import * as FileSystem from 'expo-file-system';
import { Detection } from '../types';
import { detectTags as nativeDetectTags } from '../native/AprilTagModule';

export interface AprilTagDetectorOptions {
  tagFamily?: 'tag36h11' | 'tag25h9' | 'tag16h5' | 'tagCircle21h7' | 'tagCircle49h12' | 'tagCustom48h12' | 'tagStandard41h12' | 'tagStandard52h13';
  quadDecimate?: number;
  quadSigma?: number;
  refineEdges?: number;
  decodeSharpening?: number;
  maxDetections?: number;
}

const defaultOptions: AprilTagDetectorOptions = {
  tagFamily: 'tag36h11',
  quadDecimate: 2.0,
  quadSigma: 0.0,
  refineEdges: 1,
  decodeSharpening: 0.25,
  maxDetections: 0, // 0 = unlimited
};

export async function detectAprilTags(
  imageUri: string,
  options: AprilTagDetectorOptions = {}
): Promise<Detection[]> {
  const opts = { ...defaultOptions, ...options };

  try {
    // Read image as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Use native module for detection
    const result = await nativeDetectTags(base64, opts);
    return parseDetections(result);
  } catch (error) {
    console.error('Error detecting AprilTags:', error);
    // Return empty array on error
    return [];
  }
}

function parseDetections(result: any): Detection[] {
  if (!result || !Array.isArray(result)) {
    return [];
  }

  return result.map((det: any) => ({
    id: det.id || 0,
    family: det.family || 'tag36h11',
    corners: det.corners || [],
    center: det.center || { x: 0, y: 0 },
    decision_margin: det.decision_margin,
    hamming: det.hamming,
    goodness: det.goodness,
    pose: det.pose,
    solutions: det.solutions,
  }));
}

export function getAllSupportedTagFamilies(): string[] {
  return [
    'tag36h11',
    'tag25h9',
    'tag16h5',
    'tagCircle21h7',
    'tagCircle49h12',
    'tagCustom48h12',
    'tagStandard41h12',
    'tagStandard52h13',
  ];
}
