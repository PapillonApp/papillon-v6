import { PapillonGrades, PapillonGradesViewAverages } from '../../fetch/types/grades';

const calculateAverage = async (grades: PapillonGrades, type: string = 'value', base: number = 20): Promise<number> => {
  let gradel = 0;
  let coefs = 0;

  // Formule de calcul de moyenne volée à Pronote
  grades.forEach((grade) => {
    let val = grade.grade[type].value;
    let out_of = grade.grade.out_of.value;

    const coef = grade.grade.coefficient;

    if (out_of > base) {
      val = val * (base / out_of);
      out_of = base;
    }

    // TODO: Check if grade is significant
    const significant = !grade.grade[type].significant || true;

    if (val && out_of && significant) {
      gradel += (val * coef);
      coefs += (out_of * coef);
    }
  });

  const res = (gradel / coefs) * base;

  if (gradel > 0 && coefs > 0) return res;
  else return -1;
};

const calculateSubjectAverage = async (grades: PapillonGrades, type: string = 'value', base: number = 20): Promise<number> => {
  let subjects = [];

  // sort all grades by subject
  grades.forEach((grade) => {
    const subject = subjects.find((subject) => subject.id === grade.subject.id);
    if (subject) subject.grades.push(grade);
    else subjects.push({ id: grade.subject.id, grades: [grade] });
  });

  // calculate average for each subject using calculateAverage
  let total = 0;
  let count = 0;

  await subjects.forEach(async (subject) => {
    const avg = await calculateAverage(subject.grades, type, base);
    if (avg > 0) {
      total += avg;
      count++;
    }
  });

  if (count > 0) return total / count;
  else return -1;
};

export { calculateAverage, calculateSubjectAverage };
