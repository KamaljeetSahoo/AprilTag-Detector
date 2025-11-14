import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { getAllSupportedTagFamilies } from '../utils/apriltagDetector';

interface TagFamilySelectorProps {
  selectedFamily: string;
  onSelectFamily: (family: string) => void;
}

export default function TagFamilySelector({ selectedFamily, onSelectFamily }: TagFamilySelectorProps) {
  const [modalVisible, setModalVisible] = React.useState(false);
  const families = getAllSupportedTagFamilies();

  return (
    <>
      <TouchableOpacity 
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectorText}>Tag Family: {selectedFamily}</Text>
        <Text style={styles.selectorArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Tag Family</Text>
            {families.map((family) => (
              <TouchableOpacity
                key={family}
                style={[
                  styles.familyOption,
                  selectedFamily === family && styles.familyOptionSelected,
                ]}
                onPress={() => {
                  onSelectFamily(family);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.familyOptionText,
                    selectedFamily === family && styles.familyOptionTextSelected,
                  ]}
                >
                  {family}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectorArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  familyOption: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    backgroundColor: '#f5f5f5',
  },
  familyOptionSelected: {
    backgroundColor: '#007AFF',
  },
  familyOptionText: {
    fontSize: 16,
    color: '#333',
  },
  familyOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
