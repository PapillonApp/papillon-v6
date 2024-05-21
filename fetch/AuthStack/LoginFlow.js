import AsyncStorage from '@react-native-async-storage/async-storage';
import SyncStorage from 'sync-storage';

global.Buffer = require('buffer').Buffer;

SyncStorage.init();

import { Alert } from 'react-native';

import { showMessage } from 'react-native-flash-message';


function toBase64(str) {
  return Buffer.from(str).toString('base64');
}

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

function getENTs(_url) {
  const url = fixURL(_url);

  const infoMobileURL = `${url}infoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4`;

  return fetch(infoMobileURL, {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((result) => result);
}








function refreshToken() {
  return AsyncStorage.getItem('qr_credentials').then((qrResult) => {
    if (qrResult) {
      return refreshQRToken(JSON.parse(qrResult));
    }
    return AsyncStorage.getItem('credentials').then((result) => {
      if (!result) return;
      const credentials = JSON.parse(result);

      return getToken(credentials).then((res) => {
        if (res.token !== false || res.token !== null) {
          AsyncStorage.setItem('token', res.token);
          return res;
        }
      });
    });
  });
}

function expireToken(reason, hideMessage = false) {
  AsyncStorage.setItem('token', 'expired');

  let reasonMessage = '';

  if (reason) {
    reasonMessage = ` (${reason})`;
  }

  if (hideMessage) {
    return;
  }
  
  showMessage({
    message: 'Token supprimé',
    description: `Le token a expiré${reasonMessage}`,
    type: 'warning',
    icon: 'auto',
    floating: true,
  });
}

export { getENTs, getInfo, getToken, loginQR, refreshToken, expireToken };
