export type BreathIntensityId = 'low' | 'medium' | 'high';
export type MeditationTimeId = 'quick' | 'medium' | 'longer';

export type BreathRecommendation = {
  exerciseId: string;
  confidence: number;
  phaseNote?: string;
  transitionToId?: string;
};

export const breathIntensities: { id: BreathIntensityId; label: string; description: string }[] = [
  { id: 'low', label: 'Low', description: 'Present but manageable.' },
  { id: 'medium', label: 'Medium', description: 'Noticeably affecting you.' },
  { id: 'high', label: 'High', description: 'Strongly felt in body and mind.' },
];

export const meditationTimes: { id: MeditationTimeId; label: string; description: string }[] = [
  { id: 'quick', label: 'Quick', description: '1–2 min' },
  { id: 'medium', label: 'A few minutes', description: '3–5 min' },
  { id: 'longer', label: 'Longer', description: '5+ min' },
];

const breathRecommendationMatrix: Record<string, Record<BreathIntensityId, BreathRecommendation[]>> = {
  wired: {
    low: [
      { exerciseId: 'coherent', confidence: 87 },
      { exerciseId: 'diaphragmatic', confidence: 80 },
      { exerciseId: 'pursed', confidence: 67 },
    ],
    medium: [
      { exerciseId: 'box', confidence: 87 },
      { exerciseId: 'humming', confidence: 80 },
      { exerciseId: 'coherent', confidence: 73 },
    ],
    high: [
      { exerciseId: 'sigh', confidence: 93, phaseNote: '2–3 reps, then continue with Coherent Breathing', transitionToId: 'coherent' },
      { exerciseId: 'box', confidence: 73 },
    ],
  },
  foggy: {
    low: [
      { exerciseId: 'diaphragmatic', confidence: 80 },
      { exerciseId: 'pursed', confidence: 73 },
      { exerciseId: 'coherent', confidence: 67 },
    ],
    medium: [
      { exerciseId: 'box', confidence: 87 },
      { exerciseId: 'diaphragmatic', confidence: 73 },
      { exerciseId: 'alternate', confidence: 67 },
    ],
    high: [
      { exerciseId: 'box', confidence: 80 },
      { exerciseId: 'sigh', confidence: 73, phaseNote: '2–3 reps, then continue' },
      { exerciseId: 'alternate', confidence: 67 },
    ],
  },
  scattered: {
    low: [
      { exerciseId: 'alternate', confidence: 93 },
      { exerciseId: 'coherent', confidence: 80 },
      { exerciseId: 'diaphragmatic', confidence: 67 },
    ],
    medium: [
      { exerciseId: 'alternate', confidence: 87 },
      { exerciseId: 'box', confidence: 80 },
      { exerciseId: 'humming', confidence: 73 },
    ],
    high: [
      { exerciseId: 'box', confidence: 87 },
      { exerciseId: 'alternate', confidence: 73 },
      { exerciseId: 'sigh', confidence: 67, phaseNote: '2–3 reps, then continue' },
    ],
  },
  performance: {
    low: [
      { exerciseId: 'box', confidence: 93 },
      { exerciseId: 'coherent', confidence: 80 },
      { exerciseId: 'diaphragmatic', confidence: 73 },
    ],
    medium: [
      { exerciseId: 'box', confidence: 93 },
      { exerciseId: 'sigh', confidence: 80, phaseNote: '2–3 reps, then continue' },
      { exerciseId: 'alternate', confidence: 73 },
    ],
    high: [
      { exerciseId: 'sigh', confidence: 93, phaseNote: '2–3 reps, then continue' },
      { exerciseId: 'box', confidence: 87 },
    ],
  },
  conflict: {
    low: [
      { exerciseId: 'humming', confidence: 93 },
      { exerciseId: 'coherent', confidence: 87 },
      { exerciseId: 'diaphragmatic', confidence: 73 },
    ],
    medium: [
      { exerciseId: 'humming', confidence: 93 },
      { exerciseId: '478', confidence: 80 },
      { exerciseId: 'coherent', confidence: 73 },
    ],
    high: [
      { exerciseId: 'sigh', confidence: 93, phaseNote: '2–3 reps, then continue' },
      { exerciseId: 'humming', confidence: 80 },
      { exerciseId: '478', confidence: 67 },
    ],
  },
  sleep: {
    low: [
      { exerciseId: '478', confidence: 100 },
      { exerciseId: 'coherent', confidence: 87 },
      { exerciseId: 'diaphragmatic', confidence: 80 },
    ],
    medium: [
      { exerciseId: '478', confidence: 100 },
      { exerciseId: 'humming', confidence: 87 },
      { exerciseId: 'coherent', confidence: 80 },
    ],
    high: [
      { exerciseId: '478', confidence: 93 },
      { exerciseId: 'sigh', confidence: 87, phaseNote: '2–3 reps first, then move into 4-7-8', transitionToId: '478' },
      { exerciseId: 'humming', confidence: 73 },
    ],
  },
  morning: {
    low: [
      { exerciseId: 'diaphragmatic', confidence: 87 },
      { exerciseId: 'coherent', confidence: 80 },
      { exerciseId: 'pursed', confidence: 67 },
    ],
    medium: [
      { exerciseId: 'box', confidence: 87 },
      { exerciseId: 'alternate', confidence: 80 },
      { exerciseId: 'diaphragmatic', confidence: 73 },
    ],
    high: [
      { exerciseId: 'box', confidence: 87 },
      { exerciseId: 'sigh', confidence: 80, phaseNote: '2–3 reps, then continue' },
      { exerciseId: 'alternate', confidence: 73 },
    ],
  },
};

const meditationRecommendationMatrix: Record<string, Record<MeditationTimeId, string[]>> = {
  calm: {
    quick: ['body-scan', 'self-compassion', 'noting'],
    medium: ['micro-pmr', 'body-scan', 'self-compassion'],
    longer: ['loving-kindness', 'micro-pmr', 'body-scan'],
  },
  focus: {
    quick: ['soft-focus', 'five-senses', 'noting'],
    medium: ['noting', 'soft-focus', 'five-senses'],
    longer: ['soft-focus', 'noting', 'five-senses'],
  },
  emotion: {
    quick: ['name-feeling', 'self-compassion', 'noting'],
    medium: ['self-compassion', 'loving-kindness', 'name-feeling'],
    longer: ['loving-kindness', 'self-compassion', 'name-feeling'],
  },
  ground: {
    quick: ['five-senses', 'body-scan', 'name-feeling'],
    medium: ['body-scan', 'five-senses', 'micro-pmr'],
    longer: ['loving-kindness', 'body-scan', 'five-senses'],
  },
};

const CONFIDENCE_THRESHOLD = 65;

export function getBreathRecommendations(situationId: string, intensityId: BreathIntensityId) {
  return (breathRecommendationMatrix[situationId]?.[intensityId] ?? [])
    .filter((recommendation) => recommendation.confidence >= CONFIDENCE_THRESHOLD);
}

export function getMeditationRecommendationIds(situationId: string, timeId: MeditationTimeId) {
  return meditationRecommendationMatrix[situationId]?.[timeId] ?? [];
}
