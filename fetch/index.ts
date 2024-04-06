import AsyncStorage from '@react-native-async-storage/async-storage';

// Wrapper types.
import type { PapillonUser } from './types/user';
import type { PapillonNews } from './types/news';
import type { PapillonGrades } from './types/grades';
import type { PapillonLesson } from './types/timetable';
import type { PapillonHomework } from './types/homework';
import type { PapillonDiscussion } from './types/discussions';

// Pronote related imports.
import { Pronote } from 'pawnote';
import { loadPronoteConnector } from './PronoteData/connector';
import { userHandler as pronoteUserHandler } from './PronoteData/user';
import { gradesHandler as pronoteGradesHandler } from './PronoteData/grades';
import { timetableHandler as pronoteTimetableHandler } from './PronoteData/timetable';
import { evaluationsHandler as pronoteEvaluationsHandler } from './PronoteData/evaluations';
import { vieScolaireHandler as pronoteVieScolaireHandler } from './PronoteData/vie_scolaire';
import { newsHandler as pronoteNewsHandler, newsStateHandler as pronoteNewsStateHandler } from './PronoteData/news';
import { homeworkPatchHandler as pronoteHomeworkPatchHandler, homeworkHandler as pronoteHomeworkHandler } from './PronoteData/homework';
import { discussionsHandler as pronoteDiscussionsHandler, discussionsRecipientsHandler as pronoteDiscussionsRecipientsHandler } from './PronoteData/discussions';

// Skolengo related imports.
import type { SkolengoDatas } from './SkolengoData/SkolengoDatas';
import { PapillonVieScolaire } from './types/vie_scolaire';
import { PapillonEvaluation } from './types/evaluations';

// EcoleDirecte related imports.
import { EDCore } from '@papillonapp/ed-core';
import { loadEcoleDirecteConnector } from './EcoleDirecteData/connector';
import { userInformations as EcoleDirecteUser } from './EcoleDirecteData/user';
import { EDtimetableHandler as EcoleDirecteTimetable } from './EcoleDirecteData/timetable';
import { EDvieScolaireHandler } from './EcoleDirecteData/vie_scolaire';

export type ServiceName = 'pronote' | 'skolengo' | 'ecoledirecte';

export class IndexDataInstance {
  public initialized = false;
  public initializing = false;
  public isNetworkFailing = false;

