import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';

global.Buffer = require('buffer').Buffer;

import SyncStorage from 'sync-storage';

SyncStorage.init();

function fixURL(_url) {
  let url = _url.toLowerCase();

  // remove everything after the last /
  if (
    !url.endsWith('pronote/') &&
    !url.endsWith('.fr') &&
    !url.endsWith('.net')
  ) {
    url = url.substring(0, url.lastIndexOf('/') + 1);
  }

  // if url doesnt end with /, add it
  if (!url.endsWith('/')) {
    url += '/';
  }

  if (!url.endsWith('pronote/')) {
    url += 'pronote/';
  }

  return url;
}

async function getENTs(_url) {
  const url = fixURL(_url);

  const infoMobileURL = `${url}infoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4`;

  try {
    const response = await fetch(infoMobileURL, { method: 'GET' });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching ENTs:', error);
    throw error;
  }
}

async function refreshToken() {
  try {
    const qrResult = await AsyncStorage.getItem('qr_credentials');
    if (qrResult) {
      return refreshToken(JSON.parse(qrResult));
    } else {
      const result = await AsyncStorage.getItem('credentials');
      if (!result) return;
      const credentials = JSON.parse(result);
      const res = await getToken(credentials);
      if (res.token !== false || res.token !== null) {
        AsyncStorage.setItem('token', res.token);
        return res;
      }
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

function expireToken(reason, hideMessage = false) {
  AsyncStorage.setItem('token', 'expired');

  let reasonMessage = '';

  if (reason) {
    reasonMessage = ` (${reason})`;
  }

  if (!hideMessage) {
    showMessage({
      message: 'Token supprimé',
      description: `Le token a expiré${reasonMessage}`,
      type: 'warning',
      icon: 'auto',
      floating: true,
    });
  }
}

export { getENTs, refreshToken, expireToken };
