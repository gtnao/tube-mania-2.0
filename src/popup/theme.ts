import { createTheme, MantineColorsTuple } from "@mantine/core";

// YouTube-inspired red color palette
const youtubeRed: MantineColorsTuple = [
  "#ffe5e5",
  "#ffcccc",
  "#ff9999",
  "#ff6666",
  "#ff3333",
  "#ff0000", // YouTube red
  "#cc0000",
  "#990000",
  "#660000",
  "#330000",
];

export const theme = createTheme({
  primaryColor: "youtubeRed",
  colors: {
    youtubeRed,
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5c5f66",
      "#373A40",
      "#2C2E33",
      "#25262b",
      "#1A1B1E",
      "#141517",
      "#0f0f0f", // YouTube background
    ],
  },
  defaultRadius: "md",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  headings: {
    fontWeight: "600",
  },
  components: {
    Paper: {
      defaultProps: {
        bg: "dark.8",
      },
    },
    Slider: {
      styles: {
        track: {
          backgroundColor: "var(--mantine-color-dark-5)",
        },
        bar: {
          backgroundColor: "var(--mantine-color-youtubeRed-5)",
        },
        thumb: {
          backgroundColor: "var(--mantine-color-youtubeRed-5)",
          borderColor: "var(--mantine-color-youtubeRed-5)",
        },
      },
    },
    RangeSlider: {
      styles: {
        track: {
          backgroundColor: "var(--mantine-color-dark-5)",
        },
        bar: {
          backgroundColor: "var(--mantine-color-youtubeRed-5)",
        },
        thumb: {
          backgroundColor: "var(--mantine-color-youtubeRed-5)",
          borderColor: "var(--mantine-color-youtubeRed-5)",
        },
      },
    },
    ActionIcon: {
      defaultProps: {
        color: "gray",
      },
    },
    Switch: {
      styles: {
        track: {
          backgroundColor: "var(--mantine-color-dark-5)",
        },
      },
    },
  },
});
