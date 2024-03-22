import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { BackgroundFetchResult } from 'expo-background-fetch';

import fetchLessons from './background/Lessons';
import fetchHomeworks from './background/Homeworks';
import fetchGrades from './background/Grades';
import fetchCours from './background/BagReminder';

const backgroundFetch = async () => {
  console.log('[background fetch] Running background fetch');

  await Promise.all([fetchLessons(), fetchHomeworks(), fetchGrades(), fetchCours()]);

  return BackgroundFetchResult.NewData;
};

const setBackgroundFetch = async () => {
  TaskManager.defineTask('background-fetch', () => backgroundFetch());

  BackgroundFetch?.registerTaskAsync('background-fetch', {
    minimumInterval: 60 * 15, // 15 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });

  backgroundFetch();

  console.log('[background fetch] Registered background fetch');
};

const unsetBackgroundFetch = async () => {
  BackgroundFetch.unregisterTaskAsync('background-fetch');
  console.log('[background fetch] Unregistered background fetch');
};

export {
  setBackgroundFetch,
  unsetBackgroundFetch,
};
