# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode (Mac only)
- For Android: Android Studio

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on device/simulator:**
   - **iOS Simulator**: Press `i` in the terminal
   - **Android Emulator**: Press `a` in the terminal
   - **Physical Device**: Install Expo Go app and scan the QR code

## Important: Native Module Setup

⚠️ **This app requires a native module for AprilTag detection.**

Before the app can detect tags, you need to:

1. **Create a development build** (required for native modules):
   ```bash
   npx expo prebuild
   ```

2. **Implement the native module** following `NATIVE_MODULE_SETUP.md`

3. **Rebuild the app:**
   ```bash
   npx expo run:ios
   # or
   npx expo run:android
   ```

## Testing Without Native Module

The app will run but won't detect tags until the native module is implemented. You can:
- Test the UI and camera functionality
- Verify the modal and overlay components work
- Test tag family selection

## Project Structure

- `App.tsx` - Main app component
- `src/components/` - React components
- `src/utils/` - Utility functions
- `src/native/` - Native module interface
- `src/types/` - TypeScript type definitions

## Next Steps

1. Read `NATIVE_MODULE_SETUP.md` for native module implementation
2. Implement AprilTag detection for iOS and/or Android
3. Test with real AprilTag images
4. Build for production using EAS Build

## Troubleshooting

- **Camera not working**: Check permissions in device settings
- **Build errors**: Run `npx expo install --fix`
- **Module not found**: Ensure native module is implemented and registered
