import type { Pronote } from 'pawnote';
import type { PapillonEvaluation, PapillonEvaluationAcquisition } from '../types/evaluations';

export const evaluationsHandler = async (periodName: string, instance?: Pronote, force = false): Promise<null | PapillonEvaluation[]> => {
  // TODO: Caching
  
  if (!instance) return null;
  
  const period = instance.readPeriodsForEvaluations().find(period => period.name === periodName);
  if (!period) return null;

  try {
    const allEvaluations = await instance.getEvaluations(period);

    const evaluationsAllData: PapillonEvaluation[] = [];
    for (const evaluation of allEvaluations) {
      const acquisitions: PapillonEvaluationAcquisition[] = [];
      for (const acquisition of evaluation.skills) {
        acquisitions.push({
          id: acquisition.id,
          name: acquisition.item?.name ?? '',
          coefficient: acquisition.coefficient,
          abbreviation: acquisition.abbreviation,
          level: acquisition.level
        });
      }

      evaluationsAllData.push({
        id: evaluation.id,
        subject: {
          id: evaluation.subject.id,
          name: evaluation.subject.name,
          groups: evaluation.subject.groups
        },
        name: evaluation.name,
        description: evaluation.description,
        teacher: evaluation.teacher,
        date: evaluation.date.getTime(),
        paliers: evaluation.levels,
        coefficient: evaluation.coefficient,
        acquisitions
      });
    }

    return evaluationsAllData;
  }
  catch {
    return [];
  }
};
