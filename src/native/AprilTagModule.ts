import { NativeModulesProxy } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to AprilTagModule.web.ts
// and on native platforms to the native module.
const AprilTagModule = NativeModulesProxy.ExpoAprilTag ?? new Proxy({}, {
  get() {
    throw new Error('AprilTag native module not found. Make sure you have built the native code.');
  },
});

export interface DetectionResult {
  id: number;
  family: string;
  corners: Array<{ x: number; y: number }>;
  center: { x: number; y: number };
  decision_margin?: number;
  hamming?: number;
  goodness?: number;
  pose?: {
    R: number[][];
    t: number[];
  };
  solutions?: any[];
}

export interface DetectorOptions {
  tagFamily?: string;
  quadDecimate?: number;
  quadSigma?: number;
  refineEdges?: number;
  decodeSharpening?: number;
  maxDetections?: number;
}

export async function detectTags(
  imageBase64: string,
  options: DetectorOptions = {}
): Promise<DetectionResult[]> {
  return await AprilTagModule.detectTags(imageBase64, options);
}

export async function initializeDetector(options: DetectorOptions = {}): Promise<void> {
  return await AprilTagModule.initializeDetector(options);
}

export default AprilTagModule;
