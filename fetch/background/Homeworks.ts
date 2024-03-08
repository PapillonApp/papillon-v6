import SharedGroupPreferences from 'react-native-shared-group-preferences';
import formatCoursName from '../../utils/FormatCoursName';
import getClosestGradeEmoji from '../../utils/EmojiCoursName';
import { getSavedCourseColor } from '../../utils/ColorCoursName';
import type { PapillonLesson } from '../types/timetable';
import { getContextValues } from '../../utils/AppContext';
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import { checkCanNotify, DidNotified, SetNotified } from './Helper';
import { PapillonHomework } from '../types/homework';

const APP_GROUP_IDENTIFIER = 'group.xyz.getpapillon.ios';
const now = new Date();

const fetchHomeworks = async () => {
  let dataInstance = await getContextValues().dataProvider;
  return dataInstance.getHomeworks(true).then(async (homeworks) => {
    try {
      await notifyHomeworks(homeworks);
      console.info('[background fetch] fetched homeworks');
      return true;
    }
    catch (e) {
      console.error('[background fetch] error while backgounding homeworks', e);
      return false;
    }
  });
};

const notifyHomeworks = async (homeworks: PapillonHomework[]) => {
  // filter all homeworks for so homework.date is tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const homeworksForTomorrow = homeworks.filter((homework) => {
    const homeworkDate = new Date(homework.date);
    return homeworkDate.getDate() === tomorrow.getDate() && homeworkDate.getMonth() === tomorrow.getMonth() && homeworkDate.getFullYear() === tomorrow.getFullYear();
  });

  // get all homeworks for tomorrow where done is false
  const homeworksForTomorrowNotDone = homeworksForTomorrow.filter((homework) => !homework.done);
  const countUndoneHomeworks = homeworksForTomorrowNotDone.length;

  if (countUndoneHomeworks === 0) {
    notifee.cancelNotification('hw_' + tomorrow.getTime());
  }
  else {
    const canNotify : boolean = await checkCanNotify();
    const didNotify : boolean = await DidNotified('hw_' + tomorrow.getTime());
    if (!canNotify || didNotify) return;

    let time = new Date();
    if (time.getHours() < 19) {
      return;
    }

    await notifee.displayNotification({
      id: 'hw_' + tomorrow.getTime(),
      title: 'Devoirs pour demain',
      body: `Vous avez ${countUndoneHomeworks} devoirs à faire pour demain.`,
      android: {
        channelId: 'homeworks',
      },
    });

    await SetNotified('hw_' + tomorrow.getTime());
  }

  return true;
};

export default fetchHomeworks;
