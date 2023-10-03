import * as React from 'react';
import {
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  KeyboardAvoidingView,
} from 'react-native';

import { useTheme, Text } from 'react-native-paper';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../../../utils/AppContext';

import GetUIColors from '../../../utils/GetUIColors';

import { loginQR } from '../../../fetch/AuthStack/LoginFlow';

function LoginPronoteQR({ route, navigation }) {
  const theme = useTheme();

  const { qrData } = route.params;

  const UIColors = GetUIColors();

  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [errPin, setErrPin] = React.useState(false);

  const appCtx = useAppContext();

  function makeUUID() {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      (c) => {
        // eslint-disable-next-line no-bitwise
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        // eslint-disable-next-line no-bitwise
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
    return uuid;
  }

  function handleLogin() {
    if (code.length < 4) {
      return;
    }

    loginQR({
      checkCode: code,
      url: qrData.url,
      qrToken: qrData.jeton,
      login: qrData.login,
      uuid: makeUUID(),
    }).then((res) => {
      console.log(res);

      if (res.error) {
        if (res.error === 'invalid confirmation code') {
          setErrPin(true);
          setError('Code invalide');
        }
        if (
          res.error ===
          "('Decryption failed while trying to un pad. (probably bad decryption key/iv)', 'exception happened during login -> probably the qr code has expired (qr code is valid during 10 minutes)')"
        ) {
          setErrPin(true);
          setError('QR-code expiré');
        }
      }

      if (res.error === false && res.token !== false) {
        AsyncStorage.setItem('token', res.token);
        AsyncStorage.setItem('qr_credentials', JSON.stringify(res));
        AsyncStorage.setItem('service', 'Pronote');

        navigation.goBack();
        navigation.goBack();
        navigation.goBack();

        appCtx.setLoggedIn(true);

        Alert.alert(
          'Connexion par QR-code instable',
          "La connexion par QR-code est instable et peut causer des plantages et autres erreurs récurrentes. Si c'est le cas, connectez vous d'une autre manière.",
          [{ text: "J'ai compris" }]
        );
      }
    });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: UIColors.background }}
      contentContainerStyle={{ flexGrow: 1 }}
      behavior="padding"
      enabled
      keyboardVerticalOffset={100}
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

      <View style={styles.pinInputContainer}>
        <View style={styles.pinInputView}>
          <Text style={styles.pinTitle}>Entrez le code de confirmation</Text>
          <Text style={styles.pinSubtitle}>
            Il s'agit des 4 chiffres que vous avez choisi avant obtention du
            QR-code.
          </Text>

          <SmoothPinCodeInput
            // eslint-disable-next-line react/no-this-in-sfc
            ref={this.pinInput}
            value={code}
            onTextChange={(_code) => setCode(_code)}
            cellStyle={[
              styles.cellStyle,
              {
                borderColor: `${UIColors.text}23`,
                backgroundColor: UIColors.element,
              },
            ]}
            cellStyleFocused={[
              styles.cellStyleFocused,
              { borderColor: `${UIColors.text}44` },
            ]}
            textStyle={[styles.textStyle, { color: UIColors.text }]}
            textStyleFocused={styles.textStyleFocused}
            style={styles.pinInput}
            cellSpacing={6}
            autoFocus
            onFulfill={handleLogin()}
          />

          {errPin ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pinInputContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  pinTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  pinSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.5,
  },

  pinInputView: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cellStyle: {
    borderWidth: 1,
    borderRadius: 8,
  },
  cellStyleFocused: {
    borderWidth: 2,
    borderRadius: 8,
  },

  textStyle: {
    fontSize: 28,
    fontFamily: 'Papillon-Medium',
  },

  error: {
    color: '#ff0000',
    fontSize: 14,
    marginTop: 20,
  },
});

export default LoginPronoteQR;
