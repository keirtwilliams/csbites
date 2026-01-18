import { useEffect, useState } from 'react';
import { 
  Container, Paper, Title, Text, Button, Group, Badge, Grid, 
  Card, TextInput, NumberInput, Modal, LoadingOverlay, ActionIcon, Stack,
  Image 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { fetchStoreByOwner, createStore, addFoodItem } from '../api/store'; 

// ✅ Define API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface FoodItem {
  id: string;
  name: string;
  price: number;
}

interface Store {
  id: string;
  name: string;
  address: string;
  isOpen: boolean;
  menu: FoodItem[];
}

export default function StoreOwnerDashboard({ currentUser }: { currentUser: any }) {
  const [store, setStore] = useState<Store | null>(null);
  const [orders, setOrders] = useState<any[]>([]); // 👈 Added state for orders
  const [loading, setLoading] = useState(true);
  
  const [opened, { open, close }] = useDisclosure(false);
  const [newItem, setNewItem] = useState({ name: '', price: 0 });
  const [storeForm, setStoreForm] = useState({ name: '', address: '' });

  // 1. ✅ UPDATED DATA FETCHING
  async function loadDashboardData() {
    if (!currentUser?.id) return;
    try {
      const storeData = await fetchStoreByOwner(currentUser.id);
      setStore(storeData); 

      if (storeData) {
        // Fetch orders specifically for this store from the backend
        const ordersRes = await fetch(`${API_URL}/orders`);
        if (ordersRes.ok) {
          const allOrders = await ordersRes.json();
          // Filter orders that belong to this store owner's store
          const storeOrders = allOrders.filter((o: any) => o.storeId === storeData.id);
          setOrders(storeOrders);
        }
      }
    } catch (error) {
      console.error("Error loading store data:", error);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadDashboardData().finally(() => setLoading(false));

    const interval = setInterval(() => {
      loadDashboardData(); 
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // 2. ✅ CALCULATE STATS
  // Active = Anything not delivered or completed
  const activeOrdersCount = orders.filter(o => 
    o.status !== "DELIVERED" && o.status !== "COMPLETED"
  ).length;

  // Revenue = Sum of all items in COMPLETED orders
  const totalRevenue = orders
    .filter(o => o.status === "DELIVERED" || o.status === "COMPLETED")
    .reduce((sum, o) => {
      const orderTotal = o.items.reduce((s: number, i: any) => s + (i.food.price * i.quantity), 0);
      return sum + orderTotal;
    }, 0);

  const handleCreateStore = async () => {
    try {
      const newStore = await createStore({
        ownerId: currentUser.id,
        name: storeForm.name,
        address: storeForm.address
      });
      setStore({ ...newStore, menu: [] });
    } catch (error) {
      alert("Failed to create store.");
    }
  };

  const handleAddItem = async () => {
    if (!store) return;
    try {
      const addedItem = await addFoodItem({
        storeId: store.id,
        name: newItem.name,
        price: newItem.price
      });
      setStore(prev => prev ? ({ ...prev, menu: [...prev.menu, addedItem] }) : null);
      setNewItem({ name: '', price: 0 }); 
      close();
    } catch (error) {
      alert("Failed to add item.");
    }
  };

  if (loading) return <LoadingOverlay visible={true} overlayProps={{ blur: 2 }} />;

  if (!store) {
    return (
      <Container size="xs" mt={80}>
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack align="center" mb="lg">
            <Image src="/csbitesfinal.png" h={80} w="auto" fit="contain" alt="CS Bites Logo" mb="xs" />
            <Title order={2}>Setup Your Store</Title>
            <Text c="dimmed" ta="center">Create your profile to start selling.</Text>
          </Stack>
          <Stack>
            <TextInput label="Store Name" placeholder="e.g. Jollibee" required value={storeForm.name} onChange={(e) => setStoreForm({ ...storeForm, name: e.currentTarget.value })} />
            <TextInput label="Address" placeholder="Location" required value={storeForm.address} onChange={(e) => setStoreForm({ ...storeForm, address: e.currentTarget.value })} />
            <Button fullWidth mt="md" onClick={handleCreateStore}>Launch Store</Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Group>
          <Image src="/csbites.png" h={50} w="auto" fit="contain" alt="CS Bites Logo" />
          <div>
            <Title order={1}>{store.name}</Title>
            <Text c="dimmed" size="sm">{store.address}</Text>
          </div>
        </Group>
        <Badge size="lg" color={store.isOpen ? 'green' : 'red'} variant="light">
          {store.isOpen ? 'OPEN FOR ORDERS' : 'CLOSED'}
        </Badge>
      </Group>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack>
            <Card shadow="sm" p={{ base: 'sm', md: 'lg' }} radius="md" withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Active Orders</Text>
              {/* ✅ DYNAMIC VALUE */}
              <Title order={2} mt="xs" c="blue">{activeOrdersCount}</Title> 
            </Card>
            <Card shadow="sm" p={{ base: 'sm', md: 'lg' }} radius="md" withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Total Revenue</Text>
              {/* ✅ DYNAMIC VALUE */}
              <Title order={2} mt="xs" c="green">₱ {totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</Title> 
            </Card>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" p={{ base: 'sm', md: 'lg' }} radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Title order={3}>Menu Items</Title>
              <Button leftSection={<IconPlus size={14} />} onClick={open}>Add Item</Button>
            </Group>
            <Stack>
              {store.menu.map((item) => (
                <Paper key={item.id} withBorder p="md" radius="sm">
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>{item.name}</Text>
                      <Text c="dimmed" size="sm">₱ {item.price.toFixed(2)}</Text>
                    </div>
                    <ActionIcon color="red" variant="subtle"><IconTrash size={16} /></ActionIcon>
                  </Group>
                </Paper>
              ))}
              {store.menu.length === 0 && <Text c="dimmed" ta="center" py="xl">No items in your menu yet.</Text>}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Modal opened={opened} onClose={close} title="Add New Menu Item" centered>
        <Stack>
          <TextInput label="Item Name" placeholder="e.g. Halo-Halo" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.currentTarget.value })} />
          <NumberInput label="Price (₱)" min={0} value={newItem.price} onChange={(val) => setNewItem({ ...newItem, price: Number(val) })} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={close}>Cancel</Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}