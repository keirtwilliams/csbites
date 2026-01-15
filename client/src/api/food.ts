export async function fetchFood() {
  const res = await fetch("http://localhost:3000/food");

  if (!res.ok) {
    throw new Error("Failed to fetch food");
  }

  return res.json();
}
