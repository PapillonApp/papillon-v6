import { type Pronote } from 'pawnote';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStoragePronoteKeys } from './connector';
import type { CachedPapillonTimetable, PapillonLesson } from '../types/timetable';
import { dateToFrenchFormat } from '../../utils/dates';

function removeDuplicateCourses(courses: PapillonLesson[]): PapillonLesson[] {
  const result = courses;

  for (let i = 0; i < courses.length; i += 1) {
    // if next cours starts at the same time
    if (i + 1 < courses.length && courses[i].start === courses[i + 1].start) {

      if (courses[i + 1].is_cancelled) {
        result.splice(i + 1, 1);
      }

      if (courses[i].is_cancelled) {
        result.splice(i, 1);
      }
    }
  }

  return result;
}

export const timetableHandler = async (interval: [from: Date, to?: Date], instance?: Pronote, force = false): Promise<PapillonLesson[] | null> => {
  let weekCacheString = dateToFrenchFormat(interval[0]);
  if (interval[1]) weekCacheString += '-' + dateToFrenchFormat(interval[1]);

  const cache = await AsyncStorage.getItem(AsyncStoragePronoteKeys.CACHE_TIMETABLE + '-' + weekCacheString);
  if (cache && !force) {
    const data: Array<CachedPapillonTimetable> = JSON.parse(cache);

    for (const cachedTimetable of data) {
      const cacheInterval = cachedTimetable.interval;
      if (cacheInterval.from === dateToFrenchFormat(interval[0])) {
        if (interval[1] && cacheInterval.to !== dateToFrenchFormat(interval[1])) continue;
        return cachedTimetable.timetable;
      }
    }
  }

  if (!instance) return null;

  try {
    const timetableFromPawnote = await instance.getLessonsForInterval(...interval);
    
    const timetable: PapillonLesson[] = timetableFromPawnote.map(lesson => ({
      id: lesson.id,
      num: lesson.num,
      subject: lesson.subject,
      teachers: lesson.teacherNames,
      rooms: lesson.classrooms,
      group_names: lesson.groupNames,
      memo: lesson.memo,
      virtual: lesson.virtualClassrooms,
      start: lesson.start.toISOString(),
      end: lesson.end.toISOString(),
      background_color: lesson.backgroundColor,
      status: lesson.status,
      is_cancelled: lesson.canceled,
      is_outing: lesson.outing,
      is_detention: lesson.detention,
      is_exempted: lesson.exempted,
      is_test: lesson.test
    })).sort((a, b) => a.start.localeCompare(b.start));

    const cleanedUpTimetable = removeDuplicateCourses(timetable);
    let cachedTimetable: Array<CachedPapillonTimetable> = [];

    if (cache) {
      cachedTimetable = JSON.parse(cache);
    }

    cachedTimetable.push({
      interval: {
        from: dateToFrenchFormat(interval[0]),
        to: interval[1] ? dateToFrenchFormat(interval[1]) : void 0
      },

      timetable: cleanedUpTimetable,
    });

    await AsyncStorage.setItem(AsyncStoragePronoteKeys.CACHE_TIMETABLE + '-' + weekCacheString, JSON.stringify(cachedTimetable));
    return cleanedUpTimetable;
  } catch (error) {
    console.info('pronote/timetableHandler: network failed, no cache', error);
    return null;
  }
};
