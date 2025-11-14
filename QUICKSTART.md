# Quick Start Guide - AprilTag Detector Mobile App

## Setup in 5 Minutes

### 1. Prerequisites

```bash
# Check Node.js version (should be 16+)
node --version

# Install Expo CLI globally
npm install -g expo-cli
```

### 2. Install Dependencies

```bash
# Navigate to project directory
cd /workspace

# Install all dependencies
npm install
```

### 3. Create Assets (Optional for Testing)

For testing, you can skip creating real assets. The app will work without them, though you may see warnings.

To create proper assets later, replace the `.txt` files in `/assets` with actual PNG images.

### 4. Start the App

```bash
# Start Expo development server
npm start
```

This will open Expo DevTools in your browser.

### 5. Run on Your Device

#### Option A: Physical Device (Easiest)

1. Install **Expo Go** app:
   - iOS: Download from App Store
   - Android: Download from Google Play

2. Scan the QR code shown in terminal or browser

3. App will load on your device!

#### Option B: Emulator/Simulator

**iOS Simulator (Mac only):**
```bash
# Press 'i' in terminal or click "Run on iOS simulator"
npm run ios
```

**Android Emulator:**
```bash
# Start Android Studio and launch an emulator first, then:
npm run android
```

## Testing the App

### 1. Grant Camera Permission

When the app opens, it will request camera permission. Tap **Allow**.

### 2. Show an AprilTag

- Print an AprilTag from: https://github.com/AprilRobotics/apriltag-imgs/tree/master/tag36h11
- Or display one on another screen
- Point your camera at the tag

### 3. View Detections

- Detected tags will show up with colored markers
- Tap on a marker or bottom card to see details
- Swipe down or tap Close to dismiss the modal

## Sample AprilTags

You can test with these tag36h11 samples:

**Print or display these URLs:**
- Tag 0: `https://github.com/AprilRobotics/apriltag-imgs/raw/master/tag36h11/tag36_11_00000.png`
- Tag 1: `https://github.com/AprilRobotics/apriltag-imgs/raw/master/tag36h11/tag36_11_00001.png`
- Tag 10: `https://github.com/AprilRobotics/apriltag-imgs/raw/master/tag36h11/tag36_11_00010.png`

## Common Issues & Solutions

### "Module not found" errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
expo start -c
```

### Camera not working

1. Check device camera permissions in Settings
2. Make sure camera is not in use by another app
3. Restart the app

### QR code not scanning

1. Ensure both devices are on the same network
2. Try typing the URL manually shown in terminal
3. Use tunnel mode: `expo start --tunnel`

### App crashes on launch

```bash
# Clear Expo cache
expo start -c

# Or clear all caches
rm -rf node_modules .expo
npm install
```

## Development Tips

### Live Reload

Changes to code automatically reload the app. Just save your file!

### Debug Menu

- iOS: Shake device or press Cmd+D
- Android: Shake device or press Cmd+M

### View Logs

```bash
# In terminal where you ran 'npm start', logs appear automatically
# Or use:
expo start --dev-client
```

## Next Steps

1. **Test Detection**: Use real AprilTags to test
2. **Read README**: See `README-MOBILE.md` for full documentation
3. **Integrate Real Detection**: See "Production Implementation" section
4. **Customize UI**: Modify styles in `App.js`
5. **Add Features**: Extend functionality as needed

## Build for Production

When ready to distribute:

```bash
# Using EAS Build (Recommended)
npm install -g eas-cli
eas build:configure
eas build --platform android
eas build --platform ios

# Or classic builds
expo build:android
expo build:ios
```

## File Structure

```
/workspace/
├── App.js                    # 👈 Main app - start here
├── package.json              # Dependencies
├── app.json                  # Expo config
├── babel.config.js           # Babel config
├── README-MOBILE.md          # Full documentation
├── QUICKSTART.md            # This file
├── utils/
│   └── aprilTagDetector.js   # Detection logic
└── assets/                   # App icons/images
```

## Getting Help

- **Expo Docs**: https://docs.expo.dev
- **AprilTag Info**: https://github.com/AprilRobotics/apriltag
- **React Native**: https://reactnative.dev

## Key Commands

```bash
npm start          # Start development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run in web browser

expo start -c      # Start with cleared cache
expo install       # Install/update Expo packages
```

---

**Ready to build?** Just run `npm install` and `npm start`!

Enjoy detecting AprilTags! 🎯
