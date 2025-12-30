import { useState } from "react";
import {
  Card,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Divider,
  Checkbox,
  NumberInput,
} from "@mantine/core";

export default function Signup({ onSignup, onSwitch }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔒 Role is FIXED
  const role = "CUSTOMER";

  // 🚴 Rider option
  const [isRider, setIsRider] = useState(false);
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
const [longitude, setLongitude] = useState<number | undefined>(undefined);


  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);

    const res = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        role, // ALWAYS CUSTOMER
        rider: isRider
          ? {
              latitude,
              longitude,
            }
          : null,
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
    <Card withBorder shadow="lg" radius="md" p="xl">
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

        {/* 🚴 Rider Toggle */}
        <Checkbox
          label="Register as Rider"
          checked={isRider}
          onChange={(e) => setIsRider(e.currentTarget.checked)}
          mt="sm"
        />

    {isRider && (
  <>
    <NumberInput
      label="Latitude"
      placeholder="e.g. 10.7202"
      value={latitude}
      onChange={(val) => setLatitude(val as number)}
      required
    />

    <NumberInput
      label="Longitude"
      placeholder="e.g. 122.5621"
      value={longitude}
      onChange={(val) => setLongitude(val as number)}
      required
    />
  </>
)}
    

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
