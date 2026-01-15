import { useEffect, useState } from "react";
import {
  AppShell,
  Container,
  Button,
  Group,
  Title,
  Text,
} from "@mantine/core";

// --- Import Components ---
import Login from "./pages/login";
import Signup from "./pages/signup";
import OrdersTable from "./components/OrdersTable";
import CreateOrder from "./pages/createOrder";
import RiderDashboard from "./pages/RiderDashboard";
import StoreOwnerDashboard from "./pages/StoreOwnerDashboard"; // 👈 Import this

function App() {
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState<"login" | "signup">("login");

  // ✅ RESTORE USER ON REFRESH
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  // ✅ SINGLE SOURCE OF TRUTH
  function handleAuth(userData: any) {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    setPage("login");
  }

  // 🔒 AUTH SCREENS
  if (!user) {
    return (
      <Container size="xs" mt="xl">
        {page === "login" ? (
          <Login onLogin={handleAuth} onSwitch={setPage} />
        ) : (
          <Signup onSignup={handleAuth} onSwitch={setPage} />
        )}
      </Container>
    );
  }

  // 🧭 ROLE-BASED DASHBOARD
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header p="md">
        <Group justify="space-between">
            <Group>
                <Title order={3}>CS Bite</Title>
                <Text size="sm" c="dimmed">Logged in as {user.role}</Text>
            </Group>
            <Button variant="subtle" color="red" onClick={logout}>Logout</Button>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg">

          {/* 1. ADMIN VIEW */}
          {user.role === "ADMIN" && <OrdersTable />}

          {/* 2. RIDER VIEW (Checks role OR if they have a riderId linked) */}
          {(user.role === "RIDER" || user.riderId) && (
             <RiderDashboard user={user} />
          )}

          {/* 3. STORE OWNER VIEW */}
          {user.role === "STORE_OWNER" && (
            <StoreOwnerDashboard currentUser={user} /> // 👈 Added Here
          )}

          {/* 4. CUSTOMER VIEW (Only if NOT a rider/owner/admin) */}
          {user.role === "CUSTOMER" && !user.riderId && (
            <CreateOrder user={user} />
          )}

        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;