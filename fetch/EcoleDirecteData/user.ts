import type { PapillonUser, CachedPapillonUser, PapillonUserPeriod } from '../types/user';
import { EDCore } from '@papillonapp/ed-core';
import { AsyncStorageEcoleDirecteKeys } from './connector';

import AsyncStorage from '@react-native-async-storage/async-storage';
import downloadAsB64 from '../../utils/downloadAsB64';



export const userInformations = async (instance?: EDCore, force = false): Promise<PapillonUser | null> => {
  const cache = await AsyncStorage.getItem(AsyncStorageEcoleDirecteKeys.CACHE_USER);
  if (cache && !force) {
    const data: CachedPapillonUser = JSON.parse(cache);

    // Check if the cache is outdated : 1 day
    if (new Date().getTime() - data.timestamp > 24 * 60 * 60 * 1000) {
      return userInformations(instance, true);
    }

    return data.user;
  }
  
  try {
    if (!instance) throw new Error('No instance available.');

    let name = instance.student.nom + " " + instance.student.prenom;

    const user: PapillonUser = {
      name: name,
      class: instance.student.classe.libelle,
      establishment: instance.school.name,
      phone: instance.student.tel,
      address: ["Non disponible"],
      email: instance.student.email,
      ine: "Non disponible",
      delegue: false, // TODO
      periodes: {
        grades: [],
        attendance: [],
        evaluations: []
      }
    };
  
    if (instance.studentProfilePictureURL) {
      user.profile_picture = await downloadAsB64(instance.studentProfilePictureURL);
    }
  
    const newCache: CachedPapillonUser = {
      timestamp: new Date().getTime(),
      user
    };
  
    await AsyncStorage.setItem(AsyncStorageEcoleDirecteKeys.CACHE_USER, JSON.stringify(newCache));
    return user;
  }
  // Network issue, load cache otherwise nothing...
  catch {
    if (cache) {
      const data: CachedPapillonUser = JSON.parse(cache);
      return data.user;
    }
    
    return null;
  }
};
