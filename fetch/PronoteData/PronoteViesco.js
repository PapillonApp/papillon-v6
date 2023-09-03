import AsyncStorage from '@react-native-async-storage/async-storage';
import consts from '../consts.json';

import { refreshToken } from '../AuthStack/LoginFlow';

function getViesco(force = false) {
  // obtenir le token
  return AsyncStorage.getItem('viescoCache').then((viescoCache) => {
    if (viescoCache && !force) {
      viescoCache = JSON.parse(viescoCache);

      const userCacheDate = new Date(viescoCache.date);
      const today = new Date();

      userCacheDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (userCacheDate.getTime() === today.getTime()) {
        return viescoCache.viesco;
      }
      AsyncStorage.removeItem('viescoCache');
      return getViesco(true);
    }
    return AsyncStorage.getItem('token').then((token) =>
      // fetch le timetable
      fetch(`${consts.API}/absences?token=${token}`, {
        method: 'GET',
      })
        .then((response) => response.text())
        .then((result) => {
          if (
            result === 'expired' ||
            result === '"expired"' ||
            result === 'notfound' ||
            result === '"notfound"'
          ) {
            return refreshToken().then(() => getViesco());
          }
          const absences = JSON.parse(result);

          return fetch(`${consts.API}/punishments?token=${token}`, {
            method: 'GET',
          })
            .then((response) => response.text())
            .then((res) => {
              const punishments = JSON.parse(res);

              return fetch(`${consts.API}/delays?token=${token}`, {
                method: 'GET',
              })
                .then((response) => response.text())
                .then((r) => {
                  const delays = JSON.parse(r);

                  const cachedViesco = {
                    date: new Date(),
                    viesco: {
                      absences,
                      punishments,
                      delays,
                    },
                  };
                  AsyncStorage.setItem(
                    'viescoCache',
                    JSON.stringify(cachedViesco)
                  );

                  return cachedViesco.viesco;
                });
            });
        })
    );
  });
}

export { getViesco };
