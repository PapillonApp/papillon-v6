import consts from '../consts';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { refreshToken } from '../AuthStack/LoginFlow';

function getHomeworks(day) {
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

    console.log(day);

    // obtenir le token
    return AsyncStorage.getItem('token').then((token) => {
        // fetch les devoirs
        return fetch(consts.API + '/homework' + '?token=' + token + '&dateFrom=' + day + '&dateTo=' + day, {
            method: 'GET'
        })
        .then((response) => response.json())
        .catch(e=>{console.log("ERR : PronoteHomeworks", e); return [];})
        .then((result) => {
            if (result == 'expired' || result == 'notfound') {
                return refreshToken().then(() => {
                    return getHomeworks(day);
                });
            }
            else {
                return result;
            }
        }).catch(e=>{
            console.log(e);
            return [];
        })
    });
}

function changeHomeworkState(day, id) {
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

    console.log(day);

    // obtenir le token
    return AsyncStorage.getItem('token').then((token) => {
        // fetch les devoirs
        return fetch(consts.API + '/homework/changeState' + '?token=' + token + '&dateFrom=' + day + '&dateTo=' + day + '&homeworkId=' + id, {
            method: 'POST'
        })
        .then((response) => response.json())
        .then((result) => {
            if (result == 'expired' || result == 'notfound') {
                return refreshToken().then(() => {
                    return changeHomeworkState(date, id);
                });
            }
            else {
                return result;
            }
        });
    });
}

export { getHomeworks, changeHomeworkState };