import React, { useEffect, useRef, useState, useCallback } from "react";
import { Stack, Group, Text, Slider, Box, SegmentedControl } from "@mantine/core";
import { IconVolume } from "@tabler/icons-react";

// Keyboard mapping for lower octave (selected octave)
const KEY_MAP_LOWER: Record<string, number> = {
  a: 0,
  w: 1,
  s: 2,
  e: 3,
  d: 4,
  f: 5,
  t: 6,
  g: 7,
  y: 8,
  h: 9,
  u: 10,
  j: 11,
  k: 12,
};

// Keyboard mapping for upper octave (selected octave + 1)
const KEY_MAP_UPPER: Record<string, number> = {
  o: 13,
  l: 14,
  p: 15,
  ";": 16,
  "'": 17,
};

// 2 octaves: 0-24 (C to C, 25 keys total including both C's)
const WHITE_KEY_OFFSETS = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24];
const BLACK_KEY_OFFSETS = [1, 3, 6, 8, 10, 13, 15, 18, 20, 22];

// Position of black keys relative to white key index
const BLACK_KEY_POSITIONS: Record<number, number> = {
  1: 0.75,
  3: 1.75,
  6: 3.75,
  8: 4.75,
  10: 5.75,
  13: 7.75,
  15: 8.75,
  18: 10.75,
  20: 11.75,
  22: 12.75,
};

function noteToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

function getKeyLabel(offset: number): string {
  const labels: Record<number, string> = {
    0: "A", 1: "W", 2: "S", 3: "E", 4: "D", 5: "F", 6: "T", 7: "G",
    8: "Y", 9: "H", 10: "U", 11: "J", 12: "K", 13: "O", 14: "L",
    15: "P", 16: ";", 17: "'",
  };
  return labels[offset] || "";
}

export const Piano: React.FC = () => {
  const [octave, setOctave] = useState(4);
  const [volume, setVolume] = useState(50);
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<Map<number, OscillatorNode>>(new Map());

  useEffect(() => {
    audioCtxRef.current = new AudioContext();
    gainNodeRef.current = audioCtxRef.current.createGain();
    gainNodeRef.current.connect(audioCtxRef.current.destination);
    gainNodeRef.current.gain.value = volume / 100;

    return () => {
      oscillatorsRef.current.forEach((osc) => osc.stop());
      audioCtxRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  const playNote = useCallback((noteOffset: number) => {
    if (!audioCtxRef.current || !gainNodeRef.current) return;

    const midiNote = (octave + 1) * 12 + noteOffset;
    if (oscillatorsRef.current.has(midiNote)) return;

    const osc = audioCtxRef.current.createOscillator();
    osc.frequency.value = noteToFrequency(midiNote);
    osc.connect(gainNodeRef.current);
    osc.start();

    oscillatorsRef.current.set(midiNote, osc);
    setActiveKeys((prev) => new Set(prev).add(noteOffset));
  }, [octave]);

  const stopNote = useCallback((noteOffset: number) => {
    const midiNote = (octave + 1) * 12 + noteOffset;
    const osc = oscillatorsRef.current.get(midiNote);
    if (osc) {
      osc.stop();
      oscillatorsRef.current.delete(midiNote);
    }
    setActiveKeys((prev) => {
      const next = new Set(prev);
      next.delete(noteOffset);
      return next;
    });
  }, [octave]);

  const stopAllNotes = useCallback(() => {
    oscillatorsRef.current.forEach((osc) => osc.stop());
    oscillatorsRef.current.clear();
    setActiveKeys(new Set());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      const lowerOffset = KEY_MAP_LOWER[key];
      const upperOffset = KEY_MAP_UPPER[key];
      if (lowerOffset !== undefined) {
        playNote(lowerOffset);
      } else if (upperOffset !== undefined) {
        playNote(upperOffset);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const lowerOffset = KEY_MAP_LOWER[key];
      const upperOffset = KEY_MAP_UPPER[key];
      if (lowerOffset !== undefined) {
        stopNote(lowerOffset);
      } else if (upperOffset !== undefined) {
        stopNote(upperOffset);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [playNote, stopNote]);

  const handleOctaveChange = (value: string) => {
    stopAllNotes();
    setOctave(parseInt(value, 10));
  };

  const whiteKeyWidth = 34;
  const blackKeyWidth = 22;
  const whiteKeyHeight = 100;
  const blackKeyHeight = 62;

  return (
    <Stack gap="md">
      {/* Octave Selector */}
      <Group justify="space-between" align="center">
        <Text size="sm" c="white">
          Octave
        </Text>
        <SegmentedControl
          value={octave.toString()}
          onChange={handleOctaveChange}
          data={[
            { label: "2", value: "2" },
            { label: "3", value: "3" },
            { label: "4", value: "4" },
            { label: "5", value: "5" },
          ]}
          size="xs"
          color="youtubeRed"
        />
      </Group>

      {/* Piano Keys */}
      <Box
        style={{
          position: "relative",
          height: whiteKeyHeight,
          width: whiteKeyWidth * WHITE_KEY_OFFSETS.length,
          margin: "0 auto",
        }}
      >
        {/* White Keys */}
        {WHITE_KEY_OFFSETS.map((offset, index) => (
          <Box
            key={`white-${offset}`}
            onMouseDown={() => playNote(offset)}
            onMouseUp={() => stopNote(offset)}
            onMouseLeave={() => activeKeys.has(offset) && stopNote(offset)}
            style={{
              position: "absolute",
              left: index * whiteKeyWidth,
              width: whiteKeyWidth - 2,
              height: whiteKeyHeight,
              backgroundColor: activeKeys.has(offset)
                ? "var(--mantine-color-youtubeRed-5)"
                : "#fff",
              border: "1px solid #333",
              borderRadius: "0 0 4px 4px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingBottom: 4,
              userSelect: "none",
            }}
          >
            <Text size="xs" c="dark.3" style={{ fontSize: 10 }}>
              {getKeyLabel(offset)}
            </Text>
          </Box>
        ))}

        {/* Black Keys */}
        {BLACK_KEY_OFFSETS.map((offset) => (
          <Box
            key={`black-${offset}`}
            onMouseDown={() => playNote(offset)}
            onMouseUp={() => stopNote(offset)}
            onMouseLeave={() => activeKeys.has(offset) && stopNote(offset)}
            style={{
              position: "absolute",
              left: BLACK_KEY_POSITIONS[offset] * whiteKeyWidth + (whiteKeyWidth - blackKeyWidth) / 2,
              width: blackKeyWidth,
              height: blackKeyHeight,
              backgroundColor: activeKeys.has(offset)
                ? "var(--mantine-color-youtubeRed-5)"
                : "#222",
              border: "1px solid #111",
              borderRadius: "0 0 3px 3px",
              cursor: "pointer",
              zIndex: 1,
              userSelect: "none",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: 4,
            }}
          >
            <Text size="xs" c="white" style={{ fontSize: 10 }}>
              {getKeyLabel(offset)}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Volume */}
      <Group gap="sm" align="center">
        <IconVolume size={16} color="var(--mantine-color-gray-5)" />
        <Text size="sm" c="white" w={50}>
          Volume
        </Text>
        <Box style={{ flex: 1 }}>
          <Slider
            value={volume}
            min={0}
            max={100}
            onChange={setVolume}
            size="sm"
            label={null}
          />
        </Box>
        <Text size="sm" c="youtubeRed.5" ff="monospace" w={35}>
          {volume}%
        </Text>
      </Group>
    </Stack>
  );
};
