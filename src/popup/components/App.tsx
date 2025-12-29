import React, { useState } from "react";
import {
  Stack,
  Text,
  Paper,
  Group,
  Loader,
  Alert,
  Button,
  Box,
  Divider,
  Tabs,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconRefresh,
  IconAdjustments,
  IconWaveSine,
  IconPiano,
} from "@tabler/icons-react";
import { useAudioState } from "../hooks/useAudioState";
import { PlaybackControls } from "./PlaybackControls";
import { SpeedControl } from "./SpeedControl";
import { PitchControl } from "./PitchControl";
import { VolumeControl } from "./VolumeControl";
import { LoopControl } from "./LoopControl";
import { Equalizer } from "./Equalizer";
import { Piano } from "./Piano";

const POPUP_WIDTH = 560;
const TAB_PANEL_HEIGHT = 250;

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>("controls");

  const {
    state,
    error,
    isLoading,
    initialize,
    play,
    pause,
    back,
    setCurrentTime,
    setVolume,
    setSpeed,
    setPitch,
    setEqBand,
    resetEq,
    setLoopEnabled,
    setLoopStart,
    setLoopEnd,
  } = useAudioState();

  if (isLoading) {
    return (
      <Paper p="lg" w={POPUP_WIDTH}>
        <Stack align="center" gap="md" py="xl">
          <Loader size="md" color="youtubeRed" />
          <Text size="sm" c="dimmed">
            Connecting to video...
          </Text>
        </Stack>
      </Paper>
    );
  }

  if (error || !state.isReady) {
    return (
      <Paper p="lg" w={POPUP_WIDTH}>
        <Stack gap="md">
          <Group gap="xs">
            <Text
              size="xl"
              fw={700}
              variant="gradient"
              gradient={{ from: "youtubeRed.5", to: "youtubeRed.7", deg: 90 }}
            >
              Tube Mania
            </Text>
            <Text size="xs" c="dimmed">
              2.0
            </Text>
          </Group>
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="yellow"
            title="Video Not Found"
            variant="outline"
          >
            {error || "Please open a YouTube video page to use this extension."}
          </Alert>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={initialize}
            variant="light"
            color="youtubeRed"
          >
            Retry Connection
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper p="md" w={POPUP_WIDTH}>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <Text
              size="lg"
              fw={700}
              variant="gradient"
              gradient={{ from: "youtubeRed.5", to: "youtubeRed.7", deg: 90 }}
            >
              Tube Mania
            </Text>
            <Text size="xs" c="dimmed">
              2.0
            </Text>
          </Group>
        </Group>

        {/* Playback Section */}
        <Box>
          <PlaybackControls
            currentTime={state.currentTime}
            duration={state.duration}
            isPlaying={state.isPlaying}
            onPlay={play}
            onPause={pause}
            onBack={back}
            onSeek={setCurrentTime}
          />
        </Box>

        <Divider color="dark.6" />

        {/* Loop Section - Always visible */}
        <Box>
          <LoopControl
            enabled={state.loopEnabled}
            loopStart={state.loopStart}
            loopEnd={state.loopEnd}
            duration={state.duration}
            currentTime={state.currentTime}
            onToggle={setLoopEnabled}
            onStartChange={setLoopStart}
            onEndChange={setLoopEnd}
          />
        </Box>

        <Divider color="dark.6" />

        {/* Tabs: Controls / EQ / Piano */}
        <Tabs value={activeTab} onChange={setActiveTab} color="youtubeRed">
          <Tabs.List grow>
            <Tabs.Tab value="controls" leftSection={<IconAdjustments size={14} />}>
              Controls
            </Tabs.Tab>
            <Tabs.Tab value="equalizer" leftSection={<IconWaveSine size={14} />}>
              Equalizer
            </Tabs.Tab>
            <Tabs.Tab value="piano" leftSection={<IconPiano size={14} />}>
              Piano
            </Tabs.Tab>
          </Tabs.List>

          <Box h={TAB_PANEL_HEIGHT}>
            <Tabs.Panel value="controls" pt="lg" h="100%">
              <Stack gap={28}>
                <SpeedControl speed={state.speed} onChange={setSpeed} />
                <PitchControl pitch={state.pitch} onChange={setPitch} />
                <VolumeControl volume={state.volume} onChange={setVolume} />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="equalizer" pt="lg" h="100%">
              <Equalizer
                eqGains={state.eqGains}
                onBandChange={setEqBand}
                onReset={resetEq}
              />
            </Tabs.Panel>

            <Tabs.Panel value="piano" pt="lg" h="100%">
              <Piano />
            </Tabs.Panel>
          </Box>
        </Tabs>
      </Stack>
    </Paper>
  );
};
