import { useEffect, useState } from "react";
import { Table, Button, Title, TextInput } from "@mantine/core";
import { fetchOrders, assignRider } from "../api/orders";

export default function OrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [riderId, setRiderId] = useState("");

  useEffect(() => {
    fetchOrders().then(setOrders);
  }, []);

  async function assign(orderId: string) {
    await assignRider(orderId, riderId);
    setOrders(await fetchOrders());
  }

  return (
    <>
      <Title order={2} mb="md">Admin Orders</Title>

      <TextInput
        placeholder="Paste Rider ID"
        mb="md"
        onChange={e => setRiderId(e.target.value)}
      />

      <Table striped>
        <thead>
          <tr>
            <th>ID</th>
            <th>Pickup</th>
            <th>Dropoff</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.id.slice(0, 6)}...</td>
              <td>{o.pickup}</td>
              <td>{o.dropoff}</td>
              <td>{o.status}</td>
              <td>
                {o.status === "PENDING" && (
                  <Button size="xs" onClick={() => assign(o.id)}>
                    Assign
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
