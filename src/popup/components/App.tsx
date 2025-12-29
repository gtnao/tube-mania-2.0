import React from "react";
import { Stack, Button, Text, Paper, Group, Badge } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { sendMessageToActiveTab } from "../../shared/messaging";

export const App: React.FC = () => {
  const [bodyLength, setBodyLength] = React.useState<number | null>(null);
  return (
    <Paper p="md" w={300}>
      <Stack gap="sm">
        <Group justify="space-between">
          <Text size="lg" fw={700}>
            Example Extension
          </Text>
          <Badge color="blue" variant="light">
            v1.0.0
          </Badge>
        </Group>

        {bodyLength != null && (
          <Text size="sm" c="dimmed">
            Body Length: {bodyLength}
          </Text>
        )}

        <Button
          leftSection={<IconRefresh size={16} />}
          onClick={async () => {
            const response = await sendMessageToActiveTab(
              "GET_BODY_LENGTH",
              {},
            );
            if (response.success) {
              setBodyLength(response.data.bodyLength);
            } else {
              console.error("Error fetching body length:", response.error);
            }
          }}
          variant="filled"
          size="sm"
        >
          Calculate Body Length
        </Button>
      </Stack>
    </Paper>
  );
};
