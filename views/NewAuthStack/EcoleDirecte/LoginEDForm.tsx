import React from 'react';

import {
  ScrollView,
  View,
  StyleSheet,
  Platform,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';

import * as Haptics from 'expo-haptics';

import { UserCircle, KeyRound, AlertTriangle, Link2 } from 'lucide-react-native';
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

import { AsyncStorageEcoleDirecteKeys } from '../../../fetch/EcoleDirecteData/EcoleDirecteCache';
import { EDCore } from '@papillonapp/ed-core';


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

  const appContext = useAppContext();
  const UIColors = GetUIColors();






  const handleLogin = async () => {
    if (username.trim() === '' || password.trim() === '') {
      setStringErrorAlert(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setConnecting(true);

      let ed = new EDCore();

      await ed.auth.login(username, password);

      await AsyncStorage.multiSet([
        [AsyncStorageEcoleDirecteKeys.TOKEN, ed._token],
        [AsyncStorageEcoleDirecteKeys.USER, JSON.stringify(ed.student)],
        //[AsyncStorageEcoleDirecteKeys.PASSWORD, Buffer.from(password).toString("base64")],
      ]);

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
    } catch(err) {
      console.log(err)
      setConnecting(false);
      setErrorAlert(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
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
});

export default LoginEDForm;
