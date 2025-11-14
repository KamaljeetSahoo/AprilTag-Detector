import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import Svg, { Polygon, Text as SvgText } from 'react-native-svg';
import { Detection } from '../types';

interface DetectionOverlayProps {
  detections: Detection[];
  onShowDetails: (detection: Detection) => void;
  imageWidth?: number;
  imageHeight?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DetectionOverlay({ 
  detections, 
  onShowDetails,
  imageWidth = SCREEN_WIDTH,
  imageHeight = SCREEN_HEIGHT 
}: DetectionOverlayProps) {
  if (detections.length === 0) {
    return null;
  }

  // Scale factor to convert detection coordinates to screen coordinates
  // This assumes the camera view fills the container
  const scaleX = SCREEN_WIDTH / imageWidth;
  const scaleY = SCREEN_HEIGHT / imageHeight;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Svg style={StyleSheet.absoluteFill}>
        {detections.map((detection, index) => {
          const scaledCorners = detection.corners.map(corner => ({
            x: corner.x * scaleX,
            y: corner.y * scaleY,
          }));

          const scaledCenter = {
            x: detection.center.x * scaleX,
            y: detection.center.y * scaleY,
          };

          const points = scaledCorners
            .map(corner => `${corner.x},${corner.y}`)
            .join(' ');

          return (
            <React.Fragment key={index}>
              <Polygon
                points={points}
                fill="none"
                stroke="darksalmon"
                strokeWidth="3"
              />
              <SvgText
                x={scaledCenter.x}
                y={scaledCenter.y + 5}
                fontSize="20"
                fontWeight="bold"
                fill="blue"
                textAnchor="middle"
              >
                {detection.id.toString()}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
      
      {detections.map((detection, index) => {
        const scaledCenter = {
          x: detection.center.x * scaleX,
          y: detection.center.y * scaleY,
        };

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.detectionButton,
              {
                left: Math.max(10, Math.min(SCREEN_WIDTH - 110, scaledCenter.x - 50)),
                top: Math.max(10, Math.min(SCREEN_HEIGHT - 50, scaledCenter.y + 30)),
              },
            ]}
            onPress={() => onShowDetails(detection)}
          >
            <Text style={styles.buttonText}>Show Details</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  detectionButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
