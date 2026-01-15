// ✅ FIX: Define the base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function fetchOrders() {
  // ✅ FIX: Use the variable
  const res = await fetch(`${API_URL}/orders`);
  return res.json();
}

export async function assignRider(orderId: string, riderId: string) {
  // ✅ FIX: Use the variable
  const res = await fetch(
    `${API_URL}/orders/${orderId}/assign`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riderId }),
    }
  );

  return res.ok;
}