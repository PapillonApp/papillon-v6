import AsyncStorage from '@react-native-async-storage/async-storage';

import { getTimetable } from './PronoteTimetable';
import { getHomeworks } from './PronoteHomeworks';
import { getGrades } from './PronoteGrades';

import formatCoursName from '../../utils/FormatCoursName';
import getClosestColor from '../../utils/ColorCoursName';
import getClosestGradeEmoji from '../../utils/EmojiCoursName';

import SharedGroupPreferences from 'react-native-shared-group-preferences';
const appGroupIdentifier = "group.plus.pronote";

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

      if (userCacheDate.getTime() === today.getTime()) {
        // send to widget
        sendToSharedGroupGetEdtF(recapCache.recap[0]);

        return recapCache.recap;
      }
      AsyncStorage.removeItem('recapCache');
      return getRecap(day, true);
    }
    else {
      return Promise.all([
        getTimetable(day, force),
        getGrades(force),
        getHomeworks(day, force),
        getHomeworks(addDays(day, 1), force),
        getHomeworks(addDays(day, 2), force),
      ]).then((result) => {
        // send to widget
        sendToSharedGroupGetEdtF(result[0]);

        AsyncStorage.setItem('recapCache', JSON.stringify({
          date: new Date(),
          recap: result,
        }));
        return result;
      });
    }
  });
}

async function sendToSharedGroupGetEdtF(timetableData) {
  console.log("Sending to shared group");

  // cours de demo
  const demoCours = [
      {
          "id": "31#oBtMdN4uUGSdZJLfNHmSuXaeGxRzphrH3VU_5hgaNSc",
          "num": 691,
          "subject": {
              "id": "82#zzkjJoygnLU1x0lFF4wyg8CS1MwybtjXqaav74I6FUo",
              "name": "PHILOSOPHIE",
              "groups": false
          },
          "teachers": [
              "LE BELLEC J."
          ],
          "rooms": [
              "A203"
          ],
          "group_names": [],
          "memo": null,
          "virtual": [],
          "start": "2023-09-26 09:20",
          "end": "2023-09-26 10:20",
          "background_color": "#C0C0C0",
          "status": null,
          "is_cancelled": false,
          "is_outing": false,
          "is_detention": false,
          "is_exempted": false,
          "is_test": false
      },
      {
          "id": "31#l8ZAlFBc2aT7fyKhATIry-sdAS2PvJx1O6hicQN39KA",
          "num": 662,
          "subject": {
              "id": "82#64FvV-GreYJMzQGH61YA-mzrP0ja8ioWit3fawhM0mM",
              "name": "HISTOIRE-GEOGRAPHIE",
              "groups": false
          },
          "teachers": [
              "DE BREMOND D'ARS L."
          ],
          "rooms": [
              "C003"
          ],
          "group_names": [],
          "memo": null,
          "virtual": [],
          "start": "2023-09-26 10:20",
          "end": "2023-09-26 11:25",
          "background_color": "#FFED00",
          "status": null,
          "is_cancelled": false,
          "is_outing": false,
          "is_detention": false,
          "is_exempted": false,
          "is_test": false
      },
      {
          "id": "31#Zl1OXF1gBYxrHqEaRDWTZL_3qBYB4idkZjxdKrJ9W4U",
          "num": 693,
          "subject": {
              "id": "82#Z131UEjC7jrMyoVt5nV_LXvN5qrp9FcI4XozZ8FnK7g",
              "name": "ANGLAIS LV1",
              "groups": false
          },
          "teachers": [
              "DUNY S."
          ],
          "rooms": [
              "B209"
          ],
          "group_names": [
              "[TANG3]"
          ],
          "memo": null,
          "virtual": [],
          "start": "2023-09-26 13:49",
          "end": "2023-09-26 14:50",
          "background_color": "#F49737",
          "status": null,
          "is_cancelled": false,
          "is_outing": false,
          "is_detention": false,
          "is_exempted": false,
          "is_test": false
      },
      {
          "id": "31#gWHuLTUnnfadZoUVG4xgb21IWyIw0_qCrsqbt8Tz728",
          "num": 264,
          "subject": {
              "id": "82#esDiJFBtTVxyevKOG21Ws23NmwfuRjq56r1jgg4RgiQ",
              "name": "LLC ANGL.MOND.CONT.",
              "groups": false
          },
          "teachers": [
              "LAGADEC C."
          ],
          "rooms": [
              "C301"
          ],
          "group_names": [
              "[B-TERM-LAGADEC]"
          ],
          "memo": null,
          "virtual": [],
          "start": "2023-09-26 16:00",
          "end": "2023-09-26 17:50",
          "background_color": "#EC6719",
          "status": null,
          "is_cancelled": false,
          "is_outing": false,
          "is_detention": false,
          "is_exempted": false,
          "is_test": false
      }
  ]

  timetableData = demoCours;

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
}

export { getRecap };
