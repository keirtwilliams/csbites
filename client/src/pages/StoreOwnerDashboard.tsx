import { useEffect, useState } from 'react';
import { 
  Container, Paper, Title, Text, Button, Group, Badge, Grid, 
  Card, TextInput, NumberInput, Modal, LoadingOverlay, ActionIcon, Stack 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash, IconBuildingStore } from '@tabler/icons-react';
// 👇 Import the API functions we created
import { fetchStoreByOwner, createStore, addFoodItem } from '../api/store'; 

// --- Types ---
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
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [opened, { open, close }] = useDisclosure(false);
  
  // Form states
  const [newItem, setNewItem] = useState({ name: '', price: 0 });
  const [storeForm, setStoreForm] = useState({ name: '', address: '' });

  // 1. ✅ DEFINE DATA FETCHING FUNCTION
  async function loadStore() {
    if (!currentUser?.id) return;
    try {
      const data = await fetchStoreByOwner(currentUser.id);
      // We update the store state. React handles the diffing, so it won't flicker.
      setStore(data); 
    } catch (error) {
      console.error("Error loading store:", error);
    }
  }

  // 2. ✅ REAL-TIME POLLING (Auto-refresh every 3s)
  useEffect(() => {
    // Initial fetch with Loading Spinner
    setLoading(true);
    loadStore().finally(() => setLoading(false));

    // Silent background fetch every 3 seconds
    const interval = setInterval(() => {
      loadStore(); 
    }, 3000);

    // Cleanup when leaving the page
    return () => clearInterval(interval);
  }, [currentUser]);

  // 3. ✅ HANDLE CREATE STORE
  const handleCreateStore = async () => {
    try {
      const newStore = await createStore({
        ownerId: currentUser.id,
        name: storeForm.name,
        address: storeForm.address
      });
      setStore({ ...newStore, menu: [] }); // Update UI immediately
    } catch (error) {
      alert("Failed to create store.");
    }
  };

  // 4. ✅ HANDLE ADD ITEM
  const handleAddItem = async () => {
    if (!store) return;
    try {
      const addedItem = await addFoodItem({
        storeId: store.id,
        name: newItem.name,
        price: newItem.price
      });
      // Update local state immediately (User feels it's instant)
      setStore(prev => prev ? ({ ...prev, menu: [...prev.menu, addedItem] }) : null);
      setNewItem({ name: '', price: 0 }); 
      close();
      // The polling will double-check this 3s later, which is fine
    } catch (error) {
      alert("Failed to add item.");
    }
  };

  // --- LOADING STATE ---
  if (loading) return <LoadingOverlay visible={true} overlayProps={{ blur: 2 }} />;

  // --- STATE 1: ONBOARDING (No Store Found) ---
  if (!store) {
    return (
      <Container size="xs" mt={80}>
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack align="center" mb="lg">
            <IconBuildingStore size={50} color="#228be6" />
            <Title order={2}>Setup Your Store</Title>
            <Text c="dimmed" ta="center">
              You are registered as a Store Owner. Create your profile to start selling.
            </Text>
          </Stack>

          <Stack>
            <TextInput 
              label="Store Name" 
              placeholder="e.g. Jollibee - Iloilo Branch" 
              required 
              value={storeForm.name}
              onChange={(e) => setStoreForm({ ...storeForm, name: e.currentTarget.value })}
            />
            <TextInput 
              label="Address" 
              placeholder="Store location" 
              required 
              value={storeForm.address}
              onChange={(e) => setStoreForm({ ...storeForm, address: e.currentTarget.value })}
            />
            <Button fullWidth mt="md" onClick={handleCreateStore}>
              Launch Store
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  // --- STATE 2: DASHBOARD (Store Exists) ---
  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>{store.name}</Title>
          <Text c="dimmed" size="sm">{store.address}</Text>
        </div>
        <Badge size="lg" color={store.isOpen ? 'green' : 'red'} variant="light">
          {store.isOpen ? 'OPEN FOR ORDERS' : 'CLOSED'}
        </Badge>
      </Group>

      <Grid gutter="lg">
        {/* Stats Column */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Active Orders</Text>
              <Title order={2} mt="xs">0</Title> 
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Total Revenue</Text>
              <Title order={2} mt="xs">₱ 0.00</Title> 
            </Card>
          </Stack>
        </Grid.Col>

        {/* Menu Column */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Title order={3}>Menu Items</Title>
              <Button leftSection={<IconPlus size={14} />} onClick={open}>
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
                    <ActionIcon color="red" variant="subtle">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
              {store.menu.length === 0 && (
                <Text c="dimmed" ta="center" py="xl">No items in your menu yet.</Text>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Add Item Modal */}
      <Modal opened={opened} onClose={close} title="Add New Menu Item" centered>
        <Stack>
          <TextInput 
            label="Item Name" 
            placeholder="e.g. Halo-Halo" 
            data-autofocus 
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.currentTarget.value })}
          />
          <NumberInput 
            label="Price (₱)" 
            defaultValue={0} 
            min={0}
            value={newItem.price}
            onChange={(val) => setNewItem({ ...newItem, price: Number(val) })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={close}>Cancel</Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}