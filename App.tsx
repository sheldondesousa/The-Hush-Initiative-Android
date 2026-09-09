import AsyncStorage from '@react-native-async-storage/async-storage';
import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Rect, Text as SvgText, TSpan } from 'react-native-svg';
import {
  breathSituations,
  Exercise,
  exercises,
  Meditation,
  meditationSituations,
  meditations,
} from './src/data';
import BoxBreathingSession from './src/components/BoxBreathingSession';
import BreathingVisual, { BREATHING_READOUT_HEIGHT } from './src/components/BreathingVisual';
import ExerciseCardVisual from './src/components/ExerciseCardVisual';
import PersonalizeSheet from './src/components/PersonalizeSheet';
import OnboardingFlow, { SplashScreen } from './src/components/OnboardingFlow';
import { MenuSectionScreen, type MenuSection } from './src/components/AppMenu';
import {
  BreathIntensityId,
  breathIntensities,
  getBreathRecommendations,
  getMeditationRecommendationIds,
  MeditationTimeId,
  meditationTimes,
} from './src/recommender';
import {
  DetailPhase,
  ExerciseDetailConfig,
  ExerciseGuideSection,
  exerciseDetails,
} from './src/exerciseDetails';
import {
  applyPersonalization,
  basePersonalization,
  clampPersonalization,
  type ExerciseDefaults,
  type ExercisePersonalization,
} from './src/personalization';

type ThemeMode = 'light' | 'dark' | 'minimal';
type Tab = 'breathe' | 'meditate' | 'recommend' | 'menu';
type Detail = { kind: 'exercise'; item: Exercise } | { kind: 'meditation'; item: Meditation } | null;

const palettes = {
  light: {
    bg: '#EDE9E3',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    muted: '#5B625F',
    accent: '#315F4D',
    tint: '#C8DFD8',
    border: '#DDE2DF',
    meditation: '#344868',
    meditationTint: '#DCE4EF',
  },
  dark: {
    bg: '#111111',
    surface: '#1E1E1E',
    text: '#F0F0F0',
    muted: '#B3B3B3',
    accent: '#A8C8BA',
    tint: '#22372F',
    border: '#343434',
    meditation: '#A0B4CE',
    meditationTint: '#202A38',
  },
  minimal: {
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#111111',
    muted: '#555555',
    accent: '#111111',
    tint: '#F2F2F2',
    border: '#D8D8D8',
    meditation: '#111111',
    meditationTint: '#F2F2F2',
  },
};

type Palette = (typeof palettes)[ThemeMode];

const EXERCISE_DEFAULTS_STORAGE_KEY = 'hush.exercise-defaults.v1';
const SHOW_ONBOARDING_STORAGE_KEY = 'hush.show-onboarding-after-splash.v1';
const SPLASH_DURATION_MS = 1200;
const ENABLE_BOX_ORB_PROTOTYPE = false;
const HEADER_HEIGHT = 70;
const FOREST_SAGE = '#4A7C68';
const TERRACOTTA = '#D97D46';
const TITLE_FONT_FAMILY = 'CormorantGaramond_500Medium';

