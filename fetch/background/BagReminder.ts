import {getContextValues} from '../../utils/AppContext';
import notifee from '@notifee/react-native';
import {PapillonLesson} from '../types/timetable';
import {checkCanNotify, DidNotified, SetNotified} from './Helper';
import formatCoursName from '../../utils/cours/FormatCoursName';

const now = new Date();

const bagReminder = async () => {
  if (now.getHours() >= 18 && now.getHours() <= 20) {
    console.log('[background fetch] Running cours fetch');
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tommorowAsString = tomorrow.toISOString().split('T')[0];
    let dataInstance = await getContextValues().dataProvider;
    await dataInstance.getTimetable(tomorrow).then(timetable => {
      console.log('[background fetch] fetched cours');
      const cours = timetable.filter(cours => {
        if (cours.isCancelled) return false;
        if (cours.start.split('T')[0] !== tommorowAsString) return false;
        return true;
      });
      if (cours.length > 0) {
        remindBag(cours);
      }
    });
  } else {
    console.log('[background fetch] Skipping cours fetch');
  }
};

const remindBag = async (lesson: PapillonLesson[]) => {
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const canNotify: boolean = await checkCanNotify('notifications_BagReminderEnabled');
  const didNotify: boolean = await DidNotified('br_' + tomorrow.getTime());
  if (!canNotify || didNotify) return;
  var body = '';
  var isFirst = true;
  lesson.forEach(cours => {
    if (!body.includes(cours.subject)) {
      let start = new Date(cours.start);
      let end = new Date(cours.end);
      if (!isFirst) body += '\n';
      isFirst = false;
      body += `${('0' + start.getHours()).slice(-2)}:${('0' + start.getMinutes()).slice(-2)} - ${('0' + end.getHours()).slice(-2)}:${('0' + end.getMinutes()).slice(-2)} • ${formatCoursName(cours.subject.name)}`;
    }
  });
  await notifee.displayNotification({
    id: 'br_' + tomorrow.getTime(),
    title: '🎒 Il est temps de préparer votre sac pour demain !',
    body: body,
    android: {
      channelId: 'bag-remind',
    },
    ios: {
      sound: 'papillon_ding.wav',
      threadId: 'notifications_BagReminderEnabled',
    },
  });
  await SetNotified('br_' + tomorrow.getTime());
};

export default bagReminder;
