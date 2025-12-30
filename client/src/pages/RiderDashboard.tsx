import { useEffect, useState } from "react";
import {
  Card,
  Title,
  Text,
  Button,
  Stack,
  Divider,
  Group,
} from "@mantine/core";

const DELIVERY_FEE = 40;

export default function RiderDashboard({ user }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); // 🔁 auto-refresh
    return () => clearInterval(interval);
  }, []);

  async function loadOrders() {
    const res = await fetch(
      `http://localhost:3000/riders/${user.riderId}/orders`
    );
    const data = await res.json();
    setOrders(data);
  }

  async function markDelivered(orderId: string) {
    setLoading(true);
    await fetch(
      `http://localhost:3000/riders/complete/${orderId}`,
      { method: "POST" }
    );
    await loadOrders();
    setLoading(false);
  }

  function computeSubtotal(items: any[]) {
    return items.reduce(
      (sum, i) => sum + i.food.price * i.quantity,
      0
    );
  }

  return (
    <>
      <Title order={2} mb="md">
        Rider Orders
      </Title>

      <Stack>
        {orders.length === 0 && (
          <Text c="dimmed">No assigned orders yet</Text>
        )}

        {orders.map((order) => {
          const subtotal = computeSubtotal(order.items);
          const total = subtotal + DELIVERY_FEE;

          return (
            <Card key={order.id} withBorder shadow="sm" radius="md">
              <Group justify="space-between">
                <Text fw={600}>Pickup: {order.pickup}</Text>
                <Text fw={600}>Dropoff: {order.dropoff}</Text>
              </Group>

              <Divider my="sm" />

              {order.items.map((item: any) => (
                <Text key={item.food.name} size="sm">
                  {item.food.name} × {item.quantity} = ₱
                  {item.food.price * item.quantity}
                </Text>
              ))}

              <Divider my="sm" />

              <Text size="sm">Subtotal: ₱{subtotal}</Text>
              <Text size="sm">Delivery Fee: ₱{DELIVERY_FEE}</Text>
              <Text fw={700}>Total: ₱{total}</Text>

              <Divider my="sm" />

              {order.status === "ASSIGNED" ? (
                <Button
                  color="green"
                  loading={loading}
                  onClick={() => markDelivered(order.id)}
                >
                  Mark as Delivered
                </Button>
              ) : (
                <Text c="green" fw={600}>
                  ✅ Delivered
                </Text>
              )}
            </Card>
          );
        })}
      </Stack>
    </>
  );
}
