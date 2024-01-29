import type { Pronote } from 'pawnote';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SkolengoDatas } from './SkolengoData/SkolengoDatas';
import type { PapillonLesson } from './types/timetable';
import type { PapillonGrades } from './types/grades';
import type { PapillonUser } from './types/user';
import type { PapillonHomework } from './types/homework';

import { loadPronoteConnector } from './PronoteData/connector';
import { userHandler as pronoteUserHandler } from './PronoteData/user';
import { gradesHandler as pronoteGradesHandler } from './PronoteData/grades';
import { timetableHandler as pronoteTimetableHandler } from './PronoteData/timetable';
import { homeworkHandler as pronoteHomeworkHandler } from './PronoteData/homework';

export type ServiceName = 'pronote' | 'skolengo'

export class IndexDataInstance {
  public initialized = false;
  public initializing = false;
  public isNetworkFailing = false;

  public service?: ServiceName;
  public skolengoInstance?: SkolengoDatas;
  public pronoteInstance?: Pronote;

  async waitInit(): Promise<boolean> {
    if (this.initialized) return true;

    if (!this.initializing) {
      console.log('waitInit:', this.service, 'not initializing, let\'s ask to init');

      if (this.service === 'skolengo' && !this.skolengoInstance) {
        await this.init('skolengo');
      }
      else if (this.service === 'pronote' && !this.pronoteInstance) {
        await this.init('pronote');
      }
    }

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!this.initializing) {
          clearInterval(interval);
          resolve(true);
        } else console.log('waitInit:', this.service, 'still initializing...');
      }, 250);
    });
  }

  async init (service: 'pronote' | 'skolengo', instance?: Pronote): Promise<void> {
    if (this.initializing) return;
    
    this.service = service;
    if (!this.service) return;

    console.log('provider: initializing', this.service, { wasAlreadyInitialized: this.initialized });
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
    }
    else if (this.service === 'pronote') {
      if (instance) this.pronoteInstance = instance;
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
    console.log('provider: init/results of', this.service, { loading: this.initializing, done: this.initialized });
  }

  public async getGrades (selectedPeriodName: string, force = false): Promise<PapillonGrades | null> {
    let grades: PapillonGrades | null | undefined;
    await this.waitInit();

    if (this.service === 'skolengo') {
      // TODO: Typings and stuff for Skolengo.
      // grades = await this.skolengoInstance.getGrades(selectedPeriodName, force) as unknown as PapillonGrades;
    }
    else if (this.service === 'pronote') {
      const gradesReceived = await pronoteGradesHandler(selectedPeriodName, this.pronoteInstance, force);
      
      if (!gradesReceived) {
        // TODO: Show a message to user that cache is not renewed and data can't be fetched.
        console.warn('getGrades: offline with no cache.');
        throw new Error('Not enough cache.');
      }

      grades = gradesReceived;
    }

    if (!grades) {
      throw new Error('Unknown service.');
    }

    return grades;
  }

  async getEvaluations (force = false) {
    await this.waitInit();
    
    // TODO: Skolengo Evaluation
    if (this.service === 'skolengo') return [];
    if (this.service === 'pronote') {
      // return require('./PronoteData/PronoteGrades.js')
      //   .getEvaluations(force)
      //   .then((e) => (typeof e === 'string' ? JSON.parse(e) : e));
    }

    return [];
  }

  /**
   * Get all the homeworks from first day to end of the year.
   */
  async getHomeworks (force = false): Promise<PapillonHomework[]> {
    await this.waitInit();
    
    if (this.service === 'skolengo') {
      // return this.skolengoInstance.getHomeworks(day, force, day2) || [];
    }
    else if (this.service === 'pronote') {
      const homeworkReceived = await pronoteHomeworkHandler(force, this.pronoteInstance);
      if (homeworkReceived) return homeworkReceived;

      console.warn('getHomeworks: offline.');
    }

    console.warn('getHomeworks: returning empty list.');
    return [];
  }

  async changeHomeworkState(isDone, day, id) {
    await this.waitInit();
    if (this.service === 'skolengo')
      return this.skolengoInstance.patchHomeworkAssignment(id, isDone);
    if (this.service === 'pronote')
      // return require('./PronoteData/PronoteHomeworks.js').changeHomeworkState(
      //   day,
      //   id
      // );
    // .then((e) => thenHandler('changeh', e));
      return {};
  }

  // [Service]News.js
  async getNews(force = false) {
    await this.waitInit();
    if (this.service === 'skolengo')
      return this.skolengoInstance.getNews(force);
    if (this.service === 'pronote')
      // return require('./PronoteData/PronoteNews.js')
      //   .getNews(force)
      //   .then((e) => (typeof e === 'string' ? JSON.parse(e) : e));
      return [];
  }

  async changeNewsState(id) {
    await this.waitInit();
    if (this.service === 'skolengo')
      return {status:'', error:'Not implemented'};
    if (this.service === 'pronote')
      // return require('./PronoteData/PronoteNews.js').changeNewsState(id);
      return {};
  }

  async getUniqueNews(id, force = false) {
    await this.waitInit();
    if (this.service === 'skolengo')
      return this.skolengoInstance.getUniqueNews(id, force);
    throw new Error('Method only works for Skolengo');
  }

  // [Service]Recap.js
  async getRecap(day, force = false) {
    await this.waitInit();
    const storeShared = (e) => {
      return e;
    };
    if (this.service === 'skolengo')
      return this.skolengoInstance.getRecap(day, force).then(storeShared);
    // if (this.service === 'pronote')
    //   return require('./PronoteData/PronoteRecap.js')
    //     .getRecap(day, force)
    //     .then(storeShared);
    return [[], [], {}];
  }

  /**
   * Get a list of user's lessons for a week.
   * The week is calculated from the given day.
   * A week goes from the Monday to the Sunday.
   * 
   * If the user is offline and/or the cache fails, an
   * empty list is returned.
   */
  async getTimetable (day: Date, force = false): Promise<PapillonLesson[]> {
    await this.waitInit();

    // JS dates are starting from Sunday, we do +1 to be on Monday;
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

      console.warn('getTimetable: offline and/or no cache.');
    }
    
    console.warn('getTimetable: returning empty list.');
    return [];
  }

  public async getUser (force = false): Promise<PapillonUser> {
    await this.waitInit();
    let user: PapillonUser | undefined;

    if (this.service === 'skolengo') {
      user = await this.skolengoInstance.getUser(force);
    }
    else if (this.service === 'pronote') {
      const userReceived = await pronoteUserHandler(this.pronoteInstance, force);

      if (!userReceived) {
        // TODO: Show a message to user that cache is not renewed and data can't be fetched.
        console.warn('getUser: offline with no cache.');
        throw new Error('Not enough cache.');
      }

      user = userReceived;
    }

    if (!user) {
      throw new Error('Unknown service.');
    }

    return runUserMiddleware(user);
  }

  async getPeriods(force = false): Promise<Array<{
    id: string
    name: string
    actual: boolean
  }>> {
    await this.waitInit();
    
    if (this.service === 'skolengo') {
      return this.skolengoInstance.getPeriods(force);
    }
    else if (this.service === 'pronote') {
      if (this.pronoteInstance)
        return this.pronoteInstance.periods.map(period => ({
          id: period.id,
          name: period.name,
          actual: false // TODO: Check with dates.
        }));
    }
  
    return [];
  }

  // [Service]Viesco.js
  async getViesco(force = false) {
    await this.waitInit();
    if (this.service === 'skolengo')
      return this.skolengoInstance.getViesco(force);
    // if (this.service === 'pronote')
    //   return require('./PronoteData/PronoteViesco.js').getViesco(force);
    // .then((e) => thenHandler('viesco', e));
    return [];
  }

  // [Service]Conversations.js
  async getConversations(force = false) {
    await this.waitInit();
    // if (this.service === 'pronote')
    //   return require('./PronoteData/PronoteConversations.js').getConversations(
    //     force
    //   );
    return [];
  }

  // [Service]Conversations.js
  async replyToConversation(id, message) {
    await this.waitInit();
    // if (this.service === 'pronote')
    //   return require('./PronoteData/PronoteConversations.js').replyToConversation(
    //     id,
    //     message
    //   );
    return {};
  }

  async readStateConversation(id) {
    await this.waitInit();
    // if (this.service === 'pronote')
    //   return require('./PronoteData/PronoteConversations.js').readStateConversation(
    //     id
    //   );
    return {};
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

  async getRecipients() {
    // await this.waitInit();
    // if (this.service === 'pronote')
    //   return require('./PronoteData/PronoteConversations.js').getRecipients();
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
