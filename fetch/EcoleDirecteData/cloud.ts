import AsyncStorage from '@react-native-async-storage/async-storage';

import { AsyncStorageEcoleDirecteKeys } from './connector';
import { EDCore } from '@papillonapp/ed-core';

import type { cloudResFolder } from '@papillonapp/ed-core/dist/src/types/v3';

interface CachedED_Cloud {
    root_folder: cloudResFolder[],
    timestamp: number
}

export const EDCloudHandler = async (instance?: EDCore, force = false): Promise<cloudResFolder[] | null> => {

  const cache = await AsyncStorage.getItem(AsyncStorageEcoleDirecteKeys.CACHE_CLOUD);
  const now = Date.now();


  if (cache && !force) {
    const data: CachedED_Cloud = JSON.parse(cache);

    const userCacheDate = new Date(data.timestamp);
    const today = new Date();

    userCacheDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (userCacheDate.getTime() === today.getTime()) {
      return data.root_folder;
    }

    await AsyncStorage.removeItem(AsyncStorageEcoleDirecteKeys.CACHE_CLOUD);
    return EDCloudHandler(instance, true);
  }

  if (!instance) return null;

  try {

    const cloudFromED = await instance.cloud.fetch();


    let cachedCloud: CachedED_Cloud = {
      timestamp: now,
      root_folder: cloudFromED
    };
    if (cache) cachedCloud = JSON.parse(cache);

    await AsyncStorage.setItem(AsyncStorageEcoleDirecteKeys.CACHE_CLOUD, JSON.stringify(cachedCloud));
    return cloudFromED;

  }
  catch (error) {
    if (!cache) return null;
    const data: CachedED_Cloud = JSON.parse(cache);

    console.info('[ecoledirecte/cloud]: network failed, recover with cache');
    return data.root_folder;
  }
};
