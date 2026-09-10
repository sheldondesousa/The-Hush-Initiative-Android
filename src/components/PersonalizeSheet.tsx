import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import type { Exercise } from '../data';
import {
  ALTERNATE_NOSTRIL_OPTIONS,
  applyPersonalization,
  clampPersonalization,
  COHERENT_BREATH_OPTIONS,
  type AlternateNostrilMode,
  type CoherentBreathSeconds,
  type ExercisePersonalization,
  maxCycles,
} from '../personalization';

const PICTOGRAM_BACKGROUND = '#D0E4DE';

type SheetPalette = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  tint: string;
  border: string;
};

type Props = {
  visible: boolean;
  exercise: Exercise;
  value: ExercisePersonalization;
  defaultEnabled: boolean;
  palette: SheetPalette;
  onClose: () => void;
  onSave: (value: ExercisePersonalization, setAsDefault: boolean) => void;
};

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  if (!minutes) return `${seconds} sec`;
  return `${minutes} min${seconds ? ` ${seconds} sec` : ''}`;
}

export default function PersonalizeSheet({
  visible,
  exercise,
  value,
  defaultEnabled,
  palette,
  onClose,
  onSave,
}: Props) {
  const [draft, setDraft] = useState(value);
  const [setAsDefault, setSetAsDefault] = useState(defaultEnabled);

  useEffect(() => {
    if (!visible) return;
    setDraft(value);
    setSetAsDefault(defaultEnabled);
  }, [defaultEnabled, value, visible]);

  const safeDraft = useMemo(
    () => clampPersonalization(exercise, draft),
    [draft, exercise],
  );
  const configuredExercise = useMemo(
    () => applyPersonalization(exercise, safeDraft),
    [exercise, safeDraft],
  );
  const totalSeconds = configuredExercise.phases.reduce(
    (total, phase) => total + phase.seconds,
    0,
  ) * safeDraft.cycles;
  const maximumCycles = maxCycles(exercise, safeDraft);

  const updateDraft = (next: ExercisePersonalization) => {
    setDraft(clampPersonalization(exercise, next));
  };

  return (
    <BottomSheetModal
      visible={visible}
      surfaceColor={palette.surface}
      borderColor={palette.border}
      onClose={onClose}
      sheetStyle={styles.sheet}
    >
      {(dismiss) => (
        <>
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: palette.border }]} />
          </View>
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={[styles.eyebrow, { color: palette.accent }]}>PERSONALISE</Text>
              <Text style={[styles.title, { color: palette.text }]}>{exercise.name}</Text>
            </View>
            <Pressable
              onPress={() => dismiss()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close personalisation"
            >
              <Text style={[styles.close, { color: palette.text }]}>×</Text>
            </Pressable>
          </View>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <Text style={[styles.sessionText, { color: palette.muted }]}>
            Session: <Text style={[styles.sessionValue, { color: palette.text }]}>{formatDuration(totalSeconds)}</Text>
          </Text>

          {exercise.id === 'coherent' && (
            <View style={styles.optionGroup}>
              <Text style={[styles.optionLabel, { color: palette.muted }]}>BREATH DURATION</Text>
              <View style={styles.optionRow}>
                {COHERENT_BREATH_OPTIONS.map((seconds) => {
                  const selected = safeDraft.coherentBreathSeconds === seconds;
                  return (
                    <Pressable
                      key={seconds}
                      onPress={() => updateDraft({ ...safeDraft, coherentBreathSeconds: seconds as CoherentBreathSeconds })}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: selected ? palette.text : palette.bg,
                          borderColor: selected ? palette.text : palette.border,
                        },
                      ]}
                    >
                      <Text style={[styles.optionButtonText, { color: selected ? palette.bg : palette.text }]}>{seconds}s</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {exercise.id === 'alternate' && (
            <View style={styles.optionGroup}>
              <Text style={[styles.optionLabel, { color: palette.muted }]}>BREATHE DURATION</Text>
              <View style={styles.optionRow}>
                {ALTERNATE_NOSTRIL_OPTIONS.map((option) => {
                  const selected = safeDraft.alternateNostrilMode === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => updateDraft({ ...safeDraft, alternateNostrilMode: option.value as AlternateNostrilMode })}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      style={[
                        styles.optionButton,
                        styles.optionButtonWide,
                        {
                          backgroundColor: selected ? palette.text : palette.bg,
                          borderColor: selected ? palette.text : palette.border,
                        },
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        style={[styles.optionButtonText, { color: selected ? palette.bg : palette.text }]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.cyclesGroup}>
            <Text style={[styles.optionLabel, { color: palette.muted }]}>CYCLES</Text>
            <View style={styles.cyclesControlRow}>
              <Pressable
                onPress={() => updateDraft({ ...safeDraft, cycles: safeDraft.cycles - 1 })}
                disabled={safeDraft.cycles <= 3}
                accessibilityRole="button"
                accessibilityLabel="Decrease cycles"
                style={[
                  styles.stepButton,
                  {
                    backgroundColor: PICTOGRAM_BACKGROUND,
                    borderColor: palette.border,
                    opacity: safeDraft.cycles <= 3 ? 0.4 : 1,
                  },
                ]}
              >
                <Text style={[styles.stepButtonText, { color: palette.text }]}>−</Text>
              </Pressable>
              <View style={[styles.cycleDisplay, { backgroundColor: PICTOGRAM_BACKGROUND, borderColor: palette.border }]}>
                <Text style={[styles.cycleValue, { color: palette.text }]}>{safeDraft.cycles}</Text>
              </View>
              <Pressable
                onPress={() => updateDraft({ ...safeDraft, cycles: safeDraft.cycles + 1 })}
                disabled={safeDraft.cycles >= maximumCycles}
                accessibilityRole="button"
                accessibilityLabel="Increase cycles"
                style={[
                  styles.stepButton,
                  {
                    backgroundColor: PICTOGRAM_BACKGROUND,
                    borderColor: palette.border,
                    opacity: safeDraft.cycles >= maximumCycles ? 0.4 : 1,
                  },
                ]}
              >
                <Text style={[styles.stepButtonText, { color: palette.text }]}>+</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => setSetAsDefault((current) => !current)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: setAsDefault }}
            style={styles.checkboxRow}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: setAsDefault ? palette.accent : 'transparent',
                  borderColor: setAsDefault ? palette.accent : palette.border,
                },
              ]}
            >
              {setAsDefault && <Text style={[styles.checkmark, { color: palette.bg }]}>✓</Text>}
            </View>
            <View style={styles.checkboxCopy}>
              <Text style={[styles.checkboxLabel, { color: palette.text }]}>Set as Default</Text>
              <Text style={[styles.checkboxHint, { color: palette.muted }]}>Defaults to selected cycle on relogin.</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => dismiss(() => onSave(safeDraft, setAsDefault))}
            accessibilityRole="button"
            style={[styles.saveButton, { backgroundColor: palette.accent }]}
          >
            <Text style={[styles.saveButtonText, { color: palette.bg }]}>Save</Text>
          </Pressable>
        </>
      )}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: 22,
    paddingBottom: 28,
    maxHeight: '92%',
  },
  handleRow: { height: 24, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 42, height: 4, borderRadius: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerCopy: { flex: 1, paddingRight: 16 },
  eyebrow: { fontSize: 12, lineHeight: 18, fontWeight: '600', letterSpacing: 1.4 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '600', marginTop: 2 },
  close: { fontSize: 32, lineHeight: 34, fontWeight: '300' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 18 },
  sessionText: { fontSize: 16, lineHeight: 24 },
  sessionValue: { fontWeight: '600' },
  optionGroup: { marginTop: 22, gap: 10 },
  optionLabel: { fontSize: 12, lineHeight: 18, fontWeight: '600', letterSpacing: 1.2 },
  optionRow: { flexDirection: 'row', gap: 8 },
  optionButton: {
    flex: 1,
    minHeight: 38,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  optionButtonWide: { minWidth: 0 },
  optionButtonText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  cyclesGroup: { alignItems: 'center', marginTop: 24, gap: 16 },
  cyclesControlRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  cycleDisplay: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleValue: { fontSize: 34, lineHeight: 40, fontWeight: '500', fontVariant: ['tabular-nums'] },
  stepButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonText: { fontSize: 24, lineHeight: 28, fontWeight: '400' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 26, minHeight: 52 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { fontSize: 15, lineHeight: 18, fontWeight: '600' },
  checkboxCopy: { flex: 1, marginLeft: 12 },
  checkboxLabel: { fontSize: 16, lineHeight: 22, fontWeight: '500' },
  checkboxHint: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  saveButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  saveButtonText: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
});
