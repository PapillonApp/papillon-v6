import { registerRootComponent } from 'expo';
import 'react-native-url-polyfill/auto';

import App from './App';
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);


import { registerWidgetTaskHandler } from 'react-native-android-widget';

import { widgetTaskHandler } from './android-widgets/widget-task-handler';

registerWidgetTaskHandler(widgetTaskHandler);