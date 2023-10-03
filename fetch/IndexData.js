/* eslint-disable global-require */

import asyncStorage from '@react-native-async-storage/async-storage';

export class IndexData {
  // [Service]Grades.js
  static async getGrades(force = false) {
    return asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteGrades.js`).getGrades(force);
    });
  }

  static async getEvaluations(force = false) {
    return asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteGrades.js`).getEvaluations(force);
    });
  }

  static async changePeriod(period) {
    return asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteGrades.js`).changePeriod(period);
    });
  }

  // [Service]Homeworks.js
  static async getHomeworks(day, force = false, day2 = null) {
    // if day2 is not set, use day
    if (!day2) day2 = day;

    return asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteHomeworks.js`).getHomeworks(
          day,
          force,
          day2
        );
    });
  }

  static async changeHomeworkState(day, id) {
    return asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteHomeworks.js`).changeHomeworkState(
          day,
          id
        );
    });
  }

  // [Service]News.js
  static async getNews(force = false) {
    return asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteNews.js`).getNews(force);
    });
  }

  // [Service]Recap.js
  static async getRecap(day, force = false) {
    return asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteRecap.js`).getRecap(day, force);
    });
  }

  // [Service]Timetable.js
  static async getTimetable(day, force = false) {
    return asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteTimetable.js`).getTimetable(
          day,
          force
        );
    });
  }

  // [Service]User.js
  static async getUser(force = false) {
    return asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteUser.js`).getUser(force);
    });
  }

  // [Service]Viesco.js
  static async getViesco(force = false) {
    return asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(`./PronoteData/PronoteViesco.js`).getViesco(force);
    });
  }

  // [Service]Conversations.js
  static async getConversations(force = false) {
    return asyncStorage.getItem('service').then((service) => {
      if (service === 'Pronote')
        return require(
          `./PronoteData/PronoteConversations.js`
        ).getConversations(force);
    });
  }
}
