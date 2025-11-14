# AprilTag Detector (Expo React Native)

Offline-first AprilTag detector built with Expo + React Native. The legacy browser implementation was converted into a full-screen, portrait-only Android/iOS app that keeps all processing on-device through a bundled WebAssembly pipeline. A native `Show details` modal surfaces a rich summary of detections without leaving the scan flow.

## Highlights

- 📱 **Cross-platform & vertical** – managed Expo project targeting Android and iOS, locked to portrait for a predictable scan experience.
- 📴 **Fully offline** – the AprilTag WASM runtime, worker scripts, and UI are packaged with the app; no network calls are required once installed.
- 🏷️ **Wide tag coverage** – leverages the upstream AprilTag implementation (36h11 family by default) and exposes detector options so you can expand to additional families with a recompiled wasm.
- 🪟 **Native UX** – React Native surface draws live stats, tag counts, and a `Show details` modal listing ID, pose, corners, FPS, and latency.
- 🔐 **Permissions-aware** – proactively requests camera access and gracefully reports issues back to the shell.

## Getting Started

1. **Install prerequisites**
   - Node.js 18+ and npm
   - Expo CLI (`npm install -g expo-cli`) or the Expo Go app for quick previews

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run locally**
   ```bash
   # start the Expo dev server
   npm start

   # optional shortcuts
   npm run android
   npm run ios
   ```

4. **Grant camera permissions** when prompted. The embedded WebView uses `getUserMedia` behind the scenes, so the OS camera permission must stay enabled.

## Project Structure

```
.
├── App.js                     # React Native UI + modal + WebView bridge
├── app.json                   # Expo configuration (permissions, orientation)
├── assets/
│   └── web/                   # Offline AprilTag web bundle (HTML/CSS/WASM)
├── src/
│   └── hooks/useOfflineWebBundle.js
│                               # Copies the web bundle to a readable location
├── metro.config.js            # Treats html/css/wasm/wjs as raw assets
└── README.md
```

`assets/web` still contains the original AprilTag pipeline, but the JS sources now use a `.wjs` extension so Metro bundles them as static files. At runtime `useOfflineWebBundle` copies each asset into `FileSystem.cacheDirectory/apriltag-web` with canonical names (`index.html`, `apriltag.js`, `apriltag_wasm.js`, etc.). The React Native `WebView` loads that local HTML entry point, which in turn boots the WASM module and streams frames from `getUserMedia`.

## Customising Detection

- **Detector options** – tweak `assets/web/apriltag.wjs` if you need different decimation, threading, or pose flags.
- **Tag families** – the shipped WASM supports the common 36h11 family. Recompile `apriltag_wasm` with additional families and drop the new `.wasm` + `.wjs` files into `assets/web/` to broaden coverage.
- **UI hooks** – every detection frame posts a payload to the native shell (`type: "detections"`). Extend `App.js` to log, store, or transmit detections as needed.

## Notes & Tips

- Keep the phone steady and ensure the tag fits inside the viewport for best accuracy.
- Because everything runs locally, this build works in airplane mode and never uploads camera data.
- When modifying the offline web bundle, restart the Metro server so the asset copies stay in sync.

Happy tagging! 🚀