import type { PapillonVieScolaire, CachedPapillonVieScolaire } from '../types/vie_scolaire';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageEcoleDirecteKeys } from './connector';
import { EDCore } from '@papillonapp/ed-core';
import type { schoolLifeResData } from '@papillonapp/ed-core/dist/src/types/v3';

export const EDvieScolaireHandler = async (instance?: EDCore, force = false): Promise<PapillonVieScolaire> => {
  const cache = await AsyncStorage.getItem(AsyncStorageEcoleDirecteKeys.CACHE_VIE_SCOLAIRE);
  const data: PapillonVieScolaire = { absences: [], delays: [], punishments: [] };

  if (cache && !force) {
    const cached = JSON.parse(cache) as CachedPapillonVieScolaire;
    const now = Date.now();

    // Within 12 hours.
    if (now - cached.timestamp < 12 * 60 * 60 * 1000) {
      return cached;
    }

    // Otherwise, let's fetch !
    return EDvieScolaireHandler(instance, true);
  }

  try {
    if (!instance) throw new Error('No instance available.');

  
    const schoolLife: schoolLifeResData = await instance.schoolLife.fetch();

    schoolLife.absencesRetards.forEach(element=> {
      if(element.typeElement === "Retard") {
        data.delays.push({
          id: JSON.stringify(element.id),
          date: new Date(element.date).getTime(),
          duration: parseFloat(element.libelle.split(":")[1]),
          justified: element.justifie,
          justification: element.commentaire,
          reasons: [element.motif]
        });
      } else if(element.typeElement === "Absence") {
        data.absences.push({
          id: JSON.stringify(element.id),
          from: new Date(element.interval.start).getTime(),
          to: new Date(element.interval.end).getTime(),
          justified: element.justifie,
          hours: element.libelle,
          administrativelyFixed: element.justifieEd,
          reasons: [element.motif]
        });
      }
    });

    schoolLife.sanctionsEncouragements.forEach(element=> {
      if(element.typeElement === "Punition") {
        data.punishments.push({
          id: element.id,
          schedulable: false, // TODO
          schedule: [], // TODO
          date: new Date(element.date).getTime(),
          given_by: element.par,
          exclusion: false,
          during_lesson: false,
          homework: {
            text: "Rien",
            documents: []
          },
          reason: {
            text: [element.motif],
            circumstances: element.commentaire,
            documents: []
          },
          nature: element.libelle,
          duration: 60
        });
      }
    });


    const cached: CachedPapillonVieScolaire = {
      ...data,
      timestamp: Date.now()
    };

    await AsyncStorage.setItem(AsyncStorageEcoleDirecteKeys.CACHE_VIE_SCOLAIRE, JSON.stringify(cached));
  }
  catch {
    if (cache) {
      const cached = JSON.parse(cache) as CachedPapillonVieScolaire;
      
      return {
        absences: cached.absences,
        delays: cached.delays,
        punishments: cached.punishments
      };
    }

    console.warn('[ecoledirecte:EDvieScolaireHandler]: no cache available, returning all empty.');
  }

  return data;
};
