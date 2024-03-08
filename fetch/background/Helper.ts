import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AuthorizationStatus } from '@notifee/react-native';

const checkCanNotify = async () => {
  const settings = await notifee.requestPermission();

  return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
};

const DidNotified = async (id: string) => {
  const allNotifs = await getAllNotifs();
  return allNotifs.includes(id);
};

const SetNotified = async (id: string) => {
  let allNotifs = await getAllNotifs();
  allNotifs.push(id);
  try {
    await AsyncStorage.setItem("allNotifs", JSON.stringify(allNotifs));
  } catch (error) {
    console.error('Error storing allNotifs: ', error);
  }
};

export {
  checkCanNotify,
  DidNotified,
  SetNotified,
};
