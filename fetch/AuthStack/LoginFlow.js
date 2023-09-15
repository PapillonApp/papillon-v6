import AsyncStorage from '@react-native-async-storage/async-storage';

import { showMessage } from 'react-native-flash-message';
import getConsts from '../consts';

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
  return getConsts().then((consts) => {
    return fetch(`${consts.API}/infos`, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((result) => result);
  });
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

  return getConsts().then((consts) => {
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
  });
}

function loginQR(credentials) {
  var formdata = new FormData();
  formdata.append("url", credentials.url);
  formdata.append("qrToken", credentials.qrToken);
  formdata.append("login", credentials.login);
  formdata.append("checkCode", credentials.checkCode);
  formdata.append("uuid", credentials.uuid);

  var requestOptions = {
    method: 'POST',
    body: formdata,
    redirect: 'follow'
  };

  return getConsts().then((consts) => {
    return fetch(`${consts.API}/generatetoken?method=qrcode`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        // add uuid to result
        result.uuid = credentials.uuid;

        return result;
      });
  });
}

function refreshQRToken(qr_result) {
  return getConsts().then((consts) => {
    var formdata = new FormData();
    formdata.append("url", qr_result.qr_credentials.url);
    formdata.append("username", qr_result.qr_credentials.username);
    formdata.append("password", qr_result.qr_credentials.password);
    formdata.append("uuid", qr_result.uuid);

    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

    return fetch(`${consts.API}/generatetoken?method=token`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        AsyncStorage.setItem('token', result.token);

        // change password
        return AsyncStorage.getItem('qr_credentials').then((qr_result) => {
          if(qr_result) {
            const qr_credentials = JSON.parse(qr_result);

            qr_credentials.qr_credentials.password = result.qr_credentials.password;

            console.log('Nouveau mot de passe: ' + result.qr_credentials.password);

            AsyncStorage.setItem('qr_credentials', JSON.stringify(qr_credentials));
          }

          return result;
        });
      });
  });
}

function refreshToken() {
  return AsyncStorage.getItem('qr_credentials').then((qr_result) => {
    if(qr_result) {
      return refreshQRToken(JSON.parse(qr_result));
    }
    else {
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

export { getENTs, getInfo, getToken, loginQR, refreshToken, expireToken };
