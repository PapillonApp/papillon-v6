import type { CachedPapillonGrades, PapillonGradeValue, PapillonGrades } from '../types/grades';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Pronote, PronoteApiGradeType } from 'pawnote';
import { AsyncStoragePronoteKeys } from './connector';
import type { PapillonAttachment } from '../types/attachment';

/**
 * Get the state of a grade in an integer form.
 * 
 * @param gradeValue - Value of the grade.
 */
const getGradeState = (gradeValue: number | PronoteApiGradeType): PapillonGradeValue => {
  if (typeof gradeValue === 'number') {
    return {
      significant: false,
      value: gradeValue,
      type: 'number' as PronoteApiGradeType 
    };
  }

  return {
    significant: true,
    type: gradeValue,
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
        correctionFile: grade.correctionFile as unknown as PapillonAttachment | undefined,
        subjectFile: grade.subjectFile as unknown as PapillonAttachment | undefined,
        grade: {
          value: grade.value !== undefined ? getGradeState(grade.value) : { significant: false, value: -1, type: 'number' as PronoteApiGradeType },
          out_of: grade.outOf !== undefined ? getGradeState(grade.outOf) : { significant: false, value: -1, type: 'number' as PronoteApiGradeType },
          coefficient: grade.coefficient,
          average: grade.average !== undefined ? getGradeState(grade.average) : { significant: false, value: -1, type: 'number' as PronoteApiGradeType },
          max: grade.max !== undefined ? getGradeState(grade.max) : { significant: false, value: -1, type: 'number' as PronoteApiGradeType },
          min: grade.min !== undefined ? getGradeState(grade.min) : { significant: false, value: -1, type: 'number' as PronoteApiGradeType },
        }
      })),
  
      averages: gradesOverview.averages.map(average => ({
        subject: {
          id: average.subject.id,
          name: average.subject.name,
          groups: average.subject.groups
        },
        average: average.student !== undefined ? getGradeState(average.student) : { significant: false, value: -1, type: 'number' as PronoteApiGradeType },
        class_average: average.class_average !== undefined ? getGradeState(average.class_average) : { significant: false, value: -1, type: 'number' as PronoteApiGradeType },
        max: average.max !== undefined ? getGradeState(average.max) : { significant: false, value: -1, type: 'number' as PronoteApiGradeType },
        min: average.min !== undefined ? getGradeState(average.min) : { significant: false, value: -1, type: 'number' as PronoteApiGradeType },
        out_of: average.outOf !== undefined ? getGradeState(average.outOf) : { significant: false, value: -1, type: 'number' as PronoteApiGradeType },
        color: average.backgroundColor ?? '#08BE88'
      })),
  
      overall_average: gradesOverview.overallAverage !== undefined ? getGradeState(gradesOverview.overallAverage) : { significant: false, value: -1, type: 'number' as PronoteApiGradeType },
      class_overall_average: gradesOverview.classAverage !== undefined ? getGradeState(gradesOverview.classAverage) : { significant: false, value: -1, type: 'number' as PronoteApiGradeType }
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