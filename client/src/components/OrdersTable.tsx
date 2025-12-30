import { useEffect, useState } from "react";
import {
  Table,
  Title,
  Select,
  Card,
  Badge,
  Group,
  Text,
  Loader,
  ScrollArea,
} from "@mantine/core";
import { fetchOrders, assignRider } from "../api/orders";
import { fetchActiveRiders } from "../api/riders";

export default function OrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadAll();

    const interval = setInterval(loadAll, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadAll() {
    const [ordersData, ridersData] = await Promise.all([
      fetchOrders(),
      fetchActiveRiders(),
    ]);
    setOrders(ordersData);
    setRiders(ridersData);
  }

  async function assign(orderId: string, riderId: string) {
    setLoadingId(orderId);
    await assignRider(orderId, riderId);
    await loadAll();
    setLoadingId(null);
  }

  function renderStatus(status: string) {
    const map: any = {
      PENDING: { color: "yellow", label: "Pending" },
      ASSIGNED: { color: "blue", label: "Assigned" },
      COMPLETED: { color: "green", label: "Completed" },
    };
    return <Badge color={map[status]?.color}>{map[status]?.label}</Badge>;
  }

  return (
    <Card withBorder shadow="sm" radius="md">
      <Group justify="space-between" mb="md">
        <Title order={3}>Admin Orders</Title>
        <Text size="sm" c="dimmed">
          Auto-refreshes every 5 seconds
        </Text>
      </Group>

      <ScrollArea>
        <Table
          striped
          highlightOnHover
          verticalSpacing="sm"
          horizontalSpacing="md"
        >
          <thead>
            <tr>
              <th>Order</th>
              <th>Pickup</th>
              <th>Dropoff</th>
              <th>Status</th>
              <th>Assign Rider</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <Text c="dimmed" ta="center">
                    No orders found
                  </Text>
                </td>
              </tr>
            )}

            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <Text size="sm" fw={600}>
                    #{o.id.slice(0, 6)}
                  </Text>
                </td>

                <td>
                  <Text size="sm">{o.pickup}</Text>
                </td>

                <td>
                  <Text size="sm">{o.dropoff}</Text>
                </td>

                <td>{renderStatus(o.status)}</td>

                <td>
                  {o.status === "PENDING" ? (
                    loadingId === o.id ? (
                      <Loader size="xs" />
                    ) : (
                      <Select
                        placeholder="Select rider"
                        size="xs"
                        data={riders.map((r) => ({
                          value: r.id,
                          label: r.user.email,
                        }))}
                        onChange={(value) =>
                          value && assign(o.id, value)
                        }
                      />
                    )
                  ) : (
                    <Text size="xs" c="dimmed">
                      —
                    </Text>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
