import type { PapillonHomework, PapillonHomeworkAttachment } from '../types/homework';
import type { Pronote } from 'pawnote';

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { dateToFrenchFormat } from '../../utils/dates';
// import { AsyncStoragePronoteKeys } from './connector';

// const makeCacheKey = (day: Date): string => `${AsyncStoragePronoteKeys.CACHE_HOMEWORK}-${dateToFrenchFormat(day)}`;

const makeLocalID = (homework: {
  description: string
  subjectName: string | undefined
  date: Date
}): string => {
  let localID: string;

  // return a combination of the 20 first letters of description
  if (homework.description.length > 20) {
    localID = homework.description.substring(0, 20);
  }
  else {
    localID = homework.description;
  }

  // 2 first letters of subject name
  localID += homework.subjectName?.substring(0, 2) ?? '??';

  // date in ISO
  localID += homework.date.toISOString();

  return localID;
};

export const homeworkHandler = async (start: Date, end?: Date, instance?: Pronote/*, force = false*/): Promise<PapillonHomework[] | null> => {
  // const cacheKey = makeCacheKey(day);
  // const cache = await AsyncStorage.getItem(cacheKey);
  // if (cache && !force) {
  // TODO: cache ?
  // }

  if (!instance) return null;

  try {
    // We don't pass the end of the interval, because we want every homework
    // from the given day until the end of the year.
    const everyHomework = await instance.getHomeworkForInterval(start, end);
    const parsedHomework: PapillonHomework[] = [];

    for (const homework of everyHomework) {
      const attachments: PapillonHomeworkAttachment[] = [];
      for (const attachment of homework.attachments) {
        attachments.push({
          name: attachment.name,
          type: attachment.type,
          url: attachment.url,
        });
      }

      const localID = makeLocalID({
        description: homework.description,
        subjectName: homework.subject.name,
        date: homework.deadline,
      });

      parsedHomework.push({
        id: homework.id,
        localID,
        attachments,
        subject: {
          id: homework.subject.id,
          name: homework.subject.name,
          groups: homework.subject.groups,
        },
        description: homework.description,
        background_color: homework.backgroundColor,
        done: homework.done,
        date: homework.deadline.toISOString(),
      });
    }

    return parsedHomework;
  } catch (error) {
    // if (cache) {
    //   console.info('pronote/homeworkHandler: network failed, recover with cache');
    //   const data: CachedPapillonHomework = JSON.parse(cache);
    //   return data.homework;
    // }
    
    console.info('pronote/homeworkHandler: network failed, no cache', error);
    return null;
  }
};
