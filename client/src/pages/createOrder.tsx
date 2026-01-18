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
  Container,
  Image
} from "@mantine/core";
import { 
  IconArrowLeft, 
  IconBuildingStore, 
  IconMapPin, 
  IconMinus, // 👈 Added
  IconPlus   // 👈 Added
} from "@tabler/icons-react";
import { fetchAllStores } from "../api/store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function CreateOrder({ user }: any) {
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  useEffect(() => {
    fetchAllStores().then(setStores).catch(console.error);
  }, []);

  // 1. ✅ Modified Add Logic
  function addItem(foodItem: any) {
    const existing = items.find((i) => i.foodId === foodItem.id);
    if (existing) {
      setItems(items.map((i) => i.foodId === foodItem.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { foodId: foodItem.id, name: foodItem.name, price: foodItem.price, quantity: 1 }]);
    }
  }

  // 2. ✅ NEW: Decrease/Remove Item Logic
  function removeItem(foodId: string) {
    setItems((prevItems) => 
      prevItems
        .map((item) => 
          item.foodId === foodId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0) // 👈 Automatically removes item if quantity hits 0
    );
  }

  function calculateTotal() {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  async function submitOrder() {
    if (!selectedStore) return;
    await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: user.id,
        storeId: selectedStore.id,
        pickup,
        dropoff,
        items: items.map(({ foodId, quantity }) => ({ foodId, quantity })),
      }),
    });

    alert("Order placed successfully!");
    setItems([]);
    setSelectedStore(null);
  }

  if (!selectedStore) {
    return (
      <Container>
        <Group mb="lg">
          <Image src="/csbitesfinal.png" h={50} w="auto" fit="contain" alt="CS Bites Logo" />
          <Title order={2}>Choose a Store</Title>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {stores.map((store) => (
            <Card key={store.id} shadow="sm" radius="md" withBorder p={{ base: 'sm', md: 'lg' }}>
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
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Group mb="lg" justify="space-between">
        <Group>
            <ActionIcon variant="default" size="lg" onClick={() => setSelectedStore(null)}>
                <IconArrowLeft size={18} />
            </ActionIcon>
            <Title order={2}>Ordering from {selectedStore.name}</Title>
        </Group>
        <Image src="/csbites.png" h={40} w="auto" fit="contain" alt="CS Bites Logo" />
      </Group>

      <Grid mb="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput label="Pickup location" value={pickup} onChange={(e) => setPickup(e.target.value)} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput label="Dropoff location" value={dropoff} onChange={(e) => setDropoff(e.target.value)} />
        </Grid.Col>
      </Grid>

      <Grid align="flex-start">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {selectedStore.menu.map((f: any) => (
              <Card key={f.id} shadow="sm" radius="md" p="sm">
                <Text fw={600}>{f.name}</Text>
                <Text size="sm" c="dimmed">₱{f.price}</Text>
                <Button mt="sm" fullWidth onClick={() => addItem(f)}>Add</Button>
              </Card>
            ))}
          </SimpleGrid>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" radius="md" p={{ base: 'sm', md: 'lg' }}>
            <Title order={4}>Your Order</Title>
            <Divider my="sm" />
            
            {items.length === 0 ? (
              <Text c="dimmed">No items added</Text>
            ) : (
              <Stack gap="xs">
                {items.map((item) => (
                  <Group key={item.foodId} justify="space-between" wrap="nowrap">
                    <Box style={{ flex: 1 }}>
                        <Text size="sm" truncate>{item.name}</Text>
                        <Text size="xs" c="dimmed">₱{item.price} each</Text>
                    </Box>
                    
                    {/* ✅ New Quantity Controls */}
                    <Group gap={5}>
                        <ActionIcon 
                            size="sm" 
                            variant="light" 
                            color="red" 
                            onClick={() => removeItem(item.foodId)}
                        >
                            <IconMinus size={12} />
                        </ActionIcon>
                        
                        <Text size="sm" fw={700} w={20} ta="center">{item.quantity}</Text>
                        
                        <ActionIcon 
                            size="sm" 
                            variant="light" 
                            color="blue" 
                            onClick={() => addItem({ id: item.foodId, name: item.name, price: item.price })}
                        >
                            <IconPlus size={12} />
                        </ActionIcon>
                    </Group>
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