export type Phase = { label: string; seconds: number };

export type Exercise = {
  id: string;
  name: string;
  bestFor: string;
  duration: string;
  effort: number;
  description: string;
  phases: Phase[];
  cycles: number;
  tips: string[];
  precautions: string[];
};

export type Meditation = {
  id: string;
  name: string;
  bestFor: string;
  duration: string;
  effort: number;
  description: string;
  steps: string[];
};

export const exercises: Exercise[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    bestFor: 'Composure & focus',
    duration: '5 min',
    effort: 2,
    description: 'Box breathing is a simple, effective relaxation technique where you inhale for 4 counts, hold your breath for 4, exhale for 4, and hold your breath again for 4, creating a pattern to calm the nervous system, reduce stress, and improve focus for important moments.',
    phases: [
      { label: 'Inhale', seconds: 4 },
      { label: 'Hold', seconds: 4 },
      { label: 'Exhale', seconds: 4 },
      { label: 'Hold', seconds: 4 },
    ],
    cycles: 4,
    tips: ['Breathe into your belly, not only your chest.', 'Keep each side of the “box” gentle and even.'],
    precautions: ['Shorten the count if holding feels uncomfortable.', 'Return to normal breathing if you feel dizzy.'],
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    bestFor: 'Sleep & deep calm',
    duration: '4–5 min',
    effort: 3,
    description: 'A long exhale and gentle hold create a strong downshift for winding down.',
    phases: [
      { label: 'Inhale', seconds: 4 },
      { label: 'Hold', seconds: 7 },
      { label: 'Exhale', seconds: 8 },
    ],
    cycles: 4,
    tips: ['Let the exhale be quiet and unforced.', 'Start with fewer rounds while learning.'],
    precautions: ['Do not strain during the hold.', 'Practise seated or lying down at first.'],
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    bestFor: 'Balance & HRV',
    duration: '5–6 min',
    effort: 1,
    description: 'A smooth five-second inhale and exhale supports steady nervous-system regulation.',
    phases: [{ label: 'Inhale', seconds: 5 }, { label: 'Exhale', seconds: 5 }],
    cycles: 6,
    tips: ['Keep the breath continuous.', 'Soften your face and shoulders.'],
    precautions: ['Use a shorter rhythm if five seconds feels too slow.'],
  },
  {
    id: 'alternate',
    name: 'Alternate Nostril',
    bestFor: 'Scattered thoughts',
    duration: '5 min',
    effort: 3,
    description: 'Alternating sides combines slow breathing with a simple coordination anchor.',
    phases: [
      { label: 'Inhale left', seconds: 4 },
      { label: 'Exhale right', seconds: 4 },
      { label: 'Inhale right', seconds: 4 },
      { label: 'Exhale left', seconds: 4 },
    ],
    cycles: 4,
    tips: ['Use a light touch at the nostrils.', 'Keep the shoulders relaxed.'],
    precautions: ['Skip this technique if your nose is blocked or irritated.'],
  },
  {
    id: 'pursed',
    name: 'Pursed Lips Breathing',
    bestFor: 'Breath control',
    duration: '3–4 min',
    effort: 1,
    description: 'A longer, controlled exhale helps slow breathing and ease breathlessness.',
    phases: [{ label: 'Inhale through nose', seconds: 2 }, { label: 'Exhale through pursed lips', seconds: 4 }],
    cycles: 8,
    tips: ['Purse your lips as if cooling a hot drink.', 'Let the lungs empty without forcing.'],
    precautions: ['Persistent or severe breathlessness needs medical assessment.'],
  },
  {
    id: 'sigh',
    name: 'Physiological Sigh',
    bestFor: 'Acute stress',
    duration: '1–2 min',
    effort: 2,
    description: 'A double inhale followed by a long exhale is a fast, practical stress interrupt.',
    phases: [
      { label: 'Inhale', seconds: 2 },
      { label: 'Top-up inhale', seconds: 1 },
      { label: 'Long exhale', seconds: 6 },
    ],
    cycles: 3,
    tips: ['Make the second inhale smaller than the first.', 'Let the exhale be long and passive.'],
    precautions: ['Stop if the technique causes discomfort or light-headedness.'],
  },
  {
    id: 'diaphragmatic',
    name: 'Diaphragmatic Breathing',
    bestFor: 'Foundational calm',
    duration: '5–10 min',
    effort: 1,
    description: 'Slow belly breathing reduces accessory muscle tension and builds a calm baseline.',
    phases: [{ label: 'Belly expands', seconds: 4 }, { label: 'Belly softens', seconds: 6 }],
    cycles: 6,
    tips: ['Rest a hand below your ribs.', 'Keep the upper chest relatively quiet.'],
    precautions: ['Never force a deep breath; comfort matters more than volume.'],
  },
  {
    id: 'humming',
    name: 'Humming Bee',
    bestFor: 'Rumination & tension',
    duration: '4 min',
    effort: 2,
    description: 'A soft humming exhale adds soothing vibration to a slow breathing rhythm.',
    phases: [{ label: 'Inhale quietly', seconds: 4 }, { label: 'Hum on the exhale', seconds: 8 }],
    cycles: 5,
    tips: ['Keep the hum low, steady, and comfortable.', 'Notice vibration rather than volume.'],
    precautions: ['Skip ear-covering with ear pain or infection.', 'Never strain your voice.'],
  },
];

