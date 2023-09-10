import AsyncStorage from '@react-native-async-storage/async-storage';

import { getTimetable } from './PronoteTimetable';
import { getHomeworks } from './PronoteHomeworks';
import { getGrades } from './PronoteGrades';

function addDays(date, days) {
  date = new Date(date);
  date.setDate(date.getDate() + days);
}

function getRecap(day, force) {
  return AsyncStorage.getItem('recapCache').then((recapCache) => {
    if (recapCache && !force) {
      recapCache = JSON.parse(recapCache);

      const userCacheDate = new Date(recapCache.date);
      const today = new Date();

      userCacheDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (userCacheDate.getTime() === today.getTime()) {
        return recapCache.recap;
      }
      AsyncStorage.removeItem('recapCache');
      return getRecap(day, true);
    }
    else {
      return Promise.all([
        getTimetable(day),
        getHomeworks(day),
        getGrades(force),
      ]).then((result) => {
        
        AsyncStorage.setItem('recapCache', JSON.stringify({
          date: new Date(),
          recap: result,
        }));
        return result;
      });
    }
  });
}

export { getRecap };
