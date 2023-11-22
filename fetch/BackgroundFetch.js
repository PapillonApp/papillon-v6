import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

import {Notifications} from 'react-native-notifications';

import { useAppContext } from '../utils/AppContext';
import { useEffect } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IndexDataInstance } from './IndexDataInstance';
import { ucFirst } from './SkolengoData/SkolengoDatas';

// Actualités
TaskManager.defineTask('background-fetch-news', async () => {
  const dataInstance = new IndexDataInstance();
  return AsyncStorage.getItem('oldNews').then((oldNews) => {
    if (oldNews) {
      oldNews = JSON.parse(oldNews);

      return dataInstance.getNews().then((news) => {
        if (news.length !== oldNews.length) {
          AsyncStorage.setItem('oldNews', JSON.stringify(news));

          const lastNews = news[news.length - 1];

          Notifications.postLocalNotification({
            body: lastNews.title,
            title: `📰 Nouvelle actualité ${ucFirst(dataInstance.service)}`,
            sound: 'papillon_ding.wav',
            silent: false,
            category: 'PAPILLON_NOTIFICATIONS',
            userInfo: {},
            fireDate: new Date(),
          });

          // Be sure to return the successful result type!
          return BackgroundFetch.BackgroundFetchResult.NewData;
        }
      });
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

  const notifHasAlreadyBeenSent = await AsyncStorage.getItem('notifHasAlreadyBeenSent');

  if (notifHasAlreadyBeenSent == (fireDate.getTime()).toString()) {
    return;
  }
  else if (undone.length > 0 && new Date() < fireDate) {
    Notifications.postLocalNotification({
      body: `Tu as ${undone.length} devoir${(undone.length > 1) && 's'} à faire pour demain`,
      title: `📚 Il te reste des devoirs pour demain !`,
      sound: 'papillon_ding.wav',
      silent: false,
      category: 'PAPILLON_NOTIFICATIONS',
      userInfo: {},
      fireDate: new Date(),
    });

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
  Notifications.registerRemoteNotifications();

  registerNewsBackgroundFetchAsync().then((res) => {
    console.log('News background fetch registered', res);
  });

  registerHomeworksBackgroundFetchAsync().then((res) => {
    console.log('Homeworks background fetch registered', res);
  });

  checkUndoneHomeworks();
}

export default setBackgroundFetch;
