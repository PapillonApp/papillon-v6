import type { CachedPapillonGrades, PapillonGrades } from '../types/grades';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Pronote, PronoteApiGradeType } from 'pawnote';
import { AsyncStoragePronoteKeys } from './connector';

/**
 * Get the state of a grade in an integer form.
 * 
 * @param gradeValue - Value of the grade.
 * @param significant - `true` if we want to get only the state, `false` if we want to get the value itself, so -1 if stateful.
 */
const getGradeState = (gradeValue: number | PronoteApiGradeType, significant = false): number => {
  if (significant) {
    if (typeof gradeValue === 'number') return 0;

    switch (gradeValue) {
      case PronoteApiGradeType.Absent          : return 1;
      case PronoteApiGradeType.Exempted        : return 2;
      case PronoteApiGradeType.NotGraded       : return 3;
      case PronoteApiGradeType.Unfit           : return 4;
      case PronoteApiGradeType.Unreturned      : return 5;
      case PronoteApiGradeType.AbsentZero      : return 6;
      case PronoteApiGradeType.UnreturnedZero  : return 7;
      case PronoteApiGradeType.Congratulations : return 8;
    }

    return -1;
  }
  else {
    if (typeof gradeValue === 'number') return gradeValue;
    else return -1;
  }
};

export const gradesHandler = async (period: Pronote['periods'][number], force = false): Promise<PapillonGrades> => {
  const cache = await AsyncStorage.getItem(AsyncStoragePronoteKeys.CACHE_GRADES);
  if (cache && !force) {
    const data: CachedPapillonGrades = JSON.parse(cache);

    const userCacheDate = new Date(data.date);
    const today = new Date();

    userCacheDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (userCacheDate.getTime() === today.getTime()) {
      return data.grades;
    }

    await AsyncStorage.removeItem(AsyncStoragePronoteKeys.CACHE_GRADES);
    return gradesHandler(period, true);
  }

  const gradesOverview = await period.getGradesOverview();
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
        significant: getGradeState(grade.value, true)
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
      significant: getGradeState(average.student, true),
      color: average.backgroundColor ?? '#08BE88'
    })),

    overall_average: getGradeState(gradesOverview.overallAverage),
    class_overall_average: getGradeState(gradesOverview.classAverage)
  };

  const newCache: CachedPapillonGrades = {
    date: new Date(),
    grades
  };

  await AsyncStorage.setItem(AsyncStoragePronoteKeys.CACHE_GRADES, JSON.stringify(newCache));
  return grades;
};
