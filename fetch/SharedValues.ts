import SharedGroupPreferences from 'react-native-shared-group-preferences';
import formatCoursName from '../utils/FormatCoursName';
import getClosestGradeEmoji from '../utils/EmojiCoursName';
import { getSavedCourseColor } from '../utils/ColorCoursName';
import type { PapillonLesson } from './types/timetable';

const APP_GROUP_IDENTIFIER = 'group.xyz.getpapillon';

export default async function sendToSharedGroup(lessons: PapillonLesson[]) {
  const sharedLessons = [];

  for (const lesson of lessons) {
    if (!lesson.subject) continue;

    let color = getSavedCourseColor(lesson.subject.name, lesson.background_color);

    sharedLessons.push({
      subject: formatCoursName(lesson.subject.name),
      teacher: lesson.teachers.join(', '),
      room: lesson.rooms.join(', '),
      start: new Date(lesson.start).getTime(),
      end: new Date(lesson.end).getTime(),
      background_color: color,
      emoji: getClosestGradeEmoji(lesson.subject.name),
      is_cancelled: lesson.is_cancelled,
    });
  }

  await SharedGroupPreferences.setItem('getEdtF', JSON.stringify(sharedLessons), APP_GROUP_IDENTIFIER);
  console.info('SharedValues(sendToSharedGroup): stored lessons in shared group (getEdtF)');
}
