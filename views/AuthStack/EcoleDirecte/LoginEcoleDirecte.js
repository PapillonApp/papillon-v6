import * as React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Platform,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';

import { useActionSheet } from '@expo/react-native-action-sheet';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { School } from 'lucide-react-native';


import { useTheme, Text, Switch } from 'react-native-paper';

import ListItem from '../../../components/ListItem';

import { showMessage } from 'react-native-flash-message';

import { useState } from 'react';

import { UserCircle, KeyRound } from 'lucide-react-native';

import PapillonButton from '../../../components/PapillonButton';
import GetUIColors from '../../../utils/GetUIColors';
import { useAppContext } from '../../../utils/AppContext';

import ED from 'papillon-ed-core';

//const entities = require('entities');

function LoginEcoleDirecte({ route, navigation }) {
  const theme = useTheme();
  //const { showActionSheetWithOptions } = useActionSheet();


  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: `Se connecter avec EcoleDirecte`,
    });
  }, [navigation]);


  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [connecting, setConnecting] = useState(false);

  const appctx = useAppContext();

  function login() {
    const credentials = {
      username,
      password,
    };


    if (
      credentials.username.trim() === '' ||
      credentials.password.trim() === ''
    ) {
      showMessage({
        message: 'Échec de la connexion',
        description: 'Veuillez remplir tous les champs.',
        type: 'danger',
        icon: 'auto',
        floating: true,
        duration: 5000,
      });
      return;
    }

    setConnecting(true);

    let ed = new ED();

    ed.auth.login(username, password).then(() => {

      AsyncStorage.setItem('token', ed._token);
      AsyncStorage.setItem('ED_ID', JSON.stringify(ed.student.id));
      AsyncStorage.setItem('credentials', JSON.stringify(credentials));
      AsyncStorage.setItem('service', 'EcoleDirecte');

      showMessage({
        message: 'Connecté avec succès',
        type: 'success',
        icon: 'auto',
        floating: true,
      });

      appctx.dataprovider.service = 'EcoleDirecte';
      appctx.dataprovider.init('EcoleDirecte').then(() => {
        navigation.goBack();
        navigation.goBack();
        appctx.setLoggedIn(true);
      });
      
    }).catch(err => {
      setConnecting(false);
      Alert.alert(
        'Échec de la connexion',
        'Vérifiez vos identifiants et réessayez.',
        [
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    })
  }


  const UIColors = GetUIColors();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
    >
      {Platform.OS === 'ios' ? (
        <StatusBar animated barStyle="light-content" />
      ) : (
        <StatusBar
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
      )}

        <ListItem
          title="Connexion avec ÉcoleDirecte"
          subtitle="Vous pouvez vous connecter à l'aide de vos identifiants ÉcoleDirecte."
          icon={<School color="#0062A6" />}
          color="#fff"
          style={{ marginTop: 12 }}
        />

      

      <View style={[styles.loginForm]}>
        <View
          style={[
            styles.loginGroup,
            {
              backgroundColor: theme.dark ? '#111' : '#fff',
              borderColor: theme.dark ? '#191919' : '#e5e5e5',
            },
          ]}
        >
          <LoginTextInput
            label="Identifiant"
            icon={
              <UserCircle
                style={styles.loginGroupIcon}
                color={theme.dark ? '#fff' : '#000'}
              />
            }
            value={username}
            onChangeText={(text) => setUsername(text)}
            style={{ borderBottomWidth: 1 }}
          />
          <LoginTextInput
            label="Mot de passe"
            icon={
              <KeyRound
                style={styles.loginGroupIcon}
                color={theme.dark ? '#fff' : '#000'}
              />
            }
            value={password}
            secureTextEntry
            onChangeText={(text) => setPassword(text)}
          />
          
        </View>

        <View style={[styles.buttons]}>
          <PapillonButton
            title="Se connecter"
            color="#0062A6"
            onPress={() => login()}
            style={[styles.button]}
            right={connecting && <ActivityIndicator color="#ffffff" />}
          />
        </View>

        
      </View>
    </ScrollView>
  );
}

function LoginTextInput({
  label,
  icon,
  value,
  onChangeText,
  secureTextEntry,
  style,
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.loginTextInput,
        { borderColor: theme.dark ? '#191919' : '#e5e5e5' },
        style,
      ]}
    >
      {icon}
      <TextInput
        style={[
          styles.loginTextInputText,
          { color: theme.dark ? '#fff' : '#000' },
        ]}
        placeholder={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={theme.dark ? '#ffffff55' : '#00000055'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loginHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 28,
    paddingBottom: 28,
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
    marginTop: 12,
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
    marginHorizontal: 14,
    gap: 8,
  },
  button: {
    marginTop: 8,
    flex: 1,
  },

  bottomText: {
    marginHorizontal: 14,
    marginTop: 16,
    marginBottom: 32,
    gap: 4,
  },

  bottomTextText: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.5,
  },
});

export default LoginEcoleDirecte;
