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
  await sleep(10000) 
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

async function newsFetch(callback) {
  return new Promise(async(resolve, reject) => {
    console.log("Récupération des news")
    const dataInstance = new IndexDataInstance();
    const serviceName = await AsyncStorage.getItem('service');
    await dataInstance.init(serviceName)
    AsyncStorage.getItem('oldNews').then((oldNews) => {
      if (oldNews) {
        console.log("oldNews présent")
        oldNews = JSON.parse(oldNews);
        dataInstance.getNews().then((news) => {
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
            console.log("News OK notif affiché")
            resolve("News OK notif affiché")
            if(typeof callback === "function") callback(null, "News OK notif affiché")
            return;
          }
          else {
            console.log("News OK pas de nouvelles news")
            resolve("News OK pas de nouvelles news")
            if(typeof callback === "function") callback(null, "News OK pas de nouvelles news")
          }
        })
          .catch(err => {
            console.error('[Background Fetch/News] Unable to fetch news,', err);
            reject("[News]", err)
          });
      }

      else dataInstance.getNews().then((news) => {
        AsyncStorage.setItem('oldNews', JSON.stringify(news));
        console.log("News OK pas de oldNews")
        resolve("News OK pas de oldNews")
        if(typeof callback === "function") callback(null, "News OK pas de oldNews")
      });
    });
  })
}

// Devoirs
async function checkUndoneHomeworks(callback) {
  return new Promise(async (resolve, reject) => {
    console.log("Récupération des devoirs")
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dataInstance = new IndexDataInstance();
    const serviceName = await AsyncStorage.getItem('service');
    await dataInstance.init(serviceName)
    const homeworks = await dataInstance.getHomeworks(tomorrow, true);
    console.log(homeworks) 
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
      console.log("Devoirs OK notif déjà envoyée")
      resolve("Devoirs OK notif déjà envoyée")
      if(typeof callback === "function") callback(null, "Devoirs OK notif déjà envoyée")
      return;
    }
    if (undone.length > 0 && new Date() > fireDate) {
      if (new Date() > limitDate) {
        console.log("Devoirs OK heure limite dépassée")
        resolve("Devoirs OK heure limite dépassée")
        if(typeof callback === "function") callback(null, "Devoirs OK heure limite dépassée")
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
      console.log("Devoirs OK notif envoyée")
      resolve("Devoirs OK notif envoyée")
      if(typeof callback === "function") callback(null, "Devoirs OK notif envoyée")
      return;
    }
    console.log("Devoirs OK aucun devoir non fait")
    resolve("Devoirs OK aucun devoir non fait")
    if(typeof callback === "function") callback(null, "Devoirs OK aucun devoir non fait")
  }) 
}

//Notes
async function fetchGrades(callback) {
  return new Promise(async (resolve, reject) => {
    console.log("Récupération des notes")
    const dataInstance = new IndexDataInstance();
    const serviceName = await AsyncStorage.getItem('service');
    await dataInstance.init(serviceName)
    let user = await dataInstance.getUser(true)
    let periods = user.periodes.grades
    let actualPeriod = periods.filter(p => p.actual === true)[0]
    let grades = await dataInstance.getGrades(actualPeriod.name, true)
    console.log(grades)
    let oldGrades = await AsyncStorage.getItem("oldGrades")

    if(!oldGrades) {
      await AsyncStorage.setItem("oldGrades", JSON.stringify(grades))
      console.log("Notes OK pas de oldGrades")
      resolve("Notes OK pas de oldGrades")
      callback(null, "Notes OK pas de oldGrades")
      return;
    }

    if(oldGrades) {
      oldGrades = JSON.parse(oldGrades) 
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
        ongoing: true,
        smallIcon: "notification_icon",
        color: "red",
      },
    });
  }
  parallel([
    newsFetch,
    checkUndoneHomeworks
    //fetchGrades
  ], function(err, results) {
    console.log("OK pour async", err, results)
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
  })
}

async function setBackgroundFetch() {
  console.log("Registered background fetch")
  TaskManager.defineTask("background-fetch", () => {
    backgroundFetch()
  })
  await BackgroundFetch.unregisterTaskAsync('background-fetch')
  BackgroundFetch?.registerTaskAsync('background-fetch', {
    minimumInterval: 60 * 15, // 15 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
  backgroundFetch()
}

export default setBackgroundFetch;
