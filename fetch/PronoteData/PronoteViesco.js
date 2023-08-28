import consts from '../consts';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { refreshToken } from '../AuthStack/LoginFlow';

function getViesco(force = false) {
    // obtenir le token
    return AsyncStorage.getItem('viesco_cache').then((viesco_cache) => {
        if (viesco_cache && !force) {
            viesco_cache = JSON.parse(viesco_cache);

            let userCacheDate = new Date(viesco_cache.date);
            let today = new Date();

            userCacheDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            
            if (userCacheDate.getTime() == today.getTime()) {
                return viesco_cache.viesco;
            }
            else {
                AsyncStorage.removeItem('viesco_cache');
                return getViesco(true);
            }
        }
        else {
            return AsyncStorage.getItem('token').then((token) => {
                // fetch le timetable
                return fetch(consts.API + '/absences' + '?token=' + token, {
                    method: 'GET'
                })
                .then((response) => response.text())
                .then((result) => {
                    if (result == 'expired' || result == '"expired"' || result == 'notfound' || result == '"notfound"') {
                        return refreshToken().then(() => {
                            return getViesco();
                        });
                    }
                    else {
                        let absences = JSON.parse(result);

                        return fetch(consts.API + '/punishments' + '?token=' + token, {
                            method: 'GET'
                        })
                        .then((response) => response.text())
                        .then((result) => {
                            let punishments = JSON.parse(result);

                            return fetch(consts.API + '/delays' + '?token=' + token, {
                                method: 'GET'
                            })
                            .then((response) => response.text())
                            .then((result) => {
                                let delays = JSON.parse(result);

                                let cachedViesco = {
                                    date : new Date(),
                                    viesco : {
                                        absences : absences,
                                        punishments : punishments,
                                        delays : delays
                                    }
                                };
                                AsyncStorage.setItem('viesco_cache', JSON.stringify(cachedViesco));
                            
                                return cachedViesco.viesco;
                            });
                        });
                    }
                });
            });
        }
    });
}

export { getViesco };