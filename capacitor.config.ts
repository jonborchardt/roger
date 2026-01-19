import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jonborchardt.roger',
  appName: 'roger',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    // Microphone permission for voice input
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
  ios: {
    // iOS requires microphone permission in Info.plist
    // Add NSMicrophoneUsageDescription manually to ios/App/App/Info.plist
  },
  android: {
    // Android requires RECORD_AUDIO permission in AndroidManifest.xml
    // This should be added automatically by Capacitor
  },
};

export default config;
