import AsyncStorage from '@react-native-async-storage/async-storage';
import consts from '../consts.json';

import { refreshToken } from '../AuthStack/LoginFlow';

function getGrades(force = false) {
  // obtenir le token
  return AsyncStorage.getItem('gradesCache').then((gradesCache) => {
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
  });
}

function getEvaluations(force = false) {
  // obtenir le token
  return AsyncStorage.getItem('evaluationsCache').then((evaluationsCache) => {
    if (evaluationsCache && !force) {
      // eslint-disable-next-line no-param-reassign
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
    );
  });
}

function changePeriod(selectedPeriod) {
  return AsyncStorage.getItem('token').then((token) => {
    const { API } = consts;

    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    const urlencoded = new URLSearchParams();
    urlencoded.append('token', token);
    urlencoded.append('periodName', selectedPeriod);

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow',
    };

    // get token from API
    return fetch(
      `${API}/changePeriod?token=${token}&periodName=${selectedPeriod}`,
      requestOptions
    ).then((response) => response.json());
  });
}

export { getGrades, getEvaluations, changePeriod };
