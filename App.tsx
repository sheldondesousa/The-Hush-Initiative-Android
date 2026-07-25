import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  breathSituations,
  Exercise,
  exercises,
  Meditation,
  meditationSituations,
  meditations,
} from './src/data';
import BoxBreathingSession from './src/components/BoxBreathingSession';
import BoxBreathingCardVisual from './src/components/BoxBreathingCardVisual';

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

  const completeSession = (minutes: number) => {
    setCompletedSessions((value) => value + 1);
    setMindfulMinutes((value) => value + minutes);
  };

  if (activeExercise) {
    if (activeExercise.id === 'box') {
      return (
        <BoxBreathingSession
          palette={palette}
          onClose={() => setActiveExercise(null)}
          onComplete={() => completeSession(1)}
          cycles={activeExercise.cycles}
        />
      );
    }
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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg }]}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Header palette={palette} themeMode={themeMode} setThemeMode={setThemeMode} />

      <View style={styles.content}>
        {tab === 'breathe' && (
          <Library
            title="Breathe"
            subtitle="Practical techniques for calm, focus, and better breath control."
            items={exercises}
            palette={palette}
            accent="breath"
            onPress={(item) => setDetail({ kind: 'exercise', item })}
          />
        )}
        {tab === 'meditate' && (
          <Library
            title="Meditate"
            subtitle="Short practices designed to meet you in the middle of a real day."
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

      <Modal visible={detail !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setDetail(null)}>
        {detail && (
          <DetailScreen
            detail={detail}
            palette={palette}
            onBack={() => setDetail(null)}
            onBegin={() => {
              if (detail.kind === 'exercise') setActiveExercise(detail.item);
              else setActiveMeditation(detail.item);
              setDetail(null);
            }}
          />
        )}
      </Modal>
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
      <View>
        <Text style={[styles.wordmark, { color: palette.text }]}>HUSH</Text>
        <Text style={[styles.wordmarkSub, { color: palette.muted }]}>THE HUSH INITIATIVE</Text>
      </View>
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
  subtitle,
  items,
  palette,
  accent,
  onPress,
}: {
  title: string;
  subtitle: string;
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
            YOUR PRACTICE
          </Text>
          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>{subtitle}</Text>
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
}: {
  item: Exercise | Meditation;
  index: number;
  palette: Palette;
  accent: 'breath' | 'meditation';
  onPress: () => void;
}) {
  const color = accent === 'breath' ? palette.accent : palette.meditation;
  const tint = accent === 'breath' ? palette.tint : palette.meditationTint;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.bestFor}, ${item.duration}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border, opacity: pressed ? 0.78 : 1 },
      ]}
    >
      {item.id === 'box' && accent === 'breath' ? (
        <BoxBreathingCardVisual
          color={palette.text}
          backgroundColor={tint}
        />
      ) : (
        <View style={[styles.cardMark, { backgroundColor: tint }]}>
          <Text style={[styles.cardMarkText, { color }]}>{String(index + 1).padStart(2, '0')}</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={[styles.cardCategory, { color }]}>{item.bestFor.toUpperCase()}</Text>
        <Text style={[styles.cardTitle, { color: palette.text }]}>{item.name}</Text>
        <Text style={[styles.cardDescription, { color: palette.muted }]} numberOfLines={3}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.meta, { color: palette.muted }]}>{item.duration}  ·  Effort {'●'.repeat(item.effort)}{'○'.repeat(3 - item.effort)}</Text>
          <Text style={[styles.arrow, { color }]}>→</Text>
        </View>
      </View>
    </Pressable>
  );
}

