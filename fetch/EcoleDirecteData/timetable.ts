import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CachedPapillonTimetable, PapillonLesson } from '../types/timetable';
import { dateToFrenchFormat } from '../../utils/dates';

import { AsyncStorageEcoleDirecteKeys } from './connector';
import { EDCore } from '@papillonapp/ed-core';

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

export const EDtimetableHandler = async (interval: [from: Date, to?: Date], instance?: EDCore, force = false): Promise<PapillonLesson[] | null> => {
  const from = dateToFrenchFormat(interval[0]);
  const to = interval[1] ? dateToFrenchFormat(interval[1]) : void 0;

  const cache = await AsyncStorage.getItem(AsyncStorageEcoleDirecteKeys.CACHE_TIMETABLE);
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

    // YYYY-MM-DD date format
    let firstDate = interval[0].toLocaleDateString().split('/');
    let date1 = firstDate[2] + '-' + firstDate[1] + '-' + firstDate[0];

    // YYYY-MM-DD date format
    let secondDate = interval[1] ? interval[1].toLocaleDateString().split('/'): null;
    let date2 = secondDate ? secondDate[2] + '-' + secondDate[1] + '-' + secondDate[0] : date1;

    console.log(date1, date2);

    const timetableFromED = await instance.timetable.fetchByDate(date1, date2);

    let timetable: PapillonLesson[] = [];

    timetableFromED.forEach(lesson => {

      if(lesson.typeCours === "PERMANENCE") return;

      if(lesson.typeCours === 'CONGE') return timetable.push({
        id: lesson.id,
        num: lesson.num || 0,
        subject: {
          id: lesson.id,
          name: lesson.text || 'TEST',
          groups: false
        },
        teachers: ['Aucun prof.'],
        rooms: ['Chez soi'],
        group_names: lesson.groupeCode.split(','),
        memo: 'Non disponible',
        virtual: ['Non disponible'],
        start: lesson.start_date,
        end: lesson.end_date,
        background_color: lesson.color,
        status: lesson.status || '',
        is_cancelled: lesson.isAnnule,
        is_outing: lesson.outing || false,
        is_detention: lesson.detention || false,
        is_exempted: lesson.exempted || false,
        is_test: lesson.test || false,
        classroom: ''
      });

      timetable.push({
        id: lesson.id,
        num: lesson.num || 0,
        subject: {
          id: lesson.id,
          name: lesson.text || 'TEST',
          groups: false
        },
        teachers: lesson.prof.split(','),
        rooms: lesson.salle.split(','),
        group_names: lesson.groupeCode.split(','),
        memo: 'Non disponible',
        virtual: ['Non disponible'],
        start: lesson.start_date,
        end: lesson.end_date,
        background_color: lesson.color,
        status: lesson.status || '',
        is_cancelled: lesson.isAnnule,
        is_outing: lesson.outing || false,
        is_detention: lesson.detention || false,
        is_exempted: lesson.exempted || false,
        is_test: lesson.test || false,
        classroom: ''
      });
    });

    timetable.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

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
    await AsyncStorage.setItem(AsyncStorageEcoleDirecteKeys.CACHE_TIMETABLE, JSON.stringify(cachedTimetables));
    return timetable;
  }
  catch (error) {
    if (!cache) return null;
    const data: Array<CachedPapillonTimetable> = JSON.parse(cache);

    const cached = data.find(cached => cached.interval.from === from && cached.interval.to === to);
    if (!cached) return null;

    console.info('[ecoledirecte/timetableHandler]: network failed, recover with cache');
    return cached.timetable;
  }
};
