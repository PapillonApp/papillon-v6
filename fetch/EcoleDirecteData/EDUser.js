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

async function getUser(force = false) {

    const [userData, schoolData] = await Promise.all([
      AsyncStorage.getItem("ED_USERDATA").then((userdata) => JSON.parse(userdata)),
      AsyncStorage.getItem("ED_SCHOOLDATA").then((schooldata) => JSON.parse(schooldata)),
    ])

    let user = restructureData(userData, schoolData);
    saveUser(user);
    return user;
}

function saveUser(user) {
  // fetch profile picture
  /*fetch(user.profile_picture)
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
    });*/

    user.profile_picture = "data:application/octet-stream;base64,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"
    
    //TEMPORAIRE
    AsyncStorage.setItem(
      'userCache',
      JSON.stringify({
        date: new Date(),
        user,
      })
    );
}

export { getUser };