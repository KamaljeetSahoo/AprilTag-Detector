import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { Detection } from '../types';
import { createWasmHTML } from '../utils/createWasmHTML';

interface WasmDetectorWebViewProps {
  onDetections: (detections: Detection[], width?: number, height?: number) => void;
  onReady?: () => void;
}

export interface WasmDetectorWebViewRef {
  processImage: (imageUri: string) => Promise<void>;
}

const WasmDetectorWebView = forwardRef<WasmDetectorWebViewRef, WasmDetectorWebViewProps>(
  ({ onDetections, onReady }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [htmlContent, setHtmlContent] = useState<string>('');

    useImperativeHandle(ref, () => ({
      processImage: async (imageUri: string) => {
        if (!isReady || !webViewRef.current) {
          return;
        }

        try {
          // Read image as base64
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Create data URL
          const dataUrl = `data:image/jpeg;base64,${base64}`;

          // Send to WebView for processing
          webViewRef.current.postMessage(
            JSON.stringify({
              type: 'process',
              payload: { imageDataUrl: dataUrl },
            })
          );
        } catch (error) {
          console.error('Error processing image:', error);
        }
      },
    }));

    useEffect(() => {
      // Initialize detector once WebView is loaded
      if (isInitialized && webViewRef.current && !isReady) {
        webViewRef.current.postMessage(JSON.stringify({ type: 'init' }));
      }
    }, [isInitialized, isReady]);

    const handleMessage = (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === 'loaded') {
          setIsInitialized(true);
        } else if (data.type === 'ready') {
          setIsReady(true);
          onReady?.();
        } else if (data.type === 'detections') {
          const detections = parseDetections(data.detections);
          onDetections(detections, data.width, data.height);
        } else if (data.type === 'error') {
          console.error('WASM Detector Error:', data.error);
        }
      } catch (error) {
        console.error('Error parsing WebView message:', error);
      }
    };

    useEffect(() => {
      // Load HTML content
      createWasmHTML().then(setHtmlContent);
    }, []);
    
    if (!htmlContent) {
      return null;
    }

    return (
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ 
            html: htmlContent,
            baseUrl: Platform.OS === 'ios' 
              ? 'file://' 
              : 'file:///android_asset/'
          }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          mixedContentMode="always"
          style={styles.webview}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView HTTP error: ', nativeEvent);
          }}
        />
      </View>
    );
  }
);

WasmDetectorWebView.displayName = 'WasmDetectorWebView';

function parseDetections(detections: any[]): Detection[] {
  if (!detections || !Array.isArray(detections)) {
    return [];
  }

  return detections.map((det: any) => ({
    id: det.id || 0,
    family: det.family || 'tag36h11',
    corners: (det.corners || []).map((c: any) => ({
      x: c.x || 0,
      y: c.y || 0,
    })),
    center: det.center || { x: 0, y: 0 },
    decision_margin: det.decision_margin,
    hamming: det.hamming,
    goodness: det.goodness,
    pose: det.pose,
    solutions: det.solutions,
  }));
}

export default WasmDetectorWebView;
