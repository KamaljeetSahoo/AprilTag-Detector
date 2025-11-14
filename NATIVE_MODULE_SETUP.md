# Native Module Setup Guide

This document explains how to set up the native AprilTag detection module for iOS and Android.

## Overview

The app uses Expo Modules to bridge native AprilTag detection libraries. You'll need to implement the native module for both platforms.

## Option 1: Using Expo Development Build (Recommended)

1. Create a development build with native modules:
```bash
npx expo prebuild
```

2. Implement the native modules in:
   - `ios/ExpoAprilTag/` (iOS)
   - `android/app/src/main/java/expo/modules/apriltag/` (Android)

3. Build and run:
```bash
npx expo run:ios
# or
npx expo run:android
```

## Option 2: Using EAS Build

1. Install EAS CLI:
```bash
npm install -g eas-cli
eas login
```

2. Configure `eas.json`:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {}
  }
}
```

3. Build:
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

## iOS Implementation

### Step 1: Add AprilTag Library

Add the AprilTag C library to your iOS project. You can:

1. Use CocoaPods (recommended):
   - Add to `ios/Podfile`:
   ```ruby
   pod 'AprilTag', :git => 'https://github.com/AprilRobotics/apriltag.git'
   ```

2. Or manually add the source files to your Xcode project

### Step 2: Create Expo Module

Create `ios/ExpoAprilTag/ExpoAprilTagModule.swift`:

```swift
import ExpoModulesCore
import Foundation
import UIKit

public class ExpoAprilTagModule: Module {
    private var detector: AprilTagDetector?
    
    public func definition() -> ModuleDefinition {
        Name("ExpoAprilTag")
        
        OnCreate {
            // Initialize detector on module creation
        }
        
        AsyncFunction("initializeDetector") { (options: [String: Any]) -> Void in
            let tagFamily = options["tagFamily"] as? String ?? "tag36h11"
            // Initialize your AprilTag detector here
            // self.detector = AprilTagDetector(family: tagFamily)
        }
        
        AsyncFunction("detectTags") { (base64: String, options: [String: Any]) -> [[String: Any]] in
            guard let imageData = Data(base64Encoded: base64),
                  let image = UIImage(data: imageData) else {
                return []
            }
            
            // Convert UIImage to grayscale
            // Run AprilTag detection
            // Return detections as array of dictionaries
            
            return []
        }
    }
}
```

### Step 3: Register Module

Ensure the module is registered in `ios/YourAppName/AppDelegate.swift` or `ios/YourAppName/main.m`.

## Android Implementation

### Step 1: Add AprilTag Library

Add AprilTag JNI library to your Android project:

1. Download AprilTag native library (.so files) or build from source
2. Place in `android/app/src/main/jniLibs/` with architecture folders:
   - `arm64-v8a/`
   - `armeabi-v7a/`
   - `x86/`
   - `x86_64/`

### Step 2: Create Expo Module

Create `android/app/src/main/java/expo/modules/apriltag/ExpoAprilTagModule.kt`:

```kotlin
package expo.modules.apriltag

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import android.graphics.BitmapFactory
import android.util.Base64

class ExpoAprilTagModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ExpoAprilTag")
        
        AsyncFunction("initializeDetector") { options: Map<String, Any> ->
            val tagFamily = options["tagFamily"] as? String ?: "tag36h11"
            // Initialize your AprilTag detector here
        }
        
        AsyncFunction("detectTags") { base64: String, options: Map<String, Any> ->
            try {
                val imageBytes = Base64.decode(base64, Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
                
                // Convert bitmap to grayscale
                // Run AprilTag detection using JNI
                // Return detections as list of maps
                
                emptyList<Map<String, Any>>()
            } catch (e: Exception) {
                emptyList<Map<String, Any>>()
            }
        }
    }
}
```

### Step 3: Add JNI Dependencies

Add to `android/app/build.gradle`:

```gradle
android {
    ...
    defaultConfig {
        ...
        ndk {
            abiFilters 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
        }
    }
}
```

## Detection Result Format

The native module should return detections in this format:

```typescript
[
  {
    id: number,
    family: string,
    corners: [{ x: number, y: number }, ...], // 4 corners
    center: { x: number, y: number },
    decision_margin?: number,
    hamming?: number,
    goodness?: number,
    pose?: {
      R: number[][], // 3x3 rotation matrix
      t: number[]    // 3D translation vector
    }
  }
]
```

## Testing

After implementing the native module:

1. Rebuild the app:
```bash
npx expo prebuild --clean
npx expo run:ios
# or
npx expo run:android
```

2. Test with a known AprilTag image
3. Verify detections appear in the UI

## Resources

- [AprilTag Official Repository](https://github.com/AprilRobotics/apriltag)
- [Expo Modules API](https://docs.expo.dev/modules/module-api/)
- [Expo Development Builds](https://docs.expo.dev/development/introduction/)
