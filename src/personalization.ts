import type { Exercise, Phase } from './data';

export type CoherentBreathSeconds = 5 | 6 | 7;
export type AlternateNostrilMode = 0 | 1 | 2;

export type ExercisePersonalization = {
  cycles: number;
  coherentBreathSeconds?: CoherentBreathSeconds;
  alternateNostrilMode?: AlternateNostrilMode;
};

export type ExerciseDefaults = Record<string, ExercisePersonalization>;

export const COHERENT_BREATH_OPTIONS: CoherentBreathSeconds[] = [5, 6, 7];
export const ALTERNATE_NOSTRIL_OPTIONS: Array<{ label: string; value: AlternateNostrilMode }> = [
  { label: '4 · 4', value: 0 },
  { label: '4 · 8', value: 1 },
  { label: '4 · H · 4 · H', value: 2 },
];

export function basePersonalization(exercise: Exercise): ExercisePersonalization {
  return {
    cycles: exercise.cycles,
    ...(exercise.id === 'coherent' ? { coherentBreathSeconds: 5 as CoherentBreathSeconds } : {}),
    ...(exercise.id === 'alternate' ? { alternateNostrilMode: 0 as AlternateNostrilMode } : {}),
  };
}

function alternateNostrilPhases(mode: AlternateNostrilMode): Phase[] {
  if (mode === 1) {
    return [
      { label: 'Inhale left', seconds: 4 },
      { label: 'Exhale right', seconds: 8 },
      { label: 'Inhale right', seconds: 4 },
      { label: 'Exhale left', seconds: 8 },
    ];
  }
  if (mode === 2) {
    return [
      { label: 'Inhale left', seconds: 4 },
      { label: 'Hold', seconds: 4 },
      { label: 'Exhale right', seconds: 4 },
      { label: 'Hold', seconds: 4 },
      { label: 'Inhale right', seconds: 4 },
      { label: 'Hold', seconds: 4 },
      { label: 'Exhale left', seconds: 4 },
      { label: 'Hold', seconds: 4 },
    ];
  }
  return [
    { label: 'Inhale left', seconds: 4 },
    { label: 'Exhale right', seconds: 4 },
    { label: 'Inhale right', seconds: 4 },
    { label: 'Exhale left', seconds: 4 },
  ];
}

export function applyPersonalization(
  exercise: Exercise,
  personalization: ExercisePersonalization,
): Exercise {
  let phases = exercise.phases;
  if (exercise.id === 'coherent') {
    const seconds = personalization.coherentBreathSeconds ?? 5;
    phases = [
      { label: 'Inhale', seconds },
      { label: 'Exhale', seconds },
    ];
  } else if (exercise.id === 'alternate') {
    phases = alternateNostrilPhases(personalization.alternateNostrilMode ?? 0);
  }

  return {
    ...exercise,
    phases,
    cycles: personalization.cycles,
  };
}

export function cycleDuration(
  exercise: Exercise,
  personalization: ExercisePersonalization,
): number {
  return applyPersonalization(exercise, personalization).phases.reduce(
    (total, phase) => total + phase.seconds,
    0,
  );
}

export function maxCycles(
  exercise: Exercise,
  personalization: ExercisePersonalization,
): number {
  return Math.max(3, Math.floor(1200 / cycleDuration(exercise, personalization)));
}

export function clampPersonalization(
  exercise: Exercise,
  personalization: ExercisePersonalization,
): ExercisePersonalization {
  return {
    ...personalization,
    cycles: Math.max(3, Math.min(maxCycles(exercise, personalization), personalization.cycles)),
  };
}
