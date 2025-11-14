import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Detection } from '../types';
import WasmDetectorWebView, { WasmDetectorWebViewRef } from './WasmDetectorWebView';

interface CameraViewProps {
  onDetections: (detections: Detection[], imageWidth?: number, imageHeight?: number) => void;
  tagFamily?: string;
}

export default function CameraView({ onDetections, tagFamily = 'tag36h11' }: CameraViewProps) {
  const cameraRef = useRef<ExpoCameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const frameTimeoutRef = useRef<NodeJS.Timeout>();
  const processingRef = useRef(false);
  const detectorRef = useRef<WasmDetectorWebViewRef | null>(null);
  const [detectorReady, setDetectorReady] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (permission?.granted && cameraRef.current) {
      startProcessing();
    }
    return () => {
      if (frameTimeoutRef.current) {
        clearTimeout(frameTimeoutRef.current);
      }
      processingRef.current = false;
    };
  }, [permission?.granted]);

  const processFrame = useCallback(async () => {
    if (!cameraRef.current || processingRef.current) return;
    
    processingRef.current = true;
    setIsProcessing(true);
    
    try {
      // Take a picture for processing
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.3,
        base64: false,
        skipProcessing: true,
        exif: false,
      });

      if (photo?.uri && detectorReady) {
        // Process frame using WASM detector
        if (detectorRef.current) {
          await detectorRef.current.processImage(photo.uri);
        }
      }
    } catch (error) {
      // Silently handle errors (camera might be busy)
      console.debug('Frame processing:', error);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
      
      // Schedule next frame processing
      if (permission?.granted) {
        frameTimeoutRef.current = setTimeout(processFrame, 200); // Process ~5 fps
      }
    }
  }, [permission?.granted, onDetections, tagFamily]);

  const startProcessing = useCallback(() => {
    if (processingRef.current) return;
    processFrame();
  }, [processFrame]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const handleDetectorReady = () => {
    setDetectorReady(true);
  };

  const handleDetections = (detections: Detection[], width?: number, height?: number) => {
    onDetections(detections, width, height);
  };

  return (
    <View style={styles.container}>
      <ExpoCameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      />
      <WasmDetectorWebView
        ref={detectorRef}
        onReady={handleDetectorReady}
        onDetections={handleDetections}
      />
      {isProcessing && (
        <View style={styles.processingIndicator}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  processingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
});
