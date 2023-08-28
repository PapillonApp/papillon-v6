import consts from '../consts';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { refreshToken } from '../AuthStack/LoginFlow';

function getGrades(force = false) {
    // obtenir le token
    return AsyncStorage.getItem('grades_cache').then((grades_cache) => {
        if (grades_cache && !force) {
            grades_cache = JSON.parse(grades_cache);

            let userCacheDate = new Date(grades_cache.date);
            let today = new Date();

            userCacheDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            
            if (userCacheDate.getTime() == today.getTime()) {
                return grades_cache.grades;
            }
            else {
                AsyncStorage.removeItem('grades_cache');
                return getGrades(true);
            }
        }
        else {
            return AsyncStorage.getItem('token').then((token) => {
                // fetch le timetable
                return fetch(consts.API + '/grades' + '?token=' + token, {
                    method: 'GET'
                })
                .then((response) => response.text())
                .then((result) => {
                    if (result == 'expired' || result == 'notfound' || result == '"notfound"') {
                        return refreshToken().then(() => {
                            return getGrades();
                        });
                    }
                    else {
                        let cachedGrades = {
                            date : new Date(),
                            grades : result
                        };
                        AsyncStorage.setItem('grades_cache', JSON.stringify(cachedGrades));
                    
                        return result;
                    }
                });
            });
        }
    });
}

function getEvaluations(force = false) {
    // obtenir le token
    return AsyncStorage.getItem('evaluations_cache').then((evaluations_cache) => {
        if (evaluations_cache && !force) {
            evaluations_cache = JSON.parse(evaluations_cache);

            let userCacheDate = new Date(evaluations_cache.date);
            let today = new Date();

            userCacheDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            
            if (userCacheDate.getTime() == today.getTime()) {
                return evaluations_cache.evaluations;
            }
            else {
                AsyncStorage.removeItem('evaluations_cache');
                return getEvaluations(true);
            }
        }
        else {
            return AsyncStorage.getItem('token').then((token) => {
                // fetch le timetable
                return fetch(consts.API + '/evaluations' + '?token=' + token, {
                    method: 'GET'
                })
                .then((response) => response.text())
                .then((result) => {
                    if (result == 'expired' || result == 'notfound' || result == '"notfound"') {
                        return refreshToken().then(() => {
                            return getEvaluations();
                        });
                    }
                    else {
                        let cachedEvaluations = {
                            date : new Date(),
                            evaluations : result
                        };
                        AsyncStorage.setItem('evaluations_cache', JSON.stringify(cachedEvaluations));
                    
                        return result;
                    }
                });
            });
        }
    });
}

function changePeriod(selectedPeriod) {
    return AsyncStorage.getItem('token').then((token) => {
        const API = consts.API;

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                        
        const urlencoded = new URLSearchParams();
        urlencoded.append("token", token);
        urlencoded.append("periodName", selectedPeriod);

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        };

        // get token from API
        return fetch(API + "/changePeriod" + '?token=' + token + "&periodName=" + selectedPeriod, requestOptions)
        .then(response => response.json())
    });
}

export { getGrades, getEvaluations, changePeriod };