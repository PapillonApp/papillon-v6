import AsyncStorage from '@react-native-async-storage/async-storage';
import getConsts from '../consts';

import { refreshToken } from '../AuthStack/LoginFlow';

function getGrades(force = false) {
  // obtenir le token
  return getConsts().then((consts) =>
    AsyncStorage.getItem('gradesCache').then((gradesCache) => {
      if (gradesCache && !force) {
        gradesCache = JSON.parse(gradesCache);

        const userCacheDate = new Date(gradesCache.date);
        const today = new Date();

        userCacheDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (userCacheDate.getTime() === today.getTime()) {
          return gradesCache.grades;
        }
        AsyncStorage.removeItem('gradesCache');
        return getGrades(true);
      }
      return AsyncStorage.getItem('token').then((token) =>
        // fetch le timetable
        fetch(`${consts.API}/grades?token=${token}`, {
          method: 'GET',
        })
          .then((response) => response.text())
          .then((result) => {
            if (
              result === 'expired' ||
              result === 'notfound' ||
              result === '"notfound"'
            ) {
              return refreshToken().then(() => getGrades());
            }
            const cachedGrades = {
              date: new Date(),
              grades: result,
            };
            AsyncStorage.setItem('gradesCache', JSON.stringify(cachedGrades));

            return result;
          })
      );
    })
  );
}

function getEvaluations(force = false) {
  // obtenir le token
  return getConsts().then((consts) =>
    AsyncStorage.getItem('evaluationsCache').then((evaluationsCache) => {
      if (evaluationsCache && !force) {
        evaluationsCache = JSON.parse(evaluationsCache);

        const userCacheDate = new Date(evaluationsCache.date);
        const today = new Date();

        userCacheDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (userCacheDate.getTime() === today.getTime()) {
          return evaluationsCache.evaluations;
        }
        AsyncStorage.removeItem('evaluationsCache');
        return getEvaluations(true);
      }
      return AsyncStorage.getItem('token').then((token) =>
        // fetch le timetable
        fetch(`${consts.API}/evaluations?token=${token}`, {
          method: 'GET',
        })
          .then((response) => response.text())
          .then((result) => {
            if (
              result === 'expired' ||
              result === 'notfound' ||
              result === '"notfound"'
            ) {
              return refreshToken().then(() => getEvaluations());
            }
            const cachedEvaluations = {
              date: new Date(),
              evaluations: result,
            };
            AsyncStorage.setItem(
              'evaluationsCache',
              JSON.stringify(cachedEvaluations)
            );

            return result;
          })
          .catch(() => {
            console.error('Error fetching Pronote evaluations');
          })
      );
    })
  );
}

export { getGrades, getEvaluations };
