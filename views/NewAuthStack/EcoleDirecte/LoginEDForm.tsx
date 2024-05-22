import React from 'react';

import {
  ScrollView,
  View,
  StyleSheet,
  Platform,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Image, Alert, TouchableOpacity,
} from 'react-native';

import * as Haptics from 'expo-haptics';

import {UserCircle, KeyRound, AlertTriangle, Link2, Check} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { showMessage } from 'react-native-flash-message';
import { useTheme, Text } from 'react-native-paper';

import PapillonButton from '../../../components/PapillonButton';
import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';

import AlertBottomSheet from '../../../interface/AlertBottomSheet';

import GetUIColors from '../../../utils/GetUIColors';
import { useAppContext } from '../../../utils/AppContext';
import ModalBottom from '../../../interface/ModalBottom';

import { AsyncStorageEcoleDirecteKeys } from '../../../fetch/EcoleDirecteData/connector';
import { EDCore } from '@papillonapp/ed-core';
import { v4 as uuidv4 } from 'uuid';
import CheckAnimated from '../../../interface/CheckAnimated';
import NativeText from '../../../components/NativeText';
import { doubleauthResData } from '@papillonapp/ed-core/dist/src/types/v3';
import PapillonCloseButton from '../../../interface/PapillonCloseButton';


