import React from "react";
import { Slider, Text, Group, ActionIcon, Stack, Box } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { EQ_FREQUENCIES, type EQBandIndex } from "../../shared/messaging";

interface Props {
  eqGains: number[];
  onBandChange: (bandIndex: EQBandIndex, gain: number) => void;
  onReset: () => void;
}

function formatFrequency(freq: number): string {
  if (freq >= 1000) {
    return `${freq / 1000}k`;
  }
  return freq.toString();
}

export const Equalizer: React.FC<Props> = ({ eqGains, onBandChange, onReset }) => {
  const hasChanges = eqGains.some((g) => g !== 0);

  return (
    <Stack gap="xs">
      <Group justify="flex-end" h={24}>
        <ActionIcon
          variant="subtle"
          size="xs"
          color="gray"
          onClick={onReset}
          title="Reset EQ"
          style={{ visibility: hasChanges ? "visible" : "hidden" }}
        >
          <IconRefresh size={12} />
        </ActionIcon>
      </Group>

      <Stack gap={4}>
        {EQ_FREQUENCIES.map((freq, index) => (
          <Group key={freq} gap="xs" wrap="nowrap">
            <Text
              size="xs"
              c="dimmed"
              ff="monospace"
              w={28}
              style={{ textAlign: "right" }}
            >
              {formatFrequency(freq)}
            </Text>
            <Box style={{ flex: 1 }}>
              <Slider
                value={eqGains[index]}
                min={-16}
                max={16}
                step={1}
                onChange={(value) => onBandChange(index as EQBandIndex, value)}
                size="xs"
                label={null}
                styles={{
                  track: { height: 3 },
                  thumb: { width: 8, height: 8 },
                }}
              />
            </Box>
            <Text
              size="xs"
              c={eqGains[index] !== 0 ? "youtubeRed.5" : "dimmed"}
              ff="monospace"
              w={24}
              style={{ textAlign: "right" }}
            >
              {eqGains[index] > 0 ? `+${eqGains[index]}` : eqGains[index]}
            </Text>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
};
