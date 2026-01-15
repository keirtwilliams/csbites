// Define the base URL first (checks Vercel first, then Localhost)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function fetchActiveRiders() {
  // Use the variable with backticks (`) not quotes (")
  const res = await fetch(`${API_URL}/riders/active`);
  
  if (!res.ok) throw new Error("Failed to fetch riders");
  return res.json();
}