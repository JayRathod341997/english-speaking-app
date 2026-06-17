# Bolo English — frontend

React + TypeScript + Vite web app, wrapped as a native Android app (APK) with
[Capacitor](https://capacitorjs.com/). All learning content (conversations, idioms,
vocabulary, flashcards, grammar) is bundled into the build — the app runs offline and
makes no backend API calls for content.

## Building the Android APK

The APK is the compiled web app (`dist/`) copied into the native Android project and
packaged by Gradle. App id `com.boloEnglish.app`, name **Bolo English**.

### Prerequisites

- Node.js 20+ and npm
- JDK 17
- Android SDK (install via [Android Studio](https://developer.android.com/studio); set
  `ANDROID_HOME` / `JAVA_HOME`). Android Studio is optional but recommended.

### Steps

Run from the `frontend/` directory:

```bash
# 1. Install dependencies (first time only)
npm install

# 2. (Optional) refresh the bundled content from backend/data
npm run sync-data

# 3. Build the web assets into dist/
npm run build

# 4. Copy the build into the native Android project
npx cap sync android

# 5. Package the APK with Gradle
cd android
./gradlew assembleDebug          # macOS/Linux
# .\gradlew.bat assembleDebug    # Windows PowerShell
```

The debug APK is written to:

```
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

Install it on a connected device/emulator with:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Release build

`./gradlew assembleRelease` produces `app/build/outputs/apk/release/app-release-unsigned.apk`.
The `release` build type has **no signing config**, so this APK is unsigned and cannot
be installed or uploaded to Play until you sign it (configure a keystore + `signingConfig`
in `android/app/build.gradle`, or sign with `apksigner`). Bump `versionCode` / `versionName`
in `android/app/build.gradle` for each release.

### Using Android Studio instead

```bash
npx cap open android
```

Then **Build → Build Bundle(s) / APK(s) → Build APK(s)**. Re-run steps 3–4 (`npm run build`
&& `npx cap sync android`) whenever you change the web app, so the native project picks up
the latest `dist/`.

---

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
