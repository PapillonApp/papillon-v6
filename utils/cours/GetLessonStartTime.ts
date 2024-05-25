import type { PapillonLesson } from '../../fetch/types/timetable';

const GetLessonStartTime = (lesson: PapillonLesson): string => {
  const currentTime = Date.now();
  const startTime = lesson.start;
  const endTime = lesson.end;

  if (currentTime < startTime) {
    const timeUntilStart = startTime - currentTime;
    const minutesUntilStart = Math.floor(timeUntilStart / 60000);
    const hours = Math.floor(minutesUntilStart / 60);
    const minutes = minutesUntilStart % 60;

    if (hours > 0) {
      return `dans ${hours} heure${hours > 1 ? 's' : ''} et ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `dans ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return 'dans moins d\'une minute';
    }
  } else if (currentTime >= startTime && currentTime <= endTime) {
    const timeRemaining = endTime - currentTime;
    const minutesRemaining = Math.floor(timeRemaining / 60000);

    if (minutesRemaining > 0) {
      return `${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} restante${minutesRemaining > 1 ? 's' : ''}`;
    } else {
      return 'moins d\'une minute restante';
    }
  } else {
    return 'lesson ended';
  }
};

export default GetLessonStartTime;
