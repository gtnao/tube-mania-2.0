import React from "react";
import { Slider, Text, Group, ActionIcon, Box } from "@mantine/core";
import { IconVolume, IconVolume3, IconRefresh } from "@tabler/icons-react";

interface Props {
  volume: number;
  onChange: (volume: number) => void;
}

export const VolumeControl: React.FC<Props> = ({ volume, onChange }) => {
  const percentage = Math.round(volume * 100);

  return (
    <Box>
      <Group justify="space-between" mb={6}>
        <Group gap={6}>
          {volume === 0 ? (
            <IconVolume3 size={16} color="var(--mantine-color-dark-2)" />
          ) : (
            <IconVolume size={16} color="var(--mantine-color-gray-5)" />
          )}
          <Text size="sm" c="white">
            Volume
          </Text>
        </Group>
        <Group gap={4}>
          <Text size="sm" c="youtubeRed.5" fw={600} ff="monospace">
            {percentage}%
          </Text>
          {volume !== 1 && (
            <ActionIcon
              variant="subtle"
              size="xs"
              color="gray"
              onClick={() => onChange(1)}
              title="Reset to 100%"
            >
              <IconRefresh size={12} />
            </ActionIcon>
          )}
        </Group>
      </Group>
      <Slider
        value={volume}
        min={0}
        max={1}
        step={0.01}
        onChange={onChange}
        size="sm"
        label={null}
      />
    </Box>
  );
};
