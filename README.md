# AprilTag Detector - Expo React Native App

A cross-platform mobile application for detecting AprilTags using Expo React Native. **No native modules required!** The app uses pure JavaScript with WebAssembly via a hidden WebView. Works completely offline and supports multiple AprilTag families.

## Features

- ✅ Cross-platform (iOS & Android)
- ✅ **Pure JavaScript/React Native** - No native module implementation needed!
- ✅ Completely offline operation
- ✅ Vertical full-screen mobile UI
- ✅ Real-time AprilTag detection using WebAssembly
- ✅ Support for multiple tag families:
  - tag36h11 (default)
  - tag25h9
  - tag16h5
  - tagCircle21h7
  - tagCircle49h12
  - tagCustom48h12
  - tagStandard41h12
  - tagStandard52h13
- ✅ Detection overlay with bounding boxes and IDs
- ✅ Detailed modal showing tag information
- ✅ Tag family selector

## How It Works

The app uses a **hidden WebView** that runs the existing WASM-based AprilTag detector:
1. Camera captures frames → React Native Camera component
2. Frames converted to base64 → Sent to WebView
3. WebView processes with WASM → Uses existing `apriltag.js` and `apriltag_wasm.js/wasm` files
4. Detections sent back → React Native receives results via postMessage
5. UI updates → Overlay shows detection boxes and details

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)
- For physical devices: Expo Go app or development build

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your platform:
   - iOS: Press `i` in the terminal or scan QR code with Expo Go
   - Android: Press `a` in the terminal or scan QR code with Expo Go

## WASM Files Setup

The app uses WebAssembly files for detection. These are already in your project:
- `apriltag.js` - Worker script
- `apriltag_wasm.js` - WASM loader
- `apriltag_wasm.wasm` - Compiled WASM binary

See `README_WASM.md` for details on how WASM files are loaded and bundled.

## No Native Module Needed! 🎉

This app uses **pure JavaScript with WebAssembly** - no native module implementation required! The WASM detector runs in a hidden WebView, making it completely cross-platform and easy to maintain.

## Project Structure

```
├── App.tsx                 # Main app component
├── src/
│   ├── components/         # React components
│   │   ├── CameraView.tsx  # Camera component with frame processing
│   │   ├── DetectionOverlay.tsx  # Overlay for detection boxes
│   │   ├── DetailsModal.tsx     # Modal for tag details
│   │   └── TagFamilySelector.tsx # Tag family selector
│   ├── utils/
│   │   └── apriltagDetector.ts   # Detection utility
│   ├── native/
│   │   └── AprilTagModule.ts     # Native module interface
│   └── types/
│       └── index.ts              # TypeScript types
├── app.json                # Expo configuration
└── package.json            # Dependencies
```

## Usage

1. **Start the app**: Run `npm start` and select your platform
2. **Grant camera permission**: Allow camera access when prompted
3. **Select tag family**: Tap the tag family selector to choose which AprilTag family to detect
4. **Point camera at tag**: The app will automatically detect tags in real-time
5. **View details**: Tap "Show Details" button on any detected tag to see detailed information

## Building for Production

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

## Troubleshooting

### Camera not working
- Ensure camera permissions are granted in device settings
- Check that the app has camera permission in `app.config.js`

### "Detector not ready" or no detections
- Wait a few seconds for WASM to load (check console for initialization)
- Ensure WASM files are accessible (see `README_WASM.md`)
- Check that the correct tag family is selected
- Verify the tag is in good lighting and focus

### WASM files not loading
- For development: Ensure files are accessible via HTTP or use Expo web support
- For production: Bundle WASM files as assets (see `WASM_SETUP.md`)
- Check WebView console for loading errors

### Build errors
- Run `npx expo install --fix` to fix dependency versions
- Clear cache: `expo start -c`
- Delete `node_modules` and reinstall

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
