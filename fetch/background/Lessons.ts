import SharedGroupPreferences from 'react-native-shared-group-preferences';
import formatCoursName from '../../utils/FormatCoursName';
import getClosestGradeEmoji from '../../utils/EmojiCoursName';
import { getSavedCourseColor } from '../../utils/ColorCoursName';
import type { PapillonLesson } from '../types/timetable';
import { getContextValues } from '../../utils/AppContext';
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import { checkCanNotify } from './Helper';

const APP_GROUP_IDENTIFIER = 'group.xyz.getpapillon';
const now = new Date();

const fetchLessons = async () => {
  let dataInstance = await getContextValues().dataProvider;
  return dataInstance.getTimetable(now, true).then(async (lessons) => {
    console.info('[background fetch] fetched lessons');
    try {
      await sendLessonsToSharedGroup(lessons);
      await notifyLessons(lessons);
      return true;
    }
    catch (e) {
      console.error('[background fetch] error while sending lessons to shared group', e);
      return false;
    }
  });
};

const sendLessonsToSharedGroup = async (lessons: PapillonLesson[]) => {
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
  console.info('[background fetch] stored lessons in shared group (getEdtF)');

  return true;
};

const notifyLessons = async (lessons: PapillonLesson[]) => {
  const canNotify : boolean = await checkCanNotify();
  if (!canNotify) return;

  // get all lessons with status set
  const lessonsWithStatus = lessons.filter(lesson => lesson.status !== undefined);
  
  // for each lesson, notify if status is set
  for (const lesson of lessonsWithStatus) {
    const lessonStart = new Date(lesson.start);
    lessonStart.setMinutes(lessonStart.getMinutes() - 10);
    
    const lessonID = (lesson.subject?.name ? lesson.subject.name : '') + lessonStart.getTime();

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: lessonStart.getTime(),
    };

    // notify at most 10 minutes before the lesson
    notifee.cancelNotification(lessonID);
    notifee.createTriggerNotification({
      id: lessonID,
      title: lesson.status,
      body: `Votre cours ${lesson.subject?.name ? 'de' + lesson.subject.name : ''} sera en ${lesson.rooms.join(', ')}`,
      android: {
        channelId: 'getpapillon',
      },
      ios: {
        sound: 'papillon_ding.wav',
      }
    }, trigger);
  }

  return true;
};

export default fetchLessons;
