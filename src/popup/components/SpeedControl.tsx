import React from "react";
import { Slider, Text, Group, ActionIcon, Box } from "@mantine/core";
import { IconRefresh, IconGauge } from "@tabler/icons-react";

interface Props {
  speed: number;
  onChange: (speed: number) => void;
}

// Convert slider value (0-100) to speed (0.25-5)
// 0-50: 0.25-1, 50-100: 1-5
function sliderToSpeed(sliderValue: number): number {
  if (sliderValue <= 50) {
    // 0-50 -> 0.25-1
    return 0.25 + (sliderValue / 50) * 0.75;
  } else {
    // 50-100 -> 1-5
    return 1 + ((sliderValue - 50) / 50) * 4;
  }
}

// Convert speed (0.25-5) to slider value (0-100)
function speedToSlider(speed: number): number {
  if (speed <= 1) {
    // 0.25-1 -> 0-50
    return ((speed - 0.25) / 0.75) * 50;
  } else {
    // 1-5 -> 50-100
    return 50 + ((speed - 1) / 4) * 50;
  }
}

export const SpeedControl: React.FC<Props> = ({ speed, onChange }) => {
  const sliderValue = speedToSlider(speed);

  const handleSliderChange = (value: number) => {
    const newSpeed = sliderToSpeed(value);
    // Round to 2 decimal places
    onChange(Math.round(newSpeed * 100) / 100);
  };

  return (
    <Box>
      <Group justify="space-between" mb={8}>
        <Group gap={6}>
          <IconGauge size={16} color="var(--mantine-color-gray-5)" />
          <Text size="sm" c="white">
            Speed
          </Text>
        </Group>
        <Group gap={4}>
          <Text size="sm" c="youtubeRed.5" fw={600} ff="monospace">
            {speed.toFixed(2)}x
          </Text>
          {speed !== 1 && (
            <ActionIcon
              variant="subtle"
              size="xs"
              color="gray"
              onClick={() => onChange(1)}
              title="Reset to 1.0x"
            >
              <IconRefresh size={12} />
            </ActionIcon>
          )}
        </Group>
      </Group>
      <Slider
        value={sliderValue}
        min={0}
        max={100}
        step={1}
        onChange={handleSliderChange}
        size="sm"
        label={null}
        marks={[
          { value: 0, label: "0.25" },
          { value: 50, label: "1" },
          { value: 100, label: "5" },
        ]}
        styles={{
          markLabel: { fontSize: 10, color: "var(--mantine-color-dark-2)" },
        }}
      />
    </Box>
  );
};
