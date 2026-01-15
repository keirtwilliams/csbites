// ✅ FIX: Define the base URL (Vercel or Localhost)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function fetchFood() {
  // ✅ FIX: Use the variable with backticks `
  const res = await fetch(`${API_URL}/food`);

  if (!res.ok) {
    throw new Error("Failed to fetch food");
  }

  return res.json();
}