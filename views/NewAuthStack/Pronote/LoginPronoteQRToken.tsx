import React from 'react';

import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
  KeyboardAvoidingView,
} from 'react-native';

import { useTheme, Text } from 'react-native-paper';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticatePronoteQRCode } from 'pawnote';
import { useAppContext } from '../../../utils/AppContext';

import GetUIColors from '../../../utils/GetUIColors';
import { AsyncStoragePronoteKeys } from '../../../fetch/PronoteData/connector';

function LoginPronoteQR({ route, navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [errPin, setErrPin] = React.useState(false);

  const appContext = useAppContext();

  const makeUUID = (): string => {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      (c) => {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
    return uuid;
  };

  const handleQRPinLogin = async (code: string) => {
    const deviceUUID = makeUUID();

    try {
      const pronote = await authenticatePronoteQRCode({
        dataFromQRCode: route.params.qrData,
        pinCode: code,
        deviceUUID,
      });

      await AsyncStorage.multiSet([
        [AsyncStoragePronoteKeys.NEXT_TIME_TOKEN, pronote.nextTimeToken],
        [AsyncStoragePronoteKeys.ACCOUNT_TYPE_ID, pronote.accountTypeID.toString()],
        [AsyncStoragePronoteKeys.INSTANCE_URL, pronote.pronoteRootURL],
        [AsyncStoragePronoteKeys.USERNAME, pronote.username],
        [AsyncStoragePronoteKeys.DEVICE_UUID, deviceUUID],
      ]);

      await appContext.dataProvider.init('pronote', pronote);
      await AsyncStorage.setItem('service', 'pronote');

      navigation.goBack();
      navigation.goBack();
      navigation.goBack();
      appContext.setLoggedIn(true);
    }
    catch {
      setErrPin(true);
      setError('Code invalide ou expiré');
    }
  };

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
            value={code}
            codeLength={4}
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
            cellSpacing={6}
            autoFocus
            onFulfill={handleQRPinLogin}
            onTextChange={(code: string) => setCode(code)}
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
