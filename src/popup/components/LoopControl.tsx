import React from "react";
import { RangeSlider, Text, Group, Stack, Box, Badge, UnstyledButton, Button } from "@mantine/core";
import { IconRepeat } from "@tabler/icons-react";

interface Props {
  enabled: boolean;
  loopStart: number;
  loopEnd: number;
  duration: number;
  currentTime: number;
  onToggle: (enabled: boolean) => void;
  onStartChange: (time: number) => void;
  onEndChange: (time: number) => void;
}

function formatTime(seconds: number, precise = false): string {
  if (!isFinite(seconds) || seconds < 0) return precise ? "0:00.00" : "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (precise) {
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const LoopControl: React.FC<Props> = ({
  enabled,
  loopStart,
  loopEnd,
  duration,
  currentTime,
  onToggle,
  onStartChange,
  onEndChange,
}) => {
  const handleRangeChange = (value: [number, number]) => {
    onStartChange(value[0]);
    onEndChange(value[1]);
  };

  const canSetStart = currentTime < loopEnd;
  const canSetEnd = currentTime > loopStart;

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Group gap={6}>
          <IconRepeat
            size={16}
            color={enabled ? "var(--mantine-color-youtubeRed-5)" : "var(--mantine-color-dark-2)"}
          />
          <Text size="sm" c="white">
            Loop
          </Text>
          <Text size="xs" c="dimmed" ff="monospace">
            {formatTime(loopStart, true)} - {formatTime(loopEnd, true)}
          </Text>
        </Group>
        <UnstyledButton onClick={() => onToggle(!enabled)}>
          <Badge
            color={enabled ? "youtubeRed" : "dark.5"}
            variant={enabled ? "filled" : "outline"}
            size="sm"
            style={{ cursor: "pointer", minWidth: 50 }}
          >
            {enabled ? "ON" : "OFF"}
          </Badge>
        </UnstyledButton>
      </Group>

      <Box>
        <RangeSlider
          value={[loopStart, loopEnd]}
          min={0}
          max={duration || 100}
          step={1}
          onChange={handleRangeChange}
          size="sm"
          minRange={1}
          label={(value) => formatTime(value)}
          labelAlwaysOn={false}
          styles={{
            track: {
              backgroundColor: "var(--mantine-color-dark-5)",
            },
            bar: {
              backgroundColor: enabled
                ? "var(--mantine-color-youtubeRed-5)"
                : "var(--mantine-color-dark-4)",
            },
            thumb: {
              backgroundColor: enabled
                ? "var(--mantine-color-youtubeRed-5)"
                : "var(--mantine-color-dark-3)",
              borderColor: enabled
                ? "var(--mantine-color-youtubeRed-5)"
                : "var(--mantine-color-dark-3)",
            },
          }}
        />
      </Box>

      <Group gap="sm">
        <Button
          variant="subtle"
          size="xs"
          color="gray"
          onClick={() => onStartChange(currentTime)}
          disabled={!canSetStart}
        >
          Set start to now
        </Button>
        <Button
          variant="subtle"
          size="xs"
          color="gray"
          onClick={() => onEndChange(currentTime)}
          disabled={!canSetEnd}
        >
          Set end to now
        </Button>
      </Group>
    </Stack>
  );
};
