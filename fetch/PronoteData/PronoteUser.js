import consts from '../consts';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { refreshToken } from '../AuthStack/LoginFlow';

function getUser(force = false) {
    // return cached user if from today and exists
    return AsyncStorage.getItem('user_cache').then((user_cache) => {
        if (user_cache && !force) {
            user_cache = JSON.parse(user_cache);

            let userCacheDate = new Date(user_cache.date);
            let today = new Date();

            userCacheDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            
            if (userCacheDate.getTime() == today.getTime()) {
                return user_cache.user;
            }
        }
        else {
            // obtenir le token
            return AsyncStorage.getItem('token').then((token) => {
                // fetch le timetable
                return fetch(consts.API + '/user' + '?token=' + token, {
                    method: 'GET'
                })
                .then((response) => response.text())
                .then((result) => {
                    if (result == 'expired' || result == 'notfound') {
                        return refreshToken().then(() => {
                            return getUser();
                        });
                    }
                    else {
                        result = JSON.parse(result);
                        saveUser(result);
                        return result;
                    }
                });
            });
        }
    });
}

function saveUser(user) {
    // fetch profile picture
    fetch(user.profile_picture).then((response) => response.blob()).then((blob) => {
        // save as base64 url
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function() {
            var base64data = reader.result;                
            user.profile_picture = base64data;
        }

        // save user
        AsyncStorage.setItem('user_cache', JSON.stringify({
            date: new Date(),
            user: user
        }));
    });
}

export { getUser };