import SharedGroupPreferences from 'react-native-shared-group-preferences';
import formatCoursName from '../utils/FormatCoursName';
import getClosestColor from '../utils/ColorCoursName';
import getClosestGradeEmoji from '../utils/EmojiCoursName';

const appGroupIdentifier = 'group.plus.pronote';

async function sendToSharedGroup(timetableData) {
  console.log('Sending to shared group');

  const coursSharedTable = [];

  // for each cours in timetableData
  for (let i = 0; i < timetableData.length; i++) {
    const cours = timetableData[i];

    coursSharedTable.push({
      subject: formatCoursName(cours.subject.name),
      teacher: cours.teachers.join(', '),
      room: cours.rooms.join(', '),
      start: new Date(cours.start).getTime(),
      end: new Date(cours.end).getTime(),
      background_color: getClosestColor(cours.background_color),
      emoji: getClosestGradeEmoji(cours.subject.name),
      is_cancelled: cours.is_cancelled,
    });
  }

  const stringifiedData = JSON.stringify(coursSharedTable);

  await SharedGroupPreferences.setItem(
    'getEdtF',
    stringifiedData,
    appGroupIdentifier
  );
}


export default sendToSharedGroup;