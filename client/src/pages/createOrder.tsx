import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Title,
  TextInput,
  SimpleGrid,
  Group,
  Text,
  Stack,
  Divider,
  Grid,
  Badge,
  ActionIcon,
  Container
} from "@mantine/core";
import { IconArrowLeft, IconBuildingStore, IconMapPin } from "@tabler/icons-react";
import { fetchAllStores } from "../api/store";

export default function CreateOrder({ user }: any) {
  // 🏪 STATE: Stores & Navigation
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any | null>(null);

  // 🍔 STATE: Ordering
  const [items, setItems] = useState<any[]>([]);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  // 1. Fetch Stores on Load
  useEffect(() => {
    fetchAllStores().then(setStores).catch(console.error);
  }, []);

  // 2. Add Item Logic
  function addItem(foodItem: any) {
    const existing = items.find((i) => i.foodId === foodItem.id);
    if (existing) {
      setItems(items.map((i) => i.foodId === foodItem.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { foodId: foodItem.id, name: foodItem.name, price: foodItem.price, quantity: 1 }]);
    }
  }

  function calculateTotal() {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  async function submitOrder() {
    if (!selectedStore) return;

    await fetch("http://localhost:3000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: user.id,
        storeId: selectedStore.id, // 👈 CRITICAL: We now know which store!
        pickup,
        dropoff,
        items: items.map(({ foodId, quantity }) => ({ foodId, quantity })),
      }),
    });

    alert("Order placed successfully!");
    setItems([]);
    setSelectedStore(null); // Go back to store list
  }

  // --- VIEW 1: STORE LIST ---
  if (!selectedStore) {
    return (
      <Container>
        <Title order={2} mb="lg">Choose a Store</Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {stores.map((store) => (
            <Card key={store.id} shadow="sm" radius="md" withBorder padding="lg">
              <Group justify="space-between" mb="xs">
                <Text fw={700} size="lg">{store.name}</Text>
                <Badge color="green">OPEN</Badge>
              </Group>

              <Group gap="xs" c="dimmed" mb="md">
                <IconMapPin size={16} />
                <Text size="sm">{store.address}</Text>
              </Group>

              <Button 
                fullWidth 
                variant="light" 
                onClick={() => setSelectedStore(store)}
                leftSection={<IconBuildingStore size={16} />}
              >
                View Menu
              </Button>
            </Card>
          ))}
        </SimpleGrid>
        
        {stores.length === 0 && <Text c="dimmed" ta="center" mt="xl">No stores available right now.</Text>}
      </Container>
    );
  }

  // --- VIEW 2: MENU (Ordering from specific store) ---
  return (
    <Container size="lg">
      <Group mb="lg">
        <ActionIcon variant="default" size="lg" onClick={() => setSelectedStore(null)}>
          <IconArrowLeft size={18} />
        </ActionIcon>
        <Title order={2}>Ordering from {selectedStore.name}</Title>
      </Group>

      {/* Pickup / Dropoff */}
      <Grid mb="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput label="Pickup location" value={pickup} onChange={(e) => setPickup(e.target.value)} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput label="Dropoff location" value={dropoff} onChange={(e) => setDropoff(e.target.value)} />
        </Grid.Col>
      </Grid>

      {/* Main Content */}
      <Grid align="flex-start">
        {/* FOOD LIST */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {selectedStore.menu.map((f: any) => (
              <Card key={f.id} shadow="sm" radius="md">
                <Text fw={600}>{f.name}</Text>
                <Text size="sm" c="dimmed">₱{f.price}</Text>
                <Button mt="sm" fullWidth onClick={() => addItem(f)}>Add</Button>
              </Card>
            ))}
             {selectedStore.menu.length === 0 && <Text c="dimmed">This store has no items yet.</Text>}
          </SimpleGrid>
        </Grid.Col>

        {/* ORDER SUMMARY */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" radius="md">
            <Title order={4}>Your Order</Title>
            <Divider my="sm" />
            
            {items.length === 0 ? (
              <Text c="dimmed">No items added</Text>
            ) : (
              <Stack gap="xs">
                {items.map((item) => (
                  <Group key={item.foodId} justify="space-between">
                    <Text size="sm">{item.name} × {item.quantity}</Text>
                    <Text size="sm">₱{item.price * item.quantity}</Text>
                  </Group>
                ))}
              </Stack>
            )}

            <Divider my="sm" />
            <Group justify="space-between">
              <Text fw={600}>Total</Text>
              <Text fw={600}>₱{calculateTotal()}</Text>
            </Group>

            <Button
              fullWidth
              mt="md"
              disabled={!pickup || !dropoff || items.length === 0}
              onClick={submitOrder}
            >
              Place Order
            </Button>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}