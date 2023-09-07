/* eslint-disable global-require */

import asyncStorage from '@react-native-async-storage/async-storage';

export class IndexData {
  // [Service]Grades.js
  static async getGrades(force = false) {
    asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteGrades.js`).getGrades(force);
    });
  }

  static async getEvaluations(force = false) {
    asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteGrades.js`).getEvaluations(force);
    });
  }

  static async changePeriod(period) {
    asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteGrades.js`).changePeriod(period);
    });
  }

  // [Service]Homeworks.js
  static async getHomeworks(day) {
    asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteHomeworks.js`).getHomeworks(day);
    });
  }

  static async changeHomeworkState(day, id) {
    asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteHomeworks.js`).changeHomeworkState(
          day,
          id
        );
    });
  }

  // [Service]News.js
  static async getNews(force = false) {
    asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteNews.js`).getNews(force);
    });
  }

  // [Service]Recap.js
  static async getRecap(day, force = false) {
    asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteRecap.js`).getRecap(day, force);
    });
  }

  // [Service]Timetable.js
  static async getTimetable(day, force = false) {
    asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteTimetable.js`).getTimetable(
          day,
          force
        );
    });
  }

  // [Service]User.js
  static async getUser(force = false) {
    asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteUser.js`).getUser(force);
    });
  }

  // [Service]Viesco.js
  static async getViesco(force = false) {
    asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteViesco.js`).getViesco(force);
    });
  }
}
