import { EDCore } from '@papillonapp/ed-core';
import {gradesResData} from '@papillonapp/ed-core/dist/src/types/v3';
import type {PapillonEvaluation, PapillonEvaluationAcquisition} from '../types/evaluations';

export const EDEvaluationsHandler = async (period: string, force = false, instance?: EDCore): Promise<PapillonEvaluation[]> => {

  // TODO cache

  try {
    if (!instance) throw new Error('No instance available.');


    const gradesData: gradesResData = await instance.grades.fetch();
    const data: PapillonEvaluation[] = [];

    for (const gradeObject of gradesData.notes) {
      if (gradeObject.codePeriode != period) continue;
      const acquisitions: PapillonEvaluationAcquisition[] = [];
      for (const skill of gradeObject.elementsProgramme) {
        acquisitions.push({
          id: skill.idCompetence.toString(),
          name: skill.libelleCompetence,
          // TODO correctly fill coef
          coefficient: 0,
          abbreviation: skill.libelleCompetence,
          level: skill.valeur,
        });
      }
      data.push({
        // TODO add id
        id: '',
        subject: {
          id: gradeObject.codeMatiere,
          name: gradeObject.libelleMatiere,
          // TODO, pas cette option sur ED ?
          groups: false
        },
        name: gradeObject.typeDevoir,
        description: gradeObject.devoir,
        // TODO
        teacher: '',
        // TODO La date faut la mettre en number, quel format ?
        // date: gradeObject.dateSaisie,
        date: 0,
        // TODO
        paliers: [],
        coefficient: parseInt(gradeObject.coef),
        acquisitions
      });
    }
    return data;
  }
  catch {
    return [];
  }
};
