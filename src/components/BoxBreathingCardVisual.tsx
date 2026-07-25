import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type Props = {
  color: string;
  backgroundColor: string;
};

/**
 * Static card-sized frame from the full Box Breathing motion language:
 * a quiet rounded-square route, completed trail, and current-position marker.
 */
export default function BoxBreathingCardVisual({
  color,
  backgroundColor,
}: Props) {
  return (
    <View
      style={[styles.container, { backgroundColor }]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={64} height={64} viewBox="0 0 80 80">
        <Rect
          x={12}
          y={12}
          width={56}
          height={56}
          rx={8}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.16}
        />
        <Path
          d="M 12 24 Q 12 12 24 12 L 46 12"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.72}
        />
        <Circle cx={46} cy={12} r={4} fill={color} opacity={0.92} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
