import { NativeModulesProxy } from 'expo-modules-core';

// Import the native module
export default NativeModulesProxy.ExpoAprilTag ?? {
  detectTags: async () => {
    throw new Error('AprilTag native module not found');
  },
  initializeDetector: async () => {
    throw new Error('AprilTag native module not found');
  },
};
