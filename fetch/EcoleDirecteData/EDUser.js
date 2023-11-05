import AsyncStorage from '@react-native-async-storage/async-storage';


function restructureData(userData, etabData) {
  return {
    "address": ["Non disponible"],
    "class": userData.classe?.code || "rien",
    "delegue": [],
    "email": userData.email,
    "establishment": etabData.name,
    "ine": "Non disponible",
    "name": userData.nom + " " + userData.prenom,
    "phone": userData.tel,
    "profile_picture": userData.photo
  }
}

function getUser(force = false, ecoledirecteInstance) {
  // return cached user if from today and exists
  AsyncStorage.getItem('userCache').then((userCache) => {
    if (userCache && !force) {
      userCache = JSON.parse(userCache);
      console.log("cached user ", userCache.user)
      return editUser(userCache.user);
    }
    console.log(ecoledirecteInstance)
    if(ecoledirecteInstance.isLoggedIn && Object.keys(ecoledirecteInstance.student).length > 1) {
      let data = restructureData(ecoledirecteInstance.student, ecoledirecteInstance.school);
      saveUser(data);
      return editUser(data);
    } else {
      console.log("TODO : FETCH USER DATA");
    }

    // obtenir le token
    /*return AsyncStorage.getItem('token').then((token) => {
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
      }).catch(() => {});*/
  })
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
      // eslint-disable-next-line no-undef
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