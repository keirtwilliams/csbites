import { useState } from "react";
import {
  Card,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Select,
  Stack,
  Divider,
} from "@mantine/core";

export default function Signup({ onSignup, onSwitch }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string | null>("CUSTOMER");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);

    const res = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        role,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Signup failed");
      return;
    }

    onSignup(await res.json());
  }

  return (
    <Card
      withBorder
      shadow="lg"
      radius="md"
      p="xl"
    >
      <Stack gap="xs">
        <Title order={2}>Create account</Title>
        <Text c="dimmed" size="sm">
          Join CS Bite and start ordering food
        </Text>
      </Stack>

      <Divider my="md" />

      <Stack>
        <TextInput
          label="Email"
          placeholder="you@email.com"
          size="md"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordInput
          label="Password"
          placeholder="Create a password"
          size="md"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Select
          label="Account type"
          size="md"
          required
          data={[
            { value: "CUSTOMER", label: "Customer" },
            { value: "ADMIN", label: "Admin" },
          ]}
          value={role}
          onChange={setRole}
        />

        <Button
          size="md"
          fullWidth
          loading={loading}
          mt="sm"
          onClick={handleSignup}
        >
          Create account
        </Button>

        <Button
          variant="subtle"
          size="sm"
          fullWidth
          onClick={() => onSwitch("login")}
        >
          Already have an account? Login
        </Button>
      </Stack>
    </Card>
  );
}
