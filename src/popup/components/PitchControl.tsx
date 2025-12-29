import React from "react";
import { Slider, Text, Group, ActionIcon, Box } from "@mantine/core";
import { IconRefresh, IconMusic } from "@tabler/icons-react";

interface Props {
  pitch: number;
  onChange: (pitch: number) => void;
}

export const PitchControl: React.FC<Props> = ({ pitch, onChange }) => {
  const displayValue = pitch > 0 ? `+${pitch}` : pitch.toString();

  return (
    <Box>
      <Group justify="space-between" mb={8}>
        <Group gap={6}>
          <IconMusic size={16} color="var(--mantine-color-gray-5)" />
          <Text size="sm" c="white">
            Pitch
          </Text>
        </Group>
        <Group gap={4}>
          <Text size="sm" c="youtubeRed.5" fw={600} ff="monospace">
            {displayValue} st
          </Text>
          {pitch !== 0 && (
            <ActionIcon
              variant="subtle"
              size="xs"
              color="gray"
              onClick={() => onChange(0)}
              title="Reset to 0"
            >
              <IconRefresh size={12} />
            </ActionIcon>
          )}
        </Group>
      </Group>
      <Slider
        value={pitch}
        min={-12}
        max={12}
        step={1}
        onChange={onChange}
        size="sm"
        label={null}
        marks={[
          { value: -12, label: "-12" },
          { value: 0, label: "0" },
          { value: 12, label: "+12" },
        ]}
        styles={{
          markLabel: { fontSize: 10, color: "var(--mantine-color-dark-2)" },
        }}
      />
    </Box>
  );
};
