import consts from '../consts';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { refreshToken } from '../AuthStack/LoginFlow';

function getTimetable(day) {
    // obtenir le token
    return AsyncStorage.getItem('token').then((token) => {
        // fetch le timetable
        return fetch(consts.API + '/timetable' + '?token=' + token + '&dateString=' + day, {
            method: 'GET'
        })
        .then((response) => response.json())
        .then((result) => {
            if (result == 'expired') {
                refreshToken().then(() => {
                    return getTimetable(day);
                });
            }

            return result;
        });
    });
}

export { getTimetable };