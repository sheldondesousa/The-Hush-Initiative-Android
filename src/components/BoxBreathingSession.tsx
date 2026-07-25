import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

const SIZE = 312;
const PAD = 24;
const RADIUS = 17;
const PHASE_SECONDS = 4;
const CYCLE_SECONDS = 16;
const DEFAULT_CYCLES = 4;

const x0 = PAD;
const y0 = PAD;
const x1 = SIZE - PAD;
const y1 = SIZE - PAD;
const straight = x1 - x0 - 2 * RADIUS;
const arc = (Math.PI / 2) * RADIUS;
const perimeter = 4 * straight + 4 * arc;

const boxPath = [
  `M ${x0} ${y0 + RADIUS}`,
  `A ${RADIUS} ${RADIUS} 0 0 1 ${x0 + RADIUS} ${y0}`,
  `L ${x1 - RADIUS} ${y0}`,
  `A ${RADIUS} ${RADIUS} 0 0 1 ${x1} ${y0 + RADIUS}`,
  `L ${x1} ${y1 - RADIUS}`,
  `A ${RADIUS} ${RADIUS} 0 0 1 ${x1 - RADIUS} ${y1}`,
  `L ${x0 + RADIUS} ${y1}`,
  `A ${RADIUS} ${RADIUS} 0 0 1 ${x0} ${y1 - RADIUS}`,
  `L ${x0} ${y0 + RADIUS}`,
].join(' ');

const phases = ['INHALE', 'HOLD', 'EXHALE', 'HOLD'] as const;
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type SessionPalette = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  tint: string;
  border: string;
};

type Props = {
  palette: SessionPalette;
  onClose: () => void;
  onComplete: () => void;
  cycles?: number;
};

type SessionState = 'countdown' | 'starting' | 'active' | 'finishing' | 'complete';

function easeInOut(value: number) {
  'worklet';
  return value < 0.5
    ? 2 * value * value
    : -1 + (4 - 2 * value) * value;
}

function visibleProgress(rawProgress: number) {
  'worklet';
  const safe = Math.min(Math.max(rawProgress, 0), 0.999999);
  const phase = Math.min(Math.floor(safe * 4), 3);
  const phaseProgress = safe * 4 - phase;
  return (phase + easeInOut(phaseProgress)) / 4;
}

function pointAtProgress(rawProgress: number) {
  'worklet';
  let distance = visibleProgress(rawProgress) * perimeter;
  const segments = [
    { kind: 1, length: arc },
    { kind: 0, length: straight },
    { kind: 1, length: arc },
    { kind: 0, length: straight },
    { kind: 1, length: arc },
    { kind: 0, length: straight },
    { kind: 1, length: arc },
    { kind: 0, length: straight },
  ];

  let segmentIndex = 0;
  while (segmentIndex < segments.length - 1 && distance > segments[segmentIndex].length) {
    distance -= segments[segmentIndex].length;
    segmentIndex += 1;
  }
  const t = Math.min(distance / segments[segmentIndex].length, 1);

  switch (segmentIndex) {
    case 0: {
      const angle = Math.PI - (Math.PI / 2) * t;
      return { x: x0 + RADIUS + RADIUS * Math.cos(angle), y: y0 + RADIUS + RADIUS * Math.sin(angle) };
    }
    case 1:
      return { x: x0 + RADIUS + straight * t, y: y0 };
    case 2: {
      const angle = -Math.PI / 2 + (Math.PI / 2) * t;
      return { x: x1 - RADIUS + RADIUS * Math.cos(angle), y: y0 + RADIUS + RADIUS * Math.sin(angle) };
    }
    case 3:
      return { x: x1, y: y0 + RADIUS + straight * t };
    case 4: {
      const angle = (Math.PI / 2) * t;
      return { x: x1 - RADIUS + RADIUS * Math.cos(angle), y: y1 - RADIUS + RADIUS * Math.sin(angle) };
    }
    case 5:
      return { x: x1 - RADIUS - straight * t, y: y1 };
    case 6: {
      const angle = Math.PI / 2 + (Math.PI / 2) * t;
      return { x: x0 + RADIUS + RADIUS * Math.cos(angle), y: y1 - RADIUS + RADIUS * Math.sin(angle) };
    }
    default:
      return { x: x0, y: y1 - RADIUS - straight * t };
  }
}

