import { useEffect, useState } from 'react';
import { 
  Container, Paper, Title, Text, Button, Group, Badge, Grid, 
  Card, TextInput, NumberInput, Modal, LoadingOverlay, ActionIcon, Stack,
  Image 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash, IconPencil } from '@tabler/icons-react'; // 👈 Added IconPencil
import { fetchStoreByOwner, createStore, addFoodItem } from '../api/store'; 

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
  const [orders, setOrders] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [opened, { open, close }] = useDisclosure(false);
  
  // 📝 Form states
  const [newItem, setNewItem] = useState({ id: '', name: '', price: 0 });
  const [isEditing, setIsEditing] = useState(false); // 👈 Track if we are editing or adding
  const [storeForm, setStoreForm] = useState({ name: '', address: '' });

  async function loadDashboardData() {
    if (!currentUser?.id) return;
    try {
      const storeData = await fetchStoreByOwner(currentUser.id);
      setStore(storeData); 

      if (storeData) {
        const ordersRes = await fetch(`${API_URL}/orders`);
        if (ordersRes.ok) {
          const allOrders = await ordersRes.json();
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
    const interval = setInterval(() => { loadDashboardData(); }, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // 1. ✅ DELETE ITEM FUNCTION
  const handleDeleteItem = async (foodId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`${API_URL}/stores/items/${foodId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStore(prev => prev ? ({ ...prev, menu: prev.menu.filter(i => i.id !== foodId) }) : null);
      } else {
        alert("Failed to delete item");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // 2. ✅ OPEN EDIT MODAL
  const openEditModal = (item: FoodItem) => {
    setNewItem({ id: item.id, name: item.name, price: item.price });
    setIsEditing(true);
    open();
  };

  // 3. ✅ SAVE (ADD or UPDATE) ITEM
  const handleSaveItem = async () => {
    if (!store) return;
    try {
      if (isEditing) {
        // UPDATE LOGIC
        const res = await fetch(`${API_URL}/stores/items/${newItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newItem.name, price: newItem.price }),
        });
        if (res.ok) {
          const updated = await res.json();
          setStore(prev => prev ? ({
            ...prev,
            menu: prev.menu.map(i => i.id === updated.id ? updated : i)
          }) : null);
        }
      } else {
        // ADD LOGIC
        const addedItem = await addFoodItem({
          storeId: store.id,
          name: newItem.name,
          price: newItem.price
        });
        setStore(prev => prev ? ({ ...prev, menu: [...prev.menu, addedItem] }) : null);
      }
      
      setNewItem({ id: '', name: '', price: 0 }); 
      setIsEditing(false);
      close();
    } catch (error) {
      alert("Failed to save item.");
    }
  };

  // Stats calculation
  const activeOrdersCount = orders.filter(o => o.status !== "DELIVERED" && o.status !== "COMPLETED").length;
  const totalRevenue = orders
    .filter(o => o.status === "DELIVERED" || o.status === "COMPLETED")
    .reduce((sum, o) => {
      const orderTotal = o.items.reduce((s: number, i: any) => s + (i.food.price * i.quantity), 0);
      return sum + orderTotal;
    }, 0);

  const handleCreateStore = async () => {
    try {
      const newStore = await createStore({ ownerId: currentUser.id, name: storeForm.name, address: storeForm.address });
      setStore({ ...newStore, menu: [] });
    } catch (error) {
      alert("Failed to create store.");
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
              <Title order={2} mt="xs" c="blue">{activeOrdersCount}</Title> 
            </Card>
            <Card shadow="sm" p={{ base: 'sm', md: 'lg' }} radius="md" withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Total Revenue</Text>
              <Title order={2} mt="xs" c="green">₱ {totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</Title> 
            </Card>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" p={{ base: 'sm', md: 'lg' }} radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Title order={3}>Menu Items</Title>
              <Button leftSection={<IconPlus size={14} />} onClick={() => { setIsEditing(false); setNewItem({id: '', name: '', price: 0}); open(); }}>
                Add Item
              </Button>
            </Group>
            <Stack>
              {store.menu.map((item) => (
                <Paper key={item.id} withBorder p="md" radius="sm">
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>{item.name}</Text>
                      <Text c="dimmed" size="sm">₱ {item.price.toFixed(2)}</Text>
                    </div>
                    <Group gap="xs">
                      {/* EDIT BUTTON */}
                      <ActionIcon color="blue" variant="subtle" onClick={() => openEditModal(item)}>
                        <IconPencil size={16} />
                      </ActionIcon>
                      {/* DELETE BUTTON */}
                      <ActionIcon color="red" variant="subtle" onClick={() => handleDeleteItem(item.id)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Paper>
              ))}
              {store.menu.length === 0 && <Text c="dimmed" ta="center" py="xl">No items in your menu yet.</Text>}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Modal opened={opened} onClose={close} title={isEditing ? "Edit Menu Item" : "Add New Menu Item"} centered>
        <Stack>
          <TextInput label="Item Name" placeholder="e.g. Halo-Halo" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.currentTarget.value })} />
          <NumberInput label="Price (₱)" min={0} value={newItem.price} onChange={(val) => setNewItem({ ...newItem, price: Number(val) })} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={close}>Cancel</Button>
            <Button onClick={handleSaveItem}>{isEditing ? "Save Changes" : "Add Item"}</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}