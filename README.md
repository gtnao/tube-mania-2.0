# Chrome Extension Template

**⚠️ This template is intended for PRIVATE USE ONLY, not for publishing to Chrome Web Store.**

## Features

- 🚀 **Vite** - Fast build tool with [@crxjs/vite-plugin](https://crxjs.dev/) for Chrome extension development
  - Lightning-fast HMR (Hot Module Replacement) for popup development
  - Instant updates without losing application state
  - Automatic manifest generation and optimization
- ⚛️ **React** - Build interactive popup UI with modern React
- 📘 **TypeScript** - Full type safety across popup and content scripts
- 🎨 **[Mantine UI](https://ui.mantine.dev/)** - Pre-configured with Mantine (feel free to swap with your preferred UI library)
- 🔒 **Type-safe messaging** - Communication between popup and content scripts with type safety (see `src/shared/messaging.ts`)

## Example Extension

<img width="1613" height="293" alt="extension-example" src="https://github.com/user-attachments/assets/05d15af0-9b4a-47b4-a7de-d56df8d5a17d" />

This template includes a simple example demonstrating communication between popup and content script (fetching body text length from the current page).

## Prerequisites

- Node.js
- [pnpm](https://pnpm.io/installation)

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build
```

## Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project

## Hot Reload

- ✅ **Popup**: Changes are hot-reloaded automatically
- ❌ **Content Scripts**: Requires manual extension reload in Chrome
  - After modifying content scripts, reload the extension from `chrome://extensions/`
