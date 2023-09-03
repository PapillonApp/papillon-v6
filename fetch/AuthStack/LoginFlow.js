import AsyncStorage from '@react-native-async-storage/async-storage';

import { showMessage } from 'react-native-flash-message';
import consts from '../consts.json';

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

function getInfo() {
  return fetch(`${consts.API}/infos`, {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((result) => result);
}

function getToken(credentials) {
  let loginTrue = false;
  if (credentials.url.endsWith('?login=true')) {
    loginTrue = true;
  }

  // eslint-disable-next-line no-param-reassign
  credentials.url = `${fixURL(credentials.url)}eleve.html`;

  if (loginTrue) {
    // eslint-disable-next-line no-param-reassign
    credentials.url += '?login=true';
  }

  return fetch(`${consts.API}/generatetoken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `username=${credentials.username}&password=${credentials.password}&url=${credentials.url}&ent=${credentials.ent}`,
  })
    .then((response) => response.text())
    .then((result) => {
      if (result.startsWith('A server error occurred.')) {
        return { token: false };
      }

      return JSON.parse(result);
    });
}

function refreshToken() {
  return AsyncStorage.getItem('credentials').then((result) => {
    const credentials = JSON.parse(result);

    return getToken(credentials).then((res) => {
      if (res.token !== false || res.token !== null) {
        AsyncStorage.setItem('token', res.token);
        return res;
      }
    });
  });
}

function expireToken(reason) {
  AsyncStorage.setItem('token', 'expired');

  let reasonMessage = '';

  if (reason) {
    reasonMessage = ` (${reason})`;
  }

  showMessage({
    message: 'Token supprimé',
    description: `Le token a expiré${reasonMessage}`,
    type: 'warning',
    icon: 'auto',
    floating: true,
  });
}

export { getENTs, getInfo, getToken, refreshToken, expireToken };
