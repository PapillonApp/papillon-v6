import type { CachedPapillonGrades, PapillonGradeValue, PapillonGrades } from '../types/grades';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Pronote, PronoteApiGradeType } from 'pawnote';
import { AsyncStoragePronoteKeys } from './connector';

/**
 * Get the state of a grade in an integer form.
 * 
 * @param gradeValue - Value of the grade.
 * @param significant - `true` if we want to get only the state, `false` if we want to get the value itself, so -1 if stateful.
 */
const getGradeState = (gradeValue: number | PronoteApiGradeType): PapillonGradeValue => {
  if (typeof gradeValue === 'number') return {
    significant: false,
    value: gradeValue
  };
  
  return {
    significant: true,
    type: gradeValue
  };
};

export const gradesHandler = async (periodName: string, instance?: Pronote, force = false): Promise<PapillonGrades | null> => {
  const cache = await AsyncStorage.getItem(AsyncStoragePronoteKeys.CACHE_GRADES + periodName);
  if (cache && !force) {
    const data: CachedPapillonGrades = JSON.parse(cache);

    const userCacheDate = new Date(data.timestamp);
    const today = new Date();

    userCacheDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (userCacheDate.getTime() === today.getTime()) {
      return data.grades;
    }

    await AsyncStorage.removeItem(AsyncStoragePronoteKeys.CACHE_GRADES + periodName);
    return gradesHandler(periodName, instance, true);
  }

  if (!instance) return null;
  
  const period = instance.readPeriodsForGradesOverview().find(period => period.name === periodName);
  if (!period) return null;

  try {
    const gradesOverview = await instance.getGradesOverview(period);
  
    const grades: PapillonGrades = {
      grades: gradesOverview.grades.map(grade => ({
        id: grade.id,
        subject: {
          id: grade.subject.id,
          name: grade.subject.name,
          groups: grade.subject.groups
        },
        date: grade.date.toISOString(),
        description: grade.comment,
        is_bonus: grade.isBonus,
        is_optional: grade.isOptional,
        is_out_of_20: grade.isOutOf20,
        grade: {
          value: getGradeState(grade.value),
          out_of: getGradeState(grade.outOf),
          coefficient: grade.coefficient,
          average: getGradeState(grade.average),
          max: getGradeState(grade.max),
          min: getGradeState(grade.min),
        }
      })),
  
      averages: gradesOverview.averages.map(average => ({
        subject: {
          id: average.subject.id,
          name: average.subject.name,
          groups: average.subject.groups
        },
        average: getGradeState(average.student),
        class_average: getGradeState(average.class_average),
        max: getGradeState(average.max),
        min: getGradeState(average.min),
        out_of: getGradeState(average.outOf),
        color: average.backgroundColor ?? '#08BE88'
      })),
  
      overall_average: typeof gradesOverview.overallAverage !== 'undefined' ? getGradeState(gradesOverview.overallAverage) : { significant: false, value: -1 },
      class_overall_average: typeof gradesOverview.classAverage !== 'undefined' ? getGradeState(gradesOverview.classAverage) : { significant: false, value: -1 }
    };
  
    const newCache: CachedPapillonGrades = {
      timestamp: Date.now(),
      grades
    };
  
    await AsyncStorage.setItem(AsyncStoragePronoteKeys.CACHE_GRADES + periodName, JSON.stringify(newCache));
    return grades;
  } catch (error) {
    if (cache) {
      console.info('pronote/gradesHandler: network failed, recover with cache');
      const data: CachedPapillonGrades = JSON.parse(cache);
      return data.grades;
    }
    
    console.info('pronote/gradesHandler: network failed, no cache', error);
    return null;
  }
};
