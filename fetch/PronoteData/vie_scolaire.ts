import { type Pronote, StudentAbsence, StudentDelay, StudentPunishment, StudentObservation } from 'pawnote';
import type { PapillonVieScolaire, PapillonPunishment, CachedPapillonVieScolaire } from '../types/vie_scolaire';
import type { PapillonAttachmentType } from '../types/attachment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStoragePronoteKeys } from './connector';

export const vieScolaireHandler = async (instance?: Pronote, force = false): Promise<PapillonVieScolaire> => {
  const cache = await AsyncStorage.getItem(AsyncStoragePronoteKeys.CACHE_VIE_SCOLAIRE);
  const data: PapillonVieScolaire = { absences: [], delays: [], punishments: [], observations: [] };

  if (cache && !force) {
    const cached = JSON.parse(cache) as CachedPapillonVieScolaire;
    const now = Date.now();

    // Within 12 hours.
    if (now - cached.timestamp < 12 * 60 * 60 * 1000) {
      return cached;
    }

    // Otherwise, let's fetch !
    return vieScolaireHandler(instance, true);
  }

  try {
    if (!instance) throw new Error('No instance available.');
    
    // Get attendance data for all periods.
    const periods = instance.readPeriodsForAttendance();
    const allTimePeriod = periods.find(period => period.name.startsWith('Année'));
    if (!allTimePeriod) throw new Error('No all time period found.');
  
    const attendance = await instance.getAttendance(allTimePeriod);
    for (const item of attendance) {
      if (item instanceof StudentAbsence) {
        data.absences.push({
          id: item.id,
          from: item.from.getTime(),
          to: item.to.getTime(),
          justified: item.justified,
          hours: item.hoursMissed + 'h' + item.minutesMissed,
          administrativelyFixed: item.administrativelyFixed,
          reasons: [item.reason ?? null]
        });
      }
  
      else if (item instanceof StudentDelay) {
        data.delays.push({
          id: item.id,
          date: item.date.getTime(),
          duration: item.minutes,
          justified: item.justified,
          justification: item.justification,
          reasons: [item.reason]
        });
      }

      else if (item instanceof StudentObservation) {
        data.observations.push({
          id: item.id,
          date: item.date.getTime(),
          sectionName: item.section.name,
          subjectName: item.subject?.name,
          shouldParentsJustify: item.shouldParentsJustify,
          reasons: [item.reason ?? null]
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
              type: doc.type as unknown as PapillonAttachmentType,
              url: doc.url
            }))
          },
          reason: {
            text: item.reasons,
            circumstances: item.circumstances,
            documents: item.circumstancesDocuments.map(doc => ({
              name: doc.name,
              type: doc.type as unknown as PapillonAttachmentType,
              url: doc.url
            }))
          },
          nature: item.title,
          duration: item.durationMinutes
        };
  
        data.punishments.push(punishment);
      }
    }

    const cached: CachedPapillonVieScolaire = {
      ...data,
      timestamp: Date.now()
    };

    await AsyncStorage.setItem(AsyncStoragePronoteKeys.CACHE_VIE_SCOLAIRE, JSON.stringify(cached));
  }
  catch {
    if (cache) {
      const cached = JSON.parse(cache) as CachedPapillonVieScolaire;
      
      return {
        absences: cached.absences,
        delays: cached.delays,
        punishments: cached.punishments,
        observations: cached.observations
      };
    }

    console.warn('[pronote:vieScolaireHandler]: no cache available, returning all empty.');
  }

  return data;
};
