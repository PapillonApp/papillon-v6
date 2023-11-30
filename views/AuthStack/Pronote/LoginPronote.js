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

import LinearGradient from 'react-native-linear-gradient';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme, Text, Switch } from 'react-native-paper';

import { showMessage } from 'react-native-flash-message';

import { useState } from 'react';

import { UserCircle, KeyRound } from 'lucide-react-native';
import { getENTs, getInfo, getToken } from '../../../fetch/AuthStack/LoginFlow';

import PapillonButton from '../../../components/PapillonButton';
import GetUIColors from '../../../utils/GetUIColors';
import { useAppContext } from '../../../utils/AppContext';

const entities = require('entities');

function LoginPronote({ route, navigation }) {
  const theme = useTheme();
  const { showActionSheetWithOptions } = useActionSheet();

  const { etab, useDemo } = route.params;
  // eslint-disable-next-line no-unused-vars
  const [etabName, setEtabName] = useState(etab.nomEtab);
  const [etabInfo, setEtabInfo] = useState(etab);

  // eslint-disable-next-line no-unused-vars
  const [useEduconnect, setUseEduconnect] = React.useState(false);

  const [isENTUsed, setIsENTUsed] = React.useState(false);
  const onToggleSwitch = () => setIsENTUsed(!isENTUsed);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: `Se connecter à ${etab.nomEtab}`,
    });
  }, [navigation]);

  let CAS = null;
  const [ENTs, setENTs] = useState([]);

  function removeSubdomain(hostname) {
    if (!hostname) return;

    let domain = hostname.split('.');

    if (domain.length > 2) {
      // remove everything except the last two parts
      domain = domain.slice(domain.length - 2, domain.length);

      return domain.join('.');
    }

    return hostname;
  }

  React.useEffect(() => {
    getENTs(etab.url).then((result) => {
      CAS = result.CAS;
      navigation.setOptions({});

      setEtabInfo(result);
      setEtabName(result.nomEtab);

      const hostname = CAS.casURL.split('/')[2];

      getInfo().then((r) => {
        const ents = r?.ent_list;

        // find all ent in ents where url = hostname
        const entList = ents.filter(
          (ent) => removeSubdomain(ent.url) === removeSubdomain(hostname)
        );

        let ent = entList[0];

        if (entList.length > 1) {
          showActionSheetWithOptions(
            {
              title: 'Choisissez votre ENT',
              options: entList.map((_ent) => _ent.name),
              cancelButtonIndex: entList.length,
              tintColor: UIColors.primary,
            },
            (buttonIndex) => {
              if (buttonIndex < entList.length) {
                ent = entList[buttonIndex];
                setENTs(ent);

                if (ent?.educonnect) {
                  setUseEduconnect(ent.educonnect);
                } else {
                  setUseEduconnect(false);
                }

                if (ent) {
                  setIsENTUsed(true);
                }
              }
            }
          );
        }

        setENTs(ent);

        if (ent?.educonnect) {
          setUseEduconnect(ent.educonnect);
        } else {
          setUseEduconnect(false);
        }

        if (ent) {
          setIsENTUsed(true);
        }
      });
    });
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [connecting, setConnecting] = useState(false);

  const appctx = useAppContext();

  function login() {
    const credentials = {
      username,
      password,
      url: etab.url.toLowerCase(),
      ent: isENTUsed ? ENTs.py : '',
    };

    if (!isENTUsed && ENTs !== undefined && ENTs.py !== undefined) {
      credentials.url += '?login=true';
    }

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
    getToken(credentials).then((result) => {
      setConnecting(false);
      const token = result.token;

      if (!token) {
        let errorMessage = ""
        if(result.error) {
          if(result.error.includes("probably wrong login")) errorMessage = "Vos identifiants semblent incorrects. Veuillez les vérifier."
          else errorMessage = "Une erreur s'est produite (" + result.error + ")"
        }
        else errorMessage = "Une erreur indéterminée s'est produite."
        Alert.alert(
          'Échec de la connexion',
          errorMessage,
          [
            {
              text: 'OK',
              style: 'cancel',
            },
          ]
        );
      } else {
        AsyncStorage.setItem('token', token);
        AsyncStorage.setItem('credentials', JSON.stringify(credentials));
        AsyncStorage.setItem('service', 'Pronote');

        showMessage({
          message: 'Connecté avec succès',
          type: 'success',
          icon: 'auto',
          floating: true,
        });

        appctx.dataprovider.service = 'Pronote';
        appctx.dataprovider.init('Pronote').then(() => {
          navigation.goBack();
          navigation.goBack();
          appctx.setLoggedIn(true);
        });
      }
    });
  }

  React.useEffect(() => {
    if (useDemo) {
      setUsername('demonstration');
      setPassword('pronotevs');
    }
  }, []);

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

      <LinearGradient
        style={styles.loginHeader}
        colors={['#159C5E55', UIColors.background]}
        locations={[0, 1]}
      >
        <Image
          style={styles.loginHeaderLogo}
          // eslint-disable-next-line global-require
          source={require('../../../assets/logo_pronote.png')}
        />
        <Text style={styles.loginHeaderText}>
          {entities.decodeHTML(etab.nomEtab)}
        </Text>

        {!isENTUsed ? (
          <Text style={styles.loginHeaderDescription}>
            Connexion via Pronote
          </Text>
        ) : (
          <Text style={styles.loginHeaderDescription}>
            Connexion avec l'ENT {ENTs.name}
          </Text>
        )}
      </LinearGradient>

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
          {ENTs !== undefined && ENTs.length !== 0 ? (
            <View
              style={[
                styles.switchGroup,
                {
                  borderTopWidth: 1,
                  borderColor: theme.dark ? '#191919' : '#e5e5e5',
                },
              ]}
            >
              <View style={{ width: '80%' }}>
                <Text style={{ opacity: 0.5 }}>Se connecter avec l'ENT</Text>
                <Text
                  style={{ fontSize: 16, fontWeight: 500, maxWidth: '100%' }}
                >
                  {ENTs.name}
                </Text>
              </View>
              <Switch value={isENTUsed} onValueChange={onToggleSwitch} />
            </View>
          ) : null}
        </View>

        <View style={[styles.buttons]}>
          <PapillonButton
            title="Se connecter"
            color="#159C5E"
            onPress={() => login()}
            style={[styles.button]}
            right={connecting && <ActivityIndicator color="#ffffff" />}
          />
        </View>

        <View style={[styles.bottomText]}>
          <Text style={[styles.bottomTextText]}>
            En vous connectant, vous acceptez les{' '}
            <Text style={{ fontWeight: 'bold' }}>conditions d'utilisation</Text>{' '}
            de Papillon.
          </Text>

          {etabInfo.version && etabInfo.version.length > 0 ? (
            <Text style={[styles.bottomTextText]}>
              Pronote Espace Élèves ver. {etabInfo.version.join('.')}
            </Text>
          ) : null}
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
    marginTop: -10,
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

export default LoginPronote;
