# Tube Mania 2.0

YouTube audio controller Chrome extension with pitch shift, EQ, loop, and piano features.

## Features

- **Playback Control**: Play/pause, seek, rewind (1s/5s/10s/30s)
- **Speed Control**: 0.25x - 5x with fine-grained control
- **Pitch Shift**: ±12 semitones
- **10-Band Equalizer**: -16dB to +16dB per band
- **Loop Playback**: Set start/end points while playing
- **Piano**: 2-octave keyboard with adjustable octave (2-5) and volume

## Tech Stack

- TypeScript
- React
- Mantine UI
- Vite + @crxjs/vite-plugin
- Web Audio API

## Development

```bash
# Install dependencies
pnpm install

# Development build with watch
pnpm run dev

# Production build
pnpm run build
```

## Installation

1. Run `pnpm run build`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder

## Usage

1. Open a YouTube video page
2. Click the Tube Mania extension icon
3. Use the controls to adjust playback

## License

MIT (See [LICENSE](LICENSE))

### Third-Party Licenses

- **Jungle.js** (pitch shifter): MIT License - by Chris Wilson (https://github.com/cwilso/Audio-Input-Effects)
