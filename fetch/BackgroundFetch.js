import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

//import {Notifications} from 'react-native-notifications';

import { useAppContext } from '../utils/AppContext';
import { useEffect } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IndexDataInstance } from './IndexDataInstance';
import { ucFirst } from './SkolengoData/SkolengoDatas';
import notifee from '@notifee/react-native';

import { Platform } from 'react-native';

// Actualités
TaskManager.defineTask('background-fetch-news', async () => {
  const dataInstance = new IndexDataInstance();
  return AsyncStorage.getItem('oldNews').then((oldNews) => {
    if (oldNews) {
      oldNews = JSON.parse(oldNews);
      if (Platform.OS === 'android') {
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
            ongoing: true
          },
        });
      }
      return dataInstance.getNews().then((news) => {
        notifee.cancelNotification("background-fetch")
        if (news.length !== oldNews.length) {
          AsyncStorage.setItem('oldNews', JSON.stringify(news));

          const lastNews = news[news.length - 1];

          if (lastNews.read == false) {
            notifee.displayNotification({
              title: `📰 Nouvelle actualité ${ucFirst(dataInstance.service)}`,
              body: lastNews.title,
              android: {
                channelId: "newdata-group"
              },
              ios: {
                sound: 'papillon_ding.wav',
              }
            })
          }
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

// Devoirs
async function checkUndoneHomeworks() {
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dataInstance = new IndexDataInstance();
  const homeworks = await dataInstance.getHomeworks(tomorrow, true);

  const undone = homeworks.filter((homework) => !homework.done);

  const fireDate = new Date();
  fireDate.setHours(19);
  fireDate.setMinutes(0);
  fireDate.setSeconds(0);
  fireDate.setMilliseconds(0); 

  const notifHasAlreadyBeenSent = await AsyncStorage.getItem('notifHasAlreadyBeenSent');

  if (notifHasAlreadyBeenSent == (fireDate.getTime()).toString()) {
    return;
  }
  else if (undone.length > 0 && new Date() > fireDate) {
    let plural = '';
    if (undone.length > 1) {
      plural = 's';
    }

    notifee.displayNotification({
      title: `📚 Il te reste des devoirs pour demain !`,
      body: `Tu as ${undone.length} devoir${plural} à faire pour demain`,
      android: {
        channelId: "newdata-group"
      },
      ios: {
        sound: 'papillon_ding.wav',
      }
    })

    await AsyncStorage.setItem('notifHasAlreadyBeenSent', fireDate.getTime().toString());
  }
}

TaskManager.defineTask('background-fetch-homeworks', async () => {
  await checkUndoneHomeworks();
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

async function registerHomeworksBackgroundFetchAsync() {
  if (!BackgroundFetch?.registerTaskAsync) {
    throw new Error(
      'BackgroundFetch.registerTaskAsync is not defined. (dev only)'
    );
  }
  return BackgroundFetch?.registerTaskAsync('background-fetch-homeworks', {
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
  //Notifications.registerRemoteNotifications();

  registerNewsBackgroundFetchAsync().then((res) => {
  });

  registerHomeworksBackgroundFetchAsync().then((res) => {
  });

  checkUndoneHomeworks();
}

export default setBackgroundFetch;
