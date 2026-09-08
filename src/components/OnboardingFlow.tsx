import { CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

const colors = {
  background: '#EDE9E3',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  muted: '#66706B',
  accent: '#315F4D',
  tint: '#C8DFD8',
  border: '#DDE2DF',
  softTint: '#E8F0EC',
};

type OnboardingFlowProps = {
  onComplete: () => void;
};

export function SplashScreen() {
  return (
    <View style={styles.splash}>
      <StatusBar style="dark" />
      <Text accessibilityLabel="Hush" style={styles.splashWordmark}>
        Hush<Text style={styles.splashWordmarkDot}>.</Text>
      </Text>
    </View>
  );
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [fontsLoaded] = useFonts({ DMSans_700Bold, CormorantGaramond_400Regular });
  const [page, setPage] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const animationDirection = useRef(1);

  useEffect(() => {
    opacity.setValue(0);
    translateX.setValue(16 * animationDirection.current);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, page, translateX]);

  const goForward = () => {
    if (page === 2) return;
    animationDirection.current = 1;
    setPage((current) => current + 1);
  };

  const goBack = () => {
    if (page === 0) return;
    animationDirection.current = -1;
    setPage((current) => current - 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <Text accessibilityLabel="Hush" style={styles.headerWordmark}>
          Hush<Text style={styles.headerWordmarkDot}>.</Text>
        </Text>
        <Text style={styles.stepLabel}>{page + 1} / 3</Text>
      </View>

      <View style={styles.illustrationPanel}>
        <Animated.View
          key={page}
          style={[
            styles.illustrationCanvas,
            {
              opacity,
              transform: [{ translateX }],
            },
          ]}
        >
          {page === 0 && <ExerciseLibraryIllustration />}
          {page === 1 && <ToolkitIllustration />}
          {page === 2 && <FollowPatternIllustration />}
        </Animated.View>

        <View style={styles.pageNavigation}>
          <Pressable
            onPress={goBack}
            disabled={page === 0}
            accessibilityRole="button"
            accessibilityLabel="Previous onboarding screen"
            accessibilityState={{ disabled: page === 0 }}
            style={({ pressed }) => [
              styles.navigationButton,
              page === 0 && styles.navigationButtonHidden,
              pressed && styles.navigationButtonPressed,
            ]}
          >
            <Text style={styles.navigationArrow}>‹</Text>
          </Pressable>
          <View style={styles.dots} accessibilityLabel={`Onboarding page ${page + 1} of 3`}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[styles.dot, index === page && styles.dotActive]}
              />
            ))}
          </View>
          <Pressable
            onPress={goForward}
            disabled={page === 2}
            accessibilityRole="button"
            accessibilityLabel="Next onboarding screen"
            accessibilityState={{ disabled: page === 2 }}
            style={({ pressed }) => [
              styles.navigationButton,
              page === 2 && styles.navigationButtonHidden,
              pressed && styles.navigationButtonPressed,
            ]}
          >
            <Text style={styles.navigationArrow}>›</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.copyPanel}>
        <Animated.View
          key={`copy-${page}`}
          style={[
            styles.copy,
            {
              opacity,
              transform: [{ translateX }],
            },
          ]}
        >
          <Text style={[styles.eyebrow, fontsLoaded && { fontFamily: 'DMSans_700Bold' }]}>
            {page === 0 ? 'FIND YOUR PRACTICE' : page === 1 ? 'MAKE IT YOURS' : 'BREATHE WITH THE GUIDE'}
          </Text>
          <Text accessibilityRole="header" style={[styles.title, fontsLoaded && { fontFamily: 'CormorantGaramond_400Regular' }]}>
            {page === 0
              ? 'Choose from 8 guided breathing exercises.'
              : page === 1
                ? 'Personalize your experience.'
                : 'Follow the pattern as Hush guides every breath.'}
          </Text>
        </Animated.View>
      </View>

      <Pressable
        onPress={onComplete}
        accessibilityRole="button"
        accessibilityLabel="Skip onboarding and go to the home page"
        style={({ pressed }) => [styles.skipButton, pressed && styles.skipButtonPressed]}
      >
        <Text style={styles.skipText}>SKIP</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function ExerciseLibraryIllustration() {
  return (
    <View
      style={styles.libraryScene}
      accessible
      accessibilityLabel="A selection of breathing exercise cards"
    >
      <View style={[styles.miniCard, styles.miniCardBack]}>
        <View style={[styles.miniVisual, { backgroundColor: '#E5EBF2' }]}>
          <Svg width={42} height={42} viewBox="0 0 42 42">
            <Path
              d="M4 30 C9 30 11 12 16 12 C21 12 23 30 28 30 C33 30 35 12 40 12"
              fill="none"
              stroke={colors.text}
              strokeWidth={1.4}
              strokeLinecap="round"
              opacity={0.66}
            />
          </Svg>
        </View>
        <View style={styles.miniCardCopy}>
          <Text style={styles.miniCardMeta}>BALANCE & HRV</Text>
          <Text style={styles.miniCardTitle}>Coherent Breathing</Text>
          <Text style={styles.miniCardDetail}>5–6 min  ·  Effort ●○○</Text>
        </View>
      </View>

      <View style={[styles.miniCard, styles.miniCardMiddle]}>
        <View style={[styles.miniVisual, { backgroundColor: '#EAE5F0' }]}>
          <Svg width={42} height={42} viewBox="0 0 42 42">
            <Circle cx={21} cy={21} r={14} fill="none" stroke={colors.text} opacity={0.14} />
            <Path d="M21 7 A14 14 0 0 1 34 17" fill="none" stroke={colors.text} strokeWidth={1.5} strokeLinecap="round" />
            <Circle cx={21} cy={7} r={2.4} fill={colors.text} />
          </Svg>
        </View>
        <View style={styles.miniCardCopy}>
          <Text style={styles.miniCardMeta}>SLEEP & DEEP CALM</Text>
          <Text style={styles.miniCardTitle}>4–7–8 Breathing</Text>
          <Text style={styles.miniCardDetail}>4–5 min  ·  Effort ●●●</Text>
        </View>
      </View>

      <View style={[styles.miniCard, styles.miniCardFront]}>
        <View style={[styles.miniVisual, { backgroundColor: colors.tint }]}>
          <Svg width={42} height={42} viewBox="0 0 42 42">
            <Rect x={7} y={7} width={28} height={28} rx={6} fill="none" stroke={colors.text} opacity={0.18} />
            <Path d="M7 18 Q7 7 18 7 H24" fill="none" stroke={colors.text} strokeWidth={1.5} strokeLinecap="round" />
            <Circle cx={24} cy={7} r={2.5} fill={colors.text} />
          </Svg>
        </View>
        <View style={styles.miniCardCopy}>
          <Text style={styles.miniCardMeta}>COMPOSURE & FOCUS</Text>
          <Text style={styles.miniCardTitle}>Box Breathing</Text>
          <Text style={styles.miniCardDetail}>5 min  ·  Effort ●●○</Text>
        </View>
        <Text style={styles.cardArrow}>→</Text>
      </View>
    </View>
  );
}

