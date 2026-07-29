import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
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
import { BREATHING_READOUT_HEIGHT } from './BreathingVisual';

const SIZE = 312;
const PAD = 34;
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
      const angle = Math.PI + (Math.PI / 2) * t;
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
  const [contentHeight, setContentHeight] = useState(0);
  const visualSize = width - 32;
  const visualBlockHeight = visualSize + BREATHING_READOUT_HEIGHT;
  const contentSpaceBelowVisual = Math.max(0, (contentHeight - visualBlockHeight) / 2);
  const cycleLabelTop = (40 - contentSpaceBelowVisual) / 2 - 10;
  const totalSessionSeconds = cycles * CYCLE_SECONDS;
  const timeSpent = `${Math.floor(totalSessionSeconds / 60)}:${String(totalSessionSeconds % 60).padStart(2, '0')}`;
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
  const outline = palette.tint;
  const trail = palette.accent;

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
      <StatusBar style={palette.text === '#F0F0F0' ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close breathing session"
          style={styles.closeButton}
        >
          <Text style={[styles.close, { color: palette.text }]}>×</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.text }]}>Box Breathing</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View
        style={styles.content}
        onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}
      >
        <Animated.View
          style={[
            styles.animationCard,
            {
              width: visualSize,
              height: visualSize + BREATHING_READOUT_HEIGHT,
            },
            visualStyle,
          ]}
        >
          {(sessionState === 'countdown' || sessionState === 'starting') && (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(450)} style={styles.centerReadout}>
              <Text
                style={[
                  styles.preCount,
                  {
                    color: palette.text,
                    opacity: sessionState === 'countdown' ? 1 : 0,
                  },
                ]}
              >
                {sessionState === 'countdown' ? countdown : '0'}
              </Text>
              <Text style={[styles.phase, { color: palette.muted }]}>
                {sessionState === 'countdown' ? 'GET READY' : 'STARTING…'}
              </Text>
            </Animated.View>
          )}

          {(active || sessionState === 'finishing') && (
            <Animated.View entering={FadeIn.duration(600)} style={styles.animationLayer}>
              <View pointerEvents="none" style={[styles.activeReadout, { height: BREATHING_READOUT_HEIGHT }]}>
                <Text style={[styles.count, { color: palette.text }]}>{count}</Text>
                <View style={styles.phaseToggle}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.phaseToggleLabel,
                      {
                        color: phases[phaseIndex] === 'INHALE' ? palette.text : palette.muted,
                        fontWeight: phases[phaseIndex] === 'INHALE' ? '700' : '400',
                        opacity: phases[phaseIndex] === 'INHALE' ? 1 : 0.35,
                      },
                    ]}
                  >
                    INHALE
                  </Text>
                  <Text style={[styles.phaseToggleDivider, { color: palette.border }]}>|</Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.phaseToggleLabel,
                      {
                        color: phases[phaseIndex] === 'HOLD' ? palette.text : palette.muted,
                        fontWeight: phases[phaseIndex] === 'HOLD' ? '700' : '400',
                        opacity: phases[phaseIndex] === 'HOLD' ? 1 : 0.35,
                      },
                    ]}
                  >
                    HOLD
                  </Text>
                  <Text style={[styles.phaseToggleDivider, { color: palette.border }]}>|</Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.phaseToggleLabel,
                      {
                        color: phases[phaseIndex] === 'EXHALE' ? palette.text : palette.muted,
                        fontWeight: phases[phaseIndex] === 'EXHALE' ? '700' : '400',
                        opacity: phases[phaseIndex] === 'EXHALE' ? 1 : 0.35,
                      },
                    ]}
                  >
                    EXHALE
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.boxAnimationStage,
                  {
                    top: BREATHING_READOUT_HEIGHT,
                    width: visualSize,
                    height: visualSize,
                  },
                ]}
              >
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
              </View>
            </Animated.View>
          )}

          {complete && (
            <View style={styles.centerReadout}>
              <Text style={[styles.check, { color: palette.text }]}>✓</Text>
              <Text style={[styles.completeTitle, { color: palette.text }]}>Well done</Text>
              <Text style={[styles.completeCopy, { color: palette.text }]}>
                That was time well spent. Let it settle.
              </Text>
            </View>
          )}
        </Animated.View>

        {complete && (
          <View
            accessible
            accessibilityLabel={`Time spent ${timeSpent}, ${cycles} cycles`}
            style={[
              styles.completionStats,
              { borderColor: palette.border, left: (width - 220) / 2 },
              { transform: [{ translateY: 36 }] },
            ]}
          >
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: palette.muted }]}>Time Spent</Text>
              <Text style={[styles.statValue, { color: palette.text }]}>{timeSpent}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: palette.border }]} />
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: palette.muted }]}>Cycles</Text>
              <Text style={[styles.statValue, { color: palette.text }]}>{cycles}</Text>
            </View>
          </View>
        )}

      </View>

      <View style={styles.controls}>
        {!complete && (
          <>
            <View style={styles.roundPlaceholder} />
            {(active || sessionState === 'finishing') && (
              <Text
                style={[
                  styles.roundCount,
                  styles.floatingRoundCount,
                  { color: palette.muted, top: cycleLabelTop },
                ]}
              >
                Round {cycle} of {cycles}
              </Text>
            )}
            {(active || sessionState === 'finishing') && (
              <View style={styles.sessionActions}>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="End session"
                style={({ pressed }) => [
                  styles.sessionAction,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    opacity: pressed ? 0.72 : 1,
                  },
                ]}
              >
                <Text style={[styles.sessionActionLabel, { color: palette.text }]}>End session</Text>
              </Pressable>
              <Pressable
                onPress={paused ? resume : pause}
                disabled={!active}
                accessibilityRole="button"
                accessibilityLabel={paused ? 'Resume exercise' : 'Pause exercise'}
                accessibilityState={{ disabled: !active }}
                style={({ pressed }) => [
                  styles.sessionAction,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    opacity: !active ? 0.45 : pressed ? 0.72 : 1,
                  },
                ]}
              >
                <Text style={[styles.sessionActionLabel, { color: palette.text }]}>
                  {paused ? 'Resume' : 'Pause'}
                </Text>
              </Pressable>
              </View>
            )}
          </>
        )}
        {complete && (
          <>
            <View style={styles.roundPlaceholder} />
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
          </>
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
  closeButton: {
    width: 30,
    zIndex: 1,
  },
  close: { fontSize: 32, fontWeight: '300', lineHeight: 34 },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  headerSpacer: { width: 30 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  eyebrow: {
    position: 'absolute',
    top: 10,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  animationCard: {
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationLayer: { ...StyleSheet.absoluteFill },
  activeReadout: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 42,
  },
  boxAnimationStage: {
    position: 'absolute',
    left: 0,
    overflow: 'hidden',
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
  preCount: {
    width: '100%',
    textAlign: 'center',
    fontSize: 68,
    lineHeight: 74,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  count: {
    width: '100%',
    textAlign: 'center',
    fontSize: 68,
    lineHeight: 74,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  phase: {
    width: '100%',
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '400',
    letterSpacing: 2.2,
    marginTop: 6,
  },
  phaseToggle: {
    minHeight: 30,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  phaseToggleLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 1.4,
  },
  phaseToggleDivider: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  activePhase: {
    width: '100%',
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '400',
    letterSpacing: 2.2,
    marginTop: 2,
  },
  check: { fontSize: 42, fontWeight: '300' },
  completeTitle: { fontSize: 24, fontWeight: '600', marginTop: 8 },
  completeCopy: { textAlign: 'center', fontSize: 16, lineHeight: 24, marginTop: 8 },
  controls: {
    minHeight: 116,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    justifyContent: 'center',
    gap: 10,
  },
  roundCount: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
  },
  roundCountPosition: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
  },
  roundPlaceholder: {
    height: 20,
  },
  floatingRoundCount: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  completionStats: {
    position: 'absolute',
    top: '75%',
    width: 220,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  statValue: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  statDivider: { height: 1 },
  sessionActions: {
    flexDirection: 'row',
    gap: 10,
  },
  sessionAction: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  sessionActionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
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
});
