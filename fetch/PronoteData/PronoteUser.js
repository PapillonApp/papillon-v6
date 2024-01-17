import AsyncStorage from '@react-native-async-storage/async-storage';
import getConsts from '../consts';

import { refreshToken } from '../AuthStack/LoginFlow';

function getUser(force = false) {
  // return cached user if from today and exists
  return getConsts().then((consts) =>
    AsyncStorage.getItem('userCache').then((userCache) => {
      if (userCache && !force) {
        userCache = JSON.parse(userCache);

        return editUser(userCache.user);
      }
      // obtenir le token
      return AsyncStorage.getItem('token')
        .then((token) =>
          // fetch le timetable
          fetch(`${consts.API}/user?token=${token}`, {
            method: 'GET',
          })
            .then((response) => response.json())
            .then(async (result) => {
              if (result === 'expired' || result === 'notfound') {
                return refreshToken().then(() => getUser());
              }
              saveUser(result);
              return editUser(result);
            })
            .catch(() => {})
        )
        .catch(() => {});
    })
  );
}

function editUser(profile) {
  const user = profile;

  return AsyncStorage.getItem('custom_profile_picture').then(
    (customProfilePicture) => {
      (customProfilePicture);

      if (customProfilePicture) {
        user.profile_picture = customProfilePicture;
      }

      return AsyncStorage.getItem('custom_name').then((customName) => {
        if (customName) {
          user.name = customName;
        }

        return user;
      });
    }
  );
}

function saveUser(user) {
  // fetch profile picture
  fetch(user.profile_picture)
    .then((response) => response.blob())
    .then((blob) => {
      // save as base64 url
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        user.profile_picture = base64data;

        // save user
        AsyncStorage.setItem(
          'userCache',
          JSON.stringify({
            date: new Date(),
            user,
          })
        );
      };
    })
    .catch((err) => {
      AsyncStorage.setItem(
        'userCache',
        JSON.stringify({
          date: new Date(),
          user,
        })
      );
    });
}

export { getUser };
