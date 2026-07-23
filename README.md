# The Hush Initiative — React Native

The Android-first React Native version of The Hush Initiative, built with Expo and TypeScript.

## Included

- Eight guided breathing exercises with native timed animations
- Eight guided mindfulness practices
- Breathing and meditation recommendation flows
- Exercise information, rhythm, tips, and safety guidance
- Light, dark, and minimalist themes
- Local session and mindful-minute metrics
- Android package ID: `com.sheldondesousa.thehushinitiative`

## Run locally

Requirements: Node.js and the Expo Go Android app or an Android emulator.

```bash
npm install
npm run android
```

Other useful checks:

```bash
npm run typecheck
npx expo-doctor
npx expo export --platform android
```

## Architecture

- `App.tsx` contains the native navigation shell, screens, guided-session state, and theme system.
- `src/data.ts` contains the breathing and meditation content and recommendation mappings.
- `app.json` contains the Expo and Android application metadata.

The web repository is the product reference only. This repository is self-contained and does not modify or depend on the web source at runtime.
