/**
 * Capacitor Configuration for PLAYVERSE 35 Android App
 * Enables wrapping this modern Vite React Web App into a native Android APK / AAB.
 */

const config = {
  appId: 'com.playverse35.arcade',
  appName: 'PLAYVERSE 35',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: false
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0a0d17',
    buildOptions: {
      keystorePath: 'playverse35-release-key.jks',
      keystoreAlias: 'playverse35'
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0a0d17',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0d17'
    }
  }
};

export default config;
