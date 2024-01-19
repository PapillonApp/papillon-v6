import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SkolengoDatas } from './SkolengoData/SkolengoDatas';
import type { Pronote } from 'pawnote';
import { PapillonUser } from './types/user';

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
    if (this.initialized) this.initialized = false;
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
        const pronote = await import('./PronoteData/connector');
        
        try {
          const connector = await pronote.loadPronoteConnector();
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

  // [Service]Grades.js
  async getGrades (selectedPeriodName: string, force = false) {
    await this.waitInit();

    if (this.service === 'skolengo') {
      return this.skolengoInstance.getGrades(selectedPeriodName, force);
    }
    else if (this.service === 'pronote') {
      const { gradesHandler } = await import('./PronoteData/grades');

      if (!this.pronoteInstance) {
        throw new Error('getGrades: cache not available');
      } 

      const period = this.pronoteInstance.periods.find(
        period => period.name === selectedPeriodName
      );

      if (!period) throw new Error('Aucune période associé à ce nom a été trouvé.');
      return gradesHandler(period, force); 
    }
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

  // [Service]Homeworks.js
  async getHomeworks(day, force = false, day2 = null) {
    if (!day2) day2 = day;
    await this.waitInit();
    
    if (this.service === 'skolengo') {
      return this.skolengoInstance.getHomeworks(day, force, day2) || [];
    }
    
    else if (this.service === 'pronote') {
      // return require('./PronoteData/PronoteHomeworks.js').getHomeworks(
      //   day,
      //   force,
      //   day2
      // );
    }

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

  // [Service]Timetable.js
  async getTimetable(day: Date, force = false) {
    await this.waitInit();
    if (this.service === 'skolengo')
      return this.skolengoInstance.getTimetable(day, force);
    // if (this.service === 'pronote')
    //   return require('./PronoteData/PronoteTimetable.js').getTimetable(
    //     day,
    //     force
    //   );
    return [];
  }

  async getUser (force = false): Promise<PapillonUser> {
    await this.waitInit();
    let user: PapillonUser;

    if (this.service === 'skolengo') {
      user = await this.skolengoInstance.getUser(force);
    }
    else if (this.service === 'pronote') {
      const { userHandler } = await import('./PronoteData/user');
      user = await userHandler(this.pronoteInstance, force);

      if (!user) {
        // TODO: Show a message to user that cache is not renewed and data can't be fetched.
        console.warn('getUser: offline with no cache.');
        throw new Error('Not enough cache.');
      }
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
