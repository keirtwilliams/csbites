export async function fetchOrders() {
  const res = await fetch("http://localhost:3000/orders");
  return res.json();
}

export async function assignRider(orderId: string, riderId: string) {
  const res = await fetch(
    `http://localhost:3000/orders/${orderId}/assign`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riderId }),
    }
  );

  return res.ok;
}
