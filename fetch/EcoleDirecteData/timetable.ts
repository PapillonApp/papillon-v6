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

    let firstdate = interval[0].toLocaleDateString().split("/");
    let date1 = firstdate[2] + '-' + firstdate[1] + '-' + firstdate[0];

    let secdate = interval[1].toLocaleDateString().split("/");
    let date2 = secdate ? secdate[2] + '-' + secdate[1] + '-' + secdate[0] : date1;

    console.log(date1, date2);

    const timetableFromED = await instance.timetable.fetchByDate(date1, date2);

    let timetable: PapillonLesson[] = new Array();

    timetableFromED.forEach(lesson => {
      timetable.push({
        id: lesson.id,
        num: lesson.num || 0,
        subject: {
          id: lesson.id,
          name: lesson.text || "TEST",
          groups: false
        },
        teachers: lesson.prof.split(","),
        rooms: lesson.salle.split(","),
        group_names: lesson.groupeCode.split(","),
        memo: "Non disponible",
        virtual: ["Non disponible"],
        start: lesson.start_date, //new Date(new Date(lesson.start_date).getTime() - (new Date(lesson.start_date).getTimezoneOffset() * 60000)).toISOString(),
        end: lesson.end_date, //new Date(new Date(lesson.end_date).getTime() - (new Date(lesson.end_date).getTimezoneOffset() * 60000)).toISOString(),
        background_color: lesson.color,
        status: lesson.status || "",
        is_cancelled: lesson.isAnnule,
        is_outing: lesson.outing || false,
        is_detention: lesson.detention || false,
        is_exempted: lesson.exempted || false,
        is_test: lesson.test || false
      })
    })

    /*const timetable: PapillonLesson[] = timetableFromED.map(lesson => ({
      id: lesson.id,
      num: lesson.num || 0,
      subject: { // TODO: Export the type in Pawnote of `StudentSubject` : we're reusing it here.
        id: lesson.id,
        name: lesson.text || "TEST",
        groups: false
      },
      teachers: lesson.prof.split(","),
      rooms: lesson.salle.split(","),
      group_names: lesson.groupeCode.split(","),
      memo: "Non disponible",
      virtual: ["Non disponible"],
      start: new Date(new Date(lesson.start_date).getTime() - (new Date(lesson.start_date).getTimezoneOffset() * 60000)).toISOString(),
      end:  new Date(new Date(lesson.end_date).getTime() - (new Date(lesson.end_date).getTimezoneOffset() * 60000)).toISOString(),
      background_color: lesson.color,
      status: lesson.status || "",
      is_cancelled: lesson.isAnnule,
      is_outing: lesson.outing || false,
      is_detention: lesson.detention || false,
      is_exempted: lesson.exempted || false,
      is_test: lesson.test || false
    })).sort((a, b) => a.start.localeCompare(b.start));*/
    timetable.sort((a, b) => a.start.localeCompare(b.start));

    
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
    console.log("eeeeerrrrroooooorrrrr")
    console.log(error)
    if (!cache) return null;
    const data: Array<CachedPapillonTimetable> = JSON.parse(cache);

    const cached = data.find(cached => cached.interval.from === from && cached.interval.to === to);
    if (!cached) return null;

    console.info('[ecoledirecte/timetableHandler]: network failed, recover with cache');
    return cached.timetable;
  }
};