export default function BoxBreathingSession({
  palette,
  onClose,
  onComplete,
  cycles = DEFAULT_CYCLES,
}: Props) {
  const { width } = useWindowDimensions();
  const visualSize = Math.min(width - 48, SIZE);
  const [sessionState, setSessionState] = useState<SessionState>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [cycle, setCycle] = useState(1);
  const [paused, setPaused] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(1);
  const cycleRef = useRef(1);
  const completionSentRef = useRef(false);
  const progress = useSharedValue(0);
  const visualOpacity = useSharedValue(1);

  const primary = palette.text;
  const outline = palette.text === '#F0F0F0'
    ? 'rgba(240,240,240,0.45)'
    : 'rgba(26,26,26,0.50)';
  const trail = palette.text === '#F0F0F0'
    ? 'rgba(240,240,240,0.82)'
    : 'rgba(26,26,26,0.76)';

  useEffect(() => {
    if (sessionState !== 'countdown') return;
    const timer = setTimeout(() => {
      if (countdown > 1) {
        setCountdown((value) => value - 1);
      } else {
        setSessionState('starting');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, sessionState]);

  useEffect(() => {
    if (sessionState !== 'starting') return;
    const timer = setTimeout(() => setSessionState('active'), 850);
    return () => clearTimeout(timer);
  }, [sessionState]);

  const finishSession = useCallback(() => {
    setSessionState('complete');
    visualOpacity.value = withTiming(1, { duration: 500 });
    if (!completionSentRef.current) {
      completionSentRef.current = true;
      onComplete();
    }
  }, [onComplete, visualOpacity]);

  const handleCycleComplete = useCallback(() => {
    if (cycleRef.current >= cycles) {
      setSessionState('finishing');
      visualOpacity.value = withTiming(0, { duration: 600 }, (finished) => {
        if (finished) runOnJS(finishSession)();
      });
      return;
    }
    cycleRef.current += 1;
    setCycle(cycleRef.current);
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: CYCLE_SECONDS * 1000,
      easing: Easing.linear,
    }, (finished) => {
      if (finished) runOnJS(handleCycleComplete)();
    });
  }, [cycles, finishSession, progress, visualOpacity]);

  useEffect(() => {
    if (sessionState !== 'active') return;
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: CYCLE_SECONDS * 1000,
      easing: Easing.linear,
    }, (finished) => {
      if (finished) runOnJS(handleCycleComplete)();
    });
    return () => cancelAnimation(progress);
  }, [handleCycleComplete, progress, sessionState]);

  const updateReadout = useCallback((nextPhase: number, nextCount: number) => {
    setPhaseIndex((currentPhase) => {
      if (currentPhase !== nextPhase && sessionState === 'active' && !paused) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      }
      return nextPhase;
    });
    setCount(nextCount);
  }, [paused, sessionState]);

  useAnimatedReaction(
    () => {
      const safe = Math.min(progress.value, 0.999999);
      const nextPhase = Math.min(Math.floor(safe * 4), 3);
      const phaseProgress = safe * 4 - nextPhase;
      const nextCount = Math.min(PHASE_SECONDS, Math.floor(phaseProgress * PHASE_SECONDS) + 1);
      return { nextPhase, nextCount };
    },
    (current, previous) => {
      if (
        !previous
        || current.nextPhase !== previous.nextPhase
        || current.nextCount !== previous.nextCount
      ) {
        runOnJS(updateReadout)(current.nextPhase, current.nextCount);
      }
    },
    [updateReadout],
  );

  const pathAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: perimeter * (1 - visibleProgress(progress.value)),
  }));

  const markerAnimatedProps = useAnimatedProps(() => {
    const point = pointAtProgress(progress.value);
    return { cx: point.x, cy: point.y };
  });

  const visualStyle = useAnimatedStyle(() => ({
    opacity: visualOpacity.value,
  }));

  const pause = () => {
    cancelAnimation(progress);
    setPaused(true);
    Haptics.selectionAsync().catch(() => undefined);
  };

  const resume = () => {
    const remaining = Math.max(0, 1 - progress.value);
    setPaused(false);
    progress.value = withTiming(1, {
      duration: remaining * CYCLE_SECONDS * 1000,
      easing: Easing.linear,
    }, (finished) => {
      if (finished) runOnJS(handleCycleComplete)();
    });
  };

  const restart = () => {
    cancelAnimation(progress);
    completionSentRef.current = false;
    cycleRef.current = 1;
    setCycle(1);
    setPhaseIndex(0);
    setCount(1);
    setPaused(false);
    setCountdown(3);
    progress.value = 0;
    visualOpacity.value = 1;
    setSessionState('countdown');
  };

  const active = sessionState === 'active';
  const complete = sessionState === 'complete';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close breathing session"
        >
          <Text style={[styles.close, { color: palette.text }]}>×</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.text }]}>Box Breathing</Text>
        <Text style={[styles.cycle, { color: palette.muted }]}>{cycle}/{cycles}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.eyebrow, { color: palette.accent }]}>4 · 4 · 4 · 4</Text>
        <Text style={[styles.title, { color: palette.text }]}>Steady the rhythm</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Follow the marker clockwise. Let every side of the box take four easy counts.
        </Text>

        <Animated.View
          style={[
            styles.animationCard,
            {
              width: visualSize,
              height: visualSize,
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
            visualStyle,
          ]}
        >
          {(sessionState === 'countdown' || sessionState === 'starting') && (
            <View style={styles.centerReadout}>
              <Text style={[styles.preCount, { color: palette.text }]}>
                {sessionState === 'countdown' ? countdown : '·'}
              </Text>
              <Text style={[styles.phase, { color: palette.muted }]}>
                {sessionState === 'countdown' ? 'GET READY' : 'STARTING…'}
              </Text>
            </View>
          )}

          {(active || sessionState === 'finishing') && (
            <>
              <Svg width="100%" height="100%" viewBox={`0 0 ${SIZE} ${SIZE}`}>
                <Path
                  d={boxPath}
                  fill="none"
                  stroke={outline}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                <AnimatedPath
                  animatedProps={pathAnimatedProps}
                  d={boxPath}
                  fill="none"
                  stroke={trail}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={`${perimeter} ${perimeter}`}
                />
                <AnimatedCircle
                  animatedProps={markerAnimatedProps}
                  r={7}
                  fill={primary}
                />
              </Svg>
              <View pointerEvents="none" style={styles.centerReadout}>
                <Text style={[styles.count, { color: palette.text }]}>{count}</Text>
                <Text style={[styles.phase, { color: palette.muted }]}>{phases[phaseIndex]}</Text>
              </View>
            </>
          )}

          {complete && (
            <View style={styles.centerReadout}>
              <Text style={[styles.check, { color: palette.text }]}>✓</Text>
              <Text style={[styles.completeTitle, { color: palette.text }]}>Well done</Text>
              <Text style={[styles.completeCopy, { color: palette.muted }]}>
                Notice your breath before moving on.
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.progressRow}>
          {Array.from({ length: cycles }, (_, index) => (
            <View
              key={index}
              style={[
                styles.progressPip,
                {
                  backgroundColor: index < cycle
                    ? palette.accent
                    : palette.border,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        {active && (
          <Pressable
            onPress={paused ? resume : pause}
            accessibilityRole="button"
            accessibilityLabel={paused ? 'Resume exercise' : 'Pause exercise'}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: palette.accent, opacity: pressed ? 0.78 : 1 },
            ]}
          >
            <Text style={[styles.primaryLabel, { color: palette.bg }]}>
              {paused ? 'Resume' : 'Pause'}
            </Text>
          </Pressable>
        )}
        {complete && (
          <View style={styles.completedControls}>
            <Pressable
              onPress={restart}
              style={[styles.secondaryButton, { borderColor: palette.border }]}
            >
              <Text style={[styles.secondaryLabel, { color: palette.text }]}>Practise again</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={[styles.primaryButton, styles.flexButton, { backgroundColor: palette.accent }]}
            >
              <Text style={[styles.primaryLabel, { color: palette.bg }]}>Done</Text>
            </Pressable>
          </View>
        )}
        {!active && !complete && (
          <Text style={[styles.controlHint, { color: palette.muted }]}>Prepare to breathe gently.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  close: { fontSize: 32, fontWeight: '300', lineHeight: 34 },
  headerTitle: { fontSize: 14, fontWeight: '600' },
  cycle: { width: 30, textAlign: 'right', fontSize: 12, fontVariant: ['tabular-nums'] },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 10 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '500', letterSpacing: -0.8 },
  subtitle: { maxWidth: 330, textAlign: 'center', fontSize: 15, lineHeight: 22, marginTop: 8 },
  animationCard: {
    marginTop: 28,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  centerReadout: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 42,
  },
  preCount: { fontSize: 58, lineHeight: 66, fontWeight: '300', fontVariant: ['tabular-nums'] },
  count: { fontSize: 56, lineHeight: 62, fontWeight: '300', fontVariant: ['tabular-nums'] },
  phase: { fontSize: 14, fontWeight: '400', letterSpacing: 2.2, marginTop: 2 },
  check: { fontSize: 42, fontWeight: '300' },
  completeTitle: { fontSize: 24, fontWeight: '600', marginTop: 8 },
  completeCopy: { textAlign: 'center', fontSize: 14, lineHeight: 21, marginTop: 8 },
  progressRow: { flexDirection: 'row', gap: 8, marginTop: 24 },
  progressPip: { width: 26, height: 3, borderRadius: 2 },
  controls: { minHeight: 92, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18, justifyContent: 'center' },
  primaryButton: {
    minHeight: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  primaryLabel: { fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 27,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  secondaryLabel: { fontSize: 15, fontWeight: '600' },
  completedControls: { flexDirection: 'row', gap: 10 },
  flexButton: { flex: 1 },
  controlHint: { textAlign: 'center', fontSize: 13 },
});
