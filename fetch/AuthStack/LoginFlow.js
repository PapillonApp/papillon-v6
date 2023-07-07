import consts from '../consts';
import AsyncStorage from '@react-native-async-storage/async-storage';

function getENTs(url) {
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
    return fetch(consts.API + '/generatetoken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'username=' + credentials.username + '&password=' + credentials.password + '&url=' + credentials.url + '&ent=' + credentials.ent
    })
    .then((response) => response.json())
    .then((result) => {
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