import { School } from 'scolengo-api/types/models/School';
import { SkolengoDataProvider } from './SkolengoDataProvider';
import { AppContextType } from '../../utils/AppContext';
import {
  AuthRequest,
  exchangeCodeAsync,
  resolveDiscoveryAsync,
} from 'expo-auth-session';
import { coolDownAsync, warmUpAsync } from 'expo-web-browser';
import { Alert } from 'react-native';
import { OID_CLIENT_ID, OID_CLIENT_SECRET, REDIRECT_URI } from 'scolengo-api';

const skolengoErrorHandler = (err?: Error | any) => {
  if (err instanceof Error) console.error(err);
  Alert.alert(
    'Erreur',
    'Une erreur est survenue lors de la connexion à Skolengo. Veuillez réessayer.'
  );
  return null;
};

export const loginSkolengoWorkflow = async (
  appContext: AppContextType,
  navigation: any,
  school: School,
  skolengoInstance: SkolengoDataProvider | null = null
) => {
  const disco = await Promise.all([
    fetch(school.emsOIDCWellKnownUrl)
      .then((res) => res.json())
      .then((res) => res.issuer),
    warmUpAsync(),
  ])
    .then(([issuer]) => resolveDiscoveryAsync(issuer))
    .catch(skolengoErrorHandler);
  if (!disco) return;
  const authRes = new AuthRequest({
    clientId: OID_CLIENT_ID,
    clientSecret: OID_CLIENT_SECRET,
    redirectUri: REDIRECT_URI,
    extraParams: {
      scope: 'openid',
      response_type: 'code',
    },
    usePKCE: false,
  });
  const res = await authRes.promptAsync(disco).catch(skolengoErrorHandler)!;
  coolDownAsync();
  if (!res || res?.type !== 'success') return;
  if (!res.params.code) {
    return skolengoErrorHandler(res.error);
  }
  const token = await exchangeCodeAsync(
    {
      clientId: OID_CLIENT_ID,
      clientSecret: OID_CLIENT_SECRET,
      code: res.params.code,
      redirectUri: REDIRECT_URI,
    },
    disco
  ).catch(skolengoErrorHandler);
  if (!token) return skolengoErrorHandler();
  console.log({token});
  Alert.alert(
    'Skolengo : intégration en cours',
    'Veuillez patienter, le processus de connexion à Skolengo à fonctionné.\nMais l\'intégration de Skolengo (NG) n\'est pas encode terminé.\n\nRevenez plus tard.'
  );
  /* // TODO : Créer l'intégration via scolengo-api
  return; */
  /* await Promise.all([
    AsyncStorage.setItem('service', 'Skolengo'),
    AsyncStorage.setItem('token', 'skolengo'),
  ]);
  showMessage({
    message: 'Connecté avec succès',
    type: 'success',
    icon: 'auto',
    floating: true,
  });
  if (appContext) {
    const a = new SkolengoDatas(token, school);
    await a.saveToken(disco);
    appContext.dataProvider.init('Skolengo').then(() => {
      appContext.setLoggedIn(true);
      navigation.popToTop();
    });
    return true;
  }
  skolengoInstance.school = school;
  skolengoInstance.rtInstance = token;
  return skolengoInstance; */
};