  public service?: ServiceName;
  public skolengoInstance?: SkolengoDatas;
  public pronoteInstance?: Pronote;
  public ecoledirecteInstance?: EDCore;
  /**
   * Internal function that waits for the initialization
   * of the service to be finished so we can use it.
   */
  private async waitInit(): Promise<boolean> {
    if (this.initialized) return true;

    if (!this.initializing) {
      if (this.service === 'skolengo' && !this.skolengoInstance) {
        await this.init('skolengo');
      }
      else if (this.service === 'pronote' && !this.pronoteInstance) {
        await this.init('pronote');
      } else if (this.service === 'ecoledirecte' && !this.ecoledirecteInstance) {
        await this.init('ecoledirecte');
      }
    }

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!this.initializing) {
          clearInterval(interval);
          resolve(true);
        }
      }, 250);
    });
  }

  public async init (service: 'pronote' | 'skolengo' | 'ecoledirecte', instance?: Pronote | EDCore): Promise<void> {
    if (this.initializing) return;
    
    this.service = service;
    if (!this.service) return;

    if (this.initialized) { // ...was already initialized.
      // Prevent to do any more presence request.
      if (this.pronoteInstance) this.pronoteInstance.stopPresenceRequests();
      this.initialized = false;
    }

    this.initializing = true;
    
    if (this.service === 'skolengo') {
      const skolengo = await import('./SkolengoData/SkolengoDatas.js');
      this.skolengoInstance = await skolengo.SkolengoDatas.initSkolengoDatas();
      // TODO: Let's say for now that it never fails...
      this.isNetworkFailing = false;

      this.initialized = this.skolengoInstance ? true : false;
    } else if(this.service === 'ecoledirecte') {
      if (instance && instance instanceof EDCore) this.ecoledirecteInstance = instance;
      else {
        try {
          const connector = await loadEcoleDirecteConnector();
          if (connector) this.ecoledirecteInstance = connector;
          this.isNetworkFailing = false;
        } catch {
          this.isNetworkFailing = true;
        }
      }

      this.initialized = this.ecoledirecteInstance ? true : false;
    }
    else if (this.service === 'pronote') {
      if (instance && instance instanceof Pronote) this.pronoteInstance = instance;
      else {
        try {
          const connector = await loadPronoteConnector();
          if (connector) this.pronoteInstance = connector;
          this.isNetworkFailing = false;
        } catch { // any error not handled in the connector; so the network fail.
          this.isNetworkFailing = true;
        }
      }

      this.initialized = this.pronoteInstance ? true : false;
    }

    this.initializing = false;
  }

  public async getGrades (selectedPeriodName: string, force = false): Promise<PapillonGrades | null> {
    let grades: PapillonGrades | null | undefined;
    await this.waitInit();

    if (this.service === 'skolengo') {
      // TODO: Typings and stuff for Skolengo.
      // grades = await this.skolengoInstance.getGrades(selectedPeriodName, force) as unknown as PapillonGrades;
    }
    else if (this.service === 'pronote') {
      grades = await pronoteGradesHandler(selectedPeriodName, this.pronoteInstance, force);
    }

    if (!grades) {
      throw new Error('Unknown service.');
    }

    return grades;
  }

  public async getEvaluations (selectedPeriodName: string, force = false): Promise<PapillonEvaluation[] | null>{
    await this.waitInit();
    
    if (this.service === 'skolengo') {
      // TODO: Skolengo Evaluation
    }
    else if (this.service === 'pronote') {
      return pronoteEvaluationsHandler(selectedPeriodName, this.pronoteInstance, force);
    }

    return [];
  }

  /**
   * Get all the homeworks from first day to end of the year.
   */
  public async getHomeworks (force = false): Promise<PapillonHomework[]> {
    await this.waitInit();
    
    if (this.service === 'skolengo') {
      // TODO
      // return this.skolengoInstance.getHomeworks(day, force, day2) || [];
    }
    else if (this.service === 'pronote') {
      return pronoteHomeworkHandler(force, this.pronoteInstance);
    }

    return [];
  }

  public async changeHomeworkState (homework: PapillonHomework, isDone: boolean): Promise<boolean> {
    await this.waitInit();

    if (this.service === 'skolengo') {
      // TODO
      // return this.skolengoInstance.patchHomeworkAssignment(id, isDone);
    }
    else if (this.service === 'pronote') {
      return pronoteHomeworkPatchHandler(homework, isDone, this.pronoteInstance);
    }

    return false;
  }

  public async getNews (force = false): Promise<PapillonNews[]> {
    await this.waitInit();

    if (this.service === 'skolengo') {
      // return this.skolengoInstance.getNews(force);
    }
    else if (this.service === 'pronote') {
      return pronoteNewsHandler(force, this.pronoteInstance);
    }

    return [];
  }

  /**
   * Change the `read` state of a news.
   * Applies to information and surveys.
   * 
   * @returns `true` when operation is successful.
   */
  public async changeNewsState (localID: string): Promise<boolean> {
    await this.waitInit();
    if (this.service === 'skolengo') {
      // TODO
    }
    else if (this.service === 'pronote') {
      return pronoteNewsStateHandler(localID, true, this.pronoteInstance);
    }

    return false;
  }

  public async getUniqueNews (id: string, force = false): Promise<PapillonNews> {
    await this.waitInit();
    if (this.service === 'skolengo') {
      // TODO
      // return this.skolengoInstance.getUniqueNews(id, force);
    }

    throw new Error('Method only works for Skolengo');
  }

  /**
   * Get a list of user's lessons for a week.
   * The week is calculated from the given day.
   * A week goes from the Monday to the Sunday.
   * 
   * If the user is offline and/or the cache fails, an
   * empty list is returned.
   */
  public async getTimetable (day: Date, force = false): Promise<PapillonLesson[]> {
    await this.waitInit();

    // JS dates are starting from Sunday, we do `+1` to be on Monday;
    const mondayIndex = day.getDate() - day.getDay() + 1;
    const sundayIndex = mondayIndex + 6;

    const monday = new Date(day);
    monday.setDate(mondayIndex);
    const sunday = new Date(day);
    sunday.setDate(sundayIndex);

    if (this.service === 'skolengo') {
      return this.skolengoInstance!.getTimetable(day, force);
    }
    else if (this.service === 'pronote') {
      const timetable = await pronoteTimetableHandler([monday, sunday], this.pronoteInstance, force);
      if (timetable) return timetable;
    } else if(this.service === 'ecoledirecte') {
      const timetable = await EcoleDirecteTimetable([monday, sunday], this.ecoledirecteInstance, force);
      if(timetable) return timetable;
    }
    
    return [];
  }

  /**
   * Retrieves information about the user and also
   * about the school and periods.
   */
  public async getUser (force = false): Promise<PapillonUser> {
    await this.waitInit();
    let user: PapillonUser | undefined | null;

    if (this.service === 'skolengo') {
      // TODO: Implement typings for skolengo.
      // user = await this.skolengoInstance.getUser(force);
    }
    else if (this.service === 'pronote') {
      user = await pronoteUserHandler(this.pronoteInstance, force);
    } else if(this.service === 'ecoledirecte') {
      user = await EcoleDirecteUser(this.ecoledirecteInstance, force);
    }
    
    if (!user) {
      // TODO: Show a message to user that cache is not renewed and data can't be fetched.
      throw new Error('No cache or service unknown/disconnected.');
    }

    return runUserMiddleware(user);
  }

  public async getViesco(force = false): Promise<PapillonVieScolaire> {
    await this.waitInit();
    if (this.service === 'skolengo') {
      // TODO
      // return this.skolengoInstance.getViesco(force);
    }
    else if (this.service === 'pronote') {
      return pronoteVieScolaireHandler(this.pronoteInstance, force);
    } else if (this.service === 'ecoledirecte') {
      return EDvieScolaireHandler(this.ecoledirecteInstance, force);
    }

    return { absences: [], delays: [], punishments: [] } as PapillonVieScolaire;
  }

  public async getConversations (): Promise<PapillonDiscussion[]> {
    await this.waitInit();
    
    if (this.service === 'pronote') {
      return pronoteDiscussionsHandler(this.pronoteInstance);
    }

    return [];
  }

  async replyToConversation(localID: string, messageContent: string) {
    await this.waitInit();

    if (this.service === 'pronote') {
      //   return require('./PronoteData/PronoteConversations.js').replyToConversation(
      //     id,
      //     message
      //   );
      // TODO
    }

    return {};
  }

  public async readStateConversation (localID: string): Promise<void> {
    await this.waitInit();
    if (this.service === 'pronote') {
      // TODO
      // return require('./PronoteData/PronoteConversations.js').readStateConversation(
      //   id
      // );
    }
  }

  async createDiscussion(subject, content, participants) {
    await this.waitInit();
    // if (this.service === 'pronote')
    //   return require('./PronoteData/PronoteConversations.js').createDiscussion(
    //     subject,
    //     content,
    //     participants
    //   );
    return {};
  }

  public async getRecipients (localDiscussionID: string): Promise<string[]> {
    await this.waitInit();

    if (this.service === 'pronote') {
      return pronoteDiscussionsRecipientsHandler(localDiscussionID, this.pronoteInstance);
    }

    return [];
  }
}

/**
 * Middleware mainly here to add the custom
 * profile picture and custom name from settings.
 */
const runUserMiddleware = async (user: PapillonUser): Promise<PapillonUser> => {
  const customProfilePictureB64 = await AsyncStorage.getItem('custom_profile_picture');
  if (customProfilePictureB64) {
    user.profile_picture = customProfilePictureB64;
  }

  const customName = await AsyncStorage.getItem('custom_name');
  if (customName) {
    user.name = customName;
  }

  return user;
};
