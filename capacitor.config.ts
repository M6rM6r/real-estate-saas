import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wa9l.app',
  appName: 'Wa9l',
  webDir: '.next',
  server: {
    url: 'https://rewrew7.web.app',
    cleartext: false
  }
};

export default config;
