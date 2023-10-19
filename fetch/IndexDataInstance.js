/* eslint-disable global-require */

import AsyncStorage from '@react-native-async-storage/async-storage';

export class IndexDataInstance {
  initialized = false;

  service = null;

  /**
   * @type {import('./SkolengoData/SkolengoDatas.js').SkolengoDatas | null}
   */
  skolengoInstance = null;

  constructor(service = null) {
    this.service = service;
    this.init(service);
  }

  async waitInit() {
    if (this.initialized) return true;
    if (this.service === 'Skolengo' && this.skolengoInstance === null)
      await this.init('Skolengo');
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.initialized) {
          clearInterval(interval);
          resolve(true);
        }
      }, 250);
    });
  }

  async init(service = null) {
    this.service = service || (await AsyncStorage.getItem('service')) || null;
    console.log('seriv', this.service);
    this.skolengoInstance =
      this.service === 'Skolengo'
        ? await require(
            `./SkolengoData/SkolengoDatas.js`
          ).SkolengoDatas?.initSkolengoDatas()
        : null;
    this.initialized = true;
  }

  // [Service]Grades.js
  async getGrades(selectedPeriod, force = false) {
    await this.waitInit();
    if (this.service === 'Skolengo') {
      return this.skolengoInstance.getGrades(selectedPeriod, force);
    }
    if (this.service === 'Pronote')
      return require(`./PronoteData/PronoteGrades.js`)
        .getGrades(force)
        .then((e) => (typeof e === 'string' ? JSON.parse(e) : e));
    // .then((e) => thenHandler('grades', e));
    return require(`./SkolengoData/SkolengoDatas.js`).SkolengoDatas
      .gradesDefault;
  }

  async getEvaluations(force = false) {
    await this.waitInit();
    // TODO: skolengo Evaluation
    if (this.service === 'Skolengo') return [];
    if (this.service === 'Pronote')
      return require(`./PronoteData/PronoteGrades.js`)
        .getEvaluations(force)
        .then((e) => (typeof e === 'string' ? JSON.parse(e) : e));
    // .then((e) => thenHandler('evals', e));
    return [];
  }

  async changePeriod(period) {
    await this.waitInit();
    if (this.service === 'Pronote')
      return require(`./PronoteData/PronoteGrades.js`).changePeriod(period);
    // .then((e) => thenHandler('changep', e));
    return {};
  }

  // [Service]Homeworks.js
  async getHomeworks(day, force = false, day2 = null) {
    if (!day2) day2 = day;
    await this.waitInit();
    if (this.service === 'Skolengo')
      return this.skolengoInstance.getHomeworks(day, force, day2) || [];
    if (this.service === 'Pronote')
      return require(`./PronoteData/PronoteHomeworks.js`).getHomeworks(
        day,
        force,
        day2
      );
    // .then((e) => thenHandler('homeworks', e));
    return [];
  }

  async changeHomeworkState(isDone, day, id) {
    await this.waitInit();
    if (this.service === 'Skolengo')
      return this.skolengoInstance.patchHomeworkAssignment(id, isDone);
    if (this.service === 'Pronote')
      return require(`./PronoteData/PronoteHomeworks.js`).changeHomeworkState(
        day,
        id
      );
    // .then((e) => thenHandler('changeh', e));
    return {};
  }

  // [Service]News.js
  async getNews(force = false) {
    await this.waitInit();
    if (this.service === 'Skolengo')
      return this.skolengoInstance.getNews(force);
    if (this.service === 'Pronote')
      return require(`./PronoteData/PronoteNews.js`)
        .getNews(force)
        .then((e) => (typeof e === 'string' ? JSON.parse(e) : e));
    // .then((e) => thenHandler('news', e));
    return [];
  }

  async changeNewsState(id) {
    await this.waitInit();
    if (this.service === 'Skolengo')
      return {status:'', error:'Not implemented'};
    if (this.service === 'Pronote')
      return require(`./PronoteData/PronoteNews.js`).changeNewsState(id);
    // .then((e) => thenHandler('changen', e));
    return {};
  }

  async getUniqueNews(id, force = false) {
    await this.waitInit();
    if (this.service === 'Skolengo')
      return this.skolengoInstance.getUniqueNews(id, force);
    throw new Error('Method only works for Skolengo');
  }

  // [Service]Recap.js
  async getRecap(day, force = false) {
    await this.waitInit();
    const storeShared = (e) => {
      return e;
    };
    if (this.service === 'Skolengo')
      return this.skolengoInstance.getRecap(day, force).then(storeShared);
    if (this.service === 'Pronote')
      return require(`./PronoteData/PronoteRecap.js`)
        .getRecap(day, force)
        .then(storeShared);
    // .then((e) => thenHandler('recap', e));
    return [[], [], {}];
  }

  // [Service]Timetable.js
  async getTimetable(day, force = false) {
    await this.waitInit();
    if (this.service === 'Skolengo')
      return this.skolengoInstance.getTimetable(day, force);
    if (this.service === 'Pronote')
      return require(`./PronoteData/PronoteTimetable.js`).getTimetable(
        day,
        force
      );
    return [];
  }

  // [Service]User.js
  async getUser(force = false) {
    await this.waitInit();
    if (this.service === 'Skolengo')
      return this.skolengoInstance
        .getUser(force)
        .then((e) => editUser(e))
        .then((e) => {
          console.log('usr', e);
          return e;
        });
    if (this.service === 'Pronote')
      return require(`./PronoteData/PronoteUser.js`)
        .getUser(force)
        .then((e) => ({ ...e, periods: undefined }))
        .then((e) => editUser(e));
    // .then((e) => thenHandler('usr', e));
    return {};
  }

  async getPeriods(force = false) {
    await this.waitInit();
    if (this.service === 'Skolengo')
      return this.skolengoInstance.getPeriods(force);
    if (this.service === 'Pronote')
      return (await require(`./PronoteData/PronoteUser.js`).getUser(force))
        .periods;
    // .then((e) => thenHandler('usr', e));
    return [];
  }

  // [Service]Viesco.js
  async getViesco(force = false) {
    await this.waitInit();
    if (this.service === 'Skolengo')
      return this.skolengoInstance.getViesco(force);
    if (this.service === 'Pronote')
      return require(`./PronoteData/PronoteViesco.js`).getViesco(force);
    // .then((e) => thenHandler('viesco', e));
    return [];
  }

  async getConversations(force = false) {
    await this.waitInit();
    if (this.service === 'Pronote')
      return require(`./PronoteData/PronoteConversations.js`).getConversations(
        force
      );
    return [];
  }
}

async function editUser(profile) {
  const user = profile;

  await AsyncStorage.getItem('custom_profile_picture').then(
    (customProfilePicture) => {
      if (customProfilePicture) {
        user.profile_picture = customProfilePicture;
      }
    }
  );

  await AsyncStorage.getItem('custom_name').then((customName) => {
    if (customName) {
      user.name = customName;
    }
  });

  return user;
}
