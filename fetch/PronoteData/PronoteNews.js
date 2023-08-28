import consts from '../consts';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { refreshToken } from '../AuthStack/LoginFlow';

function getNews(force = false) {
    // obtenir le token
    return AsyncStorage.getItem('news_cache').then((news_cache) => {
        if (news_cache && !force) {
            news_cache = JSON.parse(news_cache);

            let userCacheDate = new Date(news_cache.date);
            let today = new Date();

            userCacheDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            
            if (userCacheDate.getTime() == today.getTime()) {
                return news_cache.news;
            }
            else {
                AsyncStorage.removeItem('news_cache');
                return getUser(true);
            }
        }
        else {
            return AsyncStorage.getItem('token').then((token) => {
                // fetch le timetable
                return fetch(consts.API + '/news' + '?token=' + token, {
                    method: 'GET'
                })
                .then((response) => response.text())
                .then((result) => {
                    if (result == 'expired' || result == '"expired"' || result == 'notfound' || result == '"notfound"') {
                        return refreshToken().then(() => {
                            return getNews();
                        });
                    }
                    else {
                        let cachedNews = {
                            date : new Date(),
                            news : result
                        };
                        AsyncStorage.setItem('news_cache', JSON.stringify(cachedNews));
                    
                        return result;
                    }
                });
            });
        }
    });
}

export { getNews };