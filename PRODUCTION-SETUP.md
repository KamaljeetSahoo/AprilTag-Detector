# Production AprilTag Detection Setup

This guide shows how to implement **real** AprilTag detection in your React Native app using native modules.

## Current Implementation

⚠️ **Note**: The current detector (`utils/aprilTagDetector.js`) uses **mock data** for demonstration. Follow this guide to implement real detection.

## Recommended Approach: Vision Camera + Frame Processor

The best solution for production is **react-native-vision-camera** with a custom frame processor plugin.

### Step 1: Install Vision Camera

```bash
npm install react-native-vision-camera
```

### Step 2: Configure Platform-Specific Settings

#### iOS Configuration

Add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-vision-camera",
        {
          "cameraPermissionText": "$(PRODUCT_NAME) needs access to your Camera to detect AprilTags."
        }
      ]
    ]
  }
}
```

#### Android Configuration

Add to `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ]
    }
  }
}
```

### Step 3: Install AprilTag Frame Processor Plugin

You have two options:

#### Option A: Use Existing Plugin (if available)

```bash
npm install vision-camera-apriltag
# or similar package
```

#### Option B: Create Custom Native Module

Create a custom frame processor plugin that wraps the AprilTag C++ library.

**1. Create Native Module Structure:**

```bash
mkdir -p native-apriltag/ios
mkdir -p native-apriltag/android
```

**2. Add AprilTag Library:**

Download AprilTag C++ source:
```bash
git clone https://github.com/AprilRobotics/apriltag.git native-apriltag/cpp
```

**3. Create iOS Plugin:**

`native-apriltag/ios/AprilTagFrameProcessor.mm`

```objc
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/Frame.h>

extern "C" {
#include "apriltag.h"
#include "tag36h11.h"
}

@interface AprilTagFrameProcessor : NSObject
@end

@implementation AprilTagFrameProcessor

+ (void)load {
  [FrameProcessorPluginRegistry addFrameProcessorPlugin:@"detectAprilTags"
    withInitializer:^FrameProcessorPlugin*(NSDictionary* options) {
      return [[AprilTagFrameProcessorPlugin alloc] init];
    }];
}

@end

@interface AprilTagFrameProcessorPlugin : FrameProcessorPlugin
@end

@implementation AprilTagFrameProcessorPlugin

- (id)callback:(Frame*)frame withArguments:(NSDictionary*)arguments {
  apriltag_detector_t *td = apriltag_detector_create();
  apriltag_family_t *tf = tag36h11_create();
  apriltag_detector_add_family(td, tf);
  
  // Convert frame to grayscale
  // ... image processing code ...
  
  // Detect tags
  zarray_t *detections = apriltag_detector_detect(td, im);
  
  // Convert to JSON
  NSMutableArray *results = [NSMutableArray array];
  for (int i = 0; i < zarray_size(detections); i++) {
    apriltag_detection_t *det;
    zarray_get(detections, i, &det);
    
    [results addObject:@{
      @"id": @(det->id),
      @"hamming": @(det->hamming),
      @"decision_margin": @(det->decision_margin),
      @"center": @{
        @"x": @(det->c[0]),
        @"y": @(det->c[1])
      },
      @"corners": @[
        @{@"x": @(det->p[0][0]), @"y": @(det->p[0][1])},
        @{@"x": @(det->p[1][0]), @"y": @(det->p[1][1])},
        @{@"x": @(det->p[2][0]), @"y": @(det->p[2][1])},
        @{@"x": @(det->p[3][0]), @"y": @(det->p[3][1])}
      ]
    }];
  }
  
  // Cleanup
  apriltag_detections_destroy(detections);
  apriltag_detector_destroy(td);
  tag36h11_destroy(tf);
  
  return results;
}

@end
```

**4. Create Android Plugin:**

`native-apriltag/android/AprilTagFrameProcessor.kt`

```kotlin
package com.apriltag

import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessor.VisionCameraProxy

class AprilTagFrameProcessorPlugin(proxy: VisionCameraProxy): FrameProcessorPlugin() {
  
  companion object {
    init {
      System.loadLibrary("apriltag")
    }
  }
  
  override fun callback(frame: Frame, params: Map<String, Any>?): Any {
    // Convert frame to grayscale
    val grayscale = frameToGrayscale(frame)
    
    // Detect tags using native method
    val detections = detectTags(grayscale, frame.width, frame.height)
    
    return detections
  }
  