function DetailScreen({
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
  const accent = isExercise ? palette.accent : palette.meditation;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg }]}>
      <StatusBar style={palette === palettes.dark ? 'light' : 'dark'} />
      <View style={[styles.detailHeader, { borderBottomColor: palette.border }]}>
        <Pressable onPress={onBack} hitSlop={12}><Text style={[styles.back, { color: palette.text }]}>‹ Back</Text></Pressable>
        <Text style={[styles.detailHeaderLabel, { color: palette.muted }]}>{isExercise ? 'BREATHING' : 'MEDITATION'}</Text>
        <View style={{ width: 52 }} />
      </View>
      <ScrollView contentContainerStyle={styles.detailContent}>
        <Text style={[styles.eyebrow, { color: accent }]}>{item.bestFor.toUpperCase()}</Text>
        <Text style={[styles.detailTitle, { color: palette.text }]}>{item.name}</Text>
        <Text style={[styles.detailMeta, { color: palette.muted }]}>{item.duration}  ·  Effort {item.effort} of 3</Text>
        <Text style={[styles.detailDescription, { color: palette.text }]}>{item.description}</Text>

        {isExercise ? (
          <>
            <InfoSection title="Rhythm" palette={palette}>
              {(item as Exercise).phases.map((phase, index) => (
                <InfoRow key={`${phase.label}-${index}`} number={index + 1} text={`${phase.label} · ${phase.seconds} seconds`} palette={palette} />
              ))}
            </InfoSection>
            <InfoSection title="Tips" palette={palette}>
              {(item as Exercise).tips.map((tip, index) => <InfoRow key={tip} number={index + 1} text={tip} palette={palette} />)}
            </InfoSection>
            <InfoSection title="Safety first" palette={palette}>
              {(item as Exercise).precautions.map((tip, index) => <InfoRow key={tip} number={index + 1} text={tip} palette={palette} />)}
            </InfoSection>
          </>
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
  const [mode, setMode] = useState<'breathe' | 'meditate'>('breathe');
  const [selected, setSelected] = useState<string | null>(null);
  const situations = mode === 'breathe' ? breathSituations : meditationSituations;
  const recommendation = useMemo(() => {
    const situation = situations.find((item) => item.id === selected);
    if (!situation) return [];
    return situation.picks
      .map((id) => mode === 'breathe' ? exercises.find((item) => item.id === id) : meditations.find((item) => item.id === id))
      .filter(Boolean) as (Exercise | Meditation)[];
  }, [mode, selected, situations]);

  return (
    <ScrollView contentContainerStyle={styles.recommendContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.eyebrow, { color: palette.accent }]}>PERSONALISED PRACTICE</Text>
      <Text style={[styles.title, { color: palette.text }]}>What do you need?</Text>
      <Text style={[styles.subtitle, { color: palette.muted }]}>Choose what feels closest. We’ll suggest a short place to begin.</Text>
      <View style={[styles.segment, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        {(['breathe', 'meditate'] as const).map((item) => (
          <Pressable
            key={item}
            onPress={() => { setMode(item); setSelected(null); }}
            style={[styles.segmentItem, mode === item && { backgroundColor: item === 'breathe' ? palette.tint : palette.meditationTint }]}
          >
            <Text style={{ color: palette.text, fontWeight: mode === item ? '700' : '400' }}>{item === 'breathe' ? 'Breathe' : 'Meditate'}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.question, { color: palette.text }]}>How are you feeling right now?</Text>
      <View style={styles.chips}>
        {situations.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setSelected(item.id)}
            style={[
              styles.chip,
              { borderColor: selected === item.id ? palette.accent : palette.border, backgroundColor: selected === item.id ? palette.tint : palette.surface },
            ]}
          >
            <Text style={{ color: palette.text }}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      {recommendation.length > 0 && (
        <View style={styles.results}>
          <Text style={[styles.question, { color: palette.text }]}>A good place to begin</Text>
          {recommendation.map((item, index) => (
            <PracticeCard
              key={item.id}
              item={item}
              index={index}
              palette={palette}
              accent={mode === 'breathe' ? 'breath' : 'meditation'}
              onPress={() => mode === 'breathe' ? onExercise(item as Exercise) : onMeditation(item as Meditation)}
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
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'breathe', label: 'Breathe', icon: '◯' },
    { id: 'meditate', label: 'Meditate', icon: '◇' },
    { id: 'recommend', label: 'For you', icon: '✦' },
    { id: 'profile', label: 'Profile', icon: '·' },
  ];
  return (
    <View style={[styles.tabBar, { backgroundColor: palette.surface, borderTopColor: palette.border }]}>
      {tabs.map((item) => {
        const selected = tab === item.id;
        return (
          <Pressable key={item.id} onPress={() => setTab(item.id)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected }}>
            <Text style={[styles.tabIcon, { color: selected ? palette.accent : palette.muted }]}>{item.icon}</Text>
            <Text style={[styles.tabLabel, { color: selected ? palette.text : palette.muted, fontWeight: selected ? '700' : '400' }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1 },
  header: {
    height: 70, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wordmark: { fontSize: 20, fontWeight: '800', letterSpacing: 7 },
  wordmarkSub: { fontSize: 8, letterSpacing: 1.7, marginTop: 2 },
  themeButton: {
    width: 38, height: 38, borderWidth: 1, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
  },
  listContent: { paddingHorizontal: 18, paddingBottom: 36 },
  libraryHeading: { paddingTop: 30, paddingBottom: 24 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, marginBottom: 8 },
  title: { fontSize: 38, fontWeight: '500', letterSpacing: -1.2 },
  subtitle: { fontSize: 16, lineHeight: 24, marginTop: 10, maxWidth: 340 },
  card: { minHeight: 196, borderWidth: 1, borderRadius: 18, padding: 16, flexDirection: 'row', gap: 14 },
  cardMark: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  cardMarkText: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  cardBody: { flex: 1 },
  cardCategory: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  cardTitle: { fontSize: 22, fontWeight: '600', lineHeight: 27 },
  cardDescription: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  meta: { fontSize: 11 },
  arrow: { fontSize: 20 },
  detailHeader: {
    height: 58, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: { fontSize: 16 },
  detailHeaderLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  detailContent: { padding: 22, paddingBottom: 130 },
  detailTitle: { fontSize: 40, lineHeight: 46, fontWeight: '600', letterSpacing: -1.2 },
  detailMeta: { marginTop: 12, fontSize: 13 },
  detailDescription: { marginTop: 28, fontSize: 18, lineHeight: 29 },
  infoSection: { marginTop: 34 },
  infoTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  infoBox: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  infoRow: { minHeight: 60, padding: 14, flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, gap: 14 },
  infoNumber: { width: 24, fontSize: 11, letterSpacing: 1 },
  infoText: { flex: 1, fontSize: 15, lineHeight: 22 },
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { borderWidth: 1, borderRadius: 22, paddingVertical: 12, paddingHorizontal: 16 },
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
  tabBar: { minHeight: 70, flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingBottom: 4 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 10 },
});
