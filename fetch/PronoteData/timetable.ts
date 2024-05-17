import { type Pronote, TimetableLesson, TimetableActivity } from 'pawnote';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStoragePronoteKeys } from './connector';
import { dateToFrenchFormat } from '../../utils/dates';

import type { CachedPapillonTimetable, PapillonLesson } from '../types/timetable';
import type { PapillonAttachmentType } from '../types/attachment';

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
    const timetableOverview = await instance.getTimetableOverview(...interval);
    const classes = timetableOverview.parse({
      withSuperposedCanceledClasses: false,
      withCanceledClasses: true,
      withPlannedClasses: true
    });

    const timetable: PapillonLesson[] = [];

    for (const currentClass of classes) {
      if (currentClass instanceof TimetableLesson) {
        const teachers = [
          ...currentClass.teacherNames,
          // We consider personal as teachers also here (for compatibility).
          ...currentClass.personalNames
        ];

        const resource = await currentClass.getResource();
        const contents: PapillonLesson['contents'] = [];
        if (resource) {
          for (const resourceContent of resource.contents) {
            contents.push({
              description: resourceContent.description,
              title: resourceContent.title,
              files: resourceContent.files.map(file => ({
                name: file.name,
                type: file.type as unknown as PapillonAttachmentType,
                url: file.url
              }))
            });
          }
        }

        timetable.push({
          id: currentClass.id,
          subject: currentClass.subject,
          teachers,
          rooms: currentClass.classrooms,
          group_names: currentClass.groupNames,
          memo: currentClass.notes,
          virtual: currentClass.virtualClassrooms,
          start: currentClass.startDate.getTime(),
          end: currentClass.endDate.getTime(),
          background_color: currentClass.backgroundColor,
          status: currentClass.status,
          is_cancelled: currentClass.canceled,
          is_outing: false,
          is_detention: currentClass.detention,
          is_exempted: currentClass.exempted,
          is_test: currentClass.test,
          contents
        });
      }
      else if (currentClass instanceof TimetableActivity) {
        timetable.push({
          id: currentClass.id,
          subject: {
            name: currentClass.title,
            groups: false,
            id: '0'
          },
          teachers: currentClass.attendants,
          rooms: [],
          group_names: [currentClass.resourceValue],
          memo: currentClass.notes,
          virtual: [],
          start: currentClass.startDate.getTime(),
          end: currentClass.endDate.getTime(),
          background_color: currentClass.backgroundColor,
          is_cancelled: false,
          is_outing: true,
          is_detention: false,
          is_exempted: false,
          is_test: false
        });
      }
    }

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