export const meditations: Meditation[] = [
  {
    id: 'soft-focus', name: 'Soft Focus Anchor', bestFor: 'Focus & grounding', effort: 1, duration: '1–2 min',
    description: 'Choose one steady anchor and return to it whenever the mind wanders.',
    steps: ['Settle your posture and soften your gaze.', 'Choose feet, hands, or a neutral sound as your anchor.', 'Notice wandering without judgment.', 'Return gently to the anchor.'],
  },
  {
    id: 'noting', name: 'Noting', bestFor: 'Awareness & clarity', effort: 2, duration: '2–3 min',
    description: 'Label present thoughts, feelings, and sensations simply to reduce reactivity.',
    steps: ['Close your eyes and settle.', 'Notice what is most prominent.', 'Use a short label such as “thinking”, “warmth”, or “worry”.', 'Let it pass and notice what comes next.'],
  },
  {
    id: 'body-scan', name: 'Mini Body Scan', bestFor: 'Stress relief', effort: 1, duration: '2–5 min',
    description: 'Move attention through the body, noticing sensations without trying to fix them.',
    steps: ['Begin at the face and jaw.', 'Move to shoulders, chest, and hands.', 'Notice the belly and hips.', 'Finish with legs and feet.'],
  },
  {
    id: 'micro-pmr', name: 'Micro PMR', bestFor: 'Tension release', effort: 2, duration: '2–4 min',
    description: 'Tense and release a few muscle groups to make relaxation easier to feel.',
    steps: ['Tense your hands for five seconds.', 'Release fully for ten seconds.', 'Repeat with shoulders, then face.', 'Notice the contrast after each release.'],
  },
  {
    id: 'name-feeling', name: 'Name the Feeling', bestFor: 'Emotional regulation', effort: 1, duration: '1–3 min',
    description: 'Name the emotion and where it appears in the body to create useful distance.',
    steps: ['Ask, “What is here right now?”', 'Name one or two emotions.', 'Say, “I’m noticing…” rather than “I am…”.', 'Locate the feeling in your body and take one slow breath.'],
  },
  {
    id: 'self-compassion', name: 'Self-Compassion Break', bestFor: 'Self-kindness', effort: 1, duration: '2–3 min',
    description: 'Acknowledge difficulty, remember you are not alone, and offer kindness inward.',
    steps: ['Acknowledge: “This is difficult.”', 'Normalise: “Struggle is part of being human.”', 'Place a hand on your chest if comfortable.', 'Offer a phrase of support you genuinely need.'],
  },
  {
    id: 'loving-kindness', name: 'Loving-Kindness', bestFor: 'Compassion & mood', effort: 2, duration: '3–5 min',
    description: 'Repeat simple phrases of goodwill toward yourself and others.',
    steps: ['Begin with yourself.', 'Repeat: “May I be safe. May I be well.”', 'Extend the phrases to someone you care about.', 'Widen the circle only if it feels natural.'],
  },
  {
    id: 'five-senses', name: 'Five Senses Grounding', bestFor: 'Anxiety relief', effort: 1, duration: '2–3 min',
    description: 'Use your senses to reconnect with the present environment.',
    steps: ['Name five things you can see.', 'Notice four things you can feel.', 'Find three sounds and two scents.', 'Notice one taste or take one steady breath.'],
  },
];

export const breathSituations = [
  { id: 'wired', label: 'Stressed' },
  { id: 'foggy', label: 'Drained' },
  { id: 'scattered', label: 'Distracted' },
  { id: 'performance', label: 'Pre-performance' },
  { id: 'conflict', label: 'Post-conflict' },
  { id: 'sleep', label: 'Sleep transition' },
];

export const meditationSituations = [
  { id: 'calm', label: 'Calm & relax' },
  { id: 'focus', label: 'Find focus' },
  { id: 'emotion', label: 'Process emotions' },
  { id: 'ground', label: 'Ground myself' },
];
