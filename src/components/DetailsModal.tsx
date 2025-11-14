import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Detection } from '../types';

interface DetailsModalProps {
  visible: boolean;
  detection: Detection | null;
  onClose: () => void;
}

export default function DetailsModal({ visible, detection, onClose }: DetailsModalProps) {
  if (!detection) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tag Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tag ID:</Text>
              <Text style={styles.detailValue}>{detection.id}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Family:</Text>
              <Text style={styles.detailValue}>{detection.family || 'N/A'}</Text>
            </View>

            {detection.decision_margin !== undefined && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Decision Margin:</Text>
                <Text style={styles.detailValue}>{detection.decision_margin.toFixed(2)}</Text>
              </View>
            )}

            {detection.hamming !== undefined && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Hamming:</Text>
                <Text style={styles.detailValue}>{detection.hamming}</Text>
              </View>
            )}

            {detection.goodness !== undefined && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Goodness:</Text>
                <Text style={styles.detailValue}>{detection.goodness.toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Center:</Text>
              <Text style={styles.detailValue}>
                ({detection.center.x.toFixed(1)}, {detection.center.y.toFixed(1)})
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Corners:</Text>
              {detection.corners.map((corner, index) => (
                <View key={index} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Corner {index + 1}:</Text>
                  <Text style={styles.detailValue}>
                    ({corner.x.toFixed(1)}, {corner.y.toFixed(1)})
                  </Text>
                </View>
              ))}
            </View>

            {detection.pose && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pose:</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Translation:</Text>
                  <Text style={styles.detailValue}>
                    [{detection.pose.t.map(t => t.toFixed(3)).join(', ')}]
                  </Text>
                </View>
                <Text style={styles.detailLabel}>Rotation Matrix:</Text>
                {detection.pose.R.map((row, i) => (
                  <Text key={i} style={styles.detailValue}>
                    [{row.map(r => r.toFixed(3)).join(', ')}]
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  modalBody: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  section: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
});
