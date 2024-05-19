import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CachedPapillonTimetable, PapillonLesson } from '../types/timetable';
import { dateToFrenchFormat } from '../../utils/dates';

import { AsyncStorageEcoleDirecteKeys } from './connector';
import { EDCore } from '@papillonapp/ed-core';

import type { studentDocsResData } from '@papillonapp/ed-core/dist/src/types/v3';


interface CachedED_Documents {
    documents: studentDocsResData,
    timestamp: number
}

export const EDDocumentsHandler = async (instance?: EDCore, force = false): Promise<studentDocsResData | null> => {

  const cache = await AsyncStorage.getItem(AsyncStorageEcoleDirecteKeys.CACHE_DOCUMENTS);
  const now = Date.now();


  if (cache && !force) {
    const data: CachedED_Documents = JSON.parse(cache);

    const userCacheDate = new Date(data.timestamp);
    const today = new Date();

    userCacheDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (userCacheDate.getTime() === today.getTime()) {
      return data.documents;
    }

    await AsyncStorage.removeItem(AsyncStorageEcoleDirecteKeys.CACHE_DOCUMENTS);
    return EDDocumentsHandler(instance, true);
  }

  if (!instance) return null;

  try {

    const documentsFromED = await instance.documents.fetch();


    let cachedDocuments: CachedED_Documents = {
        timestamp: now,
        documents: documentsFromED,
      };
    if (cache) cachedDocuments = JSON.parse(cache);

    await AsyncStorage.setItem(AsyncStorageEcoleDirecteKeys.CACHE_DOCUMENTS, JSON.stringify(cachedDocuments));
    return documentsFromED;
  }
  catch (error) {
    if (!cache) return null;
    const data: CachedED_Documents = JSON.parse(cache);

    console.info('[ecoledirecte/documents]: network failed, recover with cache');
    return data.documents;
  }
};
