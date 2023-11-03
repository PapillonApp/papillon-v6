import AsyncStorage from '@react-native-async-storage/async-storage';
import getConsts from '../consts';

import { refreshToken } from '../AuthStack/LoginFlow';

async function getHomeworks(day, force = false, day2 = null) {
  if (!force) {
    force = false;
  }

  if (!day2) {
    day2 = day;
  } else {
    force = true;
  }

  // if date is not valid
  if (
    Number.isNaN(new Date(day).getTime()) &&
    Number.isNaN(new Date(day2).getTime())
  )
    return [];

  return getConsts().then((consts) =>
    AsyncStorage.getItem('homeworksCache').then((homeworksCache) => {
      if (homeworksCache && !force) {
        homeworksCache = JSON.parse(homeworksCache);

        for (let i = 0; i < homeworksCache.length; i += 1) {
          const thisDay = new Date(day);
          const cacheDay = new Date(homeworksCache[i].date);

          thisDay.setHours(0, 0, 0, 0);
          cacheDay.setHours(0, 0, 0, 0);

          if (thisDay.getTime() === cacheDay.getTime()) {
            const currentTime = new Date();
            currentTime.setHours(0, 0, 0, 0);

            const cacheTime = new Date(homeworksCache[i].dateSaved);
            cacheTime.setHours(0, 0, 0, 0);

            if (currentTime.getTime() === cacheTime.getTime()) {
              return homeworksCache[i].timetable;
            }
          }
        }
      }

      // TEMPORARY : remove 1 month
      day = new Date(day);

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

      day2 = new Date(day2);

      // date = '2021-09-13' (YYYY-MM-DD)
      const date2 = new Date(day2);
      const year2 = date2.getFullYear();
      let month2 = date2.getMonth() + 1;
      let dayOfMonth2 = date2.getDate();

      if (month2 < 10) {
        month2 = `0${month2}`;
      }

      if (dayOfMonth2 < 10) {
        dayOfMonth2 = `0${dayOfMonth2}`;
      }

      day2 = `${year2}-${month2}-${dayOfMonth2}`;

      // obtenir le token
      return AsyncStorage.getItem('token').then((token) =>
        // fetch les devoirs
        fetch(
          `${consts.API}/homework` +
            `?token=${token}&dateFrom=${day}&dateTo=${day2}`,
          {
            method: 'GET',
          }
        )
          .then((response) => response.json())
          .catch((e) => {
            return [];
          })
          .then((result) => {

            if (result === 'notfound') {
              return refreshToken().then(() => getHomeworks(day));
            }

            if (result === 'expired') {
              return refreshToken().then(() => getHomeworks(day));
            }

            // save in cache
            AsyncStorage.getItem('homeworksCache').then((_homeworksCache) => {
              let cachedHomeworks = [];

              if (_homeworksCache) {
                cachedHomeworks = JSON.parse(_homeworksCache);
              }

              cachedHomeworks = cachedHomeworks.filter(
                (entry) => entry.date !== day
              );

              cachedHomeworks.push({
                date: day,
                dateSaved: new Date(),
                timetable: result,
              });

              AsyncStorage.setItem(
                'homeworksCache',
                JSON.stringify(cachedHomeworks)
              );
            });

            return result;
          })
          .catch((e) => {
            return [];
          })
      );
    })
  );
}

function changeHomeworkState(day, id) {
  // TEMPORARY : remove 1 month
  day = day.split(' ')[0];

  id = id.replace('#', '%23');

  // obtenir le token
  return getConsts().then((consts) =>
    AsyncStorage.getItem('token').then((token) =>
      // fetch les devoirs
      fetch(
        `${consts.API}/homework/changeState?token=${token}&dateFrom=${day}&dateTo=${day}&homeworkId=${id}`,
        {
          method: 'POST',
        }
      )
        .then((response) => response.json())
        .then((result) => {
          if (result === 'expired' || result === 'notfound') {
            return refreshToken().then(() => changeHomeworkState(day, id));
          }
          return result;
        })
    )
  );
}

export { getHomeworks, changeHomeworkState };
