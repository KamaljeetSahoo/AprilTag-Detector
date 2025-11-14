# AprilTag Detector - Expo React Native App

A cross-platform mobile application for detecting AprilTags using Expo React Native. The app works completely offline and supports multiple AprilTag families.

## Features

- ✅ Cross-platform (iOS & Android)
- ✅ Completely offline operation
- ✅ Vertical full-screen mobile UI
- ✅ Real-time AprilTag detection
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

## Native Module Setup

This app requires a native module for AprilTag detection. You'll need to implement the native module for iOS and Android.

### iOS Implementation

Create `ios/ExpoAprilTag/ExpoAprilTagModule.swift`:

```swift
import ExpoModulesCore
import Foundation

public class ExpoAprilTagModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoAprilTag")
        
        AsyncFunction("detectTags") { (base64: String, options: [String: Any]) -> [String: Any] in
            // Implement AprilTag detection using a native library
            // Return array of detections
            return []
        }
        
        AsyncFunction("initializeDetector") { (options: [String: Any]) -> Void in
            // Initialize the detector with options
        }
    }
}
```

### Android Implementation

Create `android/app/src/main/java/expo/modules/apriltag/ExpoAprilTagModule.kt`:

```kotlin
package expo.modules.apriltag

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoAprilTagModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ExpoAprilTag")
        
        AsyncFunction("detectTags") { base64: String, options: Map<String, Any> ->
            // Implement AprilTag detection using a native library
            // Return array of detections
            emptyList<Map<String, Any>>()
        }
        
        AsyncFunction("initializeDetector") { options: Map<String, Any> ->
            // Initialize the detector with options
        }
    }
}
```

### Using AprilTag Native Libraries

For iOS, you can use:
- [AprilTag](https://github.com/AprilRobotics/apriltag) C library compiled as a framework
- [AprilTagSwift](https://github.com/your-repo/apriltag-swift) Swift wrapper

For Android, you can use:
- [AprilTag JNI](https://github.com/AprilRobotics/apriltag) C library via JNI
- [AprilTag Android](https://github.com/your-repo/apriltag-android) Android wrapper

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
- Check that the app has camera permission in `app.json`

### No detections
- Ensure the native module is properly implemented
- Check that the correct tag family is selected
- Verify the tag is in good lighting and focus

### Build errors
- Run `npx expo install --fix` to fix dependency versions
- Clear cache: `expo start -c`
- Delete `node_modules` and reinstall

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
