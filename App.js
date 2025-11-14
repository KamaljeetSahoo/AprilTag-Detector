import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { detectAprilTags } from './utils/aprilTagDetector';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [detections, setDetections] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);
  const processingRef = useRef(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    // Start continuous frame processing
    const interval = setInterval(() => {
      if (!processingRef.current && cameraRef.current) {
        processFrame();
      }
    }, 100); // Process every 100ms

    return () => clearInterval(interval);
  }, []);

  const processFrame = async () => {
    if (!cameraRef.current || processingRef.current) return;

    try {
      processingRef.current = true;
      setIsProcessing(true);

      // Take a picture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        skipProcessing: true,
      });

      // Detect AprilTags
      const detected = await detectAprilTags(photo.base64, photo.width, photo.height);
      setDetections(detected);
    } catch (error) {
      console.error('Error processing frame:', error);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <Text style={styles.infoText}>
          Please grant camera permission in your device settings
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        {/* Overlay for detections */}
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AprilTag Detector</Text>
            <Text style={styles.headerSubtitle}>
              {detections.length > 0
                ? `${detections.length} tag${detections.length > 1 ? 's' : ''} detected`
                : 'Show an AprilTag to detect'}
            </Text>
          </View>

          {/* Detection indicators */}
          {detections.map((detection, index) => (
            <TouchableOpacity
              key={`detection-${detection.id}-${index}`}
              style={[
                styles.detectionMarker,
                {
                  left: detection.center?.x || SCREEN_WIDTH / 2,
                  top: detection.center?.y || SCREEN_HEIGHT / 2,
                },
              ]}
              onPress={() => setSelectedTag(detection)}
            >
              <View style={styles.markerCircle}>
                <Text style={styles.markerText}>{detection.id}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Bottom info panel */}
          <View style={styles.bottomPanel}>
            {detections.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {detections.map((detection, index) => (
                  <TouchableOpacity
                    key={`tag-${detection.id}-${index}`}
                    style={styles.tagCard}
                    onPress={() => setSelectedTag(detection)}
                  >
                    <Text style={styles.tagCardId}>Tag #{detection.id}</Text>
                    <Text style={styles.tagCardAction}>Tap for details</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noDetectionContainer}>
                <Text style={styles.noDetectionText}>
                  No AprilTags detected
                </Text>
                <Text style={styles.noDetectionSubtext}>
                  Point camera at tag36h11 AprilTags
                </Text>
              </View>
            )}
          </View>
        </View>
      </CameraView>

      {/* Detail Modal */}
      <Modal
        visible={selectedTag !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedTag(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                AprilTag Details
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedTag(null)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedTag && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tag ID:</Text>
                    <Text style={styles.detailValue}>{selectedTag.id}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Family:</Text>
                    <Text style={styles.detailValue}>
                      {selectedTag.family || 'tag36h11'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Hamming:</Text>
                    <Text style={styles.detailValue}>
                      {selectedTag.hamming || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Decision Margin:</Text>
                    <Text style={styles.detailValue}>
                      {selectedTag.decision_margin?.toFixed(2) || 'N/A'}
                    </Text>
                  </View>

                  {selectedTag.center && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Center Position:</Text>
                      <Text style={styles.detailValue}>
                        ({selectedTag.center.x?.toFixed(1)}, {selectedTag.center.y?.toFixed(1)})
                      </Text>
                    </View>
                  )}

                  {selectedTag.corners && selectedTag.corners.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Corners:</Text>
                      {selectedTag.corners.map((corner, idx) => (
                        <Text key={idx} style={styles.detailValue}>
                          Corner {idx + 1}: ({corner.x?.toFixed(1)}, {corner.y?.toFixed(1)})
                        </Text>
                      ))}
                    </View>
                  )}

                  {selectedTag.pose && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Pose Information:</Text>
                      <Text style={styles.detailValue}>
                        Available (requires calibration)
                      </Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setSelectedTag(null)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ccc',
  },
  detectionMarker: {
    position: 'absolute',
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  markerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  markerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 20,
    paddingHorizontal: 10,
    minHeight: 100,
  },
  tagCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: '#fff',
    minWidth: 120,
  },
  tagCardId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  tagCardAction: {
    fontSize: 12,
    color: '#ccc',
  },
  noDetectionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  noDetectionText: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: '600',
    marginBottom: 5,
  },
  noDetectionSubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  detailSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalButton: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
