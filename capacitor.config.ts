import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.phrasepilot.app',
  appName: 'phrase-pilot-mobile',
  webDir: 'dist',
  server: {
    url: 'https://2c331c8f-3998-4408-8917-8389d82cde0a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    // Future configurations for Capacitor plugins would go here
  }
};

export default config;