export default function App() {
  const [launchState, setLaunchState] = useState<'splash' | 'onboarding' | 'app'>('splash');
  const [tab, setTab] = useState<Tab>('breathe');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [detail, setDetail] = useState<Detail>(null);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [activeMeditation, setActiveMeditation] = useState<Meditation | null>(null);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [mindfulMinutes, setMindfulMinutes] = useState(0);
  const [exerciseDefaults, setExerciseDefaults] = useState<ExerciseDefaults>({});
  const [menuSection, setMenuSection] = useState<MenuSection | null>(null);
  const [showOnboardingAfterSplash, setShowOnboardingAfterSplash] = useState(true);
  const palette = palettes[themeMode];
  const [titleFontsLoaded] = useFonts({ CormorantGaramond_500Medium });

  useEffect(() => {
    let active = true;
    let splashTimeout: ReturnType<typeof setTimeout> | undefined;
    const splashStartedAt = Date.now();
    AsyncStorage.getItem(SHOW_ONBOARDING_STORAGE_KEY)
      .then((stored) => {
        if (!active) return;
        const shouldShowOnboarding = stored === null ? true : stored === 'true';
        setShowOnboardingAfterSplash(shouldShowOnboarding);
        const remainingSplashTime = Math.max(0, SPLASH_DURATION_MS - (Date.now() - splashStartedAt));
        splashTimeout = setTimeout(() => {
          if (active) setLaunchState(shouldShowOnboarding ? 'onboarding' : 'app');
        }, remainingSplashTime);
      })
      .catch(() => {
        if (!active) return;
        const remainingSplashTime = Math.max(0, SPLASH_DURATION_MS - (Date.now() - splashStartedAt));
        splashTimeout = setTimeout(() => {
          if (active) setLaunchState('onboarding');
        }, remainingSplashTime);
      });
    return () => {
      active = false;
      if (splashTimeout) clearTimeout(splashTimeout);
    };
  }, []);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(EXERCISE_DEFAULTS_STORAGE_KEY)
      .then((stored) => {
        if (!active || !stored) return;
        const parsed = JSON.parse(stored) as ExerciseDefaults;
        if (parsed && typeof parsed === 'object') setExerciseDefaults(parsed);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const updateExerciseDefault = (exerciseId: string, value: ExercisePersonalization | null) => {
    setExerciseDefaults((current) => {
      const next = { ...current };
      if (value) next[exerciseId] = value;
      else delete next[exerciseId];
      AsyncStorage.setItem(EXERCISE_DEFAULTS_STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  };

  const updateOnboardingVisibility = (enabled: boolean) => {
    setShowOnboardingAfterSplash(enabled);
    AsyncStorage.setItem(SHOW_ONBOARDING_STORAGE_KEY, String(enabled)).catch(() => undefined);
  };

  useEffect(() => {
    if (!detail) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setDetail(null);
      return true;
    });
    return () => subscription.remove();
  }, [detail]);

  const completeSession = (minutes: number) => {
    setCompletedSessions((value) => value + 1);
    setMindfulMinutes((value) => value + minutes);
  };

  if (launchState === 'splash') {
    return <SplashScreen />;
  }

  if (launchState === 'onboarding') {
    return (
      <OnboardingFlow
        onComplete={() => setLaunchState('app')}
      />
    );
  }

  if (activeExercise) {
    return (
      <BreathingSession
        exercise={activeExercise}
        palette={palette}
        onClose={() => setActiveExercise(null)}
        onComplete={() => completeSession(Math.max(1, Math.round(
          activeExercise.phases.reduce((sum, phase) => sum + phase.seconds, 0) * activeExercise.cycles / 60,
        )))}
      />
    );
  }

  if (activeMeditation) {
    return (
      <MeditationSession
        meditation={activeMeditation}
        palette={palette}
        onClose={() => setActiveMeditation(null)}
        onComplete={() => completeSession(Number.parseInt(activeMeditation.duration, 10) || 2)}
      />
    );
  }

  if (detail) {
    return (
      <ExerciseInfoScreen
        detail={detail}
        palette={palette}
        titleFontsLoaded={titleFontsLoaded}
        defaultPersonalization={detail.kind === 'exercise' ? exerciseDefaults[detail.item.id] : undefined}
        onDefaultChange={updateExerciseDefault}
        onBack={() => setDetail(null)}
        onBegin={(configuredItem) => {
          if (detail.kind === 'exercise') setActiveExercise(configuredItem as Exercise);
          else setActiveMeditation(configuredItem as Meditation);
          setDetail(null);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg }]} edges={['top', 'left', 'right']}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Header
        palette={palette}
        themeMode={themeMode}
        onBack={tab === 'menu' && menuSection !== null ? () => setMenuSection(null) : undefined}
      />

      <View style={styles.content}>
        {tab === 'breathe' && (
          <Library
            title="Just Breathe"
            items={exercises}
            palette={palette}
            accent="breath"
            onPress={(item) => setDetail({ kind: 'exercise', item })}
            titleFontsLoaded={titleFontsLoaded}
          />
        )}
        {tab === 'meditate' && (
          <Library
            title="Meditate"
            items={meditations}
            palette={palette}
            accent="meditation"
            onPress={(item) => setDetail({ kind: 'meditation', item })}
            titleFontsLoaded={titleFontsLoaded}
          />
        )}
        {tab === 'recommend' && (
          <RecommendScreen
            palette={palette}
            onExercise={(item) => setDetail({ kind: 'exercise', item })}
            onMeditation={(item) => setDetail({ kind: 'meditation', item })}
            titleFontsLoaded={titleFontsLoaded}
          />
        )}
        {tab === 'menu' && (
          <MenuSectionScreen
            section={menuSection}
            palette={palette}
            completedSessions={completedSessions}
            mindfulMinutes={mindfulMinutes}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            showOnboardingAfterSplash={showOnboardingAfterSplash}
            setShowOnboardingAfterSplash={updateOnboardingVisibility}
            onSelectSection={setMenuSection}
            onBack={() => setMenuSection(null)}
          />
        )}
      </View>

      <TabBar
        tab={tab}
        palette={palette}
        onTabPress={(nextTab) => {
          if (nextTab === 'menu') setMenuSection(null);
          setTab(nextTab);
        }}
      />
    </SafeAreaView>
  );
}

function Header({
  palette,
  themeMode,
  onBack,
}: {
  palette: Palette;
  themeMode: ThemeMode;
  onBack?: () => void;
}) {
  return (
    <View style={[styles.header, { backgroundColor: palette.bg, borderBottomColor: palette.border }]}>
      {onBack && (
        <Pressable onPress={onBack} hitSlop={12} style={{ zIndex: 1 }}>
          <Text style={[styles.headerBack, { color: palette.text }]}>‹ Back</Text>
        </Pressable>
      )}
      <Text style={[styles.wordmark, { color: palette.text }]}>
        Hush<Text style={{ color: TERRACOTTA }}>.</Text>
      </Text>
    </View>
  );
}

function Library<T extends Exercise | Meditation>({
  title,
  items,
  palette,
  accent,
  onPress,
  titleFontsLoaded,
}: {
  title: string;
  items: T[];
  palette: Palette;
  accent: 'breath' | 'meditation';
  onPress: (item: T) => void;
  titleFontsLoaded: boolean;
}) {
  const categories: { category: string; items: T[] }[] = [];
  for (const item of items) {
    const group = categories.find((entry) => entry.category === item.bestFor);
    if (group) group.items.push(item);
    else categories.push({ category: item.bestFor, items: [item] });
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.libraryHeading}>
        <Text style={[styles.eyebrow, { color: accent === 'breath' ? palette.accent : palette.meditation }]}>
          {accent === 'breath' ? 'CHOOSE YOUR PATH' : 'FIND YOUR CALM'}
        </Text>
        <Text style={[styles.title, styles.libraryTitle, { color: palette.text }, titleFontsLoaded && { fontFamily: TITLE_FONT_FAMILY }]}>{title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {accent === 'breath' && items.length > 0 && (
          <FeaturedCard item={items[0] as unknown as Exercise} palette={palette} onPress={() => onPress(items[0])} titleFontsLoaded={titleFontsLoaded} />
        )}
        {categories.map((group, groupIndex) => (
          <View key={group.category} style={groupIndex > 0 ? styles.categorySection : undefined}>
            {groupIndex > 0 && <View style={[styles.categorySeparator, { backgroundColor: FOREST_SAGE, opacity: 0.5 }]} />}
            {group.items.map((item, index) => (
              <View key={item.id} style={styles.categoryCardSpacing}>
                <PracticeCard
                  item={item}
                  index={index}
                  palette={palette}
                  accent={accent}
                  onPress={() => onPress(item)}
                  titleFontsLoaded={titleFontsLoaded}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function FeaturedCard({
  item,
  palette,
  onPress,
  titleFontsLoaded,
}: {
  item: Exercise;
  palette: Palette;
  onPress: () => void;
  titleFontsLoaded: boolean;
}) {
  const phases = exerciseDetails[item.id]?.phases;
  const flow = phases ? buildFlowPaths(phases) : null;
  const totalSeconds = phases?.reduce((sum, phase) => sum + phase.seconds, 0) ?? 0;
  let elapsedSeconds = 0;
  const phaseLabels = phases?.map((phase) => {
    const midpoint = elapsedSeconds + phase.seconds / 2;
    elapsedSeconds += phase.seconds;
    return { key: `${phase.label}-${elapsedSeconds}`, seconds: phase.seconds, pct: (midpoint / totalSeconds) * 100 };
  });
  let boundarySeconds = 0;
  const phaseBoundaries = phases?.slice(0, -1).map((phase) => {
    boundarySeconds += phase.seconds;
    return (boundarySeconds / totalSeconds) * 1000;
  });
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.bestFor}, ${item.duration}, today's pick`}
      style={({ pressed }) => [styles.featuredCard, { backgroundColor: palette.accent, opacity: pressed ? 0.85 : 1 }]}
    >
      {flow && (
        <Svg pointerEvents="none" style={styles.featuredCardGraph} viewBox="0 0 1000 64" preserveAspectRatio="none">
          <Path d={flow.fill} fill="#FFFFFF" opacity={0.1} />
          {phaseBoundaries?.map((x) => (
            <Line key={x} x1={x} y1={8} x2={x} y2={56} stroke="#FFFFFF" strokeWidth={1} opacity={0.4} />
          ))}
          <Path d={flow.stroke} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={0.75} />
        </Svg>
      )}
      {flow && phaseLabels && (
        <View pointerEvents="none" style={styles.featuredCardGraphLabels}>
          {phaseLabels.map((label) => (
            <Text key={label.key} style={[styles.featuredCardGraphLabel, { left: `${label.pct}%`, color: '#FFFFFF' }]}>
              {label.seconds}s
            </Text>
          ))}
        </View>
      )}
      <View style={styles.featuredCardBody}>
        <Text style={[styles.featuredCardTitle, { color: palette.surface }, titleFontsLoaded && { fontFamily: TITLE_FONT_FAMILY }]}>{item.name}</Text>
        <Text style={[styles.featuredCardMeta, { color: palette.tint }]}>{item.duration} · {item.bestFor}</Text>
      </View>
      <View style={[styles.featuredCardTryButton, { backgroundColor: palette.tint }]}>
        <Text style={[styles.featuredCardTryLabel, { color: palette.accent }]}>Go</Text>
      </View>
    </Pressable>
  );
}

function PracticeCard({
  item,
  index,
  palette,
  accent,
  onPress,
  confidence,
  recommendationNote,
  showCategory = true,
  titleFontsLoaded,
}: {
  item: Exercise | Meditation;
  index: number;
  palette: Palette;
  accent: 'breath' | 'meditation';
  onPress: () => void;
  confidence?: number;
  recommendationNote?: string;
  showCategory?: boolean;
  titleFontsLoaded: boolean;
}) {
  const color = accent === 'breath' ? palette.accent : palette.meditation;
  const tint = accent === 'breath' ? palette.tint : palette.meditationTint;
  const recommendationContext = [
    confidence !== undefined ? `${confidence}% match` : null,
    recommendationNote,
  ].filter(Boolean).join(', ');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.bestFor}, ${item.duration}${recommendationContext ? `, ${recommendationContext}` : ''}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border, opacity: pressed ? 0.78 : 1 },
      ]}
    >
      {accent === 'breath' ? (
        <ExerciseCardVisual
          exerciseName={item.name}
          color={palette.text}
          backgroundColor={tint}
        />
      ) : (
        <View style={[styles.cardMark, { backgroundColor: tint }]}>
          <Text style={[styles.cardMarkText, { color }]}>{String(index + 1).padStart(2, '0')}</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        {(showCategory || confidence !== undefined) && (
          <View style={styles.cardCategoryRow}>
            {showCategory && <Text style={[styles.cardCategory, { color }]}>{item.bestFor.toUpperCase()}</Text>}
            {confidence !== undefined && (
              <Text style={[styles.confidence, { color, backgroundColor: tint }]}>{confidence}% MATCH</Text>
            )}
          </View>
        )}
        <Text style={[styles.cardTitle, { color: palette.text }, titleFontsLoaded && { fontFamily: TITLE_FONT_FAMILY }]}>{item.name}</Text>
        {recommendationNote && (
          <Text style={[styles.recommendationNote, { color }]}>{recommendationNote}</Text>
        )}
      </View>
      <Text style={[styles.arrow, styles.cardArrow, { color }]}>→</Text>
    </Pressable>
  );
}

function PersonalizeIcon({ color, backgroundColor }: { color: string; backgroundColor: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Line x1={4} y1={7} x2={20} y2={7} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={9} cy={7} r={2} fill={backgroundColor} stroke={color} strokeWidth={1.5} />
      <Line x1={4} y1={17} x2={20} y2={17} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={15} cy={17} r={2} fill={backgroundColor} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

function ExerciseInfoScreen({
  detail,
  palette,
  defaultPersonalization,
  onDefaultChange,
  onBack,
  onBegin,
  titleFontsLoaded,
}: {
  detail: NonNullable<Detail>;
  palette: Palette;
  defaultPersonalization?: ExercisePersonalization;
  onDefaultChange: (exerciseId: string, value: ExercisePersonalization | null) => void;
  onBack: () => void;
  onBegin: (item: Exercise | Meditation) => void;
  titleFontsLoaded: boolean;
}) {
  const item = detail.item;
  const isExercise = detail.kind === 'exercise';
  const exerciseItem = isExercise ? item as Exercise : undefined;
  const exerciseConfig = isExercise ? exerciseDetails[item.id] : undefined;
  const accent = isExercise ? palette.accent : palette.meditation;
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const [personalization, setPersonalization] = useState<ExercisePersonalization | null>(() => (
    exerciseItem ? defaultPersonalization ?? basePersonalization(exerciseItem) : null
  ));

  useEffect(() => {
    if (!exerciseItem) {
      setPersonalization(null);
      return;
    }
    setPersonalization(defaultPersonalization ?? basePersonalization(exerciseItem));
  }, [defaultPersonalization, exerciseItem?.id]);

  const configuredExercise = exerciseItem && personalization
    ? applyPersonalization(exerciseItem, clampPersonalization(exerciseItem, personalization))
    : undefined;
  const configuredExerciseConfig = exerciseConfig && configuredExercise
    && (configuredExercise.id === 'coherent' || configuredExercise.id === 'alternate')
    ? {
        ...exerciseConfig,
        phases: configuredExercise.phases.map((phase) => ({
          label: phase.label.toUpperCase(),
          seconds: phase.seconds,
        })),
      }
    : exerciseConfig;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg }]}>
      <StatusBar style={palette === palettes.dark ? 'light' : 'dark'} />
      <View style={[styles.detailHeader, { borderBottomColor: palette.border }]}>
        <Pressable onPress={onBack} hitSlop={12}><Text style={[styles.back, { color: palette.text }]}>‹ Back</Text></Pressable>
        {isExercise ? (
          <Text accessibilityLabel="Hush" style={[styles.detailWordmark, { color: palette.text }]}>
            Hush<Text style={{ color: TERRACOTTA }}>.</Text>
          </Text>
        ) : (
          <Text style={[styles.detailHeaderLabel, { color: palette.muted }]}>MEDITATION</Text>
        )}
        {exerciseItem ? (
          <Pressable
            onPress={() => setPersonalizeOpen(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Personalise ${exerciseItem.name}`}
            style={styles.detailPersonalizeButton}
          >
            <PersonalizeIcon color={palette.text} backgroundColor={palette.bg} />
          </Pressable>
        ) : (
          <View style={{ width: 52 }} />
        )}
      </View>
      <ScrollView contentContainerStyle={styles.detailContent}>
        <Text style={[styles.eyebrow, { color: accent }]}>{item.bestFor.toUpperCase()}</Text>
        <Text style={[styles.detailTitle, { color: palette.text }, titleFontsLoaded && { fontFamily: TITLE_FONT_FAMILY }]}>{item.name}</Text>
        {!isExercise && (
          <Text style={[styles.detailMeta, { color: palette.muted }]}>{item.duration}  ·  Effort {item.effort} of 3</Text>
        )}
        {exerciseConfig ? (
          <ExerciseSummary description={exerciseConfig.summary} palette={palette} />
        ) : (
          <Text style={[styles.detailDescription, { color: palette.text }]}>{item.description}</Text>
        )}

        {isExercise ? (
          exerciseConfig ? (
            <>
              <ExerciseRhythm config={configuredExerciseConfig ?? exerciseConfig} palette={palette} titleFontsLoaded={titleFontsLoaded} />
              <ExerciseGuide sections={exerciseConfig.guide} palette={palette} titleFontsLoaded={titleFontsLoaded} />
            </>
          ) : null
        ) : (
          <InfoSection title="The practice" palette={palette} titleFontsLoaded={titleFontsLoaded}>
            {(item as Meditation).steps.map((step, index) => <InfoRow key={step} number={index + 1} text={step} palette={palette} />)}
          </InfoSection>
        )}
      </ScrollView>
      <View style={[styles.beginDock, { backgroundColor: palette.bg, borderTopColor: palette.border }]}>
        <Pressable onPress={() => onBegin(configuredExercise ?? item)} style={[styles.primaryButton, { backgroundColor: accent }]}>
          <Text style={[styles.primaryButtonText, { color: palette.bg }]}>Begin practice</Text>
        </Pressable>
      </View>
      {exerciseItem && personalization && (
        <PersonalizeSheet
          visible={personalizeOpen}
          exercise={exerciseItem}
          value={personalization}
          defaultEnabled={Boolean(defaultPersonalization)}
          palette={palette}
          onClose={() => setPersonalizeOpen(false)}
          onSave={(value, setAsDefault) => {
            setPersonalization(value);
            onDefaultChange(exerciseItem.id, setAsDefault ? value : null);
            setPersonalizeOpen(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}

function ExerciseSummary({ description, palette }: { description: string; palette: Palette }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.summarySection}>
      <Text
        style={[styles.summaryText, { color: palette.text }]}
        numberOfLines={expanded ? undefined : 3}
      >
        {description}
      </Text>
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={({ pressed }) => [styles.summaryToggle, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Text style={[styles.summaryToggleText, { color: palette.muted }]}>
          {expanded ? 'Show less' : 'Show more'}
        </Text>
        <ChevronDisclosureIcon color={palette.muted} expanded={expanded} size={13} />
      </Pressable>
    </View>
  );
}

function buildFlowPaths(phases: DetailPhase[]) {
  const total = phases.reduce((sum, phase) => sum + phase.seconds, 0);
  let level = 0;
  let x = 0;
  const commands: string[] = [];
  phases.forEach((phase, index) => {
    const startLevel = level;
    if (phase.toLevel !== undefined) level = phase.toLevel;
    else if (phase.label === 'MAX' || phase.label.startsWith('INHALE')) level = 1;
    else if (phase.label.startsWith('EXHALE')) level = 0;
    const width = (phase.seconds / total) * 1000;
    const x2 = x + width;
    const y1 = 56 - startLevel * 48;
    const y2 = 56 - level * 48;
    if (index === 0) commands.push(`M${x},${y1}`);
    if (Math.abs(y1 - y2) < 0.5) commands.push(`L${x2},${y2}`);
    else if (phase.spike) {
      const control = x + width * 0.05;
      commands.push(`C${control},${y2} ${control},${y2} ${x2},${y2}`);
    } else {
      const midpointX = x + width * 0.5;
      const midpointY = y1 + (y2 - y1) * 0.5;
      commands.push(`C${x + width / 6},${y1} ${x + width / 3},${y1 + (y2 - y1) * 0.1875} ${midpointX},${midpointY}`);
      commands.push(`C${x + width * 2 / 3},${y1 + (y2 - y1) * 0.8125} ${x + width * 5 / 6},${y2} ${x2},${y2}`);
    }
    x = x2;
  });
  const stroke = commands.join(' ');
  return { stroke, fill: `${stroke} L1000,56 L0,56 Z`, total };
}

function ExerciseRhythm({ config, palette, titleFontsLoaded }: { config: ExerciseDetailConfig; palette: Palette; titleFontsLoaded: boolean }) {
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const isDark = palette === palettes.dark;
  const isMinimal = palette === palettes.minimal;
  const graphStroke = isDark ? '#FFFFFF' : isMinimal ? palette.accent : '#4A7C68';
  const graphFill = isDark ? 'rgba(240,240,240,0.08)' : isMinimal ? palette.tint : 'rgba(74,124,104,0.10)';
  const guideLine = isDark ? 'rgba(240,240,240,0.40)' : isMinimal ? 'rgba(17,17,17,0.35)' : 'rgba(74,124,104,0.42)';
  const previewScale = Math.min(Math.max(screenWidth - 74, 1) / 360, 259 / 286);
  // SVG text renders optically smaller than native React Native Text at the
  // same nominal size, so use a 13px SVG target to match the 12px phase labels.
  const previewPhaseFontSize = 13 / previewScale;
  const previewDurationFontSize = 16 / previewScale;
  const previewUnitFontSize = 13 / previewScale;
  const phases = config.phases;
  const flowPaths = buildFlowPaths(phases);
  let boundary = 0;
  const phaseBoundaries = phases.slice(0, -1).map((phase) => {
    boundary += (phase.seconds / flowPaths.total) * 1000;
    return boundary;
  });

  return (
    <View style={styles.infoSection}>
      <Text style={[styles.infoTitle, { color: palette.text }, titleFontsLoaded && { fontFamily: TITLE_FONT_FAMILY }]}>Rhythm</Text>
      <View
        style={[styles.rhythmCard, { borderColor: palette.border }]}
      >
        <View
          style={styles.flowGraph}
          accessible
          accessibilityLabel={`Breathing rhythm: ${phases.map((phase) => `${phase.label.toLowerCase()} ${phase.seconds} seconds`).join(', ')}.`}
        >
          <Svg width="100%" height={64} viewBox="0 0 1000 64" preserveAspectRatio="none">
            <Line x1={0} y1={56} x2={1000} y2={56} stroke={guideLine} strokeWidth={0.5} />
            {phaseBoundaries.map((x) => (
              <Line key={x} x1={x} y1={8} x2={x} y2={56} stroke={guideLine} strokeWidth={0.5} />
            ))}
            <Path d={flowPaths.fill} fill={graphFill} />
            <Path d={flowPaths.stroke} fill="none" stroke={graphStroke} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
        <View style={styles.phaseStrip}>
          {phases.map((phase, index) => (
            <View key={`${phase.label}-${index}`} style={[styles.phaseColumn, { flex: phase.seconds }, index > 0 && { borderLeftColor: palette.border, borderLeftWidth: StyleSheet.hairlineWidth }]}>
              <Text style={[styles.phaseDuration, { color: palette.text }]}>
                {phase.seconds}<Text style={[styles.phaseUnit, { color: palette.muted }]}>s</Text>
              </Text>
              <Text style={[styles.phaseLabel, { color: palette.text }]}>{phase.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <Pressable
        onPress={() => setPreviewExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: previewExpanded }}
        style={({ pressed }) => [styles.previewToggle, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Text style={[styles.previewToggleText, { color: palette.muted }]}>
          {previewExpanded ? 'Hide preview' : 'Preview'}
        </Text>
        <ChevronDisclosureIcon color={palette.muted} expanded={previewExpanded} size={13} />
      </Pressable>
      {previewExpanded && (
        <View
          style={[styles.boxPreviewCard, { borderColor: palette.border }]}
          accessible
          accessibilityLabel={`${config.flow} breathing preview: ${phases.map((phase) => `${phase.label.toLowerCase()} ${phase.seconds} seconds`).join(', ')}.`}
        >
          <Text style={[styles.previewFlowLabel, { color: palette.muted }]}>Flow: {config.flow}</Text>
          <ExercisePreviewGraphic
            config={config}
            palette={palette}
            phaseFontSize={previewPhaseFontSize}
            durationFontSize={previewDurationFontSize}
            unitFontSize={previewUnitFontSize}
          />
        </View>
      )}
    </View>
  );
}

function ExercisePreviewGraphic({
  config,
  palette,
  phaseFontSize,
  durationFontSize,
  unitFontSize,
}: {
  config: ExerciseDetailConfig;
  palette: Palette;
  phaseFontSize: number;
  durationFontSize: number;
  unitFontSize: number;
}) {
  const isDark = palette === palettes.dark;
  const isMinimal = palette === palettes.minimal;
  const ghost = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.30)';
  const active = isDark ? 'rgba(255,255,255,0.72)' : palette.accent;
  const leader = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)';
  const softFill = isDark ? 'rgba(255,255,255,0.09)' : isMinimal ? palette.tint : 'rgba(49,95,77,0.08)';
  const phaseColor = palette.accent;

  const metric = (
    key: string,
    x: number,
    y: number,
    anchor: 'start' | 'middle' | 'end',
    phase: DetailPhase,
  ) => (
    <React.Fragment key={key}>
      <SvgText x={x} y={y - 8} textAnchor={anchor} fontSize={durationFontSize} fontWeight="500" fill={palette.text}>
        <TSpan>{phase.seconds}</TSpan>
        <TSpan fontSize={unitFontSize} fontWeight="400">s</TSpan>
      </SvgText>
      <SvgText x={x} y={y + 10} textAnchor={anchor} fontSize={phaseFontSize} letterSpacing={0.6} fill={phaseColor}>
        {phase.label === 'EXHALE with HUM' ? 'EXHALE + HUM' : phase.label}
      </SvgText>
    </React.Fragment>
  );

  if (config.preview === 'box') {
    const labels = [
      { phase: config.phases[0], x1: 175, y1: 67.5, x2: 175, y2: 49, tx: 175, ty: 34, anchor: 'middle' as const },
      { phase: config.phases[1], x1: 262.5, y1: 155, x2: 281, y2: 155, tx: 287, ty: 150, anchor: 'start' as const },
      { phase: config.phases[2], x1: 175, y1: 242.5, x2: 175, y2: 261, tx: 175, ty: 270, anchor: 'middle' as const },
      { phase: config.phases[3], x1: 87.5, y1: 155, x2: 69, y2: 155, tx: 63, ty: 150, anchor: 'end' as const },
    ];
    return (
      <Svg width="100%" height={259} viewBox="-10 10 360 286">
        <Rect x={87.5} y={67.5} width={175} height={175} rx={8} fill="none" stroke={ghost} strokeWidth={1.75} />
        <Circle cx={95.5} cy={67.5} r={2.5} fill={palette.text} />
        {labels.map((label, index) => (
          <React.Fragment key={`${label.phase.label}-${index}`}>
            <Line x1={label.x1} y1={label.y1} x2={label.x2} y2={label.y2} stroke={leader} strokeWidth={1} />
            {metric(`${label.phase.label}-metric-${index}`, label.tx, label.ty, label.anchor, label.phase)}
          </React.Fragment>
        ))}
      </Svg>
    );
  }

  if (config.preview === 'wave') {
    const wave = 'M87.5,242.5 C135.8,242.5 126.7,67.5 175,67.5 C223.3,67.5 214.2,242.5 262.5,242.5';
    const activeWave = 'M87.5,242.5 C135.8,242.5 126.7,67.5 175,67.5';
    return (
      <Svg width="100%" height={259} viewBox="-10 10 360 286">
        <Path d={wave} fill="none" stroke={ghost} strokeWidth={1.75} strokeLinecap="round" />
        <Path d={activeWave} fill="none" stroke={active} strokeWidth={1.75} strokeLinecap="round" />
        <Circle cx={131.25} cy={155} r={2.5} fill={palette.text} />
        <Line x1={131.25} y1={155} x2={55} y2={155} stroke={leader} />
        {metric('wave-inhale', 50, 155, 'end', config.phases[0])}
        <Circle cx={218.75} cy={155} r={2.5} fill={palette.text} />
        <Line x1={218.75} y1={155} x2={295} y2={155} stroke={leader} />
        {metric('wave-exhale', 300, 155, 'start', config.phases[1])}
      </Svg>
    );
  }

  if (config.preview === 'triangles') {
    const inhalePhase = config.phases.find((phase) => phase.label.includes('INHALE')) ?? config.phases[0];
    const exhalePhase = config.phases.find((phase) => phase.label.includes('EXHALE')) ?? config.phases[1];
    return (
      <Svg width="100%" height={259} viewBox="-10 10 360 286">
        <Path d="M174,67.5 L87.5,242.5 L174,242.5 Z" fill={softFill} stroke={active} strokeWidth={1.75} />
        <Path d="M176,67.5 L176,242.5 L262.5,242.5 Z" fill={softFill} stroke={ghost} strokeWidth={1.75} />
        <Circle cx={130.75} cy={155} r={2.5} fill={palette.text} />
        <Line x1={130.75} y1={155} x2={55} y2={155} stroke={leader} />
        {metric('triangle-inhale', 50, 155, 'end', inhalePhase)}
        <Circle cx={219.25} cy={155} r={2.5} fill={palette.text} />
        <Line x1={219.25} y1={155} x2={295} y2={155} stroke={leader} />
        {metric('triangle-exhale', 300, 155, 'start', exhalePhase)}
      </Svg>
    );
  }

  if (config.preview === 'lens') {
    const upper = 'M87.5,155 C135.8,155 126.7,67.5 175,67.5 C223.3,67.5 214.2,155 262.5,155';
    const lower = 'M87.5,155 C135.8,155 126.7,242.5 175,242.5 C223.3,242.5 214.2,155 262.5,155';
    return (
      <Svg width="100%" height={259} viewBox="-10 10 360 286">
        <Path d={`${upper} C214.2,155 223.3,242.5 175,242.5 C126.7,242.5 135.8,155 87.5,155 Z`} fill={softFill} />
        <Path d={upper} fill="none" stroke={active} strokeWidth={1.75} />
        <Path d={lower} fill="none" stroke={ghost} strokeWidth={1.75} />
        {metric('lens-inhale', 50, 155, 'end', config.phases[0])}
        {metric('lens-exhale', 300, 155, 'start', config.phases[1])}
      </Svg>
    );
  }

  if (config.preview === 'diaphragm') {
    return (
      <Svg width="100%" height={259} viewBox="-10 10 360 286">
        <Rect x={87.5} y={67.5} width={175} height={175} fill={softFill} />
        <Line x1={87.5} y1={67.5} x2={262.5} y2={67.5} stroke={ghost} strokeWidth={1.75} strokeLinecap="round" />
        <Line x1={87.5} y1={242.5} x2={262.5} y2={242.5} stroke={active} strokeWidth={1.75} strokeLinecap="round" />
        <Circle cx={87.5} cy={242.5} r={2.5} fill={palette.text} />
        <Line x1={87.5} y1={242.5} x2={55} y2={242.5} stroke={leader} />
        {metric('diaphragm-inhale', 50, 242.5, 'end', config.phases[0])}
        <Circle cx={262.5} cy={67.5} r={2.5} fill={palette.text} />
        <Line x1={262.5} y1={67.5} x2={295} y2={67.5} stroke={leader} />
        {metric('diaphragm-exhale', 300, 67.5, 'start', config.phases[2])}
      </Svg>
    );
  }

  const cx = 175;
  const cy = 155;
  const radius = 87.5;
  const total = config.phases.reduce((sum, phase) => sum + phase.seconds, 0);
  let cursor = -Math.PI / 2;
  const arcs = config.phases.map((phase) => {
    const span = (phase.seconds / total) * Math.PI * 2;
    const start = cursor + 0.03;
    const sweep = span - 0.06;
    const mid = cursor + span / 2;
    cursor += span;
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(start + sweep);
    const y2 = cy + radius * Math.sin(start + sweep);
    const labelRadius = 120;
    const lx = cx + labelRadius * Math.cos(mid);
    const ly = cy + labelRadius * Math.sin(mid);
    const anchor = lx < cx - 4 ? 'end' as const : lx > cx + 4 ? 'start' as const : 'middle' as const;
    const textX = anchor === 'end' ? lx - 5 : anchor === 'start' ? lx + 5 : lx;
    const dotRadius = config.preview === 'sigh' && phase.label === 'MAX' ? (55 + radius) / 2 : radius;
    return {
      phase,
      d: `M${x1},${y1} A${radius},${radius} 0 ${sweep > Math.PI ? 1 : 0},1 ${x2},${y2}`,
      dotX: cx + dotRadius * Math.cos(mid),
      dotY: cy + dotRadius * Math.sin(mid),
      lx,
      ly,
      textX,
      anchor,
    };
  });

  return (
    <Svg width="100%" height={259} viewBox="-10 10 360 286">
      {config.preview === 'sigh' && (
        <>
          <Circle cx={cx} cy={cy} r={radius} fill={softFill} stroke={ghost} strokeWidth={1.75} />
          <Circle cx={cx} cy={cy} r={55} fill={isDark ? 'rgba(255,255,255,0.07)' : isMinimal ? palette.tint : 'rgba(49,95,77,0.04)'} />
        </>
      )}
      {arcs.map((arc, index) => (
        <React.Fragment key={`${arc.phase.label}-${index}`}>
          {config.preview !== 'sigh' && <Path d={arc.d} fill="none" stroke={ghost} strokeWidth={1.75} strokeLinecap="round" />}
          <Circle cx={arc.dotX} cy={arc.dotY} r={2.5} fill={palette.text} />
          <Line x1={arc.dotX} y1={arc.dotY} x2={arc.lx} y2={arc.ly} stroke={leader} />
          {metric(`arc-${index}`, arc.textX, arc.ly, arc.anchor, arc.phase)}
        </React.Fragment>
      ))}
    </Svg>
  );
}

function ExerciseGuide({ sections, palette, titleFontsLoaded }: { sections: ExerciseGuideSection[]; palette: Palette; titleFontsLoaded: boolean }) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  return (
    <View style={styles.infoSection}>
      <Text style={[styles.infoTitle, { color: palette.text }, titleFontsLoaded && { fontFamily: TITLE_FONT_FAMILY }]}>Guide</Text>
      <View style={[styles.guideBox, { borderColor: palette.border }]}>
        {sections.map((section, sectionIndex) => {
          const isOpen = Boolean(openSections[section.id]);
          return (
            <View key={section.id} style={sectionIndex < sections.length - 1 && { borderBottomColor: palette.border, borderBottomWidth: StyleSheet.hairlineWidth }}>
              <Pressable
                onPress={() => setOpenSections((current) => ({ ...current, [section.id]: !current[section.id] }))}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                accessibilityLabel={`${section.title}, ${isOpen ? 'collapse' : 'expand'}`}
                style={({ pressed }) => [styles.guideHeader, { opacity: pressed ? 0.65 : 1 }]}
              >
                <Text style={[styles.guideTitle, { color: palette.text }]}>{section.title}</Text>
                <ChevronDisclosureIcon color={palette.muted} expanded={isOpen} />
              </Pressable>
              {isOpen && (
                <View style={styles.guideContent}>
                  {section.items.map((item, index) => (
                    <View key={`${section.id}-${index}`} style={styles.guideItem}>
                      <Text style={[styles.guideBullet, { color: palette.accent }]}>•</Text>
                      <Text style={[styles.guideText, { color: palette.text }]}>
                        {item.label ? <Text style={styles.guideItemLabel}>{item.label}{' '}</Text> : null}
                        {item.text}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function InfoSection({
  title,
  palette,
  children,
  titleFontsLoaded,
}: {
  title: string;
  palette: Palette;
  children: React.ReactNode;
  titleFontsLoaded: boolean;
}) {
  return (
    <View style={styles.infoSection}>
      <Text style={[styles.infoTitle, { color: palette.text }, titleFontsLoaded && { fontFamily: TITLE_FONT_FAMILY }]}>{title}</Text>
      <View style={[styles.infoBox, { backgroundColor: palette.surface, borderColor: palette.border }]}>{children}</View>
    </View>
  );
}

function InfoRow({ number, text, palette }: { number: number; text: string; palette: Palette }) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: palette.border }]}>
      <Text style={[styles.infoNumber, { color: palette.muted }]}>{String(number).padStart(2, '0')}</Text>
      <Text style={[styles.infoText, { color: palette.text }]}>{text}</Text>
    </View>
  );
}

function BreathingSession({
  exercise,
  palette,
  onClose,
  onComplete,
}: {
  exercise: Exercise;
  palette: Palette;
  onClose: () => void;
  onComplete: () => void;
}) {
  if (exercise.id === 'box' && !ENABLE_BOX_ORB_PROTOTYPE) {
    return (
      <BoxBreathingSession
        palette={palette}
        onClose={onClose}
        onComplete={onComplete}
        cycles={exercise.cycles}
      />
    );
  }
  return (
    <StandardBreathingSession
      exercise={exercise}
      palette={palette}
      onClose={onClose}
      onComplete={onComplete}
    />
  );
}

function StandardBreathingSession({
  exercise,
  palette,
  onClose,
  onComplete,
}: {
  exercise: Exercise;
  palette: Palette;
  onClose: () => void;
  onComplete: () => void;
}) {
  const { width } = useWindowDimensions();
  const [sessionState, setSessionState] = useState<'countdown' | 'starting' | 'active' | 'finishing' | 'complete'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(exercise.phases[0].seconds);
  const [cycle, setCycle] = useState(1);
  const [paused, setPaused] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const breathLevel = useRef(new Animated.Value(0)).current;
  const phaseProgress = useRef(new Animated.Value(0)).current;
  const phaseProgressIndex = useRef(-1);
  const visualOpacity = useRef(new Animated.Value(0)).current;
  const phaseAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const phaseProgressAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const phase = exercise.phases[phaseIndex];
  const visualSize = width - 32;
  const visualBlockHeight = visualSize + BREATHING_READOUT_HEIGHT;
  const contentSpaceBelowVisual = Math.max(0, (contentHeight - visualBlockHeight) / 2);
  const cycleLabelTop = (40 - contentSpaceBelowVisual) / 2 - 10;
  const complete = sessionState === 'complete';
  const active = sessionState === 'active';
  const totalSessionSeconds = exercise.phases.reduce((sum, item) => sum + item.seconds, 0) * exercise.cycles;
  const timeSpent = `${Math.floor(totalSessionSeconds / 60)}:${String(totalSessionSeconds % 60).padStart(2, '0')}`;
  const phaseTarget = useMemo(() => {
    for (let index = phaseIndex; index >= 0; index -= 1) {
      const label = exercise.phases[index].label.toLowerCase();
      if (label.includes('exhale') || label.includes('softens') || label.includes('hum')) return 0;
      if (label.includes('inhale') || label.includes('expands')) return 1;
    }
    return 0;
  }, [exercise.phases, phaseIndex]);

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
    const timer = setTimeout(() => {
      setSessionState('active');
      Animated.timing(visualOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start();
    }, 850);
    return () => clearTimeout(timer);
  }, [sessionState, visualOpacity]);

  useLayoutEffect(() => {
    phaseProgressAnimation.current?.stop();
    if (!active || paused) return;
    if (phaseProgressIndex.current !== phaseIndex) {
      phaseProgressIndex.current = phaseIndex;
      phaseProgress.setValue(0);
    }
    const animation = Animated.timing(phaseProgress, {
      toValue: 1,
      duration: secondsLeft * 1000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    });
    phaseProgressAnimation.current = animation;
    animation.start();
    return () => animation.stop();
  }, [active, paused, phaseIndex, phaseProgress]);

  useEffect(() => {
    phaseAnimation.current?.stop();
    if (!active || paused) return;
    if (phase.label.toLowerCase().includes('hold')) {
      breathLevel.setValue(phaseTarget);
      return;
    }
    const animation = Animated.timing(breathLevel, {
      toValue: phaseTarget,
      duration: secondsLeft * 1000,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    });
    phaseAnimation.current = animation;
    animation.start();
    return () => animation.stop();
  }, [active, breathLevel, paused, phase.label, phaseTarget]);

  useEffect(() => {
    if (!active || paused) return;
    const timer = setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 0.5) return current - 0.5;
        if (phaseIndex < exercise.phases.length - 1) {
          if (exercise.id === '478' || exercise.id === 'coherent' || exercise.id === 'alternate' || exercise.id === 'pursed' || exercise.id === 'sigh' || exercise.id === 'diaphragmatic' || exercise.id === 'humming') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
          }
          const nextIndex = phaseIndex + 1;
          setPhaseIndex(nextIndex);
          return exercise.phases[nextIndex].seconds;
        }
        if (cycle < exercise.cycles) {
          if (exercise.id === '478' || exercise.id === 'coherent' || exercise.id === 'alternate' || exercise.id === 'pursed' || exercise.id === 'sigh' || exercise.id === 'diaphragmatic' || exercise.id === 'humming') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
          }
          setCycle((value) => value + 1);
          setPhaseIndex(0);
          return exercise.phases[0].seconds;
        }
        clearInterval(timer);
        setSessionState('finishing');
        Animated.timing(visualOpacity, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            setSessionState('complete');
            onComplete();
          }
        });
        return 1;
      });
    }, 500);
    return () => clearInterval(timer);
  }, [active, paused, phaseIndex, cycle, exercise, onComplete]);

  const restart = () => {
    setPhaseIndex(0);
    setSecondsLeft(exercise.phases[0].seconds);
    setCycle(1);
    setPaused(false);
    setCountdown(3);
    setSessionState('countdown');
    phaseAnimation.current?.stop();
    phaseProgressAnimation.current?.stop();
    phaseProgressIndex.current = -1;
    breathLevel.setValue(0);
    phaseProgress.setValue(0);
    visualOpacity.setValue(0);
  };

  return (
    <SafeAreaView style={[styles.exerciseSession, { backgroundColor: palette.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={palette === palettes.dark ? 'light' : 'dark'} />
      <View style={styles.exerciseSessionHeader}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.exerciseSessionCloseButton}>
          <Text style={[styles.close, { color: palette.text }]}>×</Text>
        </Pressable>
        <Text style={[styles.exerciseSessionName, { color: palette.text }]}>{exercise.name}</Text>
        <View style={styles.exerciseSessionHeaderSpacer} />
      </View>

      <View
        style={styles.exerciseSessionContent}
        onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}
      >
        <View style={[styles.exerciseSessionVisual, { width: visualSize, height: visualSize + BREATHING_READOUT_HEIGHT }]}>
          {(sessionState === 'countdown' || sessionState === 'starting') && (
            <View style={styles.exerciseSessionReadout}>
              <Text
                style={[
                  styles.exerciseSessionCountdown,
                  {
                    color: palette.text,
                    opacity: sessionState === 'countdown' ? 1 : 0,
                  },
                ]}
              >
                {sessionState === 'countdown' ? countdown : '0'}
              </Text>
              <Text style={[styles.exerciseSessionPhase, { color: palette.muted }]}>
                {sessionState === 'countdown' ? 'GET READY' : 'STARTING…'}
              </Text>
            </View>
          )}

          {(active || sessionState === 'finishing') && (
            <Animated.View style={[styles.exerciseSessionAnimation, { opacity: visualOpacity }]}>
              <BreathingVisual
                exerciseId={exercise.id}
                level={breathLevel}
                phaseProgress={phaseProgress}
                phaseIndex={phaseIndex}
                phaseCount={exercise.phases.length}
                cycle={cycle}
                phaseLabel={phase.label}
                count={
                  exercise.id === 'sigh'
                    ? phaseIndex === 1
                      ? 4
                      : Math.min(Math.ceil(phase.seconds), Math.floor(phase.seconds - secondsLeft) + 1)
                    : exercise.id === '478' || exercise.id === 'coherent' || exercise.id === 'alternate' || exercise.id === 'pursed' || exercise.id === 'diaphragmatic' || exercise.id === 'humming'
                        ? Math.min(Math.ceil(phase.seconds), Math.floor(phase.seconds - secondsLeft) + 1)
                        : Math.max(1, Math.ceil(secondsLeft))
                }
                palette={palette}
                width={visualSize}
                height={visualSize}
              />
            </Animated.View>
          )}

          {complete && (
            <View style={styles.exerciseSessionReadout}>
              <Text style={[styles.exerciseSessionCheck, { color: palette.text }]}>✓</Text>
              <Text style={[styles.exerciseSessionCompleteTitle, { color: palette.text }]}>Well done</Text>
              <Text style={[styles.exerciseSessionCompleteCopy, { color: palette.text }]}>
                That was time well spent. Let it settle.
              </Text>
            </View>
          )}
        </View>

        {complete && (
          <View
            accessible
            accessibilityLabel={`Time spent ${timeSpent}, ${exercise.cycles} cycles`}
            style={[
              styles.exerciseSessionCompletionStats,
              { borderColor: palette.border, left: (width - 220) / 2 },
              { transform: [{ translateY: 36 }] },
            ]}
          >
            <View style={styles.exerciseSessionStatRow}>
              <Text style={[styles.exerciseSessionStatLabel, { color: palette.muted }]}>Time Spent</Text>
              <Text style={[styles.exerciseSessionStatValue, { color: palette.text }]}>{timeSpent}</Text>
            </View>
            <View style={[styles.exerciseSessionStatDivider, { backgroundColor: palette.border }]} />
            <View style={styles.exerciseSessionStatRow}>
              <Text style={[styles.exerciseSessionStatLabel, { color: palette.muted }]}>Cycles</Text>
              <Text style={[styles.exerciseSessionStatValue, { color: palette.text }]}>{exercise.cycles}</Text>
            </View>
          </View>
        )}

      </View>

      <View style={styles.exerciseSessionControls}>
        {complete ? (
          <>
            <View style={styles.exerciseSessionRoundPlaceholder} />
            <View style={styles.exerciseSessionActions}>
            <Pressable
              onPress={restart}
              style={[styles.exerciseSessionAction, { backgroundColor: palette.surface, borderColor: palette.border }]}
            >
              <Text style={[styles.exerciseSessionActionLabel, { color: palette.text }]}>Practise again</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={[styles.exerciseSessionAction, { backgroundColor: palette.accent, borderColor: palette.accent }]}
            >
              <Text style={[styles.exerciseSessionActionLabel, { color: palette.bg }]}>Done</Text>
            </Pressable>
            </View>
          </>
        ) : (
          <>
            <View style={styles.exerciseSessionRoundPlaceholder} />
            {(active || sessionState === 'finishing') && (
              <Text
                style={[
                  styles.exerciseSessionRound,
                  styles.exerciseSessionFloatingRound,
                  { color: palette.muted, top: cycleLabelTop },
                ]}
              >
                Round {cycle} of {exercise.cycles}
              </Text>
            )}
            {(active || sessionState === 'finishing') && (
              <View style={styles.exerciseSessionActions}>
              <Pressable
                onPress={onClose}
                style={[
                  styles.exerciseSessionAction,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <Text style={[styles.exerciseSessionActionLabel, { color: palette.text }]}>End session</Text>
              </Pressable>
              <Pressable
                onPress={() => setPaused((value) => !value)}
                disabled={!active}
                style={[
                  styles.exerciseSessionAction,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    opacity: active ? 1 : 0.46,
                  },
                ]}
              >
                <Text style={[styles.exerciseSessionActionLabel, { color: palette.text }]}>
                  {paused ? 'Resume' : 'Pause'}
                </Text>
              </Pressable>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function MeditationSession({
  meditation,
  palette,
  onClose,
  onComplete,
}: {
  meditation: Meditation;
  palette: Palette;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const finished = step >= meditation.steps.length;

  const advance = () => {
    if (step === meditation.steps.length - 1) {
      setStep(meditation.steps.length);
      onComplete();
    } else setStep((value) => value + 1);
  };

  return (
    <SafeAreaView style={[styles.session, { backgroundColor: palette.bg }]}>
      <StatusBar style={palette === palettes.dark ? 'light' : 'dark'} />
      <View style={styles.sessionHeader}>
        <Pressable onPress={onClose} hitSlop={12}><Text style={[styles.close, { color: palette.text }]}>×</Text></Pressable>
        <Text style={[styles.sessionName, { color: palette.text }]}>{meditation.name}</Text>
        <Text style={[styles.sessionCycle, { color: palette.muted }]}>{Math.min(step + 1, meditation.steps.length)}/{meditation.steps.length}</Text>
      </View>
      <View style={styles.meditationCenter}>
        <View style={[styles.meditationHalo, { borderColor: palette.meditation, backgroundColor: palette.meditationTint }]}>
          <Text style={[styles.meditationGlyph, { color: palette.meditation }]}>{finished ? '✓' : '○'}</Text>
        </View>
        <Text style={[styles.meditationPrompt, { color: palette.text }]}>
          {finished ? 'Practice complete' : meditation.steps[step]}
        </Text>
        <Text style={[styles.sessionHint, { color: palette.muted }]}>
          {finished ? 'Notice what is present without needing to change it.' : 'Take as long as you need. There is nowhere else to get to.'}
        </Text>
      </View>
      <View style={styles.sessionControls}>
        {finished ? (
          <Pressable onPress={onClose} style={[styles.primaryButton, { backgroundColor: palette.meditation }]}>
            <Text style={[styles.primaryButtonText, { color: palette.bg }]}>Done</Text>
          </Pressable>
        ) : (
          <Pressable onPress={advance} style={[styles.primaryButton, { backgroundColor: palette.meditation }]}>
            <Text style={[styles.primaryButtonText, { color: palette.bg }]}>
              {step === meditation.steps.length - 1 ? 'Complete' : 'Next'}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

function RecommendScreen({
  palette,
  onExercise,
  onMeditation,
  titleFontsLoaded,
}: {
  palette: Palette;
  onExercise: (item: Exercise) => void;
  onMeditation: (item: Meditation) => void;
  titleFontsLoaded: boolean;
}) {
  const scrollRef = useRef<ScrollView>(null);
  // Guide Me only covers breathing for now — the meditate mode toggle was removed.
  const mode: 'breathe' | 'meditate' = 'breathe';
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<BreathIntensityId | MeditationTimeId | null>(null);
  const situations = mode === 'breathe' ? breathSituations : meditationSituations;
  const levels = mode === 'breathe' ? breathIntensities : meditationTimes;
  const modeAccent = mode === 'breathe' ? palette.accent : palette.meditation;
  const modeTint = mode === 'breathe' ? palette.tint : palette.meditationTint;
  const scrollToTop = () => {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: true }));
  };
  const returnToSituations = () => {
    setSelectedSituation(null);
    setSelectedLevel(null);
    scrollToTop();
  };
  const recommendation = useMemo(() => {
    if (!selectedSituation || !selectedLevel) return [];
    if (mode === 'breathe') {
      return getBreathRecommendations(selectedSituation, selectedLevel as BreathIntensityId)
        .map((result) => {
          const item = exercises.find((exercise) => exercise.id === result.exerciseId);
          return item ? {
            item,
            confidence: result.confidence,
            recommendationNote: result.phaseNote,
          } : null;
        })
        .filter(Boolean) as { item: Exercise; confidence: number; recommendationNote?: string }[];
    }
    return getMeditationRecommendationIds(selectedSituation, selectedLevel as MeditationTimeId)
      .map((id) => {
        const item = meditations.find((meditation) => meditation.id === id);
        return item ? { item } : null;
      })
      .filter(Boolean) as { item: Meditation }[];
  }, [mode, selectedLevel, selectedSituation]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.recommendHeading}>
        <Text style={[styles.eyebrow, { color: '#000000' }]}>FIND THE RIGHT TECHNIQUE</Text>
        <Text style={[styles.title, { color: palette.text }, titleFontsLoaded && { fontFamily: TITLE_FONT_FAMILY }]}>App Suggestions</Text>
      </View>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.recommendContent} showsVerticalScrollIndicator={false}>
      {!selectedSituation ? (
        <>
          <Text style={[styles.question, { color: palette.text }]}>How are you feeling right now?</Text>
          <View style={styles.chips}>
            <View style={styles.chipColumn}>
              {situations.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setSelectedSituation(item.id);
                    setSelectedLevel(null);
                    scrollToTop();
                  }}
                  style={[
                    styles.chip,
                    { borderColor: palette.border, backgroundColor: palette.surface },
                  ]}
                >
                  <Text style={{ color: palette.text, textAlign: 'center' }}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </>
      ) : (
        <>
          <Text style={[styles.question, { color: palette.text }]}>
            {mode === 'breathe' ? 'How strongly is it affecting you?' : 'How much time do you have?'}
          </Text>
          <View style={styles.recommenderCarousel}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to situations"
              hitSlop={6}
              onPress={returnToSituations}
              style={({ pressed }) => [styles.recommenderChevron, { opacity: pressed ? 0.55 : 1 }]}
            >
              <ChevronLeftIcon color={modeAccent} />
            </Pressable>
            <View style={styles.recommenderCarouselPills}>
              <View style={styles.chipColumn}>
                {levels.map((level) => (
                  <Pressable
                    key={level.id}
                    onPress={() => setSelectedLevel(level.id)}
                    style={[
                      styles.chip,
                      {
                        borderColor: selectedLevel === level.id ? modeAccent : palette.border,
                        backgroundColor: selectedLevel === level.id ? modeTint : palette.surface,
                      },
                    ]}
                  >
                    <Text style={[styles.chipLabel, { color: palette.text }]}>{level.label}</Text>
                    <Text style={[styles.chipDescription, { color: palette.muted }]}>{level.description}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.recommenderChevronSpacer} />
          </View>
        </>
      )}
      {recommendation.length > 0 && (
        <View style={styles.results}>
          <Text style={[styles.question, { color: palette.text }]}>Suggested exercises</Text>
          {recommendation.map((result, index) => (
            <PracticeCard
              key={result.item.id}
              item={result.item}
              index={index}
              palette={palette}
              accent={mode === 'breathe' ? 'breath' : 'meditation'}
              confidence={'confidence' in result ? result.confidence : undefined}
              recommendationNote={'recommendationNote' in result ? result.recommendationNote : undefined}
              onPress={() => mode === 'breathe' ? onExercise(result.item as Exercise) : onMeditation(result.item as Meditation)}
              titleFontsLoaded={titleFontsLoaded}
            />
          ))}
        </View>
      )}
      </ScrollView>
    </View>
  );
}

function TabBar({
  tab,
  onTabPress,
  palette,
}: {
  tab: Tab;
  onTabPress: (tab: Tab) => void;
  palette: Palette;
}) {
  const insets = useSafeAreaInsets();
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'breathe', label: 'Breathe', icon: '' },
    // Meditate is hidden from the nav bar for now.
    { id: 'recommend', label: 'Guide Me', icon: '' },
    { id: 'menu', label: 'Menu', icon: '' },
  ];
  const tabItems = tabs.map((item) => {
    const selected = tab === item.id;
    const iconColor = selected ? palette.text : palette.muted;
    const iconSize = selected ? 24 : 20;
    const icon = item.id === 'breathe' ? (
      <WindIcon color={iconColor} size={iconSize} />
    ) : item.id === 'meditate' ? (
      <FocusIcon color={iconColor} size={iconSize} />
    ) : item.id === 'recommend' ? (
      <SmartAssistIcon color={iconColor} size={iconSize} />
    ) : item.id === 'menu' ? (
      <MenuIcon color={iconColor} size={iconSize} />
    ) : (
      <Text style={[styles.tabIcon, { color: iconColor }]}>{item.icon}</Text>
    );
    return (
      <Pressable key={item.id} onPress={() => onTabPress(item.id)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected }}>
        {icon}
        <Text style={[styles.tabLabel, { color: iconColor, fontWeight: selected ? '700' : '400', fontSize: selected ? 13 : 12 }]}>{item.label}</Text>
      </Pressable>
    );
  });

  return (
    <View style={{ backgroundColor: palette.surface }}>
      <View style={styles.tabItems} accessibilityRole="tablist">
        {tabItems.map((item, index) => (
          <React.Fragment key={tabs[index].id}>
            {index > 0 && <View style={[styles.tabDivider, { backgroundColor: palette.border }]} />}
            {item}
          </React.Fragment>
        ))}
      </View>
      <View style={{ height: insets.bottom }} />
    </View>
  );
}

function WindIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Path d="M12.8 19.6A2 2 0 1 0 14 16H2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17.5 8.6A2 2 0 1 1 19 12H2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9.8 4.4A2 2 0 1 1 11 8H2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function FocusIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8} />
      <Path d="M3 7V5a2 2 0 0 1 2-2h2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 3h2a2 2 0 0 1 2 2v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 17v2a2 2 0 0 1-2 2h-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 21H5a2 2 0 0 1-2-2v-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MenuIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Line x1={4} y1={6} x2={20} y2={6} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={4} y1={12} x2={20} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={4} y1={18} x2={20} y2={18} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function SmartAssistIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Path d="m4 20 10.5-10.5 2 2L6 22H4v-2Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 2v4M15 4h4M20 8v3M18.5 9.5h3M10 3v2M9 4h2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ChevronLeftIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Path d="m15 18-6-6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronDisclosureIcon({ color, expanded, size = 18 }: { color: string; expanded: boolean; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Path
        d={expanded ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1 },
  header: {
    height: HEADER_HEIGHT, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'flex-start', borderBottomWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  wordmark: {
    position: 'absolute',
    left: 0,
    right: 20,
    textAlign: 'right',
    fontSize: 28,
    fontWeight: '500',
    letterSpacing: -0.56,
  },
  headerBack: { fontSize: 15, fontWeight: '500' },
  listContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 36 },
  libraryHeading: { paddingHorizontal: 20, paddingTop: 30 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, marginBottom: 8 },
  title: { fontSize: 42, fontWeight: '500', letterSpacing: -1.2 },
  libraryTitle: { fontSize: 36 },
  categorySection: { marginTop: 2 },
  categorySeparator: { height: 1, marginBottom: 14 },
  categoryCardSpacing: { marginBottom: 12 },
  featuredCard: {
    marginBottom: 24, minHeight: 192, borderRadius: 22, padding: 22, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
  },
  featuredCardGraph: { position: 'absolute', left: 24, right: 24, bottom: 48, height: 48, zIndex: 0 },
  featuredCardGraphLabels: { position: 'absolute', left: 24, right: 24, bottom: 30, height: 14, zIndex: 0 },
  featuredCardGraphLabel: { position: 'absolute', width: 28, marginLeft: -14, textAlign: 'center', fontSize: 10, fontWeight: '600', opacity: 0.8 },
  featuredCardBody: { flex: 1, paddingRight: 12, alignSelf: 'flex-start', zIndex: 1 },
  featuredCardTitle: { fontSize: 32, fontWeight: '700', letterSpacing: -0.6 },
  featuredCardMeta: { marginTop: 8, fontSize: 14 },
  featuredCardTryButton: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', zIndex: 1 },
  featuredCardTryLabel: { fontSize: 14, fontWeight: '700' },
  card: { borderWidth: 1, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  cardMark: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  cardMarkText: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  cardBody: { flex: 1, paddingRight: 28 },
  cardCategoryRow: { minHeight: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  cardCategory: { flex: 1, fontSize: 13, fontWeight: '700', letterSpacing: 1.2 },
  confidence: { overflow: 'hidden', borderRadius: 10, paddingVertical: 3, paddingHorizontal: 7, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  cardTitle: { fontSize: 28, fontWeight: '600', lineHeight: 34 },
  recommendationNote: { fontSize: 12, lineHeight: 17, fontWeight: '500', marginTop: 8 },
  arrow: { fontSize: 20 },
  cardArrow: { position: 'absolute', right: 16, bottom: 16 },
  detailHeader: {
    height: 58, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: { fontSize: 16 },
  detailHeaderLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  detailWordmark: { fontSize: 28, fontWeight: '500', letterSpacing: -0.56 },
  detailPersonalizeButton: { width: 52, height: 44, alignItems: 'flex-end', justifyContent: 'center' },
  detailContent: { padding: 22, paddingBottom: 130 },
  detailTitle: { fontSize: 40, lineHeight: 46, fontWeight: '600', letterSpacing: -1.2 },
  detailMeta: { marginTop: 12, fontSize: 13 },
  detailDescription: { marginTop: 28, fontSize: 18, lineHeight: 29 },
  summarySection: { marginTop: 28 },
  summaryText: { fontSize: 16, lineHeight: 25 },
  summaryToggle: { minHeight: 32, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4 },
  summaryToggleText: { fontSize: 13 },
  infoSection: { marginTop: 34 },
  infoTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  infoBox: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  infoRow: { minHeight: 60, padding: 14, flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, gap: 14 },
  infoNumber: { width: 24, fontSize: 11, letterSpacing: 1 },
  infoText: { flex: 1, fontSize: 15, lineHeight: 22 },
  rhythmCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  flowGraph: { paddingHorizontal: 14, paddingTop: 14 },
  phaseStrip: { flexDirection: 'row', paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14 },
  phaseColumn: { flex: 1, alignItems: 'center' },
  phaseDuration: { fontSize: 16, fontWeight: '500' },
  phaseUnit: { fontSize: 13, fontWeight: '400' },
  phaseLabel: { marginTop: 4, fontSize: 12, letterSpacing: 0.65 },
  previewToggle: { minHeight: 38, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 4 },
  previewToggleText: { fontSize: 13 },
  boxPreviewCard: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, overflow: 'hidden' },
  previewFlowLabel: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  guideBox: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  guideHeader: { minHeight: 54, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  guideTitle: { fontSize: 16, fontWeight: '500' },
  guideContent: { paddingHorizontal: 16, paddingBottom: 18, gap: 12 },
  guideItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  guideBullet: { fontSize: 17, lineHeight: 24 },
  guideText: { flex: 1, fontSize: 15, lineHeight: 24 },
  guideItemLabel: { fontWeight: '600' },
  beginDock: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
  primaryButton: { minHeight: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26 },
  primaryButtonText: { fontSize: 16, fontWeight: '700' },
  secondaryButton: { minHeight: 54, borderRadius: 27, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26 },
  exerciseSession: { flex: 1 },
  exerciseSessionHeader: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseSessionCloseButton: { width: 30, zIndex: 1 },
  exerciseSessionName: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseSessionHeaderSpacer: { width: 30 },
  exerciseSessionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  exerciseSessionRhythm: {
    position: 'absolute',
    top: 10,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  exerciseSessionVisual: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseSessionReadout: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 42,
  },
  exerciseSessionCountdown: {
    width: '100%',
    textAlign: 'center',
    fontSize: 68,
    lineHeight: 74,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  exerciseSessionPhase: {
    width: '100%',
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '400',
    letterSpacing: 2.2,
    marginTop: 6,
  },
  exerciseSessionAnimation: { ...StyleSheet.absoluteFill },
  exerciseSessionCheck: { fontSize: 42, fontWeight: '300' },
  exerciseSessionCompleteTitle: { fontSize: 24, fontWeight: '600', marginTop: 8 },
  exerciseSessionCompleteCopy: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  exerciseSessionRound: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
  },
  exerciseSessionRoundPosition: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
  },
  exerciseSessionCompletionStats: {
    position: 'absolute',
    top: '75%',
    width: 220,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  exerciseSessionStatRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseSessionStatLabel: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  exerciseSessionStatValue: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  exerciseSessionStatDivider: { height: 1 },
  exerciseSessionControls: {
    minHeight: 116,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    justifyContent: 'center',
    gap: 10,
  },
  exerciseSessionRoundPlaceholder: { height: 20 },
  exerciseSessionFloatingRound: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  exerciseSessionActions: { flexDirection: 'row', gap: 10 },
  exerciseSessionAction: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  exerciseSessionActionLabel: { fontSize: 16, fontWeight: '500' },
  session: { flex: 1, paddingHorizontal: 20 },
  sessionHeader: { height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { fontSize: 32, fontWeight: '300' },
  sessionName: { fontSize: 14, fontWeight: '600', maxWidth: 230 },
  sessionCycle: { fontSize: 12 },
  sessionCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  breathOrbOuter: { width: 270, height: 270, borderRadius: 135, alignItems: 'center', justifyContent: 'center' },
  breathOrb: { width: 190, height: 190, borderRadius: 95, alignItems: 'center', justifyContent: 'center' },
  phaseText: { fontSize: 17, letterSpacing: 1 },
  timerText: { fontSize: 58, fontWeight: '300', marginTop: 4 },
  sessionHint: { textAlign: 'center', fontSize: 15, lineHeight: 23, maxWidth: 300, marginTop: 42 },
  sessionControls: { paddingVertical: 24, gap: 10 },
  meditationCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  meditationHalo: { width: 140, height: 140, borderRadius: 70, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  meditationGlyph: { fontSize: 48 },
  meditationPrompt: { textAlign: 'center', fontSize: 27, lineHeight: 38, fontWeight: '500', marginTop: 38 },
  recommendHeading: { paddingHorizontal: 20, paddingTop: 30 },
  recommendContent: { paddingHorizontal: 20, paddingBottom: 42 },
  question: { fontSize: 20, fontWeight: '600', marginTop: 30, marginBottom: 14 },
  recommenderCarousel: { flexDirection: 'row', alignItems: 'center' },
  recommenderChevron: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  recommenderCarouselPills: { flex: 1, alignItems: 'stretch' },
  recommenderChevronSpacer: { width: 44 },
  chips: { alignItems: 'stretch' },
  chipColumn: { alignItems: 'stretch', gap: 10 },
  chip: { minHeight: 58, borderWidth: 1, borderRadius: 14, paddingHorizontal: 17, justifyContent: 'center' },
  chipLabel: { textAlign: 'center', fontSize: 15, fontWeight: '600' },
  chipDescription: { textAlign: 'center', fontSize: 12, marginTop: 3 },
  results: { gap: 12 },
  tabItems: { height: 58, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-around' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabDivider: { width: 1, marginVertical: 10 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 12 },
});
