const API_URL = "http://localhost:3000";

// ✅ EXISTING: Get One Store (for Owners)
export async function fetchStoreByOwner(ownerId: string) {
  const res = await fetch(`${API_URL}/store/${ownerId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch store");
  return res.json();
}

// ✅ EXISTING: Create Store
export async function createStore(data: { ownerId: string; name: string; address: string }) {
  const res = await fetch(`${API_URL}/store`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create store");
  return res.json();
}

// ✅ EXISTING: Add Item
export async function addFoodItem(data: { storeId: string; name: string; price: number }) {
  const res = await fetch(`${API_URL}/store/item`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add item");
  return res.json();
}

// 👇 NEW FUNCTION: Get All Stores (for Customers)
export async function fetchAllStores() {
  const res = await fetch(`${API_URL}/store`);
  if (!res.ok) throw new Error("Failed to fetch stores");
  return res.json();
}