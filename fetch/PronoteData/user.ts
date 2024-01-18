import type { PapillonUser, CachedPapillonUser } from '../types/user';
import type { Pronote } from 'pawnote';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStoragePronoteKeys } from './connector';

const readProfilePictureAsB64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise<string>(resolve => {
    // Read as base64 URL.
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data);
    };
  });
};

export const userHandler = async (instance: Pronote, force = false): Promise<PapillonUser> => {
  const cache = await AsyncStorage.getItem(AsyncStoragePronoteKeys.CACHE_USER);
  if (cache && !force) {
    const data: CachedPapillonUser = JSON.parse(cache);
    return data.user;
  }

  const information = await instance.getPersonalInformation();
  const user: PapillonUser = {
    name: instance.studentName,
    class: instance.studentClass,
    establishment: instance.schoolName,
    phone: information.phone,
    address: information.address,
    email: information.email,
    ine: information.INE,
    delegue: false, // TODO
    periodes: instance.periods.map(period => ({
      start: period.start.toISOString(),
      end: period.end.toISOString(),
      name: period.name,
      id: period.id,
      actual: false // TODO
    }))
  };

  if (instance.studentProfilePictureURL) {
    user.profile_picture = await readProfilePictureAsB64(instance.studentProfilePictureURL);
  }

  const newCache: CachedPapillonUser = {
    date: new Date(),
    user
  };

  await AsyncStorage.setItem(AsyncStoragePronoteKeys.CACHE_USER, JSON.stringify(newCache));
  return user;
};
