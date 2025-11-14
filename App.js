import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Camera } from 'expo-camera';
import { WebView } from 'react-native-webview';

import { useOfflineWebBundle } from './src/hooks/useOfflineWebBundle';

const formatNumber = (value, digits = 1) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '-';
  }
  return value.toFixed(digits);
};

export default function App() {
  const [cameraStatus, setCameraStatus] = useState('unknown');
  const [statusMessage, setStatusMessage] = useState('Preparing offline AprilTag runtime…');
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [detectorPayload, setDetectorPayload] = useState({
    count: 0,
    detections: [],
    fps: 0,
    latencyMs: 0,
    timestamp: null
  });

  const webViewRef = useRef(null);
  const { webViewUri, loading: bundleLoading, error: bundleError } = useOfflineWebBundle();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (mounted) {
        setCameraStatus(status === 'granted' ? 'granted' : 'denied');
        if (status !== 'granted') {
          setLastError({
            origin: 'permissions',
            message: 'Camera permission is required to read AprilTags.'
          });
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleWebViewMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'detections') {
        setDetectorPayload({
          count: data.payload.count,
          detections: data.payload.detections ?? [],
          fps: data.payload.fps ?? 0,
          latencyMs: data.payload.latencyMs ?? 0,
          timestamp: data.payload.timestamp ?? Date.now()
        });
      } else if (data.type === 'status') {
        if (data.message === 'camera-ready') {
          setStatusMessage('Camera ready. Initializing AprilTag core…');
        } else if (data.message === 'detector-ready') {
          setStatusMessage('Detector running locally. Point at a tag.');
        } else {
          setStatusMessage(data.message);
        }
      } else if (data.type === 'error') {
        setLastError({
          origin: data.origin || 'webview',
          message: data.message || 'Unknown detector error'
        });
        setStatusMessage('Detector reported an error.');
      }
    } catch (error) {
      console.warn('Unable to parse WebView message', error);
    }
  }, []);

  const handleWebViewError = useCallback((event) => {
    setLastError({
      origin: 'webview-runtime',
      message: event?.nativeEvent?.description || 'Unknown WebView error'
    });
    setStatusMessage('Unable to boot the WebView runtime.');
  }, []);

  const detectionIds = useMemo(
    () => detectorPayload.detections.map((det) => det.id).join(', '),
    [detectorPayload.detections]
  );

  const detailsDisabled = detectorPayload.count === 0;

  const androidPermissionProps =
    Platform.OS === 'android'
      ? {
          onPermissionRequest: (request) => {
            request.grant(request.resources);
          },
          allowFileAccess: true,
          allowUniversalAccessFromFileURLs: true,
          mixedContentMode: 'always'
        }
      : {
          allowingReadAccessToURL: webViewUri
            ? webViewUri.replace('index.html', '')
            : undefined
        };

  const renderWebView = () => {
    if (bundleError) {
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Bundle error</Text>
          <Text style={styles.placeholderMessage}>{bundleError.message}</Text>
        </View>
      );
    }

    if (cameraStatus === 'denied') {
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Camera access denied</Text>
          <Text style={styles.placeholderMessage}>
            Enable camera permissions in settings to detect AprilTags offline.
          </Text>
        </View>
      );
    }

    if (!webViewUri || bundleLoading) {
      return (
        <View style={styles.placeholder}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.placeholderMessage}>Preparing offline detector…</Text>
        </View>
      );
    }

    return (
      <WebView
        ref={webViewRef}
        source={{ uri: webViewUri }}
        originWhitelist={['*']}
        allowsInlineMediaPlayback
        mediaCapturePermissionGrantType="grant"
        javaScriptEnabled
        mediaPlaybackRequiresUserAction={false}
        onMessage={handleWebViewMessage}
        onError={handleWebViewError}
        renderLoading={() => (
          <View style={styles.webViewLoader}>
            <ActivityIndicator size="large" color="#fbbf24" />
            <Text style={styles.placeholderMessage}>Booting detector…</Text>
          </View>
        )}
        startInLoadingState
        style={styles.webView}
        androidLayerType="hardware"
        {...androidPermissionProps}
      />
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>AprilTag Detector</Text>
          <Text style={styles.subtitle}>Cross-platform · Offline · AprilTag 36h11+</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>
            {detectorPayload.count} tag{detectorPayload.count === 1 ? '' : 's'}
          </Text>
        </View>
      </View>

      <Text style={styles.statusMessage}>{statusMessage}</Text>

      <View style={styles.viewerContainer}>{renderWebView()}</View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.metricLabel}>Tags detected</Text>
          <Text style={styles.metricValue}>{detectorPayload.count}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.metricLabel}>IDs</Text>
          <Text style={styles.metricValue}>{detectionIds || '—'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.metricLabel}>FPS</Text>
          <Text style={styles.metricValue}>{formatNumber(detectorPayload.fps)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.metricLabel}>Latency (ms)</Text>
          <Text style={styles.metricValue}>{formatNumber(detectorPayload.latencyMs, 2)}</Text>
        </View>

        {lastError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Latest warning</Text>
            <Text style={styles.errorMessage}>{lastError.message}</Text>
          </View>
        )}

        <Pressable
          style={[styles.detailsButton, detailsDisabled && styles.detailsButtonDisabled]}
          onPress={() => setDetailsVisible(true)}
          disabled={detailsDisabled}
        >
          <Text style={styles.detailsButtonText}>
            {detailsDisabled ? 'Waiting for tags…' : 'Show details'}
          </Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={detailsVisible}
        onRequestClose={() => setDetailsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Detection details</Text>
            <ScrollView style={styles.modalScroll}>
              {detectorPayload.detections.length === 0 ? (
                <Text style={styles.modalEmpty}>No AprilTags detected yet.</Text>
              ) : (
                detectorPayload.detections.map((det) => (
                  <View key={`tag-${det.id}-${det.center?.x}-${det.center?.y}`} style={styles.modalDetection}>
                    <Text style={styles.modalDetectionTitle}>Tag #{det.id}</Text>
                    <Text style={styles.modalDetectionText}>
                      Hamming {det.hamming ?? '—'} · Decision margin {formatNumber(det.decision_margin ?? det.decisionMargin ?? 0, 2)}
                    </Text>
                    {det.center && (
                      <Text style={styles.modalDetectionText}>
                        Center ({formatNumber(det.center.x, 1)}, {formatNumber(det.center.y, 1)})
                      </Text>
                    )}
                    {Array.isArray(det.corners) && (
                      <Text style={styles.modalDetectionText}>
                        Corners {det.corners
                          .map((corner) => `(${formatNumber(corner.x, 0)}, ${formatNumber(corner.y, 0)})`)
                          .join(' · ')}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
            <Pressable style={styles.modalCloseButton} onPress={() => setDetailsVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc'
  },
  subtitle: {
    color: '#94a3b8',
    marginTop: 4,
    fontSize: 13
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#22d3ee'
  },
  statusBadgeText: {
    fontWeight: '700',
    color: '#0f172a'
  },
  statusMessage: {
    marginTop: 8,
    color: '#e2e8f0',
    fontSize: 14
  },
  viewerContainer: {
    marginTop: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
    aspectRatio: 9 / 16,
    backgroundColor: '#0f172a'
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  webViewLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc'
  },
  placeholderMessage: {
    fontSize: 14,
    textAlign: 'center',
    color: '#cbd5f5',
    marginTop: 12
  },
  summaryContainer: {
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  metricLabel: {
    color: '#cbd5f5',
    fontSize: 14
  },
  metricValue: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600'
  },
  errorBox: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 4
  },
  errorTitle: {
    color: '#fb7185',
    fontWeight: '600',
    marginBottom: 4
  },
  errorMessage: {
    color: '#fecdd3',
    fontSize: 13
  },
  detailsButton: {
    marginTop: 8,
    backgroundColor: '#38bdf8',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center'
  },
  detailsButtonDisabled: {
    backgroundColor: '#1e293b'
  },
  detailsButtonText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#0f172a'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.77)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#020617',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc'
  },
  modalScroll: {
    marginTop: 12
  },
  modalEmpty: {
    color: '#cbd5f5'
  },
  modalDetection: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1e293b'
  },
  modalDetectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#bae6fd'
  },
  modalDetectionText: {
    color: '#cbd5f5',
    fontSize: 13,
    marginTop: 4
  },
  modalCloseButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#38bdf8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999
  },
  modalCloseText: {
    fontWeight: '700',
    color: '#0f172a'
  }
});
