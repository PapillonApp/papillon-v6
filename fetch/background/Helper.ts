import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AuthorizationStatus, AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

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
  if(authorized) RegisterNotifChannel()
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

const RegisterNotifChannel = async () => {
  if(Platform.OS === "ios") return;
  let groups = [
    {
      name: 'Nouvelles données disponibles',
      description: 'Notifications en arrière-plan',
      id: 'newdata-group'
    },
    {
      name: 'Rappels',
      description: 'Notifications de rappels',
      id: 'remind-group'
    },
    {
      name: 'Notifications silencieuses',
      description: 'Notifications en arrière-plan',
      id: 'silent-group'
    }
  ]
  let channels = [
    {
      id: 'silent',
      groupId: 'silent-group',
      name: 'Données en arrière-plan',
      description: 'Notifie quand l\'application récupère les données en arrière-plan',
      importance: AndroidImportance.LOW
    },
    {
      name: 'Rappels de devoirs',
      id: 'works-remind',
      groupId: 'remind-group',
      description: 'Notifications de rappels de devoirs',
      importance: AndroidImportance.HIGH
    },
    {
      name: 'Rappels de cours',
      id: 'course-remind',
      groupId: 'remind-group',
      description: 'Notifications de rappels de cours (configurable dans l\'application)',
      importance: AndroidImportance.HIGH
    },
    {
      name: 'Nouvelles actualités',
      id: 'new-news',
      groupId: 'newdata-group',
      description: 'Indique quand une nouvelle actualité est disponible',
      importance: AndroidImportance.HIGH
    },
  ]
  await notifee.createChannelGroups(groups)
  await notifee.createChannels(channels)
}

export {
  checkCanNotify,
  DidNotified,
  SetNotified,
};
