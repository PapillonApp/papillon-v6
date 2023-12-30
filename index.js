import { registerRootComponent } from 'expo';

import App from './App';
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

import * as Sentry from '@sentry/react-native';

Sentry.init({
    dsn: 'http://4f5fa3f4dc364796bbdac55029146458@sentry.getpapillon.xyz/3',
    enableInExpoDevelopment: true,
});