function ToolkitIllustration() {
  return (
    <View
      style={styles.toolkitScene}
      accessible
      accessibilityLabel="Breathing rhythm preview, quick guide, and personalisation controls"
    >
      <View style={[styles.toolCard, styles.rhythmCard]}>
        <View style={styles.toolHeadingRow}>
          <Text style={styles.toolLabel}>RHYTHM PREVIEW</Text>
          <Text style={styles.toolAction}>Preview⌄</Text>
        </View>
        <Svg width="100%" height={55} viewBox="0 0 280 55" preserveAspectRatio="none">
          <Line x1={0} y1={46} x2={280} y2={46} stroke={colors.border} />
          <Line x1={58} y1={8} x2={58} y2={46} stroke={colors.border} />
          <Line x1={160} y1={8} x2={160} y2={46} stroke={colors.border} />
          <Path
            d="M0 46 C16 46 38 9 58 9 L160 9 C184 9 216 46 246 46 H280"
            fill="none"
            stroke={colors.accent}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.rhythmLabels}>
          <Text style={styles.rhythmLabel}>4s{'\n'}INHALE</Text>
          <Text style={styles.rhythmLabel}>7s{'\n'}HOLD</Text>
          <Text style={styles.rhythmLabel}>8s{'\n'}EXHALE</Text>
        </View>
      </View>

      <View style={[styles.toolCard, styles.guideCard]}>
        <Text style={styles.toolLabel}>QUICK GUIDE</Text>
        <View style={styles.guideRow}>
          <View style={styles.guideNumber}><Text style={styles.guideNumberText}>1</Text></View>
          <Text style={styles.guideText}>Settle into a comfortable position</Text>
        </View>
        <View style={styles.guideRow}>
          <View style={styles.guideNumber}><Text style={styles.guideNumberText}>2</Text></View>
          <Text style={styles.guideText}>Let the guide set your pace</Text>
        </View>
      </View>

      <View style={[styles.toolCard, styles.personaliseCard]}>
        <View style={styles.toolHeadingRow}>
          <Text style={styles.toolLabel}>PERSONALISE</Text>
          <Text style={styles.toolAction}>Optional</Text>
        </View>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>Pace</Text>
          <View style={styles.sliderTrack}><View style={styles.sliderFill} /><View style={styles.sliderThumb} /></View>
        </View>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>Cycles</Text>
          <View style={styles.cyclePills}>
            <View style={styles.cyclePill}><Text style={styles.cyclePillText}>3</Text></View>
            <View style={[styles.cyclePill, styles.cyclePillActive]}><Text style={[styles.cyclePillText, styles.cyclePillTextActive]}>4</Text></View>
            <View style={styles.cyclePill}><Text style={styles.cyclePillText}>5</Text></View>
          </View>
        </View>
      </View>
    </View>
  );
}

