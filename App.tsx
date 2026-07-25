import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  FlatList,
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
import ExerciseCardVisual from './src/components/ExerciseCardVisual';
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

type ThemeMode = 'light' | 'dark' | 'minimal';
type Tab = 'breathe' | 'meditate' | 'recommend' | 'profile';
type Detail = { kind: 'exercise'; item: Exercise } | { kind: 'meditation'; item: Meditation } | null;

const palettes = {
  light: {
    bg: '#F7F7F5',
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

export default function App() {
  const [tab, setTab] = useState<Tab>('breathe');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [detail, setDetail] = useState<Detail>(null);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [activeMeditation, setActiveMeditation] = useState<Meditation | null>(null);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [mindfulMinutes, setMindfulMinutes] = useState(0);
  const palette = palettes[themeMode];

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
        onBack={() => setDetail(null)}
        onBegin={() => {
          if (detail.kind === 'exercise') setActiveExercise(detail.item);
          else setActiveMeditation(detail.item);
          setDetail(null);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg }]} edges={['top', 'left', 'right']}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Header palette={palette} themeMode={themeMode} setThemeMode={setThemeMode} />

      <View style={styles.content}>
        {tab === 'breathe' && (
          <Library
            title="Choose your path"
            items={exercises}
            palette={palette}
            accent="breath"
            onPress={(item) => setDetail({ kind: 'exercise', item })}
          />
        )}
        {tab === 'meditate' && (
          <Library
            title="Meditate"
            items={meditations}
            palette={palette}
            accent="meditation"
            onPress={(item) => setDetail({ kind: 'meditation', item })}
          />
        )}
        {tab === 'recommend' && (
          <RecommendScreen
            palette={palette}
            onExercise={(item) => setDetail({ kind: 'exercise', item })}
            onMeditation={(item) => setDetail({ kind: 'meditation', item })}
          />
        )}
        {tab === 'profile' && (
          <Profile
            palette={palette}
            completedSessions={completedSessions}
            mindfulMinutes={mindfulMinutes}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
          />
        )}
      </View>

      <TabBar tab={tab} setTab={setTab} palette={palette} />
    </SafeAreaView>
  );
}

