import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.boloEnglish.app',
  appName: 'Bolo English',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SpeechRecognition: {
      language: 'en-IN',
    },
  },
};

export default config;
