import { useState } from "react";
import {
  AppShell,
  Title,
  Container,
  Button,
} from "@mantine/core";

import Login from "./pages/login";
import Signup from "./pages/signup";
import OrdersTable from "./components/OrdersTable";
import CreateOrder from "./pages/createOrder";

function App() {
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState<"login" | "signup">("login");

  if (!user) {
    return (
      <Container size="xs" mt="xl">
        {page === "login" ? (
          <Login onLogin={setUser} onSwitch={setPage} />
        ) : (
          <Signup onSignup={setUser} onSwitch={setPage} />
        )}
      </Container>
    );
  }

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header p="md">
        <Title order={3}>CS Bite</Title>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg">
          {user.role === "ADMIN" ? (
            <OrdersTable />
          ) : (
            <CreateOrder user={user} />
          )}

          <Button mt="xl" variant="light" onClick={() => setUser(null)}>
            Logout
          </Button>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
