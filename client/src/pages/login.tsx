import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Card,
  Title,
  Text,
  Stack,
  Divider,
} from "@mantine/core";

export default function Login({ onLogin, onSwitch }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) return alert("Invalid credentials");

    onLogin(await res.json());
  }

  return (
    <Card
      withBorder
      shadow="lg"
      radius="md"
      p="xl"
    >
      <Stack gap="xs">
        <Title order={2}>Welcome back</Title>
        <Text c="dimmed" size="sm">
          Sign in to continue to CS Bite
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
          placeholder="Your password"
          size="md"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          size="md"
          fullWidth
          loading={loading}
          mt="sm"
          onClick={handleLogin}
        >
          Login
        </Button>

        <Button
          variant="subtle"
          size="sm"
          fullWidth
          onClick={() => onSwitch("signup")}
        >
          Don’t have an account? Sign up
        </Button>
      </Stack>
    </Card>
  );
}
