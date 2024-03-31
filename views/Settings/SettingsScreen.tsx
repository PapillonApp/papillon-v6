import React from 'react';
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

function SettingsScreen({ navigation }) {
  const UIColors = GetUIColors();
  const appContext = useAppContext();

  const [pronoteTokenActionAlert, setPronoteTokenActionAlert] = React.useState(false);
  const [skolengoCacheClearAlert, setSkolengoCacheClearAlert] = React.useState(false);
  const [skolengoReconnectAlert, setSkolengoReconnectAlert] = React.useState(false);
  const [deleteAccountAlert, setDeleteAccountAlert] = React.useState(false);
  const [hideNotes, setHideNotes] = React.useState(false);
  async function pronoteRegenerateToken() {
    // Force another initialisation.
    await appContext.dataProvider.init('pronote');
    setPronoteTokenActionAlert(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  function confirmDisabling(then = ()=> {}, invalid = false) {
    let question = [
      {
        question: 'Quelle est la capitale de la France ?',
        response: [
          {text: 'Paris', valid: true},
          {text: 'Madrid', valid: false},
          {text: 'Londres', valid: false},
          {text: 'Berlin', valid: false},
        ]
      },
      {
        question: 'Quelle est la couleur du ciel ?',
        response: [
          {text: 'Bleu', valid: true},
          {text: 'Vert', valid: false},
          {text: 'Jaune', valid: false},
          {text: 'Rouge', valid: false},
        ]
      },
      {
        question: 'Quel est le premier mois de l\'année ?',
        response: [
          {text: 'Janvier', valid: true},
          {text: 'Février', valid: false},
          {text: 'Décembre', valid: false},
          {text: 'Avril', valid: false},
        ]
      },
      {
        question: 'Combien font 2+2 ?',
        response: [
          {text: '22', valid: false},
          {text: '4', valid: true},
          {text: '2', valid: false},
          {text: '18', valid: false},
        ]
      },
      {
        question: 'Combien font 5*5 ?',
        response: [
          {text: '25', valid: true},
          {text: '10', valid: false},
          {text: '15', valid: false},
          {text: '20', valid: false},
        ]
      },
      {
        question: 'Quelle est la première lettre de l\'alphabet ?',
        response: [
          {text: 'A', valid: true},
          {text: 'F', valid: false},
          {text: 'O', valid: false},
          {text: 'B', valid: false},
        ]
      },
      {
        question: 'Quelle est la couleur du soleil ?',
        response: [
          {text: 'Jaune', valid: true},
          {text: 'Bleu', valid: false},
          {text: 'Rouge', valid: false},
          {text: 'Vert', valid: false},
        ]
      },
      {
        question: 'Combien de jours y a-t-il dans une semaine ?',
        response: [
          {text: '7', valid: true},
          {text: '6', valid: false},
          {text: '8', valid: false},
          {text: '5', valid: false},
        ]
      },
      {
        question: 'Combien de doigts avez-vous sur une main ?',
        response: [
          {text: '5', valid: true},
          {text: '4', valid: false},
          {text: '6', valid: false},
          {text: '10', valid: false},
        ]
      },
      {
        question: 'Combien de saisons y a-t-il dans une année ?',
        response: [
          {text: '4', valid: true},
          {text: '3', valid: false},
          {text: '5', valid: false},
          {text: '6', valid: false},
        ]
      },
    ];
    let randomQuestion = question[Math.floor(Math.random() * question.length)];
    let response = randomQuestion.response
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    var button: Array<any> = [];
    response.forEach(res => {
      button.push({
        text: res.text,
        onPress: () => {
          if (res.valid) {
            then();
          } else {
            confirmDisabling(then, true);
          };
        }
      });
    });
    button.push({text: 'Annuler', style: 'cancel'});


    Alert.alert(
      invalid ? 'Réponse incorrect':'Confirmation de votre choix',
      'Afin de confirmer votre choix, merci de répondre à la question suivante :\n' + randomQuestion.question,
      button
    );
  }

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
            Désactiver l'onglet note
          </NativeText>
          <NativeText heading="p2">
            Vos notes seront masqué
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
