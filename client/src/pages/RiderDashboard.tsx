import { useEffect, useState } from "react";
import {
  Card,
  Title,
  Text,
  Button,
  Stack,
  Divider,
  Group,
  Badge,
  ActionIcon,
  Grid,
  LoadingOverlay,
  Container,
  Image // 👈 Added Image import
} from "@mantine/core";
import { 
  IconMapPin, 
  IconCheck, 
  IconRefresh, 
  IconBuildingStore 
} from "@tabler/icons-react";

// ✅ FIX: Define the base URL (Vercel or Localhost)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const DELIVERY_FEE = 40;

export default function RiderDashboard({ user }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. ✅ FETCH DATA FUNCTION
  async function loadOrders() {
    if (!user?.riderId) return;

    try {
      // ✅ FIX: Use the variable
      const res = await fetch(`${API_URL}/riders/${user.riderId}/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to load rider orders", error);
    }
  }

  // 2. ✅ REAL-TIME POLLING (Auto-refresh every 3s)
  useEffect(() => {
    setLoading(true);
    loadOrders().finally(() => setLoading(false));

    const interval = setInterval(() => {
      loadOrders(); // Silent update in background
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  // 3. ✅ MARK COMPLETE
  async function markDelivered(orderId: string) {
    if (!confirm("Are you sure this order is delivered?")) return;
    
    setLoading(true);
    try {
      // ✅ FIX: Use the variable
      await fetch(`${API_URL}/riders/complete/${orderId}`, { 
        method: "POST" 
      });
      await loadOrders(); // Refresh immediately after action
    } catch (error) {
      alert("Error updating order");
    } finally {
      setLoading(false);
    }
  }

  function computeSubtotal(items: any[]) {
    return items.reduce((sum, i) => sum + i.food.price * i.quantity, 0);
  }

  return (
    <Container size="md">
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

      <Group justify="space-between" mb="lg">
        {/* 🍔 LOGO + TITLE GROUP */}
        <Group>
          <Image 
            src="/csbitesfinal.png" 
            h={40} 
            w="auto" 
            fit="contain" 
            alt="CS Bites Logo" 
          />
          <Title order={2}>Delivery Board</Title>
        </Group>
        
        <ActionIcon variant="light" size="lg" onClick={() => loadOrders()}>
          <IconRefresh size={18} />
        </ActionIcon>
      </Group>

      <Stack>
        {orders.length === 0 && !loading && (
          <Text c="dimmed" ta="center" py="xl">
            No active deliveries assigned to you.
          </Text>
        )}

        {orders.map((order) => {
          const subtotal = computeSubtotal(order.items);
          const total = subtotal + DELIVERY_FEE;
          const isCompleted = order.status === "DELIVERED" || order.status === "COMPLETED";

          return (
            // ✅ FIX: Responsive padding
            <Card key={order.id} withBorder shadow="sm" radius="md" p={{ base: 'sm', md: 'lg' }}>
              {/* HEADER */}
              <Group justify="space-between" mb="sm">
                <Badge size="lg" color={isCompleted ? "green" : "blue"}>
                  {order.status}
                </Badge>
                <Text size="xs" c="dimmed">Order #{order.id.substring(0, 8)}</Text>
              </Group>

              {/* ROUTE INFO */}
              <Grid gutter="xs" mb="md">
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Pickup (Store)</Text>
                  <Group gap={5} align="flex-start">
                    <IconBuildingStore size={16} style={{ marginTop: 3 }} color="gray" />
                    <div>
                        {/* Fallback if store name isn't loaded yet */}
                        <Text size="sm" fw={500}>{order.store?.name || "Store Location"}</Text> 
                        <Text size="xs" c="dimmed">{order.store?.address || order.pickup}</Text>
                    </div>
                  </Group>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Dropoff (Customer)</Text>
                    <Group gap={5} align="flex-start">
                     <IconMapPin size={16} style={{ marginTop: 3 }} color="orange" />
                     <Text size="sm" fw={500}>{order.dropoff}</Text>
                    </Group>
                </Grid.Col>
              </Grid>

              <Divider my="sm" variant="dashed" />

              {/* ORDER ITEMS */}
              <Stack gap="xs" mb="md">
                <Text size="sm" fw={600}>Items to verify:</Text>
                {order.items.map((item: any) => (
                  <Group key={item.id} justify="space-between">
                    <Text size="sm">• {item.quantity}x {item.food.name}</Text>
                    <Text size="sm">₱{item.food.price * item.quantity}</Text>
                  </Group>
                ))}
              </Stack>

              <Divider my="sm" />

              {/* FOOTER ACTION */}
              <Group justify="space-between" align="center">
                <div>
                    <Text size="xs" c="dimmed">Collect from Customer:</Text>
                    <Text fw={700} size="xl" c="orange">₱{total.toFixed(2)}</Text>
                </div>

                {!isCompleted && (
                  <Button
                    color="green"
                    size="md"
                    leftSection={<IconCheck size={18} />}
                    onClick={() => markDelivered(order.id)}
                  >
                    Complete Delivery
                  </Button>
                )}
              </Group>
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
}