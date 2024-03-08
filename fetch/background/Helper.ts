import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AuthorizationStatus } from '@notifee/react-native';

const getAllNotifs = async () => {
  try {
    const value = await AsyncStorage.getItem("allNotifs");
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error('Error retrieving allNotifs: ', error);
    return [];
  }
};

const checkCanNotify = async (type = 'notificationsEnabled') => {
  const settings = await notifee.requestPermission();
  const authorized = settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;

  const notifs = await AsyncStorage.getItem('notificationSettings');
  let canNotify = true;
  let enabled = true;
  if (notifs) {
    const notifsSettings = JSON.parse(notifs);
    enabled = notifsSettings['notificationsEnabled'];
    canNotify = notifsSettings[type];
  }

  console.log('[background fetch] authorized:', authorized, 'canNotify:', canNotify, 'enabled:', enabled);

  return authorized && canNotify && enabled;
};

const DidNotified = async (id: string) => {
  const allNotifs = await getAllNotifs();
  return allNotifs.includes(id);
};

const SetNotified = async (id: string) => {
  let allNotifs = await getAllNotifs();
  allNotifs.push(id);
  try {
    await AsyncStorage.setItem('allNotifs', JSON.stringify(allNotifs));
  } catch (error) {
    console.error('Error storing allNotifs: ', error);
  }
};

export {
  checkCanNotify,
  DidNotified,
  SetNotified,
};
