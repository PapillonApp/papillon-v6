import type { PapillonUser, CachedPapillonUser, PapillonUserPeriod } from '../types/user';
import type { Period, Pronote } from 'pawnote';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStoragePronoteKeys } from './connector';
import downloadAsB64 from '../../utils/downloadAsB64';

const parsePeriodsForPapillon = (periods: Period[], actual: Period): PapillonUserPeriod[] => periods.map(period => ({
  id: period.id,
  name: period.name,
  start: period.start.getTime(),
  end: period.end.getTime(),
  actual: period.id === actual.id
}));

export const userHandler = async (instance?: Pronote, force = false): Promise<PapillonUser | null> => {
  const cache = await AsyncStorage.getItem(AsyncStoragePronoteKeys.CACHE_USER);
  if (cache && !force) {
    const data: CachedPapillonUser = JSON.parse(cache);

    // Check if the cache is outdated : 1 day
    if (new Date().getTime() - data.timestamp > 24 * 60 * 60 * 1000) {
      return userHandler(instance, true);
    }

    return data.user;
  }
  
  try {
    if (!instance) throw new Error('No instance available.');
    const information = await instance.getPersonalInformation();

    const user: PapillonUser = {
      name: instance.studentName,
      class: instance.studentClass,
      establishment: instance.schoolName,
      phone: information.phone,
      address: information.address,
      email: information.email,
      ine: information.INE,
      delegue: false, // TODO in Pawnote
      periodes: {
        grades: parsePeriodsForPapillon(
          instance.readPeriodsForGradesOverview(),
          instance.readDefaultPeriodForGradesOverview()
        ),
        attendance: parsePeriodsForPapillon(
          instance.readPeriodsForAttendance(),
          instance.readDefaultPeriodForAttendance()
        ),
        evaluations: parsePeriodsForPapillon(
          instance.readPeriodsForEvaluations(),
          instance.readDefaultPeriodForEvaluations()
        )
      }
    };
  
    if (instance.studentProfilePictureURL) {
      user.profile_picture = await downloadAsB64(instance.studentProfilePictureURL);
    }
  
    const newCache: CachedPapillonUser = {
      timestamp: new Date().getTime(),
      user
    };
  
    await AsyncStorage.setItem(AsyncStoragePronoteKeys.CACHE_USER, JSON.stringify(newCache));
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
