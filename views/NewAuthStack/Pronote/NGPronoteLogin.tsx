import * as React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Platform,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Image,
  Switch,
  Dimensions
} from 'react-native';

import { useActionSheet } from '@expo/react-native-action-sheet';

import LinearGradient from 'react-native-linear-gradient';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme, Text } from 'react-native-paper';

import { showMessage } from 'react-native-flash-message';

import { useState } from 'react';

import { UserCircle, KeyRound, AlertTriangle } from 'lucide-react-native';
import { getENTs, getInfo, getToken } from '../../../fetch/AuthStack/LoginFlow';

import PapillonButton from '../../../components/PapillonButton';
import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';

import AlertBottomSheet from '../../../interface/AlertBottomSheet';

import GetUIColors from '../../../utils/GetUIColors';
import { useAppContext } from '../../../utils/AppContext';

import SegmentedControl from 'react-native-segmented-control-2';

function NGPronoteLogin({ route, navigation }) {
  const theme = useTheme();
  const { showActionSheetWithOptions } = useActionSheet();

  const { etab, useDemo } = route.params as {
    etab: { nomEtab: string, url: string }
    useDemo?: boolean
  };

  const [etabName, setEtabName] = useState(etab.nomEtab);
  const [etabInfo, setEtabInfo] = useState(etab);

  const [useEduconnect, setUseEduconnect] = React.useState(false);

  const [errorAlert, setErrorAlert] = useState(false);

  const [isENTUsed, setIsENTUsed] = React.useState(false);
  const onToggleSwitch = () => setIsENTUsed(!isENTUsed);

  const onToggleParent = () => setModeParent(!modeParent);

  let CAS = null;
  const [ENTs, setENTs] = useState([]);

  const [modeParent, setModeParent] = useState(false);

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
    let finalURL = etab.url.toLowerCase();

    const credentials = {
      username,
      password,
      url: finalURL,
      ent: isENTUsed ? ENTs.py : '',
      parent: modeParent,
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
        setErrorAlert(true);
      } else {
        AsyncStorage.setItem('token', token);
        AsyncStorage.setItem('credentials', JSON.stringify(credentials));
        AsyncStorage.setItem('service', 'Pronote');

        showMessage({
          message: 'Connecté avec succès',
          type: 'success',
          icon: 'auto',
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
      <ScrollView
        style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
      >

        <AlertBottomSheet
          title="Échec de la connexion"
          subtitle="Vérifiez vos identifiants et réessayez."
          visible={errorAlert}
          icon={<AlertTriangle/>}
          cancelAction={() => setErrorAlert(false)}
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

        {Platform.OS === 'android' ? (
          <View style={{ height: 24 }} />
        ) : null}

        <View
          style={styles.loginHeader}
        >
          <Image
            style={styles.loginHeaderLogo}
            source={require('../../../assets/logo_pronote.png')}
          />
          <Text style={styles.loginHeaderText}>
            {entities.decodeHTML(etab.nomEtab)}
          </Text>

          {!isENTUsed ? (
            <Text style={styles.loginHeaderDescription}>
            Identifiants PRONOTE
            </Text>
          ) : (
            <Text style={styles.loginHeaderDescription}>
              {ENTs.name}
            </Text>
          )}
        </View>


        { Platform.OS === 'ios' ? (
          <SegmentedControl
            tabs={['Espace élèves', 'Espace parents']}
            width={
              Dimensions.get('window').width > 600 ? 600 : undefined
            }
            style={{ 
              backgroundColor: UIColors.text + '12',
              marginHorizontal: 15,
              alignSelf: 'center',
            }}
            activeTabColor={
              theme.dark ? '#333333' :
                UIColors.element
            }
            activeTextColor={UIColors.text}
            textStyle={{ color: UIColors.text + '55' }}
            onChange={(index) => {
              setModeParent(index === 1);
            }}
          />
        ) : (
          <SegmentedControl
            tabs={['Espace élèves', 'Espace parents']}
            style={{ 
              backgroundColor: UIColors.text + '00',
              marginHorizontal: 15,
              borderRadius: 0,
              height: 42,
            }}
            tabStyle={{
              borderRadius: 0,
            }}
            selectedTabStyle={{
              borderRadius: 0,
              elevation: 0,
              borderBottomColor: UIColors.primary,
              borderBottomWidth: 2,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
            activeTabColor={
              UIColors.primary + '00'
            }
            activeTextColor={UIColors.primary}
            textStyle={{ color: UIColors.text + '55', marginTop: -2, fontSize:16, fontFamily: 'Papillon-Semibold' }}
            onChange={(index) => {
              setModeParent(index === 1);
            }}
          />
        )}

        {Platform.OS === 'android' ? (
          <View style={{ height: 15 }} />
        ) : null}

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
              style={[styles.nginput, {color: UIColors.text}]}
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
              style={[styles.nginput, {color: UIColors.text}]}
              value={password}
              secureTextEntry
              onChangeText={(text) => setPassword(text)}
            />
          </NativeItem>

          {ENTs !== undefined && ENTs.length !== 0 ? (
            <NativeItem
              trailing={
                <Switch value={isENTUsed} onValueChange={onToggleSwitch} color={UIColors.primary} />
              }
            >
              <View style={{paddingVertical: 4, gap:2}}>
                <NativeText heading="p2" style={{fontSize: 15}}>
                Se connecter avec l'ENT
                </NativeText>
                <NativeText heading="h4">
                  {ENTs.name}
                </NativeText>
              </View>
            </NativeItem>
          ) : <View/>}
        </NativeList>

        <View style={[styles.loginForm, Platform.OS !== 'ios' && styles.loginFormAndroid]}>
          <View style={[styles.buttons]}>
            <PapillonButton
              title="Se connecter"
              color="#159C5E"
              onPress={() => login()}
              style={[styles.button]}
              right={connecting && <ActivityIndicator color="#ffffff" />}
            />
          </View>

          {Platform.OS === 'android' ? (
            <View style={{ height: 15 }} />
          ) : null}

          { modeParent ? (
            <NativeList inset>
              <NativeItem
                leading={
                  <AlertTriangle
                    color={'#FFC107'}
                  />
                }
              >
                <NativeText heading="h4">
              Support des comptes parents en beta
                </NativeText>
                <NativeText heading="p2">
              Il est possible que certaines fonctionnalités ne soient pas disponibles ou ne fonctionnent pas correctement.
                </NativeText>
              </NativeItem>
            </NativeList>
          ) : null }

          <View style={[styles.bottomText]}>
            <Text style={[styles.bottomTextText]}>
            En vous connectant, vous acceptez les{' '}
              <Text style={{ fontWeight: 'bold' }}>conditions d'utilisation</Text>{' '}
            de Papillon.
            </Text>

            {etabInfo.version && etabInfo.version.length > 0 ? (
              <Text style={[styles.bottomTextText]}>
              Pronote Espace {!modeParent ? 'Élèves' : 'Parents'} ver. {etabInfo.version.join('.')}
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </>
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

export default NGPronoteLogin;
