import AsyncStorage from '@react-native-async-storage/async-storage';
import getConsts from '../consts';
import { refreshToken } from '../AuthStack/LoginFlow';

function getNews(force = false) {
  // obtenir le token
  return getConsts().then((consts) =>
    AsyncStorage.getItem('newsCache').then((newsCache) => {
      if (newsCache && !force) {
        newsCache = JSON.parse(newsCache);

        const userCacheDate = new Date(newsCache.date);
        const today = new Date();

        userCacheDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (userCacheDate.getTime() === today.getTime()) {
          return newsCache.news;
        }
        AsyncStorage.removeItem('newsCache');
        return getNews(true);
      }
      return AsyncStorage.getItem('token').then((token) =>
        // fetch le timetable
        fetch(`${consts.API}/news?token=${token}`, {
          method: 'GET',
        })
          .then((response) => response.text())
          .then((result) => {
            if (
              result === 'expired' ||
              result === '"expired"' ||
              result === 'notfound' ||
              result === '"notfound"'
            ) {
              return refreshToken().then(() => getNews());
            }
            const cachedNews = {
              date: new Date(),
              news: result,
            };
            AsyncStorage.setItem('newsCache', JSON.stringify(cachedNews));

            return result;
          })
      );
    })
  );
}

function changeNewsState(id) {
  return getConsts().then((consts) => {
    return AsyncStorage.getItem('token').then((token) => {
      // fetch le timetable
      fetch(`${consts.API}/news/markAsRead?token=${token}&newsId=${id}`, {
        method: 'POST',
      })
        .then((response) => response.json())
        .then((result) => {
          return result;
        }
      );
    });
  })
}

export { getNews, changeNewsState };
