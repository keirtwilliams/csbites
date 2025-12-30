import { useEffect, useState } from "react";
import {
  AppShell,
  Container,
  Button,
} from "@mantine/core";

import Login from "./pages/login";
import Signup from "./pages/signup";
import OrdersTable from "./components/OrdersTable";
import CreateOrder from "./pages/createOrder";
import RiderDashboard from "./pages/RiderDashboard";

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
      <strong>CS Bite</strong>
    </AppShell.Header>

  <AppShell.Main>
  <Container size="lg">

    {user.role === "ADMIN" && <OrdersTable />}

    {user.role === "CUSTOMER" && user.riderId && (
      <RiderDashboard user={user} />
    )}

    {user.role === "CUSTOMER" && !user.riderId && (
      <CreateOrder user={user} />
    )}

    <Button mt="xl" variant="light" onClick={logout}>
      Logout
    </Button>

  </Container>
</AppShell.Main>

  </AppShell>
);

}

export default App;
