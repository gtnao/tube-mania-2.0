import React from "react";
import { Group, ActionIcon, Slider, Text, Stack, Box } from "@mantine/core";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconRewindBackward5,
  IconRewindBackward10,
  IconArrowBackUp,
} from "@tabler/icons-react";

interface Props {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onBack: (seconds: number) => void;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const PlaybackControls: React.FC<Props> = ({
  currentTime,
  duration,
  isPlaying,
  onPlay,
  onPause,
  onBack,
  onSeek,
}) => {
  return (
    <Stack gap="sm">
      {/* Time Display & Seek */}
      <Group gap="sm" align="center">
        <Text size="sm" c="white" ff="monospace" w={45}>
          {formatTime(currentTime)}
        </Text>
        <Box style={{ flex: 1 }}>
          <Slider
            value={currentTime}
            min={0}
            max={duration || 100}
            onChange={onSeek}
            size="sm"
            label={null}
            styles={{
              track: { height: 4 },
              thumb: { width: 12, height: 12 },
            }}
          />
        </Box>
        <Text size="sm" c="dimmed" ff="monospace" w={45}>
          {formatTime(duration)}
        </Text>
      </Group>

      {/* Transport Controls */}
      <Group justify="center" gap="md">
        <ActionIcon
          variant="subtle"
          size="lg"
          color="gray"
          onClick={() => onBack(10)}
          title="Rewind 10s"
        >
          <IconRewindBackward10 size={20} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          size="lg"
          color="gray"
          onClick={() => onBack(5)}
          title="Rewind 5s"
        >
          <IconRewindBackward5 size={20} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          size="lg"
          color="gray"
          onClick={() => onBack(1)}
          title="Rewind 1s"
        >
          <Group gap={2}>
            <IconArrowBackUp size={16} />
            <Text size="xs" c="dimmed">1</Text>
          </Group>
        </ActionIcon>
        <ActionIcon
          variant="filled"
          size="xl"
          radius="xl"
          color="youtubeRed"
          onClick={isPlaying ? onPause : onPlay}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <IconPlayerPause size={24} />
          ) : (
            <IconPlayerPlay size={24} style={{ marginLeft: 2 }} />
          )}
        </ActionIcon>
      </Group>
    </Stack>
  );
};
