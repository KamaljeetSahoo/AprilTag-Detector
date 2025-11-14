# AprilTag Detector - React Native Mobile App

A cross-platform mobile application for detecting AprilTags in real-time using your device camera. Built with Expo and React Native for iOS and Android.

## Features

- ✅ **Cross-Platform**: Works on both iOS and Android
- ✅ **Offline Detection**: Fully functional without internet connection
- ✅ **Real-time Detection**: Continuous camera feed processing
- ✅ **Multiple Tag Support**: Detects multiple AprilTags simultaneously
- ✅ **Detailed Information**: View comprehensive tag details in a modal
- ✅ **tag36h11 Family**: Optimized for tag36h11 AprilTag family (IDs 0-587)
- ✅ **Full Screen**: Vertical mobile app with immersive camera view

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Studio (for Android development)
- Physical device or emulator with camera access

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Placeholder Assets

Create the following placeholder images in the `assets` folder:

```bash
# You can use any PNG images for now, or generate them later
touch assets/icon.png
touch assets/splash.png
touch assets/adaptive-icon.png
touch assets/favicon.png
```

Or download proper images:
- `icon.png`: 1024x1024 app icon
- `splash.png`: 1284x2778 splash screen
- `adaptive-icon.png`: 1024x1024 Android adaptive icon
- `favicon.png`: 48x48 web favicon

### 3. Start Development Server

```bash
npm start
# or
expo start
```

### 4. Run on Device

- **iOS**: Press `i` in the terminal or scan QR code with Camera app
- **Android**: Press `a` in the terminal or scan QR code with Expo Go app

## Building for Production

### Android APK

```bash
expo build:android
```

### iOS IPA

```bash
expo build:ios
```

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Usage

1. **Launch App**: Open the app on your device
2. **Grant Permissions**: Allow camera access when prompted
3. **Point Camera**: Aim camera at AprilTag (tag36h11 family)
4. **View Detections**: Detected tags appear with colored markers and IDs
5. **Show Details**: Tap on a detected tag or the bottom card to view detailed information
6. **Close Modal**: Tap the X button or "Close" to dismiss the details modal

## Supported AprilTag Families

The current implementation is optimized for **tag36h11** family:
- ID Range: 0-587
- Grid Size: 6x6
- Hamming Distance: 11

To support additional tag families (tag16h5, tag25h9, tagStandard41h12, etc.), you'll need to integrate the native AprilTag library (see Production Implementation section).

## App Structure

```
/workspace/
├── App.js                          # Main application component
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── assets/                         # App icons and splash screens
│   ├── icon.png
│   ├── splash.png
│   ├── adaptive-icon.png
│   └── favicon.png
└── utils/
    └── aprilTagDetector.js         # AprilTag detection logic
```

## Features Breakdown

### 1. Camera View
- Full-screen camera with real-time processing
- Processes frames every 100ms for optimal performance
- Shows detection count in header

### 2. Detection Markers
- Circular markers overlaid on detected tags
- Shows tag ID inside marker
- Tap marker to view details

### 3. Bottom Panel
- Horizontal scrollable list of detected tags
- Quick access to tag information
- Shows "No AprilTags detected" when none found

### 4. Details Modal
- Slides up from bottom
- Shows comprehensive tag information:
  - Tag ID
  - Family (tag36h11)
  - Hamming distance
  - Decision margin
  - Center position (x, y)
  - Corner coordinates
  - Pose information (when available)

## Production Implementation

**IMPORTANT**: The current `aprilTagDetector.js` includes mock detection for demonstration. For production use with real AprilTag detection, you have two options:

### Option 1: Use Vision Camera with Frame Processor (Recommended)

```bash
# Install vision camera
npm install react-native-vision-camera

# Install frame processor plugin
npm install vision-camera-apriltag  # or similar plugin
```

Update your code:

