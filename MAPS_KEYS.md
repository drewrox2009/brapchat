# Map API Keys (BrapChat)

## Apple Maps (iOS)

Apple Maps does not require an API key for the native iOS map provider.
If you stay on the default Apple Maps renderer, you can leave the iOS key blank.

If you want Google Maps on iOS instead:
1) Go to Google Cloud Console → APIs & Services → Credentials.
2) Create an API key and restrict it to iOS.
3) Add your iOS bundle identifier (`com.brapchat.app`).
4) Enable the Maps SDK for iOS.
5) Paste the key in `mobile/app.json` under `react-native-maps` → `ios.apiKey`.

## Google Maps (Android)

1) Go to Google Cloud Console → APIs & Services → Credentials.
2) Create an API key and restrict it to Android.
3) Add your Android package (`com.brapchat.app`) and SHA‑1.
4) Enable the Maps SDK for Android.
5) Paste the key in `mobile/app.json` under `react-native-maps` → `android.apiKey`.

### Finding SHA‑1 on Windows

If the keytool command fails, it usually means Java isn’t installed or not on PATH.

Option A (recommended): Use Android Studio
- Open Android Studio → **Gradle** tool window.
- Run `mobile:signingReport`.
- Copy the **SHA1** from the `debug` variant.

Option B: Use keytool (requires Java)
1) Install a JDK (Temurin 17 is fine).
2) Open a new terminal and run:

```sh
"%JAVA_HOME%\bin\keytool" -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

### For Play Store release

You’ll add the **release** SHA‑1 later (from Play Console App Integrity). You can add multiple SHA‑1s to the same API key.

## Where to set keys

Edit `mobile/app.json`:

```json
"plugins": [
  [
    "react-native-maps",
    {
      "ios": {
        "apiKey": "YOUR_IOS_KEY"
      },
      "android": {
        "apiKey": "YOUR_ANDROID_KEY"
      }
    }
  ]
]
```

After updating, rebuild the dev client for native changes to apply.
