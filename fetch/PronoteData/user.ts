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

export const userHandler = async (instance?: Pronote, force = false): Promise<PapillonUser | null> => {
  console.info('pronote/userHandler: init');
  
  const cache = await AsyncStorage.getItem(AsyncStoragePronoteKeys.CACHE_USER);
  if (cache && !force) {
    const data: CachedPapillonUser = JSON.parse(cache);
    console.info('pronote/userHandler: read from cache');
    return data.user;
  }
  
  try {
    if (!instance) throw new Error('No instance available.');

    console.info('pronote/userHandler: read from API');
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
  }
  // Network issue, load cache otherwise nothing...
  catch {
    if (cache) {
      console.info('pronote/userHandler: network failed, recover with cache');
      const data: CachedPapillonUser = JSON.parse(cache);
      return data.user;
    }
    
    console.info('pronote/userHandler: network failed, no cache');
    return null;
  }
};