```javascript
import { Camera, useFrameProcessor } from 'react-native-vision-camera';
import { detectAprilTags } from 'vision-camera-apriltag';

const frameProcessor = useFrameProcessor((frame) => {
  'worklet'
  const tags = detectAprilTags(frame, {
    family: 'tag36h11',
    maxDetections: 10,
  });
  runOnJS(setDetections)(tags);
}, []);

<Camera
  device={device}
  isActive={true}
  frameProcessor={frameProcessor}
/>
```

### Option 2: Create Custom Native Module

1. Add AprilTag C++ library to your project
2. Create native module bridge for iOS and Android
3. Call native detection from JavaScript

See `utils/aprilTagDetector.js` for detailed integration guide.

## Configuration

### Camera Settings

Adjust in `App.js`:

```javascript
const photo = await cameraRef.current.takePictureAsync({
  quality: 0.5,        // 0.0 to 1.0
  base64: true,        // Enable base64 encoding
  skipProcessing: true, // Faster processing
});
```

### Detection Frequency

Adjust processing interval:

```javascript
const interval = setInterval(() => {
  if (!processingRef.current && cameraRef.current) {
    processFrame();
  }
}, 100); // Process every 100ms (10 FPS)
```

### Styling

All styles are in `App.js` StyleSheet. Key customizable elements:
- `markerCircle`: Detection marker appearance
- `bottomPanel`: Bottom info panel styling
- `modalContent`: Details modal appearance

## Permissions

### iOS

Add to `app.json`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "This app needs camera access to detect AprilTags"
      }
    }
  }
}
```

### Android

Automatically handled by expo-camera plugin. Permissions are in `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.CAMERA"
      ]
    }
  }
}
```

## Troubleshooting

### Camera Not Working

1. Check permissions in device settings
2. Ensure physical camera is not blocked
3. Try restarting the app
4. Check expo-camera is installed: `npm install expo-camera`

### No Detections

1. Ensure good lighting conditions
2. Use valid tag36h11 AprilTags
3. Keep tag steady and in focus
4. Check if tag is within camera view
5. Implement real detection (see Production Implementation)

### Build Errors

1. Clear cache: `expo start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check Node.js version: `node --version` (should be 16+)

### Performance Issues

1. Reduce detection frequency (increase interval)
2. Lower image quality in camera settings
3. Implement native detection for better performance

## AprilTag Resources

- **Generate Tags**: https://github.com/AprilRobotics/apriltag-imgs
- **Print Tags**: https://github.com/AprilRobotics/apriltag-generation
- **Tag Families**: https://april.eecs.umich.edu/software/apriltag
- **Original Library**: https://github.com/AprilRobotics/apriltag

### Recommended Tag Sizes

For optimal detection at different distances:
- **Close range (< 1m)**: 50mm - 100mm
- **Medium range (1-3m)**: 100mm - 200mm
- **Long range (> 3m)**: 200mm+

## License

This project uses the same license as the original AprilTag library.

## Credits

Based on the AprilTag library by the April Robotics Lab at the University of Michigan.

## Support

For issues and questions:
1. Check troubleshooting section
2. Review Expo documentation: https://docs.expo.dev
3. AprilTag documentation: https://github.com/AprilRobotics/apriltag

## Development Notes

### Next Steps for Full Implementation

1. **Integrate Real Detection**:
   - Add vision-camera with frame processor
   - Or implement custom native module

2. **Add Camera Controls**:
   - Flash toggle
   - Focus lock
   - Exposure adjustment

3. **Enhance UI**:
   - Add settings screen
   - Tag history
   - Export detection data

4. **Optimize Performance**:
   - Native detection
   - GPU acceleration
   - Reduce frame processing overhead

5. **Add Features**:
   - Multiple tag family support
   - Pose estimation with camera calibration
   - AR overlays
   - Tag database/lookup

## Version History

- **1.0.0**: Initial release with basic UI and mock detection
- **Future**: Real AprilTag detection integration

---

**Note**: Replace mock detection in `utils/aprilTagDetector.js` with actual detection library for production use!
