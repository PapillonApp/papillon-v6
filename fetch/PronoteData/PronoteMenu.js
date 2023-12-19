import AsyncStorage from '@react-native-async-storage/async-storage';
import getConsts from '../consts';

import { refreshToken } from '../AuthStack/LoginFlow';

async function getMenu(day, force = false, day2 = null) {
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
    AsyncStorage.getItem('menuCache').then((menuCache) => {
      if (menuCache && !force) {
        menuCache = JSON.parse(menuCache);

        for (let i = 0; i < menuCache.length; i += 1) {
          const thisDay = new Date(day);
          const cacheDay = new Date(menuCache[i].date);

          thisDay.setHours(0, 0, 0, 0);
          cacheDay.setHours(0, 0, 0, 0);

          if (thisDay.getTime() === cacheDay.getTime()) {
            const currentTime = new Date();
            currentTime.setHours(0, 0, 0, 0);

            const cacheTime = new Date(menuCache[i].dateSaved);
            cacheTime.setHours(0, 0, 0, 0);

            if (currentTime.getTime() === cacheTime.getTime()) {
              return menuCache[i].timetable;
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
          `${consts.API}/menu` +
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
              return refreshToken().then(() => getMenu(day));
            }

            if (result === 'expired') {
              return refreshToken().then(() => getMenu(day));
            }

            // save in cache
            AsyncStorage.getItem('menuCache').then((_menuCache) => {
              let cachedMenu = [];

              if (_menuCache) {
                cachedMenu = JSON.parse(_menuCache);
              }

              cachedMenu = cachedMenu.filter(
                (entry) => entry.date !== day
              );

              cachedMenu.push({
                date: day,
                dateSaved: new Date(),
                timetable: result,
              });

              AsyncStorage.setItem(
                'menuCache',
                JSON.stringify(cachedMenu)
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


export { getMenu };
