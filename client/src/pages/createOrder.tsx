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
} from "@mantine/core";
import { fetchFood } from "../api/food";

export default function CreateOrder({ user }: any) {
  const [food, setFood] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  useEffect(() => {
    fetchFood().then(setFood);
  }, []);

  function addItem(foodItem: any) {
    const existing = items.find((i) => i.foodId === foodItem.id);

    if (existing) {
      setItems(
        items.map((i) =>
          i.foodId === foodItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
    } else {
      setItems([
        ...items,
        {
          foodId: foodItem.id,
          name: foodItem.name,
          price: foodItem.price,
          quantity: 1,
        },
      ]);
    }
  }

  function calculateTotal() {
    return items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  async function submitOrder() {
    await fetch("http://localhost:3000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: user.id,
        pickup,
        dropoff,
        items: items.map(({ foodId, quantity }) => ({
          foodId,
          quantity,
        })),
      }),
    });

    alert("Order placed");
    setItems([]);
  }

  return (
    <>
      <Title order={2} mb="lg">
        Order Food
      </Title>

      {/* Pickup / Dropoff */}
      <Grid mb="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Pickup location"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Dropoff location"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
          />
        </Grid.Col>
      </Grid>

      {/* Main Content */}
      <Grid align="flex-start">
        {/* FOOD LIST */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3 }}
            spacing="md"
          >
            {food.map((f) => (
              <Card key={f.id} shadow="sm" radius="md">
                <Text fw={600}>{f.name}</Text>
                <Text size="sm" c="dimmed">
                  ₱{f.price}
                </Text>
                <Button
                  mt="sm"
                  fullWidth
                  onClick={() => addItem(f)}
                >
                  Add
                </Button>
              </Card>
            ))}
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
                  <Group
                    key={item.foodId}
                    justify="space-between"
                  >
                    <Text size="sm">
                      {item.name} × {item.quantity}
                    </Text>
                    <Text size="sm">
                      ₱{item.price * item.quantity}
                    </Text>
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
              disabled={
                !pickup || !dropoff || items.length === 0
              }
              onClick={submitOrder}
            >
              Place Order
            </Button>
          </Card>
        </Grid.Col>
      </Grid>
    </>
  );
}