  private external fun detectTags(
    data: ByteArray,
    width: Int,
    height: Int
  ): List<Map<String, Any>>
}
```

### Step 4: Update App.js to Use Real Detection

Replace the existing camera implementation:

```javascript
import { Camera, useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';

export default function App() {
  const [detections, setDetections] = useState([]);
  const device = useCameraDevice('back');
  
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    
    // Call native AprilTag detection
    const tags = detectAprilTags(frame, {
      family: 'tag36h11',
      maxDetections: 10,
      refineEdges: true,
    });
    
    // Update state on JS thread
    runOnJS(setDetections)(tags);
  }, []);
  
  if (!device) return <ActivityIndicator />;
  
  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        fps={30}
      />
      
      {/* Your UI overlays */}
    </View>
  );
}
```

### Step 5: Build Custom Development Client

Since we're using native modules, we need a custom development client:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Step 6: Add Support for Multiple Tag Families

Extend the detector to support different tag families:

```cpp
// In native code
switch (family) {
  case "tag16h5":
    tf = tag16h5_create();
    break;
  case "tag25h9":
    tf = tag25h9_create();
    break;
  case "tag36h11":
    tf = tag36h11_create();
    break;
  case "tagStandard41h12":
    tf = tagStandard41h12_create();
    break;
  // Add more families as needed
}
```

## Alternative: Pure JavaScript Implementation

If you can't use native modules, you can implement a pure JS detector (slower but works):

### Using JSQRCode + Custom Pattern Matching

```javascript
// Install image processing library
npm install react-native-fast-image
npm install @react-native-community/image-editor

// Implement detection
import ImageEditor from '@react-native-community/image-editor';

async function detectAprilTags(imageUri) {
  // 1. Convert to grayscale
  const grayscale = await convertToGrayscale(imageUri);
  
  // 2. Find edges
  const edges = detectEdges(grayscale);
  
  // 3. Find quads
  const quads = findQuadrilaterals(edges);
  
  // 4. Decode each quad
  const tags = [];
  for (const quad of quads) {
    const tag = decodeAprilTag(quad, grayscale);
    if (tag) tags.push(tag);
  }
  
  return tags;
}
```

## Performance Optimization

### 1. Frame Processing Rate

```javascript
const frameProcessor = useFrameProcessor((frame) => {
  'worklet'
  
  // Process every Nth frame
  if (frame.timestamp % 3 === 0) {
    const tags = detectAprilTags(frame);
    runOnJS(setDetections)(tags);
  }
}, []);
```

### 2. Image Resolution

```javascript
<Camera
  // ... other props
  preset="medium" // Use lower resolution for faster processing
  fps={30}
/>
```

### 3. Detector Options

```javascript
const tags = detectAprilTags(frame, {
  quad_decimate: 2.0,  // Decimate input image
  quad_sigma: 0.8,     // Blur to reduce noise
  refine_edges: true,  // Better accuracy
  max_detections: 10,  // Limit max tags
});
```

## Testing Real Detection

### 1. Print Test Tags

Download and print tags from:
```
https://github.com/AprilRobotics/apriltag-imgs/tree/master/tag36h11
```

### 2. Test Different Conditions

- Various lighting conditions
- Different distances
- Multiple tags simultaneously
- Different angles

### 3. Measure Performance

```javascript
const startTime = performance.now();
const detections = detectAprilTags(frame);
const endTime = performance.now();
console.log(`Detection took ${endTime - startTime}ms`);
```

## Troubleshooting

### Build Errors

```bash
# Clear all caches
cd ios && pod deintegrate && pod install && cd ..
cd android && ./gradlew clean && cd ..
rm -rf node_modules
npm install
```

### Native Module Not Found

1. Ensure native code is properly linked
2. Rebuild the app
3. Check that .so/.a files are included

### Poor Detection Performance

1. Use lower camera resolution
2. Reduce frame processing rate
3. Optimize detector parameters
4. Use native implementation instead of JS

## Production Checklist

- [ ] Native AprilTag detection implemented
- [ ] Tested on both iOS and Android
- [ ] Performance optimized (>= 15 FPS)
- [ ] Multiple tag families supported
- [ ] Error handling implemented
- [ ] Proper memory management
- [ ] Camera permissions handled
- [ ] UI/UX polished
- [ ] Production build tested

## Resources

- **AprilTag C++ Library**: https://github.com/AprilRobotics/apriltag
- **Vision Camera Docs**: https://react-native-vision-camera.com
- **Frame Processor Guide**: https://react-native-vision-camera.com/docs/guides/frame-processors
- **EAS Build**: https://docs.expo.dev/build/introduction/

---

**Need help?** Check the Vision Camera documentation or AprilTag library docs.
