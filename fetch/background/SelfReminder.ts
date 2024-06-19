import notifee from '@notifee/react-native';
import { getContextValues } from '../../utils/AppContext';
import { checkCanNotify, DidNotified } from './Helper';
import type { PapillonLesson } from '../types/timetable';

const SelfReminder = async () => {
  console.log('[background fetch] Running self reminder');
  const now = new Date();

  const canNotify: boolean = await checkCanNotify('notifications_BagReminderEnabled');
  const didNotify: boolean = await DidNotified('hw_' + now.getTime());
  if (!canNotify || didNotify) return;

  if (now.getHours() >= 8 && now.getHours() <= 10) {
    let dataInstance : any  = await getContextValues().dataProvider;
    await dataInstance.getTimetable(now).then(async (timetable: PapillonLesson[]) => {
      console.log('[background fetch] fetched cours');
      const cours = timetable.filter((cours: PapillonLesson) => {
        if (cours.is_cancelled) return false;
        if (new Date(cours.start).toISOString().split('T')[0] !== now.toISOString().split('T')[0]) return false;
        return true;
      });
      if (cours.length > 0) {
        await notifee.displayNotification({
          id: 'self_' + now.getTime(),
          title: '🍽️ Pense à réserver le self !',
          body: 'Il est temps d\'aller réserver le self pour ce midi.',
          android: {
            channelId: 'self-remind',
          },
          ios: {
            sound: 'papillon_ding.wav',
            threadId: 'notifications_SelfReminderEnabled',
          },
        });
      }
    });
  }
};

export default SelfReminder;
