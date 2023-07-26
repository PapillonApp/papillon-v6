import consts from '../consts';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { refreshToken } from '../AuthStack/LoginFlow';

function getTimetable(day) {
    // TEMPORARY : remove 1 month
    day = new Date(day);

    // date = '2021-09-13' (YYYY-MM-DD)
    let date = new Date(day);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let dayOfMonth = date.getDate();

    if (month < 10) {
        month = '0' + month;
    }

    if (dayOfMonth < 10) {
        dayOfMonth = '0' + dayOfMonth;
    }

    day = year + '-' + month + '-' + dayOfMonth;

    // obtenir le token
    return AsyncStorage.getItem('token').then((token) => {
        // fetch le timetable
        return fetch(consts.API + '/timetable' + '?token=' + token + '&dateString=' + day, {
            method: 'GET'
        })
        .then((response) => response.json())
        .then((result) => {
            if (result == 'expired' || result == 'notfound') {
                return refreshToken().then(() => {
                    return getTimetable(day);
                });
            }
            else {
                // sort the timetable by start
                result.sort((a, b) => {
                    return a.start.localeCompare(b.start);
                });
                
                return result;
            }
        });
    });
}

export { getTimetable };