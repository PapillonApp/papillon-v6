import AsyncStorage from '@react-native-async-storage/async-storage';

import { getTimetable } from './PronoteTimetable';
import { getHomeworks } from './PronoteHomeworks';
import { getGrades } from './PronoteGrades';
import { sendToSharedGroupGetEdtF } from '../SharedValues';

function addDays(date, days) {
  date = new Date(date);
  date.setDate(date.getDate() + days);

  return date;
}

function getRecap(day, force) {
  return AsyncStorage.getItem('recapCache').then((recapCache) => {
    if (recapCache && !force) {
      recapCache = JSON.parse(recapCache);

      const userCacheDate = new Date(recapCache.date);
      const today = new Date();

      userCacheDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (userCacheDate.getTime() === today.getTime()) return recapCache.recap;

      AsyncStorage.removeItem('recapCache');
      return getRecap(day, true);
    }
    return Promise.all([
      getTimetable(day, force),
      getGrades(force),
      getHomeworks(day, force),
      getHomeworks(addDays(day, 1), force),
      getHomeworks(addDays(day, 2), force),
    ]).then((result) => {
      // send to widget
      sendToSharedGroupGetEdtF(result[0]);

      AsyncStorage.setItem(
        'recapCache',
        JSON.stringify({
          date: new Date(),
          recap: result,
        })
      );
      return result;
    });
  });
}

async function sendToSharedGroupGetEdtF(timetableData) {
  console.log("Sending to shared group");

  let coursSharedTable = [];

  // for each cours in timetableData
  for (let i = 0; i < timetableData.length; i++) {
    let cours = timetableData[i];

    coursSharedTable.push({
      "subject": formatCoursName(cours.subject.name),
      "teacher": cours.teachers.join(", "),
      "room": cours.rooms.join(", "),
      "start": new Date(cours.start).getTime(),
      "end": new Date(cours.end).getTime(),
      "background_color": getClosestColor(cours.background_color),
      "emoji": getClosestGradeEmoji(cours.subject.name),
      "is_cancelled": cours.is_cancelled,
    });
  }

  let stringifiedData = JSON.stringify(coursSharedTable);


  await SharedGroupPreferences.setItem("getEdtF", stringifiedData, appGroupIdentifier)

  console.log("Sent to shared group");
  const loadedData = await SharedGroupPreferences.getItem("getEdtF", appGroupIdentifier)

  console.log("Loaded data: ", loadedData);

}

export { getRecap };
