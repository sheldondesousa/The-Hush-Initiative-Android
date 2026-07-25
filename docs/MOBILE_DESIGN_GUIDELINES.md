# Hush mobile design and motion guidelines

This document translates the current Hush web implementation into reusable React Native patterns. The web animation source is the current motion reference; no separate design-guidelines file was present in either repository when this document was created.

## Mobile library stack

| Need | Library | Use in Hush |
| --- | --- | --- |
| Vector exercise graphics | `react-native-svg` | Rounded paths, progress trails, markers, diagrams, and scalable illustrations |
| UI-thread animation | `react-native-reanimated` | Long-running breath motion, pause/resume, fades, and value-driven SVG props |
| Touch feedback | `expo-haptics` | Light phase-boundary and control feedback; never continuous vibration |
| Device insets | `react-native-safe-area-context` | Session headers and controls that avoid notches and system navigation |
| Navigation at scale | `@react-navigation/native` | Recommended when the prototype shell is split into production screens |
| Persisted preferences | `@react-native-async-storage/async-storage` | Theme, session defaults, onboarding state, and local metrics |
| Audio guidance | `expo-audio` | Spoken cues, ambient tracks, interruption handling, and background-safe cleanup |
| Accessible gradients | `expo-linear-gradient` | Optional atmospheric surfaces; do not use gradients for essential state |

## Reusable component model

- `PracticeCard`: title, use case, effort, duration, and native press feedback.
- `ExerciseDetailScreen`: overview, rhythm, tips, precautions, and start action.
- `SessionScaffold`: safe-area header, session metadata, main visual, progress, and controls.
- `BreathingVisualizer`: exercise-specific SVG/Reanimated scene with no navigation concerns.
- `SessionController`: countdown, phases, cycles, pause/resume, completion, and metrics.
- `PhaseReadout`: tabular count plus stable uppercase phase label.
- `SessionControls`: large pause/resume control and completion actions.
- `CompletionState`: animation dissolve followed by a calm acknowledgement.

## Motion language

- Breath motion is continuous and deterministic. Avoid spring physics for timed breathing because overshoot breaks the rhythm.
- Use linear time across the whole cycle and apply quadratic ease-in-out inside each phase.
- The phase label remains visually stable. Do not scale or change its weight.
- Use a 56 px, weight-300 tabular count at the visual centre.
- Fade the exercise visual over roughly 600 ms before revealing completion.
- Use a 3-second preparation countdown followed by an approximately 850 ms `STARTING…` bridge.
- Pausing freezes the exact visual position and count. Resuming continues from that point.
- Respect reduced-motion preferences in the production rollout by replacing spatial travel with opacity/progress changes.

## Box Breathing reference

- Rhythm: inhale 4 seconds, hold 4, exhale 4, hold 4.
- Default: four cycles.
- Canvas/viewBox: 312 × 312.
- Inset: 24.
- Corner radius: 17.
- Stroke: 2 px outline, 2.5 px completed trail.
- Marker: 7 px radius.
- Start: upper-left vertical edge, moving clockwise.
- Trail resets at the start of every cycle.
- Light haptic feedback is allowed only when the phase changes.

## Interaction and accessibility

- Every control must have an accessibility role and explicit label.
- Minimum touch target: 44 × 44 points; primary controls use 54-point height.
- Never rely on colour alone for phase, selection, or completion.
- Counts use tabular numerals to prevent horizontal movement.
- Safety content remains available before beginning an exercise.
- Haptics are supplementary and must fail silently on unsupported devices.

## Rollout order

1. Box Breathing as the reference implementation.
2. Coherent Breathing using the same session scaffold and a wave visualizer.
3. 4-7-8 using a circular path and the same phase controller.
4. Alternate Nostril with directional cues.
5. Remaining exercises, audio guidance, persisted settings, and Firebase metrics.
