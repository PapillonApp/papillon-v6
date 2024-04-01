import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from 'expo-store-review';
import * as Linking from 'expo-linking';

import { Alert, Platform } from "react-native";

const itunesItemId = 6477761165;

const UserReview = async () => {
  let lastOpenedAppRows = await AsyncStorage.getItem('lastOpenedAppRows');
  let lastAskedForReview = await AsyncStorage.getItem('lastAskedForReview');

  if (!lastOpenedAppRows) {
    await AsyncStorage.setItem('lastOpenedAppRows', '0');
    lastOpenedAppRows = '0';
  }

  if (lastAskedForReview) {
    if (new Date().getTime() - new Date(lastAskedForReview).getTime() < 14*24*60*60*1000) {
      return;
    }
  }

  if (parseInt(lastOpenedAppRows) < 7) {
    await AsyncStorage.setItem('lastOpenedAppRows', (parseInt(lastOpenedAppRows) + 1).toString());
    return;
  }
  else {
    AskForReview();
    await AsyncStorage.setItem('lastAskedForReview', new Date().toISOString());
    await AsyncStorage.setItem('lastOpenedAppRows', '0');
  }
};

const AskForReview = async () => {
  if (await StoreReview.hasAction()) {
    if (Platform.OS === 'ios') {
      await StoreReview.requestReview();
    }
    else {
      Alert.alert(
        'Notez l\'application Papillon !',
        'Si vous aimez utiliser Papillon, prenez quelques secondes pour nous noter sur le Play Store. Merci pour votre soutien !',
        [
          {
            text: 'Plus tard',
            onPress: () => console.log('Ask for review later'),
            style: 'cancel'
          },
          {
            text: 'Noter',
            onPress: () => StoreReview.requestReview()
          }
        ]
      );
    }
  }
};

export default UserReview;