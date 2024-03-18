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
      // remove the course that has is_cancelled set to true
      if (courses[i].is_cancelled) {
        result.splice(i, 1);
      } else if (courses[i + 1].is_cancelled) {
        result.splice(i + 1, 1);
      }
    }

    if (i + 1 < courses.length && courses[i].subject?.id === courses[i + 1].subject?.id && courses[i].rooms.join(',') == courses[i + 1].rooms.join(',')) {
      // check if difference between the two courses is less than 21 minutes
      const diff = new Date(courses[i + 1].start).getTime() - new Date(courses[i].end).getTime();
      if (diff < 21 * 60 * 1000) {
        // Merge the two courses.
        result[i].end = courses[i + 1].end;

        // Remove the second course.
        result.splice(i + 1, 1);
      }
    }
  }

  return result;
}

export const timetableHandler = async (interval: [from: Date, to?: Date], instance?: Pronote, force = false): Promise<PapillonLesson[] | null> => {
  const from = dateToFrenchFormat(interval[0]);
  const to = interval[1] ? dateToFrenchFormat(interval[1]) : void 0;

  const cache = await AsyncStorage.getItem(AsyncStoragePronoteKeys.CACHE_TIMETABLE);
  const now = Date.now();

  if (cache && !force) {
    const data: Array<CachedPapillonTimetable> = JSON.parse(cache);
    const cached = data.find(cached => cached.interval.from === from && cached.interval.to === to);
    
    // Within 12 hours.
    if (cached && now - cached.cacheTimestamp < 12 * 60 * 60 * 1000) {
      return cached.timetable;
    }
  }

  if (!instance) return null;

  try {
    const timetableFromPawnote = await instance.getLessonsForInterval(...interval);
    
    const timetable: PapillonLesson[] = removeDuplicateCourses(timetableFromPawnote.map(lesson => ({
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
    })).sort((a, b) => a.start.localeCompare(b.start)));
    
    // Build up the new timetables cache inside storage.
    let cachedTimetables: Array<CachedPapillonTimetable> = [];
    if (cache) cachedTimetables = JSON.parse(cache);

    // Make sure to delete any duplicates.
    cachedTimetables = cachedTimetables.filter(cached => cached.interval.from !== from || cached.interval.to !== to);

    // Add the new cache.
    cachedTimetables.push({
      cacheTimestamp: now,
      interval: { from, to },
      timetable: timetable,
    });

    await AsyncStorage.setItem(AsyncStoragePronoteKeys.CACHE_TIMETABLE, JSON.stringify(cachedTimetables));
    return timetable;
  }
  catch (error) {
    if (!cache) return null;
    const data: Array<CachedPapillonTimetable> = JSON.parse(cache);

    const cached = data.find(cached => cached.interval.from === from && cached.interval.to === to);
    if (!cached) return null;

    console.info('[pronote/timetableHandler]: network failed, recover with cache');
    return cached.timetable;
  }
};
