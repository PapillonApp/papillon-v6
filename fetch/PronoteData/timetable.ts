import { type Pronote } from 'pawnote';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStoragePronoteKeys } from './connector';
import type { CachedPapillonTimetable, PapillonLesson } from '../types/timetable';

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

export const timetableHandler = async (day: Date, instance?: Pronote, force = false): Promise<PapillonLesson[] | null> => {
  const today = new Date(day);
  today.setHours(0, 0, 0, 0);
  
  const cache = await AsyncStorage.getItem(AsyncStoragePronoteKeys.CACHE_TIMETABLE);
  if (cache && !force) {
    const data: Array<CachedPapillonTimetable> = JSON.parse(cache);

    for (let i = 0; i < data.length; i += 1) {
      const cacheDay = new Date(data[i].date);
      cacheDay.setHours(0, 0, 0, 0);

      if (today.getTime() === cacheDay.getTime()) {
        const currentTime = new Date();
        currentTime.setHours(0, 0, 0, 0);

        const cacheTime = new Date(data[i].dateSaved);
        cacheTime.setHours(0, 0, 0, 0);

        if (currentTime.getTime() === cacheTime.getTime()) {
          return data[i].timetable;
        }
      }
    }
  }

  if (!instance) throw new Error('No instance available.');

  try {
    const timetableFromPawnote = await instance.getLessonsForInterval(day);
    
    const timetable: PapillonLesson[] = timetableFromPawnote.map(lesson => ({
      id: lesson.id,
      num: lesson.num,
      subject: lesson.subject,
      teachers: lesson.teacherNames,
      rooms: lesson.classrooms,
      group_names: lesson.groupNames,
      memo: lesson.memo,
      content: [], // TODO in Pawnote
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

    cachedTimetable = cachedTimetable.filter(
      (entry) => new Date(entry.date) !== today
    );

    cachedTimetable.push({
      date: today.toISOString(),
      dateSaved: new Date().toISOString(),
      timetable: cleanedUpTimetable,
    });

    await AsyncStorage.setItem(AsyncStoragePronoteKeys.CACHE_TIMETABLE, JSON.stringify(cachedTimetable));
    return cleanedUpTimetable;
  } catch (error) {
    console.info('pronote/timetableHandler: network failed, no cache', error);
    return null;
  }
};
