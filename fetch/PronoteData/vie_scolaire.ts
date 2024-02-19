import { type Pronote, StudentAbsence, StudentDelay, StudentPunishment } from 'pawnote';
import type { PapillonVieScolaire, PapillonAbsence, PapillonDelay, PapillonPunishment } from '../types/vie_scolaire';

export const vieScolaireHandler = async (instance?: Pronote, force = false): Promise<PapillonVieScolaire> => {
  // TODO: Implement caching and `force` parameter.

  const absences: PapillonAbsence[] = [];
  const delays: PapillonDelay[] = [];
  const punishments: PapillonPunishment[] = [];

  if (!instance) throw new Error('No instance available.');
  
  // Get attendance data for all periods.
  const periods = instance.readPeriodsForAttendance();
  const allTimePeriod = periods.find(period => period.name.startsWith('Année'));
  if (!allTimePeriod) throw new Error('No all time period found.');

  const attendance = await instance.getAttendance(allTimePeriod);
  for (const item of attendance) {
    if (item instanceof StudentAbsence) {
      absences.push({
        id: item.id,
        from: item.from.getTime(),
        to: item.to.getTime(),
        justified: item.justified,
        hours: item.hoursMissed + 'h' + item.minutesMissed,
        reasons: [item.reason]
      });
    }

    else if (item instanceof StudentDelay) {
      delays.push({
        id: item.id,
        date: item.date.getTime(),
        duration: item.minutes,
        justified: item.justified,
        justification: item.justification,
        reasons: [item.reason]
      });
    }

    else if (item instanceof StudentPunishment) {
      const punishment: PapillonPunishment = {
        id: item.id,
        schedulable: false, // TODO
        schedule: [], // TODO in Pawnote
        date: item.dateGiven.getTime(),
        given_by: item.giver,
        exclusion: item.exclusion,
        during_lesson: item.isDuringLesson,
        homework: {
          text: item.workToDo,
          documents: item.workToDoDocuments.map(doc => ({
            name: doc.name,
            type: doc.type,
            url: doc.url
          }))
        },
        reason: {
          text: item.reason,
          circumstances: item.circumstances,
          documents: item.circumstancesDocuments.map(doc => ({
            name: doc.name,
            type: doc.type,
            url: doc.url
          }))
        },
        nature: null, // TODO
        duration: item.durationMinutes
      };

      punishments.push(punishment);
    }
  }

  return { absences, delays, punishments };
};
