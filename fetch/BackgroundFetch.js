import parallel from 'async/parallel';

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

//import {Notifications} from 'react-native-notifications';

import { useAppContext } from '../utils/AppContext';
import { useEffect } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IndexDataInstance } from '.';
import { ucFirst } from './SkolengoData/SkolengoDatas';
import notifee from '@notifee/react-native';

import { Platform } from 'react-native';

async function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

async function delNotif() {
  notifee.displayNotification({
    title: 'Récupération des données en arrière-plan',
    id: 'background-fetch',
    android: {
      timeoutAfter: 200,
      channelId: 'silent',
      progress: {
        max: 10,
        current: 5,
        indeterminate: true
      },
      ongoing: true
    }
  });
  notifee.cancelDisplayedNotification('background-fetch');
}

// Actualités

async function newsFetch() {
  return new Promise(async(resolve, reject) => {
    const dataInstance = new IndexDataInstance();
    return AsyncStorage.getItem('oldNews').then((oldNews) => {
      if (oldNews) {
        oldNews = JSON.parse(oldNews);
        return dataInstance.getNews().then((news) => {
          if (news.length !== oldNews.length) {
            AsyncStorage.setItem('oldNews', JSON.stringify(news));

            const lastNews = news[news.length - 1];

            if (lastNews.read == false) {
              notifee.displayNotification({
                title: `📰 Nouvelle actualité ${ucFirst(dataInstance.service)}`,
                body: lastNews.title,
                android: {
                  channelId: 'new-news'
                },
                ios: {
                  sound: 'papillon_ding.wav',
                }
              });
            }
            // Be sure to return the successful result type!
            resolve()
            return BackgroundFetch.BackgroundFetchResult.NewData;
          }
        })
          .catch(err => {
            console.error('[Background Fetch/News] Unable to fetch news,', err);
            reject("[News]", err)
          });
      }

      else return dataInstance.getNews().then((news) => {
        AsyncStorage.setItem('oldNews', JSON.stringify(news));
      });
    });
  })
}

// Devoirs
async function checkUndoneHomeworks() {
  return new Promise(async (resolve, reject) => {
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

    const limitDate = new Date();
    limitDate.setHours(21);
    limitDate.setMinutes(0);
    limitDate.setSeconds(0);
    limitDate.setMilliseconds(0);

    const notifHasAlreadyBeenSent = await AsyncStorage.getItem('notifHasAlreadyBeenSent');

    if (notifHasAlreadyBeenSent == (fireDate.getTime()).toString()) {
      return;
    }
    else if (undone.length > 0 && new Date() > fireDate) {
      if (new Date() > limitDate) {
        return;
      }

      let plural = '';
      if (undone.length > 1) {
        plural = 's';
      }

      notifee.displayNotification({
        title: '📚 Il te reste des devoirs pour demain !',
        body: `Tu as ${undone.length} devoir${plural} à faire pour demain`,
        android: {
          channelId: 'works-remind'
        },
        ios: {
          sound: 'papillon_ding.wav',
        }
      });

      await AsyncStorage.setItem('notifHasAlreadyBeenSent', fireDate.getTime().toString());
      resolve()
    }
  })
}

async function backgroundFetch() {
  if (Platform.OS === 'android') {
    notifee.displayNotification({
      title: 'Récupération des données en arrière-plan',
      id: 'background-fetch',
      android: {
        channelId: 'silent',
        progress: {
          max: 10,
          current: 5,
          indeterminate: true
        },
        ongoing: true
      },
    });
  }
  parallel([
    newsFetch(),
    checkUndoneHomeworks()
  ], fucntion((err, results) => {
    delNotif()
    if (err) {
      notifee.displayNotification({
        title: 'Erreur lors du background fetch',
        body: String(err),
        id: 'background-fetch-failed',
        android: {
          channelId: 'new-news',
        },
      });
    }
  }))
}

async function setBackgroundFetch() {
  console.log("Registered background fetch")
  TaskManager.defineTask("background-fetch", () => {
    backgroundFetch()
  })
  BackgroundFetch?.registerTaskAsync('background-fetch', {
    minimumInterval: 60 * 15, // 15 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}

export default setBackgroundFetch;
