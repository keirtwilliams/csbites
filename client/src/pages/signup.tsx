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
  NumberInput,
  SegmentedControl,
  Center,
  Box
} from "@mantine/core";
import { IconUser, IconMoped, IconBuildingStore } from "@tabler/icons-react";

export default function Signup({ onSignup, onSwitch }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔄 State to track the selected Role
  const [selectedRole, setSelectedRole] = useState("CUSTOMER");

  // 🚴 Rider specific fields
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);

    // Prepare the payload based on the selected role
    const payload = {
      email,
      password,
      role: selectedRole, 
      rider: selectedRole === "RIDER"
        ? { latitude, longitude }
        : null, 
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Signup failed");
        setLoading(false);
        return;
      }

      const data = await res.json();
      onSignup(data);
    } catch (error) {
      console.error(error);
      alert("An error occurred during signup");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card withBorder shadow="lg" radius="md" p="xl">
      <Stack gap="xs">
        <Title order={2}>Create account</Title>
        <Text c="dimmed" size="sm">
          Join CS Bite as a Customer, Rider, or Store Owner
        </Text>
      </Stack>

      <Divider my="md" />

      <Stack>
        {/* 🎛️ Role Selector (Admin Removed) */}
        <Text size="sm" fw={500} mb={-10}>
          I am a...
        </Text>
        <SegmentedControl
          value={selectedRole}
          onChange={setSelectedRole}
          data={[
            {
              value: "CUSTOMER",
              label: (
                <Center style={{ gap: 10 }}>
                  <IconUser size={16} />
                  <span>Customer</span>
                </Center>
              ),
            },
            {
              value: "RIDER",
              label: (
                <Center style={{ gap: 10 }}>
                  <IconMoped size={16} />
                  <span>Rider</span>
                </Center>
              ),
            },
            {
              value: "STORE_OWNER",
              label: (
                <Center style={{ gap: 10 }}>
                  <IconBuildingStore size={16} />
                  <span>Owner</span>
                </Center>
              ),
            },
          ]}
        />

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

        {/* 🚴 Rider Specific Inputs (Conditional) */}
        {selectedRole === "RIDER" && (
          <Box bd="1px solid gray.3" p="xs" style={{ borderRadius: 8 }}>
            <Text size="xs" c="dimmed" mb="xs">
              Rider Location Details
            </Text>
            <Stack gap="xs">
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
            </Stack>
          </Box>
        )}

        {/* 🏪 Store Owner Message */}
        {selectedRole === "STORE_OWNER" && (
          <Text size="xs" c="blue" ta="center">
            You will set up your store profile after logging in.
          </Text>
        )}

        <Button
          size="md"
          fullWidth
          loading={loading}
          mt="sm"
          onClick={handleSignup}
        >
          Sign up as {selectedRole.replace("_", " ")}
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