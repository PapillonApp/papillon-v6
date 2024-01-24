import React from 'react';
import { ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LogOut, RefreshCw, RotateCw, Server, Trash2 } from 'lucide-react-native';
import { showMessage } from 'react-native-flash-message';
import { revokeAsync } from 'expo-auth-session';

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
import { IndexDataInstance } from '../../fetch';

function SettingsScreen({ navigation }) {
  const UIColors = GetUIColors();
  const appContext = useAppContext();

  const [pronoteTokenActionAlert, setPronoteTokenActionAlert] = React.useState(false);
  const [skolengoCacheClearAlert, setSkolengoCacheClearAlert] = React.useState(false);
  const [skolengoReconnectAlert, setSkolengoReconnectAlert] = React.useState(false);
  const [deleteAccountAlert, setDeleteAccountAlert] = React.useState(false);

  async function pronoteRegenerateToken() {
    // Force another initialisation.
    await appContext.dataProvider.init('pronote');
    setPronoteTokenActionAlert(true);
  }


  function skolengoCacheClear() {
    if (appContext.dataProvider.service === 'skolengo') {
      setSkolengoCacheClearAlert(true);
    }
  }

  function skolengoReconnect() {
    if (appContext.dataProvider.service === 'skolengo') {
      setSkolengoReconnectAlert(true);
    }
  }

  return (
    <ScrollView style={{ backgroundColor: UIColors.modalBackground }}>
      {appContext.dataProvider.service === 'pronote' && ( 
        <NativeList
          header="Connexion à Pronote"
          inset
        >
          <NativeItem
            leading={<RefreshCw size={24} color={UIColors.text} />}
            chevron
            onPress={() => pronoteRegenerateToken()}
          >
            <NativeText heading="h4">
              Régénérer le token
            </NativeText>
            <NativeText heading="p2">
              Régénérer le token de votre compte
            </NativeText>
          </NativeItem>
        </NativeList>
      )}

      <AlertBottomSheet
        visible={pronoteTokenActionAlert}
        title="Régénérer le token"
        subtitle="Le token de votre compte a été régénéré avec succès !"
        icon={<RefreshCw/>}
        cancelAction={() => setPronoteTokenActionAlert(false)}
      />

      {appContext.dataProvider.service === 'skolengo' && (
        <NativeList
          header="Connexion à Skolengo"
          inset
        >
          <NativeItem
            leading={<Trash2 size={24} color={UIColors.text} />}
            chevron
            onPress={() => skolengoCacheClear()}
          >
            <NativeText heading="h4">
              Vider le cache
            </NativeText>
            <NativeText heading="p2">
              Supprimer le cache des données de Skolengo
            </NativeText>
          </NativeItem>
          <AlertBottomSheet
            visible={skolengoCacheClearAlert}
            title="Vider le cache"
            subtitle="Êtes-vous sûr de vouloir vider le cache ?"
            icon={<Trash2/>}
            primaryButton='Vider le cache'
            primaryAction={async () => {
              SkolengoCache.clearItems().then(() =>
                showMessage({
                  message: 'Cache vidé avec succès',
                  type: 'success',
                  icon: 'auto',
                  floating: true,
                })
                
              );
              console.log('Cache vidé avec succès');
            }}
            cancelButton='Annuler'
            cancelAction={() => setSkolengoCacheClearAlert(false)}
          />
          <NativeItem
            leading={<RotateCw size={24} color={UIColors.text} />}
            chevron
            onPress={() => skolengoReconnect()}
          >
            <NativeText heading="h4">
              Reconnecter son compte Skolengo
            </NativeText>
            <NativeText heading="p2">
              & régénérer le token
            </NativeText>
          </NativeItem>
          <AlertBottomSheet
            visible={skolengoReconnectAlert}
            title="Reconnecter son compte Skolengo"
            subtitle="Êtes-vous sûr de vouloir reconnecter votre compte Skolengo ?"
            icon={<RotateCw/>}
            primaryButton='Reconnecter'
            primaryAction={async () => {
              if (!appContext?.dataProvider?.skolengoInstance) return;
              if (!appContext?.dataProvider?.skolengoInstance.rtInstance)
                await appContext?.dataProvider?.init('skolengo');
              const validRetry = await loginSkolengoWorkflow(
                appContext,
                null,
                appContext.dataProvider.skolengoInstance.school,
                appContext.dataProvider.skolengoInstance
              );
              if (validRetry === true) {
                SkolengoCache.clearItems();
                const discovery = AsyncStorage.getItem(
                  SkolengoDatas.DISCOVERY_PATH
                )?.then((_disco) => _disco && JSON.parse(_disco));
                revokeAsync(
                  {
                    ...appContext.dataProvider.skolengoInstance?.rtInstance,
                    token:
                        appContext.dataProvider.skolengoInstance?.rtInstance
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
              setSkolengoReconnectAlert(false);
            }}
            cancelButton='Annuler'
            cancelAction={() => setSkolengoReconnectAlert(false)}
          />
            
        </NativeList>
      )}

      <NativeList
        header="Mon compte"
        inset
      >
        <NativeItem
          leading={<LogOut size={24} color="#D81313" />}
          chevron
          onPress={() => setDeleteAccountAlert(true)}
        >
          <NativeText heading="h4" style={{ color: '#D81313' }}>
            Déconnexion
          </NativeText>
          <NativeText heading="p2">
            Se déconnecter de votre compte
          </NativeText>
        </NativeItem>
      </NativeList>

      <AlertBottomSheet
        visible={deleteAccountAlert}
        title="Êtes-vous sûr ?"
        subtitle="Tous vos paramètres et comptes seront supprimés définitivement de Papillon."
        icon={<LogOut size={24}/>}
        color='#D81313'
        cancelButton='Annuler'
        cancelAction={() => setDeleteAccountAlert(false)}
        primaryButton='Déconnexion'
        primaryAction={async () => {
          try {
            if (appContext.dataProvider.service === 'skolengo')
              await appContext.dataProvider.skolengoInstance?.skolengoDisconnect();
          } catch { /* no-op */ }
  
          // Remove every data from storage.
          await AsyncStorage.clear();
  
          // Create a new provider since we're resetting everything.
          appContext.setDataProvider(new IndexDataInstance());
          appContext.setLoggedIn(false);

          // Go back to login menu !
          navigation.popToTop();
        }}
      />
    </ScrollView>
  );
}

export default SettingsScreen;