function FollowPatternIllustration() {
  return (
    <View
      style={styles.patternScene}
      accessible
      accessibilityLabel="4-7-8 breathing exercise showing inhale, hold, and exhale"
    >
      <View style={styles.patternHeader}>
        <Text style={styles.patternName}>4–7–8 Breathing</Text>
        <Text style={styles.patternRound}>ROUND 1 OF 4</Text>
      </View>
      <View style={styles.orbitWrap}>
        <Svg width="100%" height="100%" viewBox="0 0 260 260">
          <Circle cx={130} cy={130} r={94} fill={colors.softTint} opacity={0.5} />
          <Circle cx={130} cy={130} r={104} fill="none" stroke={colors.border} strokeWidth={1.5} />
          <Path
            d="M130 26 A104 104 0 0 1 230 102"
            fill="none"
            stroke={colors.accent}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <Path
            d="M234 112 A104 104 0 0 1 88 225"
            fill="none"
            stroke={colors.accent}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.45}
          />
          <Path
            d="M76 219 A104 104 0 0 1 120 26"
            fill="none"
            stroke={colors.accent}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.2}
          />
          <Circle cx={130} cy={26} r={7} fill={colors.accent} />
        </Svg>
        <View style={styles.orbitReadout}>
          <Text style={styles.orbitCount}>4</Text>
          <Text style={styles.orbitPhase}>INHALE</Text>
        </View>
      </View>
      <View style={styles.patternPhases}>
        <View style={styles.patternPhaseActive}>
          <Text style={styles.patternPhaseNumberActive}>4</Text>
          <Text style={styles.patternPhaseLabelActive}>INHALE</Text>
        </View>
        <View style={styles.patternDivider} />
        <View style={styles.patternPhase}>
          <Text style={styles.patternPhaseNumber}>7</Text>
          <Text style={styles.patternPhaseLabel}>HOLD</Text>
        </View>
        <View style={styles.patternDivider} />
        <View style={styles.patternPhase}>
          <Text style={styles.patternPhaseNumber}>8</Text>
          <Text style={styles.patternPhaseLabel}>EXHALE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  splashWordmark: {
    color: colors.text,
    fontSize: 52,
    lineHeight: 62,
    fontWeight: '500',
    letterSpacing: -1.1,
  },
  splashWordmarkDot: { color: colors.accent },
  safe: { flex: 1, backgroundColor: colors.background },
  illustrationPanel: {
    height: '60%',
    marginHorizontal: 16,
    borderRadius: 28,
    backgroundColor: colors.softTint,
    overflow: 'hidden',
  },
  topBar: {
    height: 64,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerWordmark: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '500',
    letterSpacing: -0.56,
  },
  headerWordmarkDot: { color: colors.accent },
  stepLabel: { color: colors.muted, fontSize: 12, fontWeight: '600', letterSpacing: 1.1 },
  illustrationCanvas: {
    position: 'absolute',
    top: 12,
    bottom: 52,
    left: 0,
    right: 0,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNavigation: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 4,
    height: 48,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigationButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigationButtonHidden: { opacity: 0 },
  navigationButtonPressed: { opacity: 0.48 },
  navigationArrow: { color: colors.accent, fontSize: 36, lineHeight: 38, fontWeight: '300' },
  dots: { width: 78, height: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#AABCB3' },
  dotActive: { width: 22, backgroundColor: colors.accent },
  copyPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { width: '100%', paddingHorizontal: 26 },
  eyebrow: { color: colors.accent, fontSize: 10.5, fontWeight: '700', letterSpacing: 1.47, marginBottom: 10 },
  title: { color: colors.text, fontSize: 32, lineHeight: 37.76, fontWeight: '400', letterSpacing: -0.16 },
  skipButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  skipButtonPressed: { opacity: 0.48 },
  skipText: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.8 },

  libraryScene: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  miniCard: {
    position: 'absolute',
    width: '82%',
    minHeight: 92,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    shadowColor: '#1A2B24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  miniCardBack: { top: '17%', left: '3%', opacity: 0.62, transform: [{ scale: 0.88 }] },
  miniCardMiddle: { top: '35%', right: '3%', opacity: 0.82, transform: [{ scale: 0.94 }] },
  miniCardFront: { top: '55%', left: '3%' },
  miniVisual: { width: 56, height: 56, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  miniCardCopy: { flex: 1, marginLeft: 12 },
  miniCardMeta: { color: colors.accent, fontSize: 7, fontWeight: '700', letterSpacing: 0.8 },
  miniCardTitle: { color: colors.text, fontSize: 15, fontWeight: '600', marginTop: 5 },
  miniCardDetail: { color: colors.muted, fontSize: 9, marginTop: 7 },
  cardArrow: { color: colors.accent, fontSize: 18, marginLeft: 4 },

  toolkitScene: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    gap: 8,
  },
  toolCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    backgroundColor: colors.surface,
    padding: 14,
    shadowColor: '#1A2B24',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  rhythmCard: { width: '78%', alignSelf: 'flex-start', marginLeft: '4%', opacity: 0.62 },
  guideCard: { width: '78%', alignSelf: 'flex-end', marginRight: '4%', opacity: 0.82 },
  personaliseCard: { width: '78%', alignSelf: 'flex-start', marginLeft: '4%' },
  toolHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toolLabel: { color: colors.text, fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  toolAction: { color: colors.accent, fontSize: 9, fontWeight: '600' },
  rhythmLabels: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 1 },
  rhythmLabel: { color: colors.muted, textAlign: 'center', fontSize: 8, lineHeight: 12 },
  guideRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  guideNumber: { width: 21, height: 21, borderRadius: 11, backgroundColor: colors.softTint, alignItems: 'center', justifyContent: 'center' },
  guideNumberText: { color: colors.accent, fontSize: 9, fontWeight: '700' },
  guideText: { flex: 1, color: colors.muted, fontSize: 10, lineHeight: 14, marginLeft: 9 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 13 },
  sliderLabel: { width: 43, color: colors.muted, fontSize: 9 },
  sliderTrack: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.border, justifyContent: 'center' },
  sliderFill: { width: '57%', height: 3, borderRadius: 2, backgroundColor: colors.accent },
  sliderThumb: { position: 'absolute', left: '53%', width: 12, height: 12, borderRadius: 6, backgroundColor: colors.surface, borderColor: colors.accent, borderWidth: 2 },
  cyclePills: { flex: 1, flexDirection: 'row', gap: 5 },
  cyclePill: { flex: 1, height: 23, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderColor: colors.border, borderWidth: 1 },
  cyclePillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  cyclePillText: { color: colors.muted, fontSize: 9, fontWeight: '600' },
  cyclePillTextActive: { color: colors.surface },

  patternScene: {
    width: '80%',
    height: '84%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
    shadowColor: '#1A2B24',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 2,
  },
  patternHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patternName: { color: colors.text, fontSize: 13, fontWeight: '600' },
  patternRound: { color: colors.muted, fontSize: 7, fontWeight: '700', letterSpacing: 0.8 },
  orbitWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 3 },
  orbitReadout: { position: 'absolute', alignItems: 'center' },
  orbitCount: { color: colors.text, fontSize: 48, lineHeight: 53, fontWeight: '300', fontVariant: ['tabular-nums'] },
  orbitPhase: { color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginTop: 3 },
  patternPhases: { height: 46, flexDirection: 'row', alignItems: 'stretch', borderRadius: 12, backgroundColor: colors.background, paddingHorizontal: 5 },
  patternPhase: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  patternPhaseActive: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.accent, marginVertical: 4 },
  patternPhaseNumber: { color: colors.text, fontSize: 13, fontWeight: '600' },
  patternPhaseNumberActive: { color: colors.surface, fontSize: 13, fontWeight: '700' },
  patternPhaseLabel: { color: colors.muted, fontSize: 7, letterSpacing: 0.7, marginTop: 2 },
  patternPhaseLabelActive: { color: colors.surface, fontSize: 7, letterSpacing: 0.7, marginTop: 2 },
  patternDivider: { width: 1, height: 22, alignSelf: 'center', backgroundColor: colors.border },
});
