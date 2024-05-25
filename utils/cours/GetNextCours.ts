import type { PapillonLesson } from '../../fetch/types/timetable';

const GetNextCours = (lessons: PapillonLesson[]) => {
  if (!lessons || lessons.length === 0 || lessons === null) return null;

  const currentTime = Date.now();

  let currentLesson: PapillonLesson | null = null;
  let nextLesson: PapillonLesson | null = null;

  for (const lesson of lessons) {
    if (lesson.is_cancelled) continue;

    if (currentTime >= lesson.start && currentTime <= lesson.end) {
      currentLesson = lesson;
      break;
    }

    if (currentTime < lesson.start) {
      if (!nextLesson || lesson.start < nextLesson.start) {
        nextLesson = lesson;
      }
    }
  }

  return currentLesson || nextLesson;
};

export default GetNextCours;
