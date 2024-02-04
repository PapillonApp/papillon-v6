import { registerRootComponent } from 'expo';
import 'react-native-url-polyfill/auto';

import App from './App';

registerRootComponent(App);

import { setJSExceptionHandler } from "react-native-exception-handler";

import { Alert } from 'react-native';
import RNRestart from 'react-native-restart';

setJSExceptionHandler((error: Error, isFatal: Boolean) => {
  console.error("Error caught! ", error, isFatal)
  Alert.alert(
    "Une erreur est survenue",
    "Cette erreur nous a été envoyée. Nous vous recommandons de redémarrer l'appli, mais vous pouvez aussi tenter de continuer son fonctionnement." + `\n${error}`,
    [{
      "text": "Redémarrer",
      onPress: () => { RNRestart.Restart(); }
    },
    {
      "text": "Continuer"
    }]
  )
}, true);