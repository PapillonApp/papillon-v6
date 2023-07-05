import consts from '../consts';

function getENTs(url) {
    // if url doesnt end with /, add it
    if (!url.endsWith('/')) {
        url += '/';
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

export { getENTs, getInfo, getToken }