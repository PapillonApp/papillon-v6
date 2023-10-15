import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';

import { useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, RefreshCw, Server, Trash2 } from 'lucide-react-native';
import { showMessage } from 'react-native-flash-message';
import { revokeAsync } from 'expo-auth-session';

import { refreshToken, expireToken } from '../../fetch/AuthStack/LoginFlow';

import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import GetUIColors from '../../utils/GetUIColors';
import { useAppContext } from '../../utils/AppContext';
import { SkolengoCache } from '../../fetch/SkolengoData/SkolengoCache';
import {
  SkolengoDatas,
  loginSkolengoWorkflow,
} from '../../fetch/SkolengoData/SkolengoDatas';

function SettingsScreen({ navigation }) {
  const UIColors = GetUIColors();

  const appctx = useAppContext();

  function LogOutAction() {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          try {
            AsyncStorage.getItem('credentials').then((result) => {
              const res = JSON.parse(result || 'null');
              if (res)
                AsyncStorage.setItem(
                  'old_login',
                  JSON.stringify({ url: res.url })
                );
            });
            if (appctx.dataprovider.service === 'Skolengo')
              appctx.dataprovider.skolengoInstance?.skolengoDisconnect();
          } catch (e) {
            /* empty */
          }

          AsyncStorage.clear();

          appctx.setLoggedIn(false);
          navigation.popToTop();
        },
      },
    ]);
  }

  const [tokenLoading, setTokenLoading] = useState(false);

  function TokenAction() {
    setTokenLoading(true);
    refreshToken().then(() => {
      setTokenLoading(false);
      Alert.alert(
        'Token regénéré',
        'Le token de votre compte a été regénéré avec succès !',
        [
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    });
  }

  function ExpireAction() {
    expireToken('expireAction');
  }

  function SkolengoCacheClear() {
    if (appctx.dataprovider.service === 'Skolengo') {
      Alert.alert(
        'Vider le cache',
        'Êtes-vous sûr de vouloir vider le cache ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Vider le cache',
            style: 'destructive',
            onPress: async () => {
              SkolengoCache.clearItems().then(() =>
                showMessage({
                  message: 'Cache vidé avec succès',
                  type: 'success',
                  icon: 'auto',
                  floating: true,
                })
              );
            },
          },
        ]
      );
    }
  }

  function SkolengoReconnect() {
    if (appctx.dataprovider.service === 'Skolengo') {
      Alert.alert(
        'Reconnecter son compte Skolengo',
        'Êtes-vous sûr de vouloir reconnecter votre compte Skolengo ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Reconnecter',
            style: 'destructive',
            onPress: async () => {
              if (!appctx?.dataprovider?.skolengoInstance) return;
              if (!appctx?.dataprovider?.skolengoInstance.rtInstance)
                await appctx?.dataprovider?.init();
              const validRetry = await loginSkolengoWorkflow(
                appctx,
                null,
                appctx.dataprovider.skolengoInstance.school,
                appctx.dataprovider.skolengoInstance
              );
              if (validRetry === true) {
                SkolengoCache.clearItems();
                const discovery = AsyncStorage.getItem(
                  SkolengoDatas.DISCOVERY_PATH
                )?.then((_disco) => _disco && JSON.parse(_disco));
                revokeAsync(
                  {
                    ...appctx.dataprovider.skolengoInstance?.rtInstance,
                    token:
                      appctx.dataprovider.skolengoInstance?.rtInstance
                        .accessToken,
                  },
                  discovery
                ).then(() => {
                  showMessage({
                    message: 'Compte déconnecté avec succès',
                    type: 'success',
                    icon: 'auto',
                    floating: true,
                  });
                  navigation.navigate('login');
                });
              }
            },
          },
        ]
      );
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
    >
      <View style={{ gap: 9, marginTop: 16 }}>
        <Text style={styles.ListTitle}>Serveur et identifiants (avancé)</Text>

        {appctx.dataprovider.service === 'Pronote' && (
          <>
            <ListItem
              title="Changer de serveur (avancé)"
              subtitle="Modifier le serveur utilisé dans l'app"
              color="#B42828"
              center
              left={
                <PapillonIcon
                  icon={<Server size={24} color="#565EA3" />}
                  color="#565EA3"
                  size={24}
                  small
                />
              }
              onPress={() => navigation.navigate('changeServer')}
            />
            <ListItem
              title="Regénerer le token"
              subtitle="Regénerer le token de votre compte"
              color="#B42828"
              center
              left={
                <PapillonIcon
                  icon={<RefreshCw size={24} color="#565EA3" />}
                  color="#565EA3"
                  size={24}
                  small
                />
              }
              right={tokenLoading ? <ActivityIndicator size="small" /> : null}
              onPress={() => TokenAction()}
            />
            <ListItem
              title="Forcer l'expiration du token"
              subtitle="Regénerer le token de votre compte"
              color="#B42828"
              center
              left={
                <PapillonIcon
                  icon={<Trash2 size={24} color="#565EA3" />}
                  color="#565EA3"
                  size={24}
                  small
                />
              }
              onPress={() => ExpireAction()}
            />
          </>
        )}
        {appctx.dataprovider.service === 'Skolengo' && (
          <>
            <ListItem
              title="Vider le cache"
              subtitle="Supprimer le cache des données de Skolengo"
              color="#B42828"
              center
              left={
                <PapillonIcon
                  icon={<Trash2 size={24} color="#565EA3" />}
                  color="#565EA3"
                  size={24}
                  small
                />
              }
              onPress={() => SkolengoCacheClear()}
            />
            <ListItem
              title="Reconnecter son compte Skolengo"
              subtitle="Et regénérer le token"
              color="#B42828"
              center
              left={
                <PapillonIcon
                  icon={<Trash2 size={24} color="#565EA3" />}
                  color="#565EA3"
                  size={24}
                  small
                />
              }
              onPress={() => SkolengoReconnect()}
            />
          </>
        )}
      </View>

      <View style={{ gap: 9, marginTop: 16 }}>
        <Text style={styles.ListTitle}>Mon compte</Text>

        <ListItem
          title="Déconnexion"
          subtitle="Se déconnecter de votre compte"
          color="#B42828"
          center
          left={
            <PapillonIcon
              icon={<LogOut size={24} color="#B42828" />}
              color="#B42828"
              size={24}
              small
            />
          }
          onPress={() => LogOutAction()}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ListTitle: {
    paddingLeft: 29,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },
});

export default SettingsScreen;
