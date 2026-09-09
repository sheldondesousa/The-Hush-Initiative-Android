import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Line,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

type Props = {
  exerciseName: string;
  color: string;
  backgroundColor: string;
  size?: number;
};

type IllustrationProps = {
  color: string;
};

function BoxVisual({ color }: IllustrationProps) {
  return (
    <>
      <Rect x={12} y={12} width={56} height={56} rx={8} fill="none" stroke={color} strokeWidth={1.5} opacity={0.16} />
      <Path d="M 12 24 Q 12 12 24 12 L 46 12" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.72} />
      <Circle cx={46} cy={12} r={4} fill={color} opacity={0.92} />
    </>
  );
}

function Breathing478Visual({ color }: IllustrationProps) {
  return (
    <>
      <Circle cx={40} cy={40} r={28} fill="none" stroke={color} strokeWidth={1.5} opacity={0.1} />
      <Path d="M 43.4 12.2 A 28 28 0 0 1 66.1 29.9" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.75} />
      <Path d="M 67.8 36.5 A 28 28 0 0 1 29.8 66.1" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" opacity={0.42} />
      <Path d="M 23.8 62.8 A 28 28 0 0 1 36.6 12.2" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.22} />
      <Circle cx={40} cy={12} r={4} fill={color} opacity={0.92} />
    </>
  );
}

function CoherentVisual({ color }: IllustrationProps) {
  return (
    <>
      <Path
        d="M 8 60 C 14 60 18 20 24 20 C 30 20 34 60 40 60 C 46 60 50 20 56 20 C 62 20 66 60 72 60"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.14}
      />
      <Path d="M 8 60 C 14 60 18 20 24 20" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.68} />
      <Circle cx={24} cy={20} r={4} fill={color} opacity={0.92} />
    </>
  );
}

function AlternateNostrilVisual({ color }: IllustrationProps) {
  return (
    <>
      <Path d="M 39 20 L 13 60 L 39 60 Z" fill={color} fillOpacity={0.25} stroke={color} strokeWidth={1.2} strokeOpacity={0.62} />
      <Path d="M 41 20 L 41 60 L 67 60 Z" fill={color} fillOpacity={0.07} stroke={color} strokeWidth={1.2} strokeOpacity={0.52} />
    </>
  );
}

function HummingBeeVisual({ color }: IllustrationProps) {
  return (
    <>
      <Circle cx={40} cy={40} r={34} fill="none" stroke={color} strokeWidth={0.75} opacity={0.08} />
      <Circle cx={40} cy={40} r={31} fill="none" stroke={color} strokeWidth={1} opacity={0.15} />
      <Circle cx={40} cy={40} r={28} fill="none" stroke={color} strokeWidth={1.5} opacity={0.11} />
      <Path d="M 40 12 A 28 28 0 0 1 64.2 54" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      <Path d="M 64.2 54 A 28 28 0 1 1 40 12" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.3} />
      <Circle cx={15.8} cy={54} r={4} fill={color} opacity={0.92} />
    </>
  );
}

function PhysiologicalSighVisual({ color }: IllustrationProps) {
  return (
    <>
      <Defs>
        <LinearGradient id="card-sigh-gradient" x1={40} y1={12} x2={40} y2={68} gradientUnits="userSpaceOnUse">
          <Stop offset={0} stopColor={color} stopOpacity={0.2} />
          <Stop offset={1} stopColor={color} stopOpacity={0.68} />
        </LinearGradient>
      </Defs>
      <Circle cx={40} cy={40} r={28} fill="none" stroke={color} strokeWidth={1.5} opacity={0.58} />
      <Circle cx={40} cy={40} r={21} fill="url(#card-sigh-gradient)" />
    </>
  );
}

function PursedLipsVisual({ color }: IllustrationProps) {
  return (
    <>
      <Path
        d="M 8 36 C 20 36 28 16 40 16 C 52 16 60 36 72 36 L 72 44 C 60 44 52 64 40 64 C 28 64 20 44 8 44 Z"
        fill={color}
        opacity={0.08}
      />
      <Path d="M 8 36 C 20 36 28 16 40 16 C 52 16 60 36 72 36" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" opacity={0.68} />
      <Path d="M 8 44 C 20 44 28 64 40 64 C 52 64 60 44 72 44" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" opacity={0.68} />
    </>
  );
}

function DiaphragmaticVisual({ color }: IllustrationProps) {
  return (
    <>
      <Line x1={12} y1={20} x2={68} y2={20} stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.22} />
      <Rect x={12} y={21} width={56} height={39} fill={color} opacity={0.05} />
      <Line x1={12} y1={60} x2={68} y2={60} stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.68} />
    </>
  );
}

const illustrations: Record<string, React.ComponentType<IllustrationProps>> = {
  'Box Breathing': BoxVisual,
  '4-7-8 Breathing': Breathing478Visual,
  'Coherent Breathing': CoherentVisual,
  'Alternate Nostril': AlternateNostrilVisual,
  'Humming Bee': HummingBeeVisual,
  'Physiological Sigh': PhysiologicalSighVisual,
  'Pursed Lips Breathing': PursedLipsVisual,
  'Diaphragmatic Breathing': DiaphragmaticVisual,
};

export default function ExerciseCardVisual({
  exerciseName,
  color,
  backgroundColor,
  size = 80,
}: Props) {
  const Illustration = illustrations[exerciseName] ?? BoxVisual;

  return (
    <View
      style={[styles.container, { width: size, height: size, borderRadius: size / 4, backgroundColor }]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} viewBox="0 0 80 80">
        <Illustration color={color} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
