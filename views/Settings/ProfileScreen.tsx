import React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  StatusBar,
  Platform,
  Alert,
  Keyboard,
  KeyboardEventListener,
} from 'react-native';
import {
  useTheme,
  Button as PaperButton,
  Text,
  Portal,
  Dialog,
  TextInput,
} from 'react-native-paper';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';

import { BlurView } from 'expo-blur';

import {
  Mail,
  Phone,
  Edit,
  Pencil,
  Trash2,
  Contact2,
  Lock,
  UserCircle2,
} from 'lucide-react-native';

import GetUIColors from '../../utils/GetUIColors';
import { useAppContext } from '../../utils/AppContext';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import { LinearGradient } from 'expo-linear-gradient';

import AlertBottomSheet from '../../interface/AlertBottomSheet';
import { PapillonUser } from '../../fetch/types/user';

function ProfileScreen() {
  const theme = useTheme();
  const UIColors = GetUIColors();
  const appContext = useAppContext();

  const [userData, setUserData] = React.useState<PapillonUser | null>(null);
  const [profilePicture, setProfilePicture] = React.useState('');
  const [resetProfilePictureAlert, setResetProfilePictureAlert] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const user = await appContext.dataProvider.getUser();

      setUserData(user);
      setProfilePicture(user.profile_picture);
    })();
  }, []);

  const [shownINE, setShownINE] = React.useState('');
  async function toggleINEReveal () {
    if (!shownINE) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Veuillez vous authentifier pour afficher votre INE',
        cancelLabel: 'Annuler',
        disableDeviceFallback: true,
      });

      if (result.success) {
        setShownINE(userData.ine);
      }
    } else {
      setShownINE('');
    }
  }

  async function updateCustomProfilePicture() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      let uri = result.assets[0].uri;

      FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      }).then((base64) => {
        AsyncStorage.setItem('custom_profile_picture', 'data:image/png;base64,' + base64);
        setProfilePicture('data:image/png;base64,' + base64);
      });
    }
  }

  async function clearCustomProfilePicture() {
    await AsyncStorage.removeItem('custom_profile_picture');
    const profilePicture = await AsyncStorage.getItem('old_profile_picture');
    setProfilePicture(profilePicture);
  }

  function promptClearCustomUserName() {
    Alert.alert(
      'Réinitialiser le nom utilisé',
      'Êtes-vous sûr de vouloir réinitialiser le nom utilisé ?',
      [
        {
          text: 'Réinitialiser',
          isPreferred: true,
          onPress: clearCustomUserName,
          style: 'destructive',
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  }

  async function clearCustomUserName() {
    const realName = await AsyncStorage.getItem('old_name');
    if (!realName) return;

    setUserData({ ...userData, name: realName });
    await AsyncStorage.removeItem('custom_name');
  }

  const [androidNamePromptVisible, setAndroidNamePromptVisible] = React.useState(false);
  const [androidNamePrompt, setAndroidNamePrompt] = React.useState('');

  function promptUpdateCustomUserName() {
    setAndroidNamePrompt(userData ? userData.name : '');

    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Modifier le nom utilisé',
        'Utilisez un prénom ou un pseudonyme différent dans l\'app Papillon',
        [
          {
            text: 'Modifier',
            isPreferred: true,
            onPress: (name) => updateCustomUserName(name),
          },
          {
            text: 'Réinitialiser',
            style: 'destructive',
            onPress: promptClearCustomUserName,
          },
          { text: 'Annuler', style: 'cancel' },
        ],
        'plain-text',
        userData ? userData.name : ''
      );
    } else {
      setAndroidNamePromptVisible(true);
    }
  }

  async function updateCustomUserName (name: string): Promise<void> {
    // If there was no existant custom name before,
    // it means it's the first time we do it.
    const existantCustomName = await AsyncStorage.getItem('custom_name');
    // We should then store current user name to it, so we
    // can revert the action and go back to real user name.
    if (!existantCustomName) {
      await AsyncStorage.setItem('old_name', userData.name);
    }

    await AsyncStorage.setItem('custom_name', name);
    setUserData({ ...userData, name });
  }

  const [bottom, setBottom] = React.useState(0);

  React.useEffect(() => {
    const onKeyboardChange: KeyboardEventListener = (evt) => {
      setBottom(evt.endCoordinates.height / 2);
    };

    if (Platform.OS === 'ios') {
      const subscription = Keyboard.addListener(
        'keyboardWillChangeFrame',
        onKeyboardChange
      );
      return () => subscription.remove();
    }

    const subscriptions = [
      Keyboard.addListener('keyboardDidHide', onKeyboardChange),
      Keyboard.addListener('keyboardDidShow', onKeyboardChange),
    ];

    return () => subscriptions.forEach((subscription) => subscription.remove());
  }, []);

  return (
    <View style={[{ backgroundColor: UIColors.modalBackground, flex: 1 }]}>
      { Platform.OS === 'ios' && (
        <View style={styles.profilePictureBgContainer}>
          {profilePicture && profilePicture !== '' && (
            <Image
              style={styles.profilePictureBg}
              source={{ uri: profilePicture }}
            />
          )}
          <BlurView
            intensity={100}
            style={styles.profilePictureBgOverlay}
          />
          <LinearGradient
            colors={['#00000000', UIColors.modalBackground]}
            style={styles.profilePictureGradientOverlay}
          />
        </View>
      )}
      <ScrollView>
        {Platform.OS === 'ios' ? (
          <StatusBar animated barStyle="light-content" />
        ) : (
          <StatusBar
            animated
            barStyle={theme.dark ? 'light-content' : 'dark-content'}
            backgroundColor="transparent"
          />
        )}

        <Portal>
          <Dialog
            style={{ bottom }}
            visible={androidNamePromptVisible}
            onDismiss={() => setAndroidNamePromptVisible(false)}
          >
            <Dialog.Title>Modifier le nom utilisé</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Entrez un prénom ou un pseudonyme"
                value={androidNamePrompt}
                onChangeText={(text) => setAndroidNamePrompt(text)}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <PaperButton onPress={() => setAndroidNamePromptVisible(false)}>
                Annuler
              </PaperButton>
              <PaperButton
                onPress={() => {
                  promptClearCustomUserName();
                  setAndroidNamePromptVisible(false);
                }}
              >
                Réinitialiser
              </PaperButton>
              <PaperButton
                onPress={() => {
                  updateCustomUserName(androidNamePrompt);
                  setAndroidNamePromptVisible(false);
                }}
              >
                Modifier
              </PaperButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <View style={styles.profileContainer}>
          <Pressable
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            onPress={() => updateCustomProfilePicture()}
          >
            {profilePicture && profilePicture !== '' ? (
              <Image
                style={styles.profilePicture}
                source={{ uri: profilePicture }}
              />
            ) : (
              <UserCircle2
                size={86}
                color={theme.dark ? '#fff' : '#000'}
                style={styles.profilePicture}
              />
            )}

            <View style={[styles.profilePictureEdit]}>
              <Pencil size={18} color="#fff" />
            </View>
          </Pressable>

          <Text style={styles.name}>
            {userData?.name}
          </Text>

          {[userData?.class, userData?.establishment].filter(Boolean).length > 0 && (
            <Text style={styles.userData}>
              {[userData?.class, userData?.establishment].filter(Boolean).join(' - ')}
            </Text>
          )}
        </View>

        <NativeList
          inset
          header="Données de contact"
        >
          {userData?.email && (
            <NativeItem
              leading={<Mail size={24} color="#565EA3" />}
            >
              <NativeText heading="h4">
                Adresse e-mail
              </NativeText>
              <NativeText heading="p2">
                {userData.email}
              </NativeText>
            </NativeItem>
          )}

          {userData?.phone && userData.phone !== '+' && (
            <NativeItem
              leading={<Phone size={24} color="#B9670F" />}
            >
              <NativeText heading="h4">
              Téléphone
              </NativeText>
              <NativeText heading="p2">
                {userData.phone}
              </NativeText>
            </NativeItem>
          )}

          {userData?.ine && userData.ine.length > 0 && (
            <NativeItem
              leading={<Contact2 size={24} color="#0065A8" />}
              onPress={() => toggleINEReveal()}
              trailing={ shownINE === '' &&
                <Lock size={16} color={UIColors.text} style={{ opacity: 0.6 }} />
              }
            >
              <NativeText heading="h4">
              Numéro INE
              </NativeText>
              <NativeText heading="p2">
                {shownINE ? shownINE : 'Appuyez pour révéler'}
              </NativeText>
            </NativeItem>
          )}
        </NativeList>

        <NativeList
          inset
          header="Options"
        >
          <NativeItem
            leading={<Edit size={24} color="#29947A" />}
            onPress={() => promptUpdateCustomUserName()}
          >
            <NativeText heading="h4">
              Modifier le nom utilisé
            </NativeText>
            <NativeText heading="p2">
              Utilisez un prénom ou un pseudonyme différent dans l'app Papillon
            </NativeText>
          </NativeItem>

          <NativeItem
            leading={<Trash2 size={24} color="#D81313" />}
            onPress={() => setResetProfilePictureAlert(true)}
          >
            <NativeText heading="h4">
              Réinitialiser la photo de profil
            </NativeText>
            <NativeText heading="p2">
              Utilise la photo de profil par défaut
            </NativeText>
          </NativeItem>
        </NativeList>

        <AlertBottomSheet
          visible={resetProfilePictureAlert}
          title="Réinitialiser la photo de profil"
          subtitle="Êtes-vous sûr de vouloir réinitialiser la photo de profil ?"
          icon={<Trash2/>}
          color='#D81313'
          primaryButton='Réinitialiser'
          primaryAction={() => clearCustomProfilePicture()}
          cancelButton='Annuler'
          cancelAction={() => setResetProfilePictureAlert(false)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  profilePicture: {
    width: 86,
    height: 86,
    borderRadius: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00000020',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Papillon-Semibold',
    marginBottom: 4,
  },
  userData: {
    fontSize: 15,
    marginBottom: -10,
    opacity: 0.6,
    marginHorizontal: 20,
    textAlign: 'center',
  },
  ListTitle: {
    paddingLeft: 29,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },
  ListTitle2: {
    paddingLeft: 15,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },
  profilePictureEdit: {
    position: 'absolute',
    bottom: 14,
    right: -3,
    backgroundColor: '#29947A',
    borderRadius: 100,
    padding: 6,
    elevation: 2,
    borderColor: '#ffffff20',
    borderWidth: 1,
  },

  infoLocked: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#B42828',
    borderRadius: 70,
    padding: 4,
  },

  profilePictureBgContainer : {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    overflow: 'hidden',
    zIndex: -1,
    opacity: 0.4,
  },

  profilePictureBg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
  },

  profilePictureBgOverlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 5,
  },

  profilePictureGradientOverlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
});

export default ProfileScreen;
