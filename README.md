# The Hush Initiative

A React Native application targeting Android (with iOS support planned).

## Tech Stack

- **React Native** 0.76.9 — New Architecture enabled by default
- **TypeScript** — Type-safe development
- **Hermes** — Optimized JS engine for React Native
- **Kotlin** — Android native layer

## Prerequisites

Before running this project, ensure you have the following installed:

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| JDK | 17 or 21 | OpenJDK recommended |
| Android Studio | Latest | Includes Android SDK |
| Android SDK | API 35 | Target SDK |

### Environment Variables

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk          # macOS
export ANDROID_HOME=$HOME/Android/Sdk                  # Linux
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start Metro Bundler

```bash
npm start
```

### 3. Run on Android

```bash
npm run android
```

Make sure you have an Android emulator running or a physical device connected with USB debugging enabled.

## Project Structure

```
TheHushInitiative/
├── android/              # Android native project
│   ├── app/
│   │   └── src/
│   │       └── main/
│   │           ├── java/com/thehushinitiative/
│   │           │   ├── MainActivity.kt
│   │           │   └── MainApplication.kt
│   │           ├── res/
│   │           └── AndroidManifest.xml
│   ├── build.gradle
│   ├── settings.gradle
│   └── gradle.properties
├── App.tsx               # Root component
├── index.js              # App entry point
├── package.json
├── tsconfig.json
└── babel.config.js
```

## Android Configuration

- **Min SDK**: 24 (Android 7.0 Nougat)
- **Target SDK**: 35 (Android 15)
- **Build Tools**: 35.0.0
- **New Architecture**: Enabled (`newArchEnabled=true`)
- **Hermes Engine**: Enabled (`hermesEnabled=true`)

## Development

```bash
# Run linter
npm run lint

# Run tests
npm test

# Start Metro with cache reset
npm start -- --reset-cache
```

## Troubleshooting

### Metro Bundler issues
```bash
npm start -- --reset-cache
```

### Android build issues
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

### ADB not found
Ensure `ANDROID_HOME` is set and `platform-tools` is in your `PATH`.
