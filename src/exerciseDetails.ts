export type ExerciseGuideItem = { label?: string; text: string };
export type ExerciseGuideSection = { id: string; title: string; items: ExerciseGuideItem[] };
export type DetailPhase = {
  label: string;
  seconds: number;
  toLevel?: number;
  spike?: boolean;
};
export type PreviewKind = 'box' | 'arc' | 'wave' | 'sigh' | 'triangles' | 'lens' | 'diaphragm';

export type ExerciseDetailConfig = {
  summary: string;
  phases: DetailPhase[];
  flow: string;
  preview: PreviewKind;
  guide: ExerciseGuideSection[];
};

const sections = (
  tips: ExerciseGuideItem[],
  preparation: ExerciseGuideItem[],
  when: ExerciseGuideItem[],
  precautions: ExerciseGuideItem[],
): ExerciseGuideSection[] => [
  { id: 'tips', title: 'Tips', items: tips },
  { id: 'preparation', title: 'Preparation', items: preparation },
  { id: 'when', title: 'Try this when', items: when },
  { id: 'precautions', title: 'Precautions', items: precautions },
];

export const exerciseDetails: Record<string, ExerciseDetailConfig> = {
  box: {
    summary: 'Box breathing is a simple, effective relaxation technique where you inhale for 4 counts, hold your breath for 4, exhale for 4, and hold your breath again for 4, creating a pattern to calm the nervous system, reduce stress, and improve focus for important moments.',
    phases: [
      { label: 'INHALE', seconds: 4 },
      { label: 'HOLD', seconds: 4 },
      { label: 'EXHALE', seconds: 4 },
      { label: 'HOLD', seconds: 4 },
    ],
    flow: 'Clockwise',
    preview: 'box',
    guide: sections(
      [
        { label: 'Duration:', text: 'If 4 seconds feels too long, start with a 2 or 3-second count and gradually increase it as you become more comfortable.' },
        { label: 'Focus:', text: 'Use “diaphragmatic breathing.” Your stomach should rise as you inhale, rather than just your chest.' },
        { text: 'Start on empty.' },
        { text: 'Inhale slowly through your nose.' },
        { text: 'Exhale gently through your mouth or nose.' },
      ],
      [
        { label: 'Find a Quiet Space:', text: 'Choose a distraction-free environment to help you focus entirely on your breath.' },
        { label: 'Sit Upright:', text: 'Choose a comfortable chair where you can sit with your back supported and feet flat on the floor. This allows for better lung expansion.' },
        { label: 'Relax Your Muscles:', text: 'Before starting, consciously drop your shoulders and release tension in your jaw.' },
        { label: 'Begin on Empty:', text: 'To start correctly, first exhale all the air out of your lungs so you begin with a full, fresh inhale.' },
      ],
      [
        { label: 'Before Stressful Events:', text: 'Use it to steady nerves before major tasks like public speaking, exams, or interviews.' },
        { label: 'During a Mid-Day Reset:', text: 'Practice for 5 minutes during a work break or “afternoon slump” to regain focus and concentration.' },
        { label: 'Before Bedtime:', text: 'Perform a few cycles to quiet a racing mind and lower your heart rate for better sleep.' },
      ],
      [
        { label: 'Start Short:', text: 'Begin with 4 cycles at a time. Extending sessions too quickly can cause light-headedness from the sustained breath holds.' },
        { label: 'Respiratory Conditions:', text: 'If you have asthma, COPD, or a history of hyperventilation, consult a doctor before attempting any breath-hold technique.' },
        { label: 'Avoid While Driving:', text: 'Do not practice while driving or operating machinery — the held breath phases can briefly reduce alertness.' },
        { label: 'Listen to Your Body:', text: 'Stop immediately if you feel dizzy or short of breath; the correct pace is one that feels controlled, never forced.' },
      ],
    ),
  },
  '478': {
    summary: 'The 4-7-8 breathing technique, also known as the “Relaxing Breath,” is a rhythmic breathing pattern. Rooted in the ancient yogic practice of pranayama, it acts as a “natural tranquilizer” for the nervous system by activating the parasympathetic response.',
    phases: [
      { label: 'INHALE', seconds: 4 },
      { label: 'HOLD', seconds: 7 },
      { label: 'EXHALE', seconds: 8 },
    ],
    flow: 'Clockwise',
    preview: 'arc',
    guide: sections(
      [
        { label: 'Tongue Placement:', text: 'Keep the tip of your tongue against the ridge of tissue behind your upper front teeth throughout the entire exercise.' },
        { label: 'Consistency:', text: 'Practice at least twice a day to train your nervous system to respond more quickly over time.' },
        { label: 'Exhale Sound:', text: 'Create an audible “whoosh” sound by exhaling through your mouth around your tongue or through pursed lips.' },
        { label: 'Limit Cycles:', text: 'Start with only four breath cycles at a time during your first month of practice before gradually increasing to eight.' },
      ],
      [
        { label: 'Be Comfortable:', text: 'Sit with your back straight or lie down if you are using the technique to fall asleep.' },
        { label: 'Eliminate Distractions:', text: 'Choose a quiet, private space and consider closing your eyes to focus better.' },
        { label: 'Empty Your Lungs:', text: 'Begin by exhaling completely through your mouth to clear your lungs before starting the first inhale.' },
        { label: 'Relax Your Body:', text: 'Intentionally relax your shoulders, jaw, and brow to prevent tensing during the breath hold.' },
      ],
      [
        { label: 'Before Bed:', text: 'Use it as part of a nighttime routine to quiet a racing mind and fall asleep faster.' },
        { label: 'During Acute Stress:', text: 'Practice before reacting to upsetting situations or when feeling internal tension.' },
        { label: 'Anxiety Management:', text: 'Use it to ground yourself during anxiety episodes or panic attacks.' },
        { label: 'To Curb Cravings:', text: 'It can help manage impulsive emotional responses, such as food cravings or anger.' },
        { label: 'Daily Resets:', text: 'Incorporate it into your morning or mid-day routine to maintain a lower baseline stress level.' },
      ],
      [
        { label: 'Limit Cycles Initially:', text: 'Start with no more than 4 cycles per session for the first month — the 7-count hold is demanding and needs gradual adaptation.' },
        { label: 'Respiratory or Heart Conditions:', text: 'The extended breath hold elevates intra-thoracic pressure; consult a doctor if you have asthma, hypertension, or cardiovascular issues.' },
        { label: 'Not While Driving:', text: 'The 7-second hold can cause a temporary drop in alertness — only practice in a safe, stationary position.' },
        { label: 'Dizziness is a Stop Sign:', text: 'Light-headedness means the hold is too long or the pace too fast. Shorten the counts and return to normal breathing before trying again.' },
      ],
    ),
  },
  coherent: {
    summary: 'Coherent breathing is a slow, rhythmic breathing technique, typically inhaling for 5 seconds and exhaling for 5 seconds, designed to sync your heart rate with your breath for optimal nervous system balance, reducing stress and anxiety while promoting calm and focus.',
    phases: [{ label: 'INHALE', seconds: 5 }, { label: 'EXHALE', seconds: 5 }],
    flow: 'Rhythmic',
    preview: 'wave',
    guide: sections(
      [
        { label: 'Focus on the Transition:', text: 'Avoid holding your breath at the top or bottom; make the switch between inhaling and exhaling smooth and continuous.' },
        { label: 'Nasal Breathing:', text: 'Always breathe through your nose to better regulate airflow and filter the air entering your lungs.' },
        { label: 'Stay Relaxed:', text: 'Keep your jaw, shoulders, and face soft; tension in these areas can inhibit deep diaphragmatic movement.' },
        { label: 'Consistency Over Duration:', text: 'Practicing for five minutes every day is more effective for your nervous system than practicing for an hour once a week.' },
      ],
      [
        { label: 'Find a Quiet Space:', text: 'Choose a location where you won’t be interrupted for a few minutes.' },
        { label: 'Optimize Posture:', text: 'Sit upright in a chair with feet flat on the floor or lie flat on your back to allow the diaphragm to move freely.' },
        { label: 'Loosen Clothing:', text: 'Ensure your waistband or belt is not restrictive, as your abdomen needs to expand fully.' },
        { label: 'Hand Placement:', text: 'Place one hand on your belly and one on your chest to ensure only the belly hand moves significantly during the breath.' },
      ],
      [
        { label: 'Commuting:', text: 'It is an effective “eyes-open” meditation for use on public transit or while sitting in traffic to stay calm.' },
        { label: 'Post-Exercise:', text: 'Use it as part of a workout cool-down to shift the body from an active to a recovery state.' },
        { label: 'Morning Routine:', text: 'Start your day with 5 minutes of practice to set a baseline of emotional stability.' },
        { label: 'Before Sleep:', text: 'Practice while lying in bed to lower your heart rate and prepare the body for deep rest.' },
      ],
      [
        { label: 'No Breath Holding:', text: 'Unlike other techniques, coherent breathing should have no deliberate pauses — forced holds disrupt the heart-rate synchronisation the method relies on.' },
        { label: 'Nasal Breathing Only:', text: 'Mouth breathing bypasses the natural airflow regulation of the nasal passages, reducing the technique’s effectiveness and potentially over-ventilating.' },
        { label: 'Avoid Driving:', text: 'The slow, meditative rhythm can reduce reaction speed — always practise while seated still.' },
        { label: 'Respiratory Conditions:', text: 'Consult a doctor if you have asthma or COPD before adopting a fixed slow-breathing rhythm.' },
      ],
    ),
  },
  sigh: {
    summary: 'The physiological sigh is a science-backed breathing technique featuring a double inhale (1 long, 1 short) followed by a long, slow exhale. It is designed to rapidly offload carbon dioxide and trigger the parasympathetic nervous system for stress relief.\n\nSuggested: Total INHALE of 4 seconds (approx)',
    phases: [
      { label: 'INHALE', seconds: 3, toLevel: 0.5 },
      { label: 'MAX', seconds: 1, toLevel: 1, spike: true },
      { label: 'EXHALE', seconds: 8 },
    ],
    flow: 'Expand-Collapse',
    preview: 'sigh',
    guide: sections(
      [
        { label: 'The “Second Sip”:', text: 'Make the second inhale short and sharp to fully pop open the tiny air sacs (alveoli) in the lungs.' },
        { label: 'Slow Exhale:', text: 'Exhale through the mouth. Aim to make the exhale roughly twice as long as the combined inhales to maximize the calming effect.' },
        { label: 'Nose for Inhaling:', text: 'Use your nose for both inhales whenever possible to better regulate air intake.' },
        { label: 'Minimal Repetition:', text: 'You typically only need 1 to 3 cycles to feel a noticeable reduction in autonomic arousal.' },
        { label: 'Consistency:', text: 'While effective for immediate relief, practicing for 5 minutes daily can improve long-term mood and respiratory health.' },
      ],
      [
        { label: 'Find a Quiet Space:', text: 'Choose a distraction-free environment to help you focus entirely on your breath.' },
        { label: 'Sit Upright:', text: 'Choose a comfortable chair where you can sit with your back supported and feet flat on the floor. This allows for better lung expansion.' },
        { label: 'Relax Your Muscles:', text: 'Before starting, consciously drop your shoulders and release tension in your jaw.' },
        { label: 'Begin on Empty:', text: 'To start correctly, first exhale all the air out of your lungs so you begin with a full, fresh inhale.' },
      ],
      [
        { label: 'Feeling Stress:', text: 'Use 1-3 cycles when you feel acute stress or tension building to rapidly calm your nervous system.' },
        { label: 'Before Performance:', text: 'Practice right before important presentations, meetings, or high-pressure situations to reduce performance anxiety.' },
        { label: 'Before Sleep:', text: 'Perform a few cycles if your mind is racing at bedtime to help transition into a restful state.' },
        { label: 'Emotional Reset:', text: 'Use it when feeling overwhelmed or emotionally activated to quickly regain composure and clarity.' },
        { label: 'Focus Recovery:', text: 'Practice during work breaks when feeling mentally scattered to restore attention and concentration.' },
      ],
      [
        { label: 'Limit Cycles:', text: 'Avoid excessive repetition (hyperventilation) by sticking to the recommended 1–3 cycles for immediate relief.' },
        { label: 'Consult Professionals:', text: 'If you have respiratory conditions or cardiovascular issues or a history of hyperventilation, consult a doctor before trying.' },
        { label: 'Avoid Focus Tasks:', text: 'Do not practice this while driving or performing any task that requires your full, alert attention.' },
        { label: 'Listen to Your Body:', text: 'Stop immediately if you feel short of breath or distressed; your comfort dictates the correct pace.' },
      ],
    ),
  },
  alternate: {
    summary: 'Alternate nostril breathing is an ancient yogic practice that involves breathing through one nostril at a time while blocking the other. This technique balances the left and right hemispheres of the brain, calms the nervous system, and enhances mental clarity and focus.',
    phases: [
      { label: 'INHALE', seconds: 4 },
      { label: 'EXHALE', seconds: 4 },
      { label: 'INHALE', seconds: 4 },
      { label: 'EXHALE', seconds: 4 },
    ],
    flow: 'Alternating',
    preview: 'triangles',
    guide: sections(
      [
        { label: 'Hand Position:', text: 'Use your right thumb to close your right nostril and your right ring finger to close your left nostril. Keep your index and middle fingers folded or resting on your forehead.' },
        { label: 'Gentle Pressure:', text: 'Apply gentle pressure when closing each nostril—just enough to block airflow without discomfort.' },
        { label: 'Equal Duration:', text: 'Try to keep your inhales and exhales roughly equal in length for optimal balance.' },
        { label: 'Smooth Transitions:', text: 'Switch nostrils smoothly without pausing between breaths to maintain a continuous flow.' },
        { label: 'Start Slow:', text: 'Begin with 3-5 rounds and gradually increase as you become more comfortable with the pattern.' },
      ],
      [
        { label: 'Find a Quiet Space:', text: 'Choose a peaceful environment where you can sit undisturbed for several minutes.' },
        { label: 'Sit Comfortably:', text: 'Sit in a cross-legged position on the floor or upright in a chair with your spine straight and shoulders relaxed.' },
        { label: 'Clear Your Nostrils:', text: 'Gently blow your nose before starting to ensure both nostrils are clear.' },
        { label: 'Relax Your Body:', text: 'Take a few natural breaths to settle in and release any tension in your shoulders, jaw, and face.' },
      ],
      [
        { label: 'Mental Clarity:', text: 'Practice when you need to enhance focus and concentration before important tasks or study sessions.' },
        { label: 'Stress Relief:', text: 'Use it to calm anxiety and reduce stress during overwhelming moments.' },
        { label: 'Before Meditation:', text: 'Perform a few rounds as a preparatory practice to center yourself before meditation.' },
        { label: 'Better Sleep:', text: 'Practice before bedtime to calm a busy mind and prepare for restful sleep.' },
        { label: 'Energy Balance:', text: 'Use it when feeling mentally foggy or unbalanced to restore equilibrium.' },
      ],
      [
        { label: 'Nasal Congestion:', text: 'If your nose is congested, postpone this practice until your nasal passages are clear.' },
        { label: 'Consult Professionals:', text: 'If you have respiratory conditions, sinus issues, or cardiovascular concerns, consult a healthcare provider before practicing.' },
        { label: 'Avoid Force:', text: 'Never force the breath—keep it gentle and natural. Stop if you feel dizzy or uncomfortable.' },
        { label: 'Listen to Your Body:', text: 'If you experience discomfort or lightheadedness, pause the practice and return to normal breathing.' },
      ],
    ),
  },
  diaphragmatic: {
    summary: 'Diaphragmatic breathing or belly breathing is a deep relaxation technique that engages your diaphragm rather than your chest. It triggers your parasympathetic nervous system which lowers heart rate, reduces stress, and decreases cortisol levels.',
    phases: [
      { label: 'INHALE', seconds: 5 },
      { label: 'EXHALE', seconds: 8 },
    ],
    flow: 'Expand-Collapse',
    preview: 'diaphragm',
    guide: sections(
      [
        { label: 'Loosen tight clothing:', text: 'Tight waistbands can restrict the belly from expanding fully.' },
        { label: 'Start lying down:', text: 'Gravity makes it easier to feel the belly rise during the initial learning phase.' },
        { label: 'Keep shoulders down:', text: 'Avoid shrugging the shoulders toward the ears during inhales to ensure the breath remains deep.' },
        { label: 'Count the breath:', text: 'Matching the rhythm to a clock or a steady count can help maintain focus.' },
        { label: 'Practice regularly:', text: 'Mastering the technique during calm moments makes it more effective to use during times of high stress.' },
        { label: 'Exhale completely:', text: 'Pushing all the air out helps to maximize the depth of the next inhale.' },
        { label: 'Use a visual aid:', text: 'Placing a light book on the belly instead of a hand can provide a clear visual of the abdomen rising and falling.' },
      ],
      [
        { label: 'Get comfortable:', text: 'Lie on your back with your knees bent, or sit upright in a supportive chair.' },
        { label: 'Place your hands:', text: 'Put one hand on your upper chest and the other flat on your belly, just below your ribcage.' },
        { label: 'Inhale deeply:', text: 'Breathe in slowly through your nose for 4 seconds. You should feel the hand on your belly rise, while the hand on your chest remains as still as possible.' },
        { label: 'Exhale slowly:', text: 'Purse your lips and exhale gently over 4 to 6 seconds. Let the hand on your belly fall naturally. Continue this cycle for 5 to 10 minutes, practicing 2 to 4 times a day.' },
      ],
      [
        { label: 'Stress and Anxiety Relief:', text: 'Practice when feeling overwhelmed, anxious, or panicked to quickly lower your heart rate and calm your nervous system.' },
        { label: 'Sleep and Morning Prep:', text: 'Use it right before bed to quiet a racing mind for better sleep, or in the morning to start your day focused.' },
        { label: 'Physical and Vocal Performance:', text: 'Use it before workouts, singing, or public speaking to expand lung capacity, steady your voice, and relax tight muscles.' },
        { label: 'Post-Workout Recovery:', text: 'Practice immediately after exercise to speed up muscle recovery and transition your body out of “fight-or-flight” mode.' },
        { label: 'Daily Resets and Digestion:', text: 'Apply it mid-day to break up stress or after meals to stimulate the vagus nerve and improve your digestion.' },
      ],
      [
        { label: 'Stop if dizzy:', text: 'Discontinue the exercise immediately if you feel lightheaded, faint, or experience hyperventilation.' },
        { label: 'Avoid forcing it:', text: 'Do not strain your muscles or push your belly out aggressively, as this can strain your abdomen.' },
        { label: 'Pace your breath:', text: 'Maintain a slow, natural rhythm to avoid throwing off your oxygen and carbon dioxide balance.' },
        { label: 'Limit initially:', text: 'Start with short sessions of 2 to 3 minutes to allow your body to adapt before increasing the duration.' },
        { label: 'Consult a doctor:', text: 'Seek medical guidance first if you have chronic respiratory conditions like asthma or COPD.' },
        { label: 'Postpone after eating:', text: 'Wait at least 1 to 2 hours after a heavy meal to prevent discomfort.' },
        { label: 'Watch your posture:', text: 'Avoid slouching during seated practice, as a collapsed spine compresses the diaphragm and restricts airflow.' },
      ],
    ),
  },
  pursed: {
    summary: 'Pursed lips breathing is a simple airway technique: inhale quietly through your nose for 2 counts, then exhale slowly through pursed lips for 4 counts. The controlled back-pressure keeps small airways open, slows the breath rate, and activates the parasympathetic response. The one rule that always applies — the exhale must be twice as long as the inhale.',
    phases: [{ label: 'INHALE', seconds: 2 }, { label: 'EXHALE', seconds: 4 }],
    flow: 'Expand-Collapse',
    preview: 'lens',
    guide: sections(
      [
        { label: 'Lip shape:', text: 'Purse as if about to whistle, blow out a candle, or cool a hot drink. Leave only a small, narrow opening — not a wide gap.' },
        { label: 'No forcing:', text: 'Let the natural pressure of your lungs push the air out. The exhale should feel controlled, not strained. You may hear a soft, gentle sound.' },
        { label: 'Relax the inhale:', text: 'Breathe in quietly through your nose. A normal, relaxed breath — no need to fill the lungs completely.' },
        { label: 'Ratio flexibility:', text: '2:4, 3:6, or 4:8 all work — what matters is that the exhale is always twice the inhale.' },
        { label: 'Daily practice:', text: 'Aim for 4–5 short sessions daily so the pattern becomes automatic when you need it during activity or stress.' },
      ],
      [
        { label: 'Posture:', text: 'Sit upright or stand. Let your shoulders drop away from your ears and unclench your jaw.' },
        { label: 'Close your mouth:', text: 'Keep your mouth gently closed before the inhale so all air enters through the nose.' },
        { label: 'Settle in:', text: 'Take one or two natural breaths first to release any tension before starting the counted rhythm.' },
        { label: 'No distractions:', text: 'Choose a quiet moment, especially when learning — it becomes easier to use in busy situations once it is familiar.' },
      ],
      [
        { label: 'During activity:', text: 'Use it while climbing stairs, walking, or exercising to pace your breath and reduce breathlessness.' },
        { label: 'Stress or anxiety:', text: 'The slow, controlled exhale quickly activates the calming branch of the nervous system.' },
        { label: 'Feeling winded:', text: 'If you feel short of breath, pursed lips breathing helps you regain control faster than shallow panting.' },
        { label: 'COPD or asthma management:', text: 'Widely used in pulmonary rehabilitation to relieve breathlessness and improve airflow.' },
        { label: 'Before sleep:', text: 'A few slow cycles help quiet the mind and lower heart rate ahead of rest.' },
      ],
      [
        { label: 'Not a substitute for medical care:', text: 'If you experience persistent breathlessness, chest pain, or severe shortness of breath, consult a doctor before relying on this technique.' },
        { label: 'Keep it gentle:', text: 'Never force the exhale. Pushing air out aggressively raises pressure in the airways and can worsen breathlessness.' },
        { label: 'Stop if dizzy:', text: 'Lightheadedness means the pace is too slow or you are over-breathing. Return to normal breathing and rest before trying again.' },
        { label: 'Respiratory conditions:', text: 'Generally safe and recommended for COPD and asthma, but check with your healthcare provider about session length and frequency.' },
      ],
    ),
  },
  humming: {
    summary: 'Humming Bee Breath is a calming breathing technique that involves making a gentle humming sound while exhaling. The vibration created by humming stimulates the vagus nerve, reduces stress, and promotes deep relaxation and mental stillness.',
    phases: [{ label: 'INHALE', seconds: 4 }, { label: 'EXHALE with HUM', seconds: 8 }],
    flow: 'Clockwise',
    preview: 'arc',
    guide: sections(
      [
        { label: 'Humming Sound:', text: 'Create a low, steady humming sound like a bee. Focus on feeling the vibration in your head and chest.' },
        { label: 'Cover Your Ears:', text: 'Gently place your index fingers over your ears (or use your thumbs) to amplify the internal vibration and deepen the meditative effect.' },
        { label: 'Slow Exhale:', text: 'Make the humming exhale long and smooth—aim for at least 5-10 seconds per exhale.' },
        { label: 'Natural Inhale:', text: 'Inhale quietly through your nose without rushing. The focus is on the humming exhale.' },
        { label: 'Volume Control:', text: 'Keep the hum soft and comfortable—not too loud. The goal is vibration, not volume.' },
      ],
      [
        { label: 'Find a Quiet Space:', text: 'Choose a calm environment where you won’t be disturbed and can focus on the sound of your humming.' },
        { label: 'Sit Upright:', text: 'Sit comfortably with your spine straight, either in a chair or cross-legged on the floor.' },
        { label: 'Close Your Eyes:', text: 'Closing your eyes helps you turn inward and enhances the meditative quality of the practice.' },
        { label: 'Relax Your Face:', text: 'Keep your jaw, tongue, and facial muscles soft and relaxed to allow the humming to resonate freely.' },
      ],
      [
        { label: 'Anxiety Relief:', text: 'Use it when feeling anxious or overwhelmed to quickly calm the nervous system.' },
        { label: 'Anger Management:', text: 'Practice when experiencing frustration or anger to cool down and regain composure.' },
        { label: 'Before Sleep:', text: 'Perform a few rounds before bed to quiet a racing mind and promote restful sleep.' },
        { label: 'Meditation Preparation:', text: 'Use it as a gateway practice to deepen meditation and enhance mental stillness.' },
        { label: 'Headache Relief:', text: 'The gentle vibration may help relieve tension headaches and sinus pressure.' },
      ],
      [
        { label: 'Ear Sensitivity:', text: 'If you have ear infections or are sensitive to sound, skip covering your ears or avoid this practice entirely.' },
        { label: 'Consult Professionals:', text: 'If you have respiratory issues, sinus infections, or cardiovascular conditions, consult a doctor before practicing.' },
        { label: 'Avoid Strain:', text: 'Keep the humming gentle and comfortable. Never strain your voice or breath.' },
        { label: 'Listen to Your Body:', text: 'Stop immediately if you feel dizzy, short of breath, or experience any discomfort.' },
      ],
    ),
  },
};