function Header({
  palette,
  themeMode,
  setThemeMode,
}: {
  palette: Palette;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}) {
  const next: Record<ThemeMode, ThemeMode> = { light: 'dark', dark: 'minimal', minimal: 'light' };
  return (
    <View style={[styles.header, { borderBottomColor: palette.border }]}>
      <Text style={[styles.wordmark, { color: palette.text }]}>
        Hush<Text style={{ color: themeMode === 'dark' ? '#A89BFF' : '#4A7C68' }}>.</Text>
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Theme: ${themeMode}. Change theme`}
        onPress={() => setThemeMode(next[themeMode])}
        style={[styles.themeButton, { borderColor: palette.border }]}
      >
        <Text style={{ color: palette.text }}>{themeMode === 'light' ? '◐' : themeMode === 'dark' ? '○' : '●'}</Text>
      </Pressable>
    </View>
  );
}

function Library<T extends Exercise | Meditation>({
  title,
  items,
  palette,
  accent,
  onPress,
}: {
  title: string;
  items: T[];
  palette: Palette;
  accent: 'breath' | 'meditation';
  onPress: (item: T) => void;
}) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.libraryHeading}>
          <Text style={[styles.eyebrow, { color: accent === 'breath' ? palette.accent : palette.meditation }]}>
            {accent === 'breath' ? 'BREATHE' : 'YOUR PRACTICE'}
          </Text>
          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <PracticeCard
          item={item}
          index={index}
          palette={palette}
          accent={accent}
          onPress={() => onPress(item)}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      showsVerticalScrollIndicator={false}
    />
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
}: {
  item: Exercise | Meditation;
  index: number;
  palette: Palette;
  accent: 'breath' | 'meditation';
  onPress: () => void;
  confidence?: number;
  recommendationNote?: string;
}) {
  const color = accent === 'breath' ? palette.accent : palette.meditation;
  const tint = accent === 'breath' ? palette.tint : palette.meditationTint;
  const description = exerciseDetails[item.id]?.summary ?? item.description;
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
        <View style={styles.cardCategoryRow}>
          <Text style={[styles.cardCategory, { color }]}>{item.bestFor.toUpperCase()}</Text>
          {confidence !== undefined && (
            <Text style={[styles.confidence, { color, backgroundColor: tint }]}>{confidence}% MATCH</Text>
          )}
        </View>
        <Text style={[styles.cardTitle, { color: palette.text }]}>{item.name}</Text>
        <Text style={[styles.cardDescription, { color: palette.muted }]} numberOfLines={3}>{description}</Text>
        {recommendationNote && (
          <Text style={[styles.recommendationNote, { color }]}>{recommendationNote}</Text>
        )}
        <View style={styles.cardFooter}>
          <Text style={[styles.meta, { color: palette.muted }]}>{item.duration}  ·  Effort {'●'.repeat(item.effort)}{'○'.repeat(3 - item.effort)}</Text>
          <Text style={[styles.arrow, { color }]}>→</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ExerciseInfoScreen({
  detail,
  palette,
  onBack,
  onBegin,
}: {
  detail: NonNullable<Detail>;
  palette: Palette;
  onBack: () => void;
  onBegin: () => void;
}) {
  const item = detail.item;
  const isExercise = detail.kind === 'exercise';
  const exerciseConfig = isExercise ? exerciseDetails[item.id] : undefined;
  const accent = isExercise ? palette.accent : palette.meditation;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg }]}>
      <StatusBar style={palette === palettes.dark ? 'light' : 'dark'} />
      <View style={[styles.detailHeader, { borderBottomColor: palette.border }]}>
        <Pressable onPress={onBack} hitSlop={12}><Text style={[styles.back, { color: palette.text }]}>‹ Back</Text></Pressable>
        {isExercise ? (
          <Text accessibilityLabel="Hush" style={[styles.detailWordmark, { color: palette.text }]}>
            Hush<Text style={{ color: '#4A7C68' }}>.</Text>
          </Text>
        ) : (
          <Text style={[styles.detailHeaderLabel, { color: palette.muted }]}>MEDITATION</Text>
        )}
        <View style={{ width: 52 }} />
      </View>
      <ScrollView contentContainerStyle={styles.detailContent}>
        <Text style={[styles.eyebrow, { color: accent }]}>{item.bestFor.toUpperCase()}</Text>
        <Text style={[styles.detailTitle, { color: palette.text }]}>{item.name}</Text>
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
              <ExerciseRhythm config={exerciseConfig} palette={palette} />
              <ExerciseGuide sections={exerciseConfig.guide} palette={palette} />
            </>
          ) : null
        ) : (
          <InfoSection title="The practice" palette={palette}>
            {(item as Meditation).steps.map((step, index) => <InfoRow key={step} number={index + 1} text={step} palette={palette} />)}
          </InfoSection>
        )}
      </ScrollView>
      <View style={[styles.beginDock, { backgroundColor: palette.bg, borderTopColor: palette.border }]}>
        <Pressable onPress={onBegin} style={[styles.primaryButton, { backgroundColor: accent }]}>
          <Text style={[styles.primaryButtonText, { color: palette.bg }]}>Begin practice</Text>
        </Pressable>
      </View>
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
      const control = (x + x2) / 2;
      commands.push(`C${control},${y1} ${control},${y2} ${x2},${y2}`);
    }
    x = x2;
  });
  const stroke = commands.join(' ');
  return { stroke, fill: `${stroke} L1000,56 L0,56 Z`, total };
}

function ExerciseRhythm({ config, palette }: { config: ExerciseDetailConfig; palette: Palette }) {
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const isDark = palette === palettes.dark;
  const graphStroke = isDark ? 'rgba(240,240,240,0.55)' : '#4A7C68';
  const graphFill = isDark ? 'rgba(240,240,240,0.08)' : 'rgba(74,124,104,0.10)';
  const guideLine = isDark ? 'rgba(240,240,240,0.40)' : 'rgba(74,124,104,0.42)';
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
      <Text style={[styles.infoTitle, { color: palette.text }]}>Rhythm</Text>
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
          {previewExpanded ? 'Hide preview' : 'Show preview'}
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
  const ghost = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.30)';
  const active = isDark ? 'rgba(255,255,255,0.72)' : palette.accent;
  const leader = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)';
  const softFill = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(49,95,77,0.08)';
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
    return (
      <Svg width="100%" height={259} viewBox="-10 10 360 286">
        <Path d="M174,67.5 L87.5,242.5 L174,242.5 Z" fill={softFill} stroke={active} strokeWidth={1.75} />
        <Path d="M176,67.5 L176,242.5 L262.5,242.5 Z" fill={softFill} stroke={ghost} strokeWidth={1.75} />
        <Circle cx={130.75} cy={155} r={2.5} fill={palette.text} />
        <Line x1={130.75} y1={155} x2={55} y2={155} stroke={leader} />
        {metric('triangle-inhale', 50, 155, 'end', config.phases[0])}
        <Circle cx={219.25} cy={155} r={2.5} fill={palette.text} />
        <Line x1={219.25} y1={155} x2={295} y2={155} stroke={leader} />
        {metric('triangle-exhale', 300, 155, 'start', config.phases[1])}
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
          <Circle cx={cx} cy={cy} r={55} fill={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(49,95,77,0.04)'} />
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

function ExerciseGuide({ sections, palette }: { sections: ExerciseGuideSection[]; palette: Palette }) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  return (
    <View style={styles.infoSection}>
      <Text style={[styles.infoTitle, { color: palette.text }]}>Guide</Text>
      <View style={[styles.guideBox, { borderColor: palette.border }]}>
        {sections.map((section, sectionIndex) => {
          const isOpen = openSection === section.id;
          return (
            <View key={section.id} style={sectionIndex < sections.length - 1 && { borderBottomColor: palette.border, borderBottomWidth: StyleSheet.hairlineWidth }}>
              <Pressable
                onPress={() => setOpenSection(isOpen ? null : section.id)}
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

function InfoSection({ title, palette, children }: { title: string; palette: Palette; children: React.ReactNode }) {
  return (
    <View style={styles.infoSection}>
      <Text style={[styles.infoTitle, { color: palette.text }]}>{title}</Text>
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
  if (exercise.id === 'box') {
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
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(exercise.phases[0].seconds);
  const [cycle, setCycle] = useState(1);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const scale = useRef(new Animated.Value(0.72)).current;
  const phase = exercise.phases[phaseIndex];

  useEffect(() => {
    Animated.timing(scale, {
      toValue: phase.label.toLowerCase().includes('inhale') || phase.label.includes('expands') ? 1.08 : 0.72,
      duration: phase.seconds * 1000,
      useNativeDriver: true,
    }).start();
  }, [phase, scale]);

  useEffect(() => {
    if (paused || complete) return;
    const timer = setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 1) return current - 1;
        if (phaseIndex < exercise.phases.length - 1) {
          const nextIndex = phaseIndex + 1;
          setPhaseIndex(nextIndex);
          return exercise.phases[nextIndex].seconds;
        }
        if (cycle < exercise.cycles) {
          setCycle((value) => value + 1);
          setPhaseIndex(0);
          return exercise.phases[0].seconds;
        }
        clearInterval(timer);
        setComplete(true);
        onComplete();
        return 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [paused, complete, phaseIndex, cycle, exercise, onComplete]);

  const restart = () => {
    setPhaseIndex(0);
    setSecondsLeft(exercise.phases[0].seconds);
    setCycle(1);
    setComplete(false);
    setPaused(false);
    scale.setValue(0.72);
  };

  return (
    <SafeAreaView style={[styles.session, { backgroundColor: palette.bg }]}>
      <StatusBar style={palette === palettes.dark ? 'light' : 'dark'} />
      <View style={styles.sessionHeader}>
        <Pressable onPress={onClose} hitSlop={12}><Text style={[styles.close, { color: palette.text }]}>×</Text></Pressable>
        <Text style={[styles.sessionName, { color: palette.text }]}>{exercise.name}</Text>
        <Text style={[styles.sessionCycle, { color: palette.muted }]}>{cycle}/{exercise.cycles}</Text>
      </View>
      <View style={styles.sessionCenter}>
        <Animated.View style={[styles.breathOrbOuter, { backgroundColor: palette.tint, transform: [{ scale }] }]}>
          <View style={[styles.breathOrb, { backgroundColor: palette.accent }]}>
            <Text style={[styles.phaseText, { color: palette.bg }]}>{complete ? 'Complete' : phase.label}</Text>
            <Text style={[styles.timerText, { color: palette.bg }]}>{complete ? '✓' : secondsLeft}</Text>
          </View>
        </Animated.View>
        <Text style={[styles.sessionHint, { color: palette.muted }]}>
          {complete ? 'Take a moment to notice how you feel.' : 'Follow the shape. Keep the breath easy and comfortable.'}
        </Text>
      </View>
      <View style={styles.sessionControls}>
        {complete ? (
          <>
            <Pressable onPress={restart} style={[styles.secondaryButton, { borderColor: palette.border }]}>
              <Text style={{ color: palette.text }}>Practise again</Text>
            </Pressable>
            <Pressable onPress={onClose} style={[styles.primaryButton, { backgroundColor: palette.accent }]}>
              <Text style={[styles.primaryButtonText, { color: palette.bg }]}>Done</Text>
            </Pressable>
          </>
        ) : (
          <Pressable onPress={() => setPaused((value) => !value)} style={[styles.primaryButton, { backgroundColor: palette.accent }]}>
            <Text style={[styles.primaryButtonText, { color: palette.bg }]}>{paused ? 'Resume' : 'Pause'}</Text>
          </Pressable>
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
}: {
  palette: Palette;
  onExercise: (item: Exercise) => void;
  onMeditation: (item: Meditation) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const [mode, setMode] = useState<'breathe' | 'meditate'>('breathe');
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
    <ScrollView ref={scrollRef} contentContainerStyle={styles.recommendContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.eyebrow, { color: palette.accent }]}>FIND THE RIGHT TECHNIQUE</Text>
      <Text style={[styles.title, { color: palette.text }]}>What do you need?</Text>
      <View style={[styles.segment, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        {(['breathe', 'meditate'] as const).map((item) => (
          <Pressable
            key={item}
            onPress={() => {
              setMode(item);
              setSelectedSituation(null);
              setSelectedLevel(null);
              scrollToTop();
            }}
            style={[styles.segmentItem, mode === item && { backgroundColor: item === 'breathe' ? palette.tint : palette.meditationTint }]}
          >
            <Text style={{ color: palette.text, fontWeight: mode === item ? '700' : '400' }}>{item === 'breathe' ? 'Breathe' : 'Meditate'}</Text>
          </Pressable>
        ))}
      </View>
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
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function Profile({
  palette,
  completedSessions,
  mindfulMinutes,
  themeMode,
  setThemeMode,
}: {
  palette: Palette;
  completedSessions: number;
  mindfulMinutes: number;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.profileContent}>
      <Text style={[styles.eyebrow, { color: palette.accent }]}>YOUR SPACE</Text>
      <Text style={[styles.title, { color: palette.text }]}>Profile</Text>
      <View style={styles.metrics}>
        <View style={[styles.metric, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.metricValue, { color: palette.text }]}>{completedSessions}</Text>
          <Text style={[styles.metricLabel, { color: palette.muted }]}>Sessions</Text>
        </View>
        <View style={[styles.metric, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.metricValue, { color: palette.text }]}>{mindfulMinutes}</Text>
          <Text style={[styles.metricLabel, { color: palette.muted }]}>Mindful min</Text>
        </View>
      </View>
      <Text style={[styles.question, { color: palette.text }]}>Appearance</Text>
      {(['light', 'dark', 'minimal'] as ThemeMode[]).map((mode) => (
        <Pressable
          key={mode}
          onPress={() => setThemeMode(mode)}
          style={[styles.settingRow, { backgroundColor: palette.surface, borderColor: palette.border }]}
        >
          <Text style={[styles.settingText, { color: palette.text }]}>{mode[0].toUpperCase() + mode.slice(1)}</Text>
          <Text style={{ color: palette.accent }}>{themeMode === mode ? '●' : '○'}</Text>
        </Pressable>
      ))}
      <View style={[styles.aboutBox, { backgroundColor: palette.tint }]}>
        <Text style={[styles.infoTitle, { color: palette.text }]}>About Hush</Text>
        <Text style={[styles.aboutText, { color: palette.muted }]}>
          Hush makes evidence-informed breathing and mindfulness practices simple enough to use in the moments you actually need them.
        </Text>
        <Text style={[styles.disclaimer, { color: palette.muted }]}>
          This app supports wellbeing and is not medical care. Stop any practice that causes discomfort and seek professional help when needed.
        </Text>
      </View>
    </ScrollView>
  );
}

function TabBar({ tab, setTab, palette }: { tab: Tab; setTab: (tab: Tab) => void; palette: Palette }) {
  const insets = useSafeAreaInsets();
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'breathe', label: 'Breathe', icon: '' },
    { id: 'meditate', label: 'Meditate', icon: '' },
    { id: 'recommend', label: 'Guide Me', icon: '' },
    { id: 'profile', label: 'Profile', icon: '' },
  ];
  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
      ]}
    >
      <View style={styles.tabItems} accessibilityRole="tablist">
        {tabs.map((item) => {
          const selected = tab === item.id;
          const color = selected ? palette.accent : palette.muted;
          return (
            <Pressable key={item.id} onPress={() => setTab(item.id)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected }}>
              {item.id === 'breathe' ? (
                <WindIcon color={color} />
              ) : item.id === 'meditate' ? (
                <FocusIcon color={color} />
              ) : item.id === 'recommend' ? (
                <SmartAssistIcon color={color} />
              ) : item.id === 'profile' ? (
                <UserIcon color={color} />
              ) : (
                <Text style={[styles.tabIcon, { color }]}>{item.icon}</Text>
              )}
              <Text style={[styles.tabLabel, { color: selected ? palette.text : palette.muted, fontWeight: selected ? '700' : '400' }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ height: insets.bottom }} />
    </View>
  );
}

function WindIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Path d="M12.8 19.6A2 2 0 1 0 14 16H2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17.5 8.6A2 2 0 1 1 19 12H2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9.8 4.4A2 2 0 1 1 11 8H2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function FocusIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8} />
      <Path d="M3 7V5a2 2 0 0 1 2-2h2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 3h2a2 2 0 0 1 2 2v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 17v2a2 2 0 0 1-2 2h-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 21H5a2 2 0 0 1-2-2v-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function UserIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Circle cx={12} cy={8} r={5} stroke={color} strokeWidth={1.8} />
      <Path d="M20 21a8 8 0 0 0-16 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SmartAssistIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" accessible={false}>
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
    height: 70, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wordmark: { fontSize: 28, fontWeight: '500', letterSpacing: -0.56 },
  themeButton: {
    width: 38, height: 38, borderWidth: 1, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
  },
  listContent: { paddingHorizontal: 18, paddingBottom: 36 },
  libraryHeading: { paddingTop: 30, paddingBottom: 24 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, marginBottom: 8 },
  title: { fontSize: 38, fontWeight: '500', letterSpacing: -1.2 },
  card: { minHeight: 196, borderWidth: 1, borderRadius: 18, padding: 16, flexDirection: 'row', gap: 14 },
  cardMark: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  cardMarkText: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  cardBody: { flex: 1 },
  cardCategoryRow: { minHeight: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  cardCategory: { flex: 1, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  confidence: { overflow: 'hidden', borderRadius: 10, paddingVertical: 3, paddingHorizontal: 7, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  cardTitle: { fontSize: 22, fontWeight: '600', lineHeight: 27 },
  cardDescription: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  recommendationNote: { fontSize: 12, lineHeight: 17, fontWeight: '500', marginTop: 8 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  meta: { fontSize: 11 },
  arrow: { fontSize: 20 },
  detailHeader: {
    height: 58, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: { fontSize: 16 },
  detailHeaderLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  detailWordmark: { fontSize: 22, fontWeight: '500', letterSpacing: -0.44 },
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
  recommendContent: { padding: 20, paddingBottom: 42 },
  segment: { flexDirection: 'row', borderWidth: 1, borderRadius: 14, padding: 4, marginTop: 24 },
  segmentItem: { flex: 1, minHeight: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  question: { fontSize: 20, fontWeight: '600', marginTop: 30, marginBottom: 14 },
  recommenderCarousel: { flexDirection: 'row', alignItems: 'center' },
  recommenderChevron: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  recommenderCarouselPills: { flex: 1, alignItems: 'center' },
  recommenderChevronSpacer: { width: 44 },
  chips: { alignItems: 'center' },
  chipColumn: { alignItems: 'stretch', gap: 10 },
  chip: { borderWidth: 1, borderRadius: 22, paddingVertical: 12, paddingHorizontal: 16 },
  chipLabel: { textAlign: 'center', fontSize: 15, fontWeight: '600' },
  chipDescription: { textAlign: 'center', fontSize: 12, marginTop: 3 },
  results: { gap: 12 },
  profileContent: { padding: 20, paddingBottom: 42 },
  metrics: { flexDirection: 'row', gap: 12, marginTop: 26 },
  metric: { flex: 1, minHeight: 125, borderWidth: 1, borderRadius: 16, padding: 18, justifyContent: 'space-between' },
  metricValue: { fontSize: 40, fontWeight: '500' },
  metricLabel: { fontSize: 13 },
  settingRow: {
    minHeight: 58, borderWidth: 1, borderRadius: 14, marginBottom: 9, paddingHorizontal: 17,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  settingText: { fontSize: 16 },
  aboutBox: { padding: 20, borderRadius: 16, marginTop: 28 },
  aboutText: { fontSize: 15, lineHeight: 23 },
  disclaimer: { fontSize: 12, lineHeight: 18, marginTop: 18 },
  tabBar: { borderTopWidth: StyleSheet.hairlineWidth },
  tabItems: { height: 70, flexDirection: 'row', paddingVertical: 4 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 12 },
});
