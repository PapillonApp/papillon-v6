import SharedGroupPreferences from 'react-native-shared-group-preferences';
import formatCoursName from '../../utils/cours/FormatCoursName';
import getClosestGradeEmoji from '../../utils/cours/EmojiCoursName';
import { getSavedCourseColor } from '../../utils/cours/ColorCoursName';
import type { PapillonLesson } from '../types/timetable';
import { getContextValues } from '../../utils/AppContext';
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import { checkCanNotify } from './Helper';
import { Platform } from 'react-native';

const APP_GROUP_IDENTIFIER = 'group.xyz.getpapillon';
const now = new Date();

const fetchLessons = async () => {
  let dataInstance = await getContextValues().dataProvider;
  return dataInstance.getTimetable(now, true).then(async (lessons) => {
    console.info('[background fetch] fetched lessons');
    try {
      // filter lessons to only keep those that are today
      lessons = lessons.filter(lesson => {
        const start = new Date(lesson.start);
        return start.getDate() === now.getDate() && start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear();
      });

      if (Platform.OS === 'ios') {
        await sendLessonsToSharedGroup(lessons);
      }
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

  console.info('[background fetch] sending lessons to shared group (getEdtF)', sharedLessons);
  await SharedGroupPreferences.setItem('getEdtF', JSON.stringify(sharedLessons), APP_GROUP_IDENTIFIER);
  console.info('[background fetch] stored lessons in shared group (getEdtF)');

  return true;
};

const notifyLessons = async (lessons: PapillonLesson[]) => {
  const canNotify : boolean = await checkCanNotify('notifications_CoursEnabled');
  if (!canNotify) return;

  // remove all notifications
  for (const lesson of lessons) {
    const lessonID = (lesson.subject?.name ? lesson.subject.name : '') + new Date(lesson.start).getTime();
    notifee.cancelNotification(lessonID);
  }

  // get all lessons with status set
  const lessonsWithStatus = lessons.filter(lesson => lesson.status !== undefined);
  
  // for each lesson, notify if status is set
  for (const lesson of lessonsWithStatus) {
    const lessonStart = new Date(lesson.start);
    lessonStart.setMinutes(lessonStart.getMinutes() - 30);

    // if lessonStart is in the past
    if (lessonStart.getTime() < Date.now()) continue;
    
    const lessonID = (lesson.subject?.name ? lesson.subject.name : '') + new Date(lesson.start).getTime();

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: lessonStart.getTime(),
    };

    console.info('[background fetch] notifying lesson', lessonID, 'at', lessonStart, 'with status', lesson.status);

    let body = '';

    if(lesson.is_cancelled) {
      body = 'Le cours est annulé.';
    } else if(lesson.rooms.length === 0) {
      body = 'Vous n\'avez pas de salle attribuée.';
    } else {
      body = `Vous serez en salle ${lesson.rooms.join(', ')}`;
    }

    // notify at most 10 minutes before the lesson
    notifee.cancelNotification(lessonID);
    notifee.createTriggerNotification({
      id: lessonID,
      title: getClosestGradeEmoji(lesson.subject?.name) + ' ' + lesson.status,
      subtitle: formatCoursName(lesson.subject?.name),
      body: body,
      android: {
        channelId: 'course-edit',
      },
      ios: {
        sound: 'papillon_ding.wav',
        threadId: 'notifications_CoursEnabled',
      }
    }, trigger);
  }

  return true;
};

export default fetchLessons;
