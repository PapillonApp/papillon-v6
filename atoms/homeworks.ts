import { atom } from 'jotai';
import type { PapillonHomework } from '../fetch/types/homework';

/**
 * Atom that contains the homeworks.
 * 
 * Is `null` when loading all the homeworks from cache or network.
 * Contains all the homeworks from day 1 to the end of the year.
 * 
 * Use the below atoms to get the periods desired.
 */
export const homeworksAtom = atom<PapillonHomework[] | null>(null);

export const homeworksUntilNextWeekAtom = atom<PapillonHomework[] | null>((get) => {
  const homeworks = get(homeworksAtom);
  if (homeworks === null) return null;

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const nextWeekTime = nextWeek.getTime();
  const nowTime = Date.now();

  return homeworks.filter(homework => {
    const homeworkDateTime = new Date(homework.date).getTime();
    return homeworkDateTime < nextWeekTime && homeworkDateTime >= nowTime;
  });
});
