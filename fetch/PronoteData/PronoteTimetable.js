import AsyncStorage from '@react-native-async-storage/async-storage';
import consts from '../consts.json';

import { refreshToken } from '../AuthStack/LoginFlow';

function getTimetable(day, force = false) {
  // TEMPORARY : remove 1 month
  day = new Date(day);

  return AsyncStorage.getItem('timetableCache').then((timetableCache) => {
    if (timetableCache && !force) {
      // if day is in cache, return it
      timetableCache = JSON.parse(timetableCache);

      for (let i = 0; i < timetableCache.length; i += 1) {
        let thisDay = new Date(day);
        let cacheDay = new Date(timetableCache[i].date);

        thisDay.setHours(0, 0, 0, 0);
        cacheDay.setHours(0, 0, 0, 0);

       if ( thisDay.getTime() === cacheDay.getTime()) {
        let currentTime = new Date();
        currentTime.setHours(0, 0, 0, 0);

        let cacheTime = new Date(timetableCache[i].dateSaved);
        cacheTime.setHours(0, 0, 0, 0);

        if (currentTime.getTime() === cacheTime.getTime()) {
          console.log('returning cached timetable');

          return timetableCache[i].timetable;
        }
       }
      }
    }

    // date = '2021-09-13' (YYYY-MM-DD)
    const date = new Date(day);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let dayOfMonth = date.getDate();

    if (month < 10) {
      month = `0${month}`;
    }

    if (dayOfMonth < 10) {
      dayOfMonth = `0${dayOfMonth}`;
    }

    day = `${year}-${month}-${dayOfMonth}`;

    // obtenir le token
    return AsyncStorage.getItem('token').then((token) =>
      // fetch le timetable
      fetch(`${consts.API}/timetable?token=${token}&dateString=${day}`, {
        method: 'GET',
      })
        .then((response) => response.json())
        .then((result) => {
          if (result === 'expired' || result === 'notfound') {
            return refreshToken().then(() => getTimetable(day));
          }
          // sort the timetable by start
          result.sort((a, b) => a.start.localeCompare(b.start));

          // save in cache
          AsyncStorage.getItem('timetableCache').then((timetableCache) => {
            let cachedTimetable = [];

            if (timetableCache) {
              cachedTimetable = JSON.parse(timetableCache);
            }

            cachedTimetable.push({
              date: day,
              dateSaved : new Date(),
              timetable: result,
            });

            AsyncStorage.setItem(
              'timetableCache',
              JSON.stringify(cachedTimetable)
            );
          });

          return result;
        })
        .catch(() => {
          console.error('Error fetching Pronote timetable');
        })
    );
  });
}

export { getTimetable };
