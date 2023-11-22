import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IndexDataInstance } from './IndexDataInstance';
import { ucFirst } from './SkolengoData/SkolengoDatas';
import notifee from '@notifee/react-native';

// Actualités
TaskManager.defineTask('background-fetch-news', async () => {
  const dataInstance = new IndexDataInstance();
  return AsyncStorage.getItem('oldNews').then((oldNews) => {
    if (oldNews) {
      oldNews = JSON.parse(oldNews);
      notifee.displayNotification({
        title: "Récupération des données en arrière-plan",
        id: "background-fetch",
        android: {
          channelId: "silent",
          progress: {
            max: 10,
            current: 5,
            indeterminate: true
          },
        },
      });
      return dataInstance.getNews().then((news) => {
        if (news.length !== oldNews.length) {
          AsyncStorage.setItem('oldNews', JSON.stringify(news));

          const lastNews = news[news.length - 1];

          notifee.displayNotification({
            title: `📰 Nouvelle actualité ${ucFirst(dataInstance.service)}`,
            body: lastNews.title,
            android: {
              channelId: "newdata-group"
            }
          })
          // Be sure to return the successful result type!
          return BackgroundFetch.BackgroundFetchResult.NewData;
        }
      });
    }
    else {

    }
    return dataInstance.getNews().then((news) => {
      AsyncStorage.setItem('oldNews', JSON.stringify(news));
    });
  });
});

// News Register
async function registerNewsBackgroundFetchAsync() {
  if (!BackgroundFetch?.registerTaskAsync) {
    throw new Error(
      'BackgroundFetch.registerTaskAsync is not defined. (dev only)'
    );
  }
  return BackgroundFetch?.registerTaskAsync('background-fetch-news', {
    minimumInterval: 60 * 15, // 15 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}

async function setBackgroundFetch() {
  registerNewsBackgroundFetchAsync()
    ?.then(() => {
    })
    .catch((err) => {
    });
}

export default setBackgroundFetch;
