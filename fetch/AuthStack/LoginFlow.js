import consts from '../consts';
import AsyncStorage from '@react-native-async-storage/async-storage';

function fixURL(url) {
    url = url.toLowerCase();

    // remove everything after the last /
    if (!url.endsWith('pronote/') && !url.endsWith('.fr') && !url.endsWith('.net')) {
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

function getENTs(url) {
    url = fixURL(url);

    const infoMobileURL = url + 'infoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4';

    return fetch(infoMobileURL, {
        method: 'GET'
    })
    .then((response) => response.json())
    .then((result) => {
        return result;
    });
}

function getInfo() {
    return fetch(consts.API + '/infos', {
        method: 'GET'
    })
    .then((response) => response.json())
    .then((result) => {
        return result;
    });
}

function getToken(credentials) {
    let loginTrue = false;
    if (credentials.url.endsWith('?login=true')) {
        loginTrue = true;
    }

    credentials.url = fixURL(credentials.url) + 'eleve.html';

    if (loginTrue) {
        credentials.url += '?login=true';
    }


    console.log(credentials);

    return fetch(consts.API + '/generatetoken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'username=' + credentials.username + '&password=' + credentials.password + '&url=' + credentials.url + '&ent=' + credentials.ent
    })
    .then((response) => response.text())
    .then((result) => {
        console.log(result);
        
        if (result.startsWith('A server error occurred.')) {
            return { token: false };
        }

        result = JSON.parse(result);
        return result;
    });
}

function refreshToken() {
    AsyncStorage.getItem('credentials').then((result) => {
        const credentials = JSON.parse(result);

        return getToken(credentials).then((result) => {
            if(result.token != false || result.token != null) {
                AsyncStorage.setItem('token', result.token);
                console.log('Token refreshed : ' + result.token);

                return result;
            }
        });
    });
};

export { getENTs, getInfo, getToken, refreshToken }