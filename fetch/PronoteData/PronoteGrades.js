import consts from '../consts';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { refreshToken } from '../AuthStack/LoginFlow';

function getGrades(day) {
    // obtenir le token
    return AsyncStorage.getItem('token').then((token) => {
        // fetch le timetable
        return fetch(consts.API + '/grades' + '?token=' + token, {
            method: 'GET'
        })
        .then((response) => response.text())
        .then((result) => {
            // console.log(result);
            if (result == 'expired' || result == 'notfound') {
                return refreshToken().then(() => {
                    return getGrades(day);
                });
            }
            else {
                return result;
            }
        });
    });
}

export { getGrades };