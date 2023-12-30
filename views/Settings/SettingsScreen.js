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

import GetUIColors from '../../utils/GetUIColors';
import { useAppContext } from '../../utils/AppContext';
import { SkolengoCache } from '../../fetch/SkolengoData/SkolengoCache';
import {
  SkolengoDatas,
  loginSkolengoWorkflow,
} from '../../fetch/SkolengoData/SkolengoDatas';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import AlertBottomSheet from '../../interface/AlertBottomSheet';

function SettingsScreen({ navigation }) {
  const UIColors = GetUIColors();

  const appctx = useAppContext();

  const [PronoteTokenActionAlert, setPronoteTokenActionAlert] = useState(false);
  const [DeleteAccountAlert, setDeleteAccountAlert] = useState(false);

  function LogOutAction() {
    setDeleteAccountAlert(true);
  }

  const [tokenLoading, setTokenLoading] = useState(false);

  function TokenAction() {
    setTokenLoading(true);
    refreshToken().then(() => {
      setTokenLoading(false);
      setPronoteTokenActionAlert(true);
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
      style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
    >

      {appctx.dataprovider.service === 'Pronote' && ( 
        <NativeList
          header="Connexion à Pronote"
          inset
        >
          <NativeItem
            leading={<Server size={24} color={UIColors.text} />}
            chevron
            onPress={() => navigation.navigate('changeServer')}
          >
            <NativeText heading="h4">
              Changer de serveur
            </NativeText>
            <NativeText heading="p2">
              Modifier le serveur utilisé dans l'app
            </NativeText>
          </NativeItem>

          <NativeItem
            leading={<RefreshCw size={24} color={UIColors.text} />}
            chevron
            onPress={() => TokenAction()}
          >
            <NativeText heading="h4">
              Regénerer le token
            </NativeText>
            <NativeText heading="p2">
              Regénerer le token de votre compte
            </NativeText>
            
          </NativeItem>
          <AlertBottomSheet
              visible={PronoteTokenActionAlert}
              title="Regénerer le token"
              subtitle="Le token de votre compte a été regénéré avec succès !"
              icon={<RefreshCw/>}
              cancelAction={() => setPronoteTokenActionAlert(false)}
          />
          <NativeItem
            leading={<Trash2 size={24} color={UIColors.text} />}
            chevron
            onPress={() => ExpireAction()}
          >
            <NativeText heading="h4">
              Forcer l'expiration du token
            </NativeText>
            <NativeText heading="p2">
              Regénerer le token de votre compte
            </NativeText>
          </NativeItem>
        </NativeList>
      )}

      {appctx.dataprovider.service === 'Skolengo' && (
        <NativeList
          header="Connexion à Skolengo"
          inset
        >
          <NativeItem
            leading={<Trash2 size={24} color={UIColors.text} />}
            chevron
            onPress={() => SkolengoCacheClear()}
          >
            <NativeText heading="h4">
              Vider le cache
            </NativeText>
            <NativeText heading="p2">
              Supprimer le cache des données de Skolengo
            </NativeText>
          </NativeItem>

          <NativeItem
            leading={<Trash2 size={24} color={UIColors.text} />}
            chevron
            onPress={() => SkolengoReconnect()}
          >
            <NativeText heading="h4">
              Reconnecter son compte Skolengo
            </NativeText>
            <NativeText heading="p2">
              & regénérer le token
            </NativeText>
          </NativeItem>
        </NativeList>
      )}

      <NativeList
        header="Mon compte"
        inset
      >
        <NativeItem
          leading={<LogOut size={24} color="#D81313" />}
          chevron
          onPress={() => LogOutAction()}
        >
          <NativeText heading="h4" style={{ color: '#D81313' }}>
            Déconnexion
          </NativeText>
          <NativeText heading="p2">
            Se déconnecter de votre compte
          </NativeText>
        </NativeItem>
        <AlertBottomSheet
          visible={DeleteAccountAlert}
          title="Déconnexion"
          subtitle="Êtes-vous sûr de vouloir vous déconnecter ?"
          icon={<LogOut size={24}/>}
          color='#D81313'
          cancelButton='Annuler'
          cancelAction={() => setDeleteAccountAlert(false)}
          primaryButton='Déconnexion'
          primaryAction={async () => {
            let server = null;
            
            try {
              AsyncStorage.getItem('credentials').then((result) => {
                const res = JSON.parse(result || 'null');
                if (res)
                  AsyncStorage.setItem(
                    'old_login',
                    JSON.stringify({ url: res.url })
                  );
              });
              AsyncStorage.getItem('custom_server').then((server) => {
                if (server) {
                  server = JSON.parse(server);
                }
              });
              if (appctx.dataprovider.service === 'Skolengo')
                appctx.dataprovider.skolengoInstance?.skolengoDisconnect();
            } catch (e) {
              /* empty */
            }
  
            AsyncStorage.clear().then(() => {
              if (server) {
                AsyncStorage.setItem('custom_server', JSON.stringify(server));
              }
            });
  
            appctx.setLoggedIn(false);
            navigation.popToTop();
          }}
        />
      </NativeList>
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
