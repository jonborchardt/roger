# Mobile Setup Guide

This guide explains how to deploy the voice-enabled PWA to mobile devices (iOS and Android).

## Overview

The app uses:
- **MediaRecorder API** for audio recording (works on all platforms)
- **Speech Recognition API** for voice-to-text (desktop Chrome, Android Chrome - **NOT iOS Safari**)
- **Speech Synthesis API** for text-to-speech (works on all platforms with iOS-specific workarounds)

## Important Platform Limitations

### iOS Safari (PWA)
- ✅ **Microphone recording**: Works
- ❌ **Speech Recognition**: NOT supported (Web Speech API not available)
- ✅ **Speech Synthesis**: Works (with initialization workaround implemented)
- ⚠️ **HTTPS required**: PWA must be served over HTTPS (localhost is OK for testing)

### Android Chrome (PWA)
- ✅ **Microphone recording**: Works
- ✅ **Speech Recognition**: Works
- ✅ **Speech Synthesis**: Works
- ⚠️ **HTTPS required**: PWA must be served over HTTPS (localhost is OK for testing)

### Desktop Chrome/Edge
- ✅ **Microphone recording**: Works
- ✅ **Speech Recognition**: Works
- ✅ **Speech Synthesis**: Works

## PWA Deployment (Web-based)

### 1. Build the PWA

```bash
npm run build
```

### 2. Deploy to HTTPS server

The built `dist/` folder must be served over HTTPS. Options:

**GitHub Pages** (already configured):
```bash
git push origin main
# Automatically deploys to https://yourusername.github.io/roger/
```

**Local testing** (HTTP is OK for localhost):
```bash
npm run preview
# Visit http://localhost:4173/roger/
```

**Other hosts**: Deploy `dist/` to Netlify, Vercel, or any static host with HTTPS.

### 3. Install PWA on mobile

**iOS Safari**:
1. Visit the HTTPS URL on your iPhone
2. Tap the Share button
3. Tap "Add to Home Screen"
4. The app will open in standalone mode

**Android Chrome**:
1. Visit the HTTPS URL on your Android device
2. Tap the menu (⋮) button
3. Tap "Add to Home Screen" or "Install app"
4. The app will open in standalone mode

### 4. Grant Microphone Permission

When you first tap the green record button:
- **iOS**: Will prompt for microphone permission (tap "Allow")
- **Android**: Will prompt for microphone permission (tap "Allow")

## Capacitor Deployment (Native App)

For a native app wrapper (optional):

### Android

1. Sync the web build to Android:
```bash
npm run build
npm run cap:sync
```

2. Open Android Studio:
```bash
npm run cap:open:android
```

3. In Android Studio:
   - The `RECORD_AUDIO` permission is already added to `AndroidManifest.xml`
   - Connect your Android device or use an emulator
   - Click Run (▶️) to install the app

### iOS

1. Sync the web build to iOS:
```bash
npm run build
npm run cap:sync
```

2. Open Xcode:
```bash
npm run cap:open:ios
```

3. In Xcode, add microphone permission to `Info.plist`:
   - Open `ios/App/App/Info.plist`
   - Add this key-value pair:
   ```xml
   <key>NSMicrophoneUsageDescription</key>
   <string>This app needs microphone access for voice commands</string>
   ```

4. Connect your iPhone and click Run (▶️) to install the app

## Testing Checklist

### Desktop (Chrome/Edge)
- [ ] Tap green button → microphone permission prompt appears
- [ ] Speak → transcript appears in real-time
- [ ] Tap red button → game responds with text
- [ ] Game response is spoken aloud

### Android PWA (Chrome)
- [ ] Install PWA to home screen
- [ ] Tap green button → microphone permission prompt appears
- [ ] Speak → transcript appears in real-time
- [ ] Tap red button → game responds with text
- [ ] Game response is spoken aloud

### iOS PWA (Safari)
- [ ] Install PWA to home screen
- [ ] Tap green button → microphone permission prompt appears
- [ ] Speak → message shows "Recording audio (speech recognition unavailable)"
- [ ] Tap red button → app records audio BUT cannot transcribe it
- [ ] **Expected limitation**: Speech recognition does NOT work on iOS
- [ ] Game response IS spoken aloud (speech synthesis works)

## Troubleshooting

### Microphone Not Working

**Desktop/Android**:
- Check browser console for errors
- Ensure HTTPS (or localhost for testing)
- Try revoking and re-granting microphone permission in browser settings

**iOS**:
- Check Settings → Safari → Camera & Microphone → Allow
- Ensure the PWA is installed to home screen (not just a browser tab)
- Try deleting the PWA and reinstalling

### Speech Recognition Not Working

**iOS**: This is expected - Speech Recognition API is not supported on iOS Safari. The app will still:
- Record audio
- Show "Recording audio (speech recognition unavailable)"
- Speak responses aloud

**Android/Desktop**:
- Check browser console for errors
- Ensure HTTPS connection
- Check microphone permission is granted

### Speech Synthesis Not Speaking

**iOS**:
- Ensure volume is up and ringer is not in silent mode
- The app initializes speech synthesis on first button press (iOS requirement)
- Try tapping the cyan button to repeat last response

**Android/Desktop**:
- Check volume settings
- Check browser console for errors
- Try refreshing the page

## Known Limitations

1. **iOS PWA has NO speech recognition** - This is a Safari limitation. Consider:
   - Using native iOS app via Capacitor (same limitation)
   - Using text input as fallback (not yet implemented)
   - Waiting for Apple to add Web Speech API support

2. **Speech recognition accuracy** - Depends on:
   - Microphone quality
   - Background noise
   - Internet connection (recognition uses cloud services)

3. **HTTPS required** - PWAs require secure context for microphone access
   - Localhost is exempt (for testing)
   - Use ngrok or similar for testing on real devices without deployment
