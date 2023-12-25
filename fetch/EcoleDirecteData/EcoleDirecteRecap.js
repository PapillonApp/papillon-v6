import AsyncStorage from '@react-native-async-storage/async-storage';

import { getTimetable } from './EcoleDirecteTimetable';
import { getHomeworks } from './EcoleDirecteHomeworks';
import { getGrades } from './EcoleDirecteGrades';

function addDays(date, days) {
  date = new Date(date);
  date.setDate(date.getDate() + days);

  return date;
}

function getRecap(day, force, ecoledirecteInstance) {
  return AsyncStorage.getItem('recapCache').then((recapCache) => {
    if (recapCache && !force) {
      recapCache = JSON.parse(recapCache);

      const userCacheDate = new Date(recapCache.date);
      const today = new Date();

      userCacheDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (userCacheDate.getTime() === today.getTime()) return recapCache.recap;

      AsyncStorage.removeItem('recapCache');
      return getRecap(day, true);
    }
    return Promise.all([
      getTimetable(day, force, ecoledirecteInstance),
      getGrades(force, ecoledirecteInstance),
      getHomeworks(day, force, null, ecoledirecteInstance),
      /*getHomeworks(addDays(day, 1), force, ecoledirecteInstance),
      getHomeworks(addDays(day, 2), force, ecoledirecteInstance),*/
    ]).then((result) => {
      // send to widget
      AsyncStorage.setItem(
        'recapCache',
        JSON.stringify({
          date: new Date(),
          recap: result,
        })
      );
      return result;
    });
  });
}

export { getRecap };