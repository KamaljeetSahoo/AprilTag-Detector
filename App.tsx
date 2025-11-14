import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import CameraView from './src/components/CameraView';
import DetectionOverlay from './src/components/DetectionOverlay';
import DetailsModal from './src/components/DetailsModal';
import TagFamilySelector from './src/components/TagFamilySelector';
import { Detection } from './src/types';

export default function App() {
  const [detections, setDetections] = React.useState<Detection[]>([]);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [selectedDetection, setSelectedDetection] = React.useState<Detection | null>(null);
  const [tagFamily, setTagFamily] = React.useState<string>('tag36h11');
  const [imageDimensions, setImageDimensions] = React.useState<{ width: number; height: number } | null>(null);

  const handleDetections = (newDetections: Detection[], imageWidth?: number, imageHeight?: number) => {
    setDetections(newDetections);
    if (imageWidth && imageHeight) {
      setImageDimensions({ width: imageWidth, height: imageHeight });
    }
  };

  const handleTagFamilyChange = (family: string) => {
    setTagFamily(family);
    // Re-initialize detector with new family
    setDetections([]);
  };

  const handleShowDetails = (detection: Detection) => {
    setSelectedDetection(detection);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedDetection(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>AprilTag Detector</Text>
        <Text style={styles.subtitle}>
          {detections.length > 0 
            ? `${detections.length} Tag${detections.length > 1 ? 's' : ''} Detected`
            : 'No detections'}
        </Text>
        <TagFamilySelector 
          selectedFamily={tagFamily}
          onSelectFamily={handleTagFamilyChange}
        />
      </View>
      
      <View style={styles.cameraContainer}>
        <CameraView onDetections={handleDetections} tagFamily={tagFamily} />
        <DetectionOverlay 
          detections={detections} 
          onShowDetails={handleShowDetails}
          imageWidth={imageDimensions?.width}
          imageHeight={imageDimensions?.height}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {detections.length > 0 
            ? `Tag IDs: ${detections.map(d => d.id).join(', ')}`
            : 'Show an AprilTag to detect'}
        </Text>
      </View>

      <DetailsModal
        visible={showDetailsModal}
        detection={selectedDetection}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ccf0e4',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  footer: {
    padding: 15,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});
