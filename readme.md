# CS2Gen Extension

A Chrome extension that adds a **`!gen` copy button** to CS2 skin marketplaces, letting you instantly copy the inspect command to use in-game.

## Supported Sites

| Site | Status |
|------|--------|
| [CSFloat](https://csfloat.com) — `/search`, `/profile/watchlist`, `/db` | ✅ |
| [Buff163](https://buff.163.com) | ✅ |
| [BitSkins](https://bitskins.com) | ⚠️ |
| [Steam Inventory](https://steamcommunity.com/*/inventory) | ✅ |

> ⚠️ BitSkins support is partial — only items with an active inspect link available in the item menu will work.

## How It Works

1. Browse any supported marketplace
2. Click the **`!gen`** button on any skin listing
3. The inspect command is automatically copied to your clipboard
4. Paste it in-game: `!gen <hex>`

The gen code is generated **fully locally** by decoding the item's inspect link using protobuf — no external API calls required.

## Installation

### From Chrome Web Store
[Install CS2 Copy !gen](https://chromewebstore.google.com/detail/cs2-copy-gen/chhjlbeglapjmmfekjoglbfpmbogcgce)

### From Source

**Requirements:** Node.js

```bash
git clone https://github.com/ffuNnyto/cs2gen-extension
cd cs2gen-extension
npm install
npm run build
```

Then load the extension in Chrome:
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the project folder

## Project Structure

```
src/
├── background.js                  # Service worker — decodes inspect links, generates hex
├── econ/
│   ├── decode.js                  # Decodes inspect link → econ object
│   ├── encode.js                  # Encodes econ object → hex
│   ├── econ.js                    # Protobuf schema (CEconItemPreviewDataBlock)
│   └── inspect-payload.js         # CRC32 checksum + float utils
├── content_scripts/
│   ├── csfloat/
│   │   ├── csfloat.js             # Market & watchlist button injection
│   │   └── csfloat_db.js          # /db table button injection
│   ├── buff163/
│   │   └── buff163.js             # Buff163 market button injection
│   ├── bitskins/
│   │   └── bitskins.js            # BitSkins market button injection
│   └── steam/
│       └── steam.js               # Steam inventory button injection
```

## Build

The background script uses `@protobuf-ts/runtime` and must be bundled with esbuild:

```bash
npm run build    # one-time build
npm run watch    # watch mode during development
```

Output goes to `dist/background.js`, which is what the manifest loads.

## Tech

- **Manifest V3** Chrome Extension
- **esbuild** for bundling the background service worker
- **protobuf-ts** for decoding CS2 inspect payloads
- Pure JS content scripts (no bundler needed)
- CRC32 implemented natively — zero external dependencies at runtime