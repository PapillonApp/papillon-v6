import { PapillonGrades } from '../../fetch/types/grades';

const calculateAverage = async (grades: PapillonGrades, type: string = 'value', base: number = 20): Promise<number> => {
  const { gradel, coefs } = grades.reduce((acc, grade) => {
    let val = grade.grade[type].value;
    let out_of = grade.grade.out_of.value;
    const coef = grade.grade.coefficient;

    if (out_of > base) {
      val = val * (base / out_of);
      out_of = base;
    }

    const significant = !grade.grade[type].significant || true;

    if (val && out_of && significant) {
      acc.gradel += (val * coef);
      acc.coefs += (out_of * coef);
    }

    return acc;
  }, { gradel: 0, coefs: 0 });

  const res = (gradel / coefs) * base;

  return (gradel > 0 && coefs > 0) ? res : -1;
};

const calculateSubjectAverage = async (grades: PapillonGrades[], type: string = 'value', base: number = 20): Promise<number> => {
  const subjects = new Map();

  grades.forEach((grade) => {
    const subjectGrades = subjects.get(grade.subject.id) || [];
    subjectGrades.push(grade);
    subjects.set(grade.subject.id, subjectGrades);
  });

  let total = 0;
  let count = 0;

  for (const subjectGrades of subjects.values()) {
    const avg = await calculateAverage(subjectGrades, type, base);
    if (avg > 0) {
      total += avg;
      count++;
    }
  }

  return (count > 0) ? total / count : -1;
};

const calculateMedian = async (grades: PapillonGrades, type: string = 'value', base: number = 20): Promise<number> => {
  const values = grades.map((grade) => {
    let val = grade.grade[type].value;
    let out_of = grade.grade.out_of.value;

    if (out_of > base) {
      val = val * (base / out_of);
      out_of = base;
    }

    return val;
  });

  values.sort((a, b) => a - b);

  const mid = Math.floor(values.length / 2);

  return values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
};

const calculateSubjectMedian = async (grades: PapillonGrades[], type: string = 'value', base: number = 20): Promise<number> => {
  const subjects = new Map();

  grades.forEach((grade) => {
    const subjectGrades = subjects.get(grade.subject.id) || [];
    subjectGrades.push(grade);
    subjects.set(grade.subject.id, subjectGrades);
  });

  let total = 0;
  let count = 0;

  for (const subjectGrades of subjects.values()) {
    const median = await calculateAverage(subjectGrades, type, base);
    if (median > 0) {
      total += median;
      count++;
    }
  }

  return (count > 0) ? total / count : -1;
};

export { calculateAverage, calculateSubjectAverage, calculateMedian, calculateSubjectMedian };
