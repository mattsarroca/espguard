import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.espguard.app',
  appName: 'ESP32 Security Monitor',
  webDir: 'dist',
  server: {
    url: 'https://82479b10-5df0-43f6-a2d6-f304780cffc2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
