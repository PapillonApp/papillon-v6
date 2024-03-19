import type { PapillonGradeValue } from '../../fetch/types/grades';
import { PronoteApiGradeType } from 'pawnote';

export const formatPapillonGradeValue = (grade: PapillonGradeValue): string => {
  if (!grade.significant) return grade.value.toFixed(2);
  switch (grade.type) {
    case PronoteApiGradeType.Absent: return 'Abs.';
    case PronoteApiGradeType.AbsentZero: return '0.00';
    case PronoteApiGradeType.Unreturned: return'N.Rdu';
    case PronoteApiGradeType.UnreturnedZero: return '0.00';
    case PronoteApiGradeType.Unfit: return 'Inapt';
    case PronoteApiGradeType.Exempted: return 'Disp.';
    case PronoteApiGradeType.NotGraded: return 'N.Not';
  }

  return '??';
};
