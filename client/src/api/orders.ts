const API_URL = "http://localhost:3000";

export async function fetchOrders() {
  const res = await fetch(`${API_URL}/orders`);
  return res.json();
}

export async function assignRider(orderId: string, riderId: string) {
  const res = await fetch(`${API_URL}/orders/${orderId}/assign`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ riderId }),
  });

  return res.json();
}
