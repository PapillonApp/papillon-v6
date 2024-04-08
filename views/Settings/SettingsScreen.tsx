import React, { useState, useEffect } from 'react';
import {Alert, ScrollView, Switch} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { unsetBackgroundFetch } from '../../fetch/BackgroundFetch';

import {EyeOff, LogOut, RefreshCw, RotateCw, Trash2} from 'lucide-react-native';
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

import questions from './questions.json';

function SettingsScreen({ navigation }) {
  const [hideNotes, setHideNotes] = useState(false);
  const [deleteAccountAlert, setDeleteAccountAlert] = useState(false);
  const [pronoteTokenActionAlert, setPronoteTokenActionAlert] = useState(false);
  const [skolengoCacheClearAlert, setSkolengoCacheClearAlert] = useState(false);
  const [skolengoReconnectAlert, setSkolengoReconnectAlert] = useState(false);
  const UIColors = GetUIColors();
  const appContext = useAppContext();

  async function getData() {
    let hideNotesTab = await AsyncStorage.getItem('hideNotesTab');
    setHideNotes(hideNotesTab === 'true');
  }

  useEffect(() => {
    getData();
  }, []);

  const confirmDisabling = (then = () => {}, invalid = false) => {
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    const { question, response } = randomQuestion;
    const randomizedResponse = response
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    const button = randomizedResponse.map(res => ({
      text: res.text,
      onPress: () => {
        if (res.valid) {
          then();
        } else {
          confirmDisabling(then, true);
        }
      }
    }));

    button.push({ text: 'Annuler', style: 'cancel' });

    Alert.alert(
      invalid ? 'Réponse incorrecte' : 'Confirmation de votre choix',
      `Afin de confirmer votre choix, merci de répondre à la question suivante :\n${question}`,
      button
    );
  };

  function switchHideNotes() {
    if (!hideNotes) {
      Alert.alert(
        'Voulez-vous vraiment désactiver l\'onglet note ?',
        'Vos notes seront masquées. Un redémmarage peut-être requis.',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            onPress: async () => {
              setHideNotes(true);
              await AsyncStorage.setItem('hideNotesTab', 'true');
            },
            style: 'destructive',
            text: 'Continuer',
          },
        ]
      );
    } else {
      Alert.alert(
        'Voulez-vous vraiment réactiver l\'onglet note ?',
        'Vos notes seront de nouveau visible dans l\'onglet note. Un redémmarage peut-être requis.',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            onPress: () => {
              confirmDisabling(() => {
                setHideNotes(false);
                AsyncStorage.setItem('hideNotesTab', 'false');
              });
            },
            style: 'destructive',
            text: 'Continuer',
          },
        ]
      );
    }
  }

  async function getData() {
    let hideNotesTab = await AsyncStorage.getItem('hideNotesTab');
    setHideNotes(hideNotesTab === 'true');
  }

  React.useEffect( () => {
    getData();
  }, []);

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
        header="Avancé"
        inset
      >
        <NativeItem
          leading={<EyeOff size={24} color={UIColors.text}/>}
          trailing={
            <Switch
              value={hideNotes}
              onValueChange={() => switchHideNotes()}
            />
          }
        >
          <NativeText heading="h4">
            Désactiver l'onglet notes
          </NativeText>
          <NativeText heading="p2">
            Vos notes ne seront plus accessibles
          </NativeText>
        </NativeItem>
      </NativeList>

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
          AsyncStorage.setItem('preventNotifInit', 'true'); //to prevent notif to re-init after logout (app stack still displayed for a few second before re-rendering)
          // Create a new provider since we're resetting everything.
          try {
            appContext.setDataProvider(new IndexDataInstance());
          }
          catch (e) {
            console.error('Error while creating new data provider', e);
          }
          appContext.setLoggedIn(false);
          unsetBackgroundFetch();
          showMessage({
            message: 'Déconnecté avec succès',
            type: 'success',
            icon: 'auto',
            floating: true,
          });
          // Go back to login menu !
          navigation.popToTop();
          navigation.getParent()?.popToTop();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
      />
    </ScrollView>
  );
}

export default SettingsScreen;
