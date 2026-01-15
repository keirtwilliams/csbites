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
  Text,
 
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";

// ✅ FIX: Define the base URL (Vercel or Localhost)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function OrdersTable() {
  // 📊 State Data
  const [orders, setOrders] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🎯 Selection State
  const [selections, setSelections] = useState<Record<string, string>>({});

  // 1. Fetch Data (Orders + Active Riders)
  async function fetchData() {
    try {
      const [ordersRes, ridersRes] = await Promise.all([
        fetch(`${API_URL}/orders`),
        fetch(`${API_URL}/orders/riders`)
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (ridersRes.ok) setRiders(await ridersRes.json());

    } catch (error) {
      console.error("Failed to fetch admin data", error);
    }
  }

  // ✅ REAL-TIME: Auto-refresh every 3 seconds
  useEffect(() => {
    setLoading(true); 
    fetchData().finally(() => setLoading(false));

    const interval = setInterval(() => {
      fetchData(); 
    }, 3000);

    return () => clearInterval(interval); 
  }, []);

  // 2. Handle Assign Action
  async function handleAssign(orderId: string) {
    const riderId = selections[orderId];
    
    if (!riderId) {
      alert("Please select a rider first");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riderId }),
      });

      if (res.ok) {
        alert("Rider Assigned Successfully!");
        fetchData(); 
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
    // ✅ RESPONSIVE UPDATE: Dynamic padding (small on mobile, large on desktop)
    <Card shadow="sm" p={{ base: 'sm', md: 'lg' }} radius="md" withBorder mt="lg">
      <LoadingOverlay visible={loading} />
      
      <Group justify="space-between" mb="md">
        <Title order={3} size="h4">Admin Dispatch Board</Title>
        <ActionIcon variant="light" size="lg" onClick={() => fetchData()}>
          <IconRefresh size={18} />
        </ActionIcon>
      </Group>

      {/* ✅ RESPONSIVE UPDATE: Table.ScrollContainer 
         This forces a horizontal scrollbar if the screen is smaller than 800px.
         This prevents the "Assign" button from getting squished.
      */}
      <Table.ScrollContainer minWidth={800}>
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
                  <Text size="xs" c="dimmed" truncate="end" w={150}>
                    {order.dropoff}
                  </Text>
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
                    <Group gap={5} wrap="nowrap"> {/* wrap="nowrap" keeps button next to select */}
                      <Select
                        placeholder="Pick Rider"
                        data={riderOptions}
                        searchable
                        value={selections[order.id] || ""}
                        onChange={(val) => setSelections({ ...selections, [order.id]: val as string })}
                        style={{ width: 160 }} 
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
      </Table.ScrollContainer>
      
      {orders.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">No orders found.</Text>
      )}
    </Card>
  );
}