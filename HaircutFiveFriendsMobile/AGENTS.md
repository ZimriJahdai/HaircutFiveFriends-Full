# Expo HAS CHANGED

This project is pinned to **Expo SDK 55** (not the latest SDK) to match the known-working dependency set from the `Banco-Movil` reference project. Read the exact versioned docs at https://docs.expo.dev/versions/v55.0.0/ before writing any code, and do not bump `expo`/`react-native`/`react` versions without re-validating the whole pinned set in `package.json`.

Do not run `expo prebuild` or touch native Android/Gradle or iOS/Xcode projects — this app stays on the managed workflow (`expo start` + Expo Go) intentionally, to avoid the native build/version-mismatch issues that motivated this pin.
