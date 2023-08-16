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
                return editUser(user_cache.user);
            }
            else {
                AsyncStorage.removeItem('user_cache');
                return getUser(true);
            }
        }
        else {
            // obtenir le token
            return AsyncStorage.getItem('token').then((token) => {
                // fetch le timetable
                return fetch(consts.API + '/user' + '?token=' + token, {
                    method: 'GET'
                })
                .then((response) => response.json())
                .then(async (result) => {
                    if (result == 'expired' || result == 'notfound') {
                        return refreshToken().then(() => {
                            return getUser();
                        });
                    }
                    else {
                        saveUser(result);
                        return editUser(result);
                    }
                })
                .catch((error) => {
                    
                });
            })
            .catch((error) => {
                
            });
        }
    });
}

function editUser(profile) {
    let user = profile;

    return AsyncStorage.getItem('custom_profile_picture').then((custom_profile_picture) => {
        if (custom_profile_picture) {
            user.profile_picture = custom_profile_picture;
        }
        
        return AsyncStorage.getItem('custom_name').then((custom_name) => {
            if (custom_name) {
                user.name = custom_name;
            }

            return user;
            
        });
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

            // save user
            AsyncStorage.setItem('user_cache', JSON.stringify({
                date: new Date(),
                user: user
            }));
        }
    });
}

export { getUser };