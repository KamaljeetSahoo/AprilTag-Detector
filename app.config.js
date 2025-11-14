export default {
  expo: {
    name: "AprilTag Detector",
    slug: "apriltag-detector",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ccf0e4"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.apriltagdetector.app",
      infoPlist: {
        NSCameraUsageDescription: "This app needs access to your camera to detect AprilTags."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ccf0e4"
      },
      package: "com.apriltagdetector.app",
      permissions: [
        "CAMERA"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera"
        }
      ]
    ]
  }
};