function LoginEDForm({ route, navigation }: {
  navigation: any; // TODO
  route: {

  }
}) {
  const theme = useTheme();

  const [errorAlert, setErrorAlert] = React.useState(false);
  const [stringErrorAlert, setStringErrorAlert] = React.useState(false);
  const [urlAlert, setURLAlert] = React.useState(false);


  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [connecting, setConnecting] = React.useState(false);

  const [isDoubleAuthEnabled, setDoubleAuthEnabled] = React.useState(false);
  const [doubleAuthObject, setDoubleAuthObject] = React.useState({ question: '', propositions: [] } as doubleauthResData);
  const [doubleAuthToken, setDoubleAuthToken] = React.useState('');

  const [doubleAuthAnswer, setDoubleAuthAnswer] = React.useState('');

  const selectDoubleAuthAnwser = (answer) => {
    setDoubleAuthAnswer(answer);
  };

  const appContext = useAppContext();
  const UIColors = GetUIColors();


  const makeUUID = (): string => {
    return uuidv4();
  };

  let ed = new EDCore();

  const handleConnection = async (uuid: string) => {
    if(ed._token && ed._accessToken) {

      await AsyncStorage.multiSet([
        [AsyncStorageEcoleDirecteKeys.TOKEN, ed._token],
        [AsyncStorageEcoleDirecteKeys.DEVICE_UUID, uuid],
        [AsyncStorageEcoleDirecteKeys.USERNAME, username],
        [AsyncStorageEcoleDirecteKeys.ACCESS_TOKEN, ed._accessToken]
      ]);
    }

    setConnecting(false);

    showMessage({
      message: 'Connecté avec succès',
      type: 'success',
      icon: 'auto',
    });

    await appContext.dataProvider!.init('ecoledirecte', ed);
    await AsyncStorage.setItem('service', 'ecoledirecte');

    navigation.goBack();
    navigation.goBack();
    appContext.setLoggedIn(true);
  };

  const handleLogin = async () => {
    if (username.trim() === '' || password.trim() === '') {
      setStringErrorAlert(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    let uuid = makeUUID();

    try {
      setConnecting(true);

      await ed.auth.login(username, password, uuid);

      await handleConnection(uuid);
    } catch(err: any) {
      setConnecting(false);
      const errorCode = err.code ? err.code: 0;

      // Doubleauth handling
      if (errorCode == 12) {
        const token = await ed.auth.get2FAToken(username, password);
        const QCM = await ed.auth.get2FA(token);
        setDoubleAuthToken(token);
        setDoubleAuthObject(QCM);
        setDoubleAuthEnabled(true);
        return;
      }


      setErrorAlert(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };


  const sendA2FAnswer = async () => {
    setConnecting(true);
    ed._token = doubleAuthToken;
    const authFactors = await ed.auth.resolve2FA(doubleAuthAnswer).catch((err) => {
      console.log(err);
      setErrorAlert(true);
    });
    setDoubleAuthEnabled(false);
    let uuid = makeUUID();

    await ed.auth.login(username, password, uuid, authFactors ?? undefined);

    await handleConnection(uuid);
  };

  return (
    <>
      <LinearGradient
        colors={[UIColors.modalBackground, UIColors.modalBackground + '00']}
        locations={[0, 1]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 100,
          zIndex: 9999,
        }}
      />
      <ScrollView style={{ backgroundColor: UIColors.modalBackground }}>
        <ModalBottom
          visible={isDoubleAuthEnabled}
          onDismiss={() => {
            setDoubleAuthEnabled(false);
          }}
          align='bottom'
          style={[
            {
              backgroundColor: '#000000',
              borderColor: '#ffffff32',
              borderWidth: 1,
              elevation : 0,
            }
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              maxWidth: '100%',
              paddingHorizontal: 16,
              paddingVertical: 12,
              paddingBottom: 8,
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <View
              style={{
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <NativeText heading='h4' style={{ color: '#fff' }}>
                La double authentification est activée
              </NativeText>
              <NativeText heading='p2' style={{ color: '#fff' }}>
                Répondez à la question pour vous connecter
              </NativeText>
              <NativeText style={{ color: '#fff', marginBottom: 10, marginTop: 10 }} heading='h4'>
                {doubleAuthObject.question}
              </NativeText>
            </View>
          </View>
          <ScrollView
            style={styles.doubleAuthModalScroll}
          >
            <NativeList
              sectionProps={{
                hideSeparator: true,
                hideSurroundingSeparators: true,
              }}
            >
              {doubleAuthObject.propositions.map((answer, index) => (
                <NativeItem
                  key={index}
                  onPress={() => selectDoubleAuthAnwser(answer)}
                  backgroundColor={UIColors.background}
                  cellProps={{
                    contentContainerStyle: {
                      paddingVertical: 3,
                    },
                    backgroundColor: UIColors.background,
                  }}

                  trailing={
                    <CheckAnimated
                      checked={answer === doubleAuthAnswer }
                      pressed={() => selectDoubleAuthAnwser(answer)}
                      backgroundColor={UIColors.background}
                    />
                  }
                >
                  <NativeText heading="p">
                    {answer}
                  </NativeText>
                </NativeItem>
              ))}
            </NativeList>
          </ScrollView>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              maxWidth: '100%',
              paddingHorizontal: 16,
              paddingVertical: 12,
              paddingBottom: 8,
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <TouchableOpacity
              style={[styles.startButton, {
                backgroundColor: doubleAuthAnswer !== '' ? UIColors.primary : UIColors.text + '40',
              }]}
              activeOpacity={doubleAuthAnswer !== '' ? 0.5 : 1}
              onPress={() => sendA2FAnswer()}
            >
              <NativeText style={[styles.startText]}>
                Confirmer
              </NativeText>
            </TouchableOpacity>
          </View>
        </ModalBottom>

        <AlertBottomSheet
          title="Échec de la connexion"
          subtitle="Vérifiez vos identifiants et réessayez."
          visible={errorAlert}
          icon={<AlertTriangle />}
          cancelAction={() => setErrorAlert(false)}
        />

        <AlertBottomSheet
          title="Échec de la connexion"
          subtitle="Veuillez remplir tous les champs."
          visible={stringErrorAlert}
          icon={<AlertTriangle />}
          cancelAction={() => setStringErrorAlert(false)}
        />

        <AlertBottomSheet
          visible={urlAlert}
          title="Erreur de connexion"
          subtitle="Imposible de se connecter."
          icon={<Link2 />}
          cancelAction={() => setURLAlert(false)}
        />

        {Platform.OS === 'ios' ? (
          <StatusBar animated barStyle="light-content" />
        ) : (
          <StatusBar
            animated
            barStyle={theme.dark ? 'light-content' : 'dark-content'}
            backgroundColor="transparent"
          />
        )}

        {Platform.OS === 'android' ? <View style={{ height: 24 }} /> : null}

        <View style={styles.loginHeader}>
          <Image
            style={styles.loginHeaderLogo}
            source={require('../../../assets/logo_modern_ed.png')}
          />

          <Text style={styles.loginHeaderDescription}>
            Identifiants EcoleDirecte
          </Text>
        </View>

        {Platform.OS === 'android' ? <View style={{ height: 15 }} /> : null}

        <NativeList inset>
          <NativeItem
            leading={
              <UserCircle
                color={theme.dark ? '#fff' : '#000'}
                style={{ opacity: 0.5 }}
              />
            }
          >
            <TextInput
              placeholder="Identifiant"
              placeholderTextColor={theme.dark ? '#ffffff55' : '#00000055'}
              style={[styles.nginput, { color: UIColors.text }]}
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
          </NativeItem>
          <NativeItem
            leading={
              <KeyRound
                color={theme.dark ? '#fff' : '#000'}
                style={{ opacity: 0.5 }}
              />
            }
          >
            <TextInput
              placeholder="Mot de passe"
              placeholderTextColor={theme.dark ? '#ffffff55' : '#00000055'}
              style={[styles.nginput, { color: UIColors.text }]}
              value={password}
              secureTextEntry
              onChangeText={(text) => setPassword(text)}
            />
          </NativeItem>
        </NativeList>

        <View
          style={[
            styles.loginForm,
            Platform.OS !== 'ios' && styles.loginFormAndroid,
          ]}
        >
          <View style={[styles.buttons]}>
            <PapillonButton
              left={null}
              light={null}
              title="Se connecter"
              color="#15529c"
              onPress={() => handleLogin()}
              style={[styles.button]}
              right={connecting && <ActivityIndicator color="#ffffff" />}
            />
          </View>

          {Platform.OS === 'android' ? <View style={{ height: 15 }} /> : null}

          <View style={[styles.bottomText]}>
            <Text style={[styles.bottomTextText]}>
              En vous connectant, vous acceptez les{' '}
              <Text style={{ fontWeight: 'bold' }}>
                conditions d'utilisation
              </Text>{' '}
              de Papillon.
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  doubleAuthModalScroll: {
    height: 300,
  },
  startButton: {
    borderRadius: 300,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    width: '100%',
  },
  startText: {
    fontSize: 16,
    fontFamily: 'Papillon-Semibold',
    color: '#ffffff',
  },
  loginHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 70,
    paddingHorizontal: 28,
    paddingBottom: 18,
  },
  loginHeaderLogo: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
  },
  loginHeaderText: {
    fontSize: 18,
    fontFamily: 'Papillon-Semibold',
    marginTop: 16,
    textAlign: 'center',
  },
  loginHeaderDescription: {
    fontSize: 15,
    marginTop: 2,
    opacity: 0.5,
    textAlign: 'center',
  },
  loginHeaderError: {
    fontSize: 15,
    marginTop: 10,
    color: '#159C5E',
    fontWeight: 500,
    textDecorationLine: 'underline',
  },

  loginForm: {
    marginTop: -10,
  },
  loginFormAndroid: {
    marginTop: 0,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 13,
  },
  loginGroup: {
    marginHorizontal: 14,
    marginVertical: 14,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    overflow: 'hidden',
  },
  loginTextInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 16,
  },
  loginTextInputText: {
    fontSize: 15,
    flex: 1,
  },
  loginGroupIcon: {
    opacity: 0.5,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 15,
    gap: 8,
  },
  button: {
    marginTop: 8,
    flex: 1,
  },

  bottomText: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    gap: 4,
  },

  bottomTextText: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.5,
  },

  nginput: {
    fontSize: 16,
    fontFamily: 'Papillon-Medium',
    paddingVertical: 4,
  },

  instructionsText: {
    fontSize: 16,
    fontFamily: 'Papillon-Medium',
    paddingHorizontal: 16,
    paddingVertical: 6,
    opacity: 0.5,
  },
});

export default LoginEDForm;
