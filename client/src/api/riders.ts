export async function fetchActiveRiders() {
  const res = await fetch("http://localhost:3000/riders/active");
  if (!res.ok) throw new Error("Failed to fetch riders");
  return res.json();
}
