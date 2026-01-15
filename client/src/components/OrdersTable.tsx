import { useEffect, useState } from "react";
import {
  Table,
  Badge,
  Select,
  Button,
  Group,
  Card,
  Title,
  LoadingOverlay,
  ActionIcon,
  Text
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";

export default function OrdersTable() {
  // 📊 State Data
  const [orders, setOrders] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🎯 Selection State
  const [selections, setSelections] = useState<Record<string, string>>({});

  // 1. Fetch Data (Orders + Active Riders)
  async function fetchData() {
    // Note: We don't set loading=true here to avoid flickering every 3 seconds
    try {
      const [ordersRes, ridersRes] = await Promise.all([
        fetch("http://localhost:3000/orders"),
        fetch("http://localhost:3000/orders/riders")
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (ridersRes.ok) setRiders(await ridersRes.json());

    } catch (error) {
      console.error("Failed to fetch admin data", error);
    }
  }

  // ✅ REAL-TIME FIX: Auto-refresh every 3 seconds
  useEffect(() => {
    setLoading(true); // Show spinner only on FIRST load
    fetchData().finally(() => setLoading(false));

    const interval = setInterval(() => {
      fetchData(); // Silent update every 3 seconds
    }, 3000);

    return () => clearInterval(interval); // Cleanup timer on exit
  }, []);

  // 2. Handle Assign Action
  async function handleAssign(orderId: string) {
    const riderId = selections[orderId];
    
    if (!riderId) {
      alert("Please select a rider first");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/orders/${orderId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riderId }),
      });

      if (res.ok) {
        alert("Rider Assigned Successfully!");
        fetchData(); // Refresh immediately
      } else {
        alert("Failed to assign rider");
      }
    } catch (error) {
      console.error("Error assigning rider:", error);
    }
  }

  // 3. Format Riders for the Dropdown
  const riderOptions = riders.map((r) => ({
    value: r.id,
    label: `${r.user.email} (Lat: ${r.latitude})`,
  }));

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mt="lg">
      <LoadingOverlay visible={loading} />
      
      <Group justify="space-between" mb="md">
        <Title order={3}>Admin Dispatch Board</Title>
        <ActionIcon variant="light" size="lg" onClick={() => fetchData()}>
          <IconRefresh size={18} />
        </ActionIcon>
      </Group>

      <Table striped highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Customer</Table.Th>
            <Table.Th>Store</Table.Th>
            <Table.Th>Items</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Assign Driver</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {orders.map((order) => (
            <Table.Tr key={order.id}>
              <Table.Td>{new Date(order.createdAt).toLocaleTimeString()}</Table.Td>
              <Table.Td>
                <Text size="sm" fw={500}>{order.customer.email}</Text>
                <Text size="xs" c="dimmed">{order.dropoff}</Text>
              </Table.Td>
              <Table.Td>
                 <Text size="sm">Store ID: {order.storeId.substring(0,6)}...</Text>
              </Table.Td>
              <Table.Td>
                {order.items.map((i: any) => (
                  <div key={i.id}>• {i.quantity}x {i.food.name}</div>
                ))}
              </Table.Td>
              <Table.Td>
                <Badge 
                  color={
                    order.status === "PENDING" ? "yellow" : 
                    order.status === "ASSIGNED" ? "blue" : "green"
                  }
                >
                  {order.status}
                </Badge>
              </Table.Td>
              <Table.Td>
                {order.status === "PENDING" ? (
                  <Group gap={5}>
                    <Select
                      placeholder="Pick Rider"
                      data={riderOptions}
                      searchable
                      value={selections[order.id] || ""}
                      onChange={(val) => setSelections({ ...selections, [order.id]: val as string })}
                      style={{ width: 180 }}
                    />
                    <Button size="xs" onClick={() => handleAssign(order.id)}>
                      Assign
                    </Button>
                  </Group>
                ) : (
                  <Text size="sm" c="dimmed">
                    Rider: {order.rider?.user?.email || "Assigned"}
                  </Text>
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      
      {orders.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">No orders found.</Text>
      )}
    </Card>
  );
}