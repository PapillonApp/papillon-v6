import SharedGroupPreferences from 'react-native-shared-group-preferences';
import formatCoursName from '../../utils/FormatCoursName';
import getClosestGradeEmoji from '../../utils/EmojiCoursName';
import { getSavedCourseColor } from '../../utils/ColorCoursName';
import { getContextValues } from '../../utils/AppContext';
import { checkCanNotify, DidNotified } from './Helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PapillonGrades } from '../types/grades';
import { calculateSubjectAverage } from '../../utils/grades/averages';

const APP_GROUP_IDENTIFIER = 'group.xyz.getpapillon';
const now = new Date();

const fetchGrades = async () => {
  let dataInstance = await getContextValues().dataProvider;
  return dataInstance.getUser().then((user) => {
    const periods = user.periodes.grades;
    const currentPeriod = periods.find((period) => period.actual)!;

    return dataInstance.getGrades(currentPeriod.name).then(async (grades) => {
      try {
        await sendGradesToSharedGroup(grades);
        await notifyGrades(grades);
        console.info('[background fetch] fetched grades');
        return true;
      }
      catch (e) {
        console.error('[background fetch] error while backgounding grades', e);
        return false;
      }
    });
  });
};

const sendGradesToSharedGroup = async (grades: PapillonGrades) => {
  const sharedLessons = [];

  for (const grade of grades.grades) {
    const color = getSavedCourseColor(grade.subject.name, '#29947a');

    sharedLessons.push({
      subject: formatCoursName(grade.subject.name),
      emoji: getClosestGradeEmoji(grade.subject.name),
      description: grade.description ? grade.description : '',
      color: color,
      date: new Date(grade.date).getTime(),
      grade: {
        value: grade.grade.value,
        out_of: grade.grade.out_of,
        average: grade.grade.average,
        max: grade.grade.max,
        min: grade.grade.min,
      },
      is_bonus: grade.is_bonus,
      is_optional: grade.is_optional,
      is_out_of_20: grade.is_out_of_20,
    });
  }

  // sort by date (most recent first)

  sharedLessons.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  //faire en sorte que d'afficher console.info await SharedGroupPreferences.setItem('getGradesF', JSON.stringify(sharedLessons), APP_GROUP_IDENTIFIER); ne retourne pas d'erreur

  try {
    await SharedGroupPreferences.setItem('getGradesF', JSON.stringify(sharedLessons), APP_GROUP_IDENTIFIER);
    console.info('[background fetch] Stored grades in shared group (getGradesF)');
    console.info('[background fetch] Stored grades in shared group', sharedLessons);
  } catch (error) {
    console.error('[background fetch] Error while storing grades in shared group', error);
  }
  
  // create an history of grades by calculating calculateSubjectAverage with all grades gradually added
  const history = [];
  const gradesHistoryList = [];

  for (const grade of grades.grades) {
    gradesHistoryList.push(grade);
    history.push(await calculateSubjectAverage(gradesHistoryList));
  }

  const hst = {
    average: history[history.length - 1],
    history: history,
  };

  await SharedGroupPreferences.setItem('getAveragesF', JSON.stringify(hst), APP_GROUP_IDENTIFIER);
  console.info('[background fetch] Stored averages in shared group (getAveragesF)');
  
  return true;
};

const notifyGrades = async (grades: PapillonGrades[]) => {
  let oldGrades = await AsyncStorage.getItem('oldGrades');
  const fullGrades = grades.grades;
  const avg = await calculateSubjectAverage(fullGrades);

  if (oldGrades === null) {
    await AsyncStorage.setItem('oldGrades', JSON.stringify(fullGrades));
    return true;
  }

  oldGrades = JSON.parse(oldGrades);

  if (oldGrades.length === fullGrades.length) {
    return true;
  }

  // find the difference between the two arrays
  const lastGrades = fullGrades.filter((grade) => !oldGrades.includes(grade));

  for (let i = 0; i < lastGrades.length; i++) {
    let lastGrade = lastGrades[i];
    let lastGradeId = lastGrade.subject.name + lastGrade.date;
    notifee.cancelNotification(lastGradeId);

    const canNotify = await checkCanNotify();
    const didNotified = await DidNotified(lastGradeId);
    if (!canNotify || didNotified) {
      return false;
    }

    const goodGrade = lastGrade.grade.value.value / lastGrade.grade.out_of.value >= 0.75;

    notifee.displayNotification({
      id: lastGradeId,
      subtitle: formatCoursName(lastGrade.subject.name),
      title: lastGrade.description ? getClosestGradeEmoji(lastGrade.subject.name) + ' ' + lastGrade.description : getClosestGradeEmoji(lastGrade.subject.name) + ' ' + 'Nouvelle note',
      body: `Vous avez eu ${lastGrade.grade.value.value}/${lastGrade.grade.out_of.value} ${goodGrade ? '! 👏' : ''}`,
      android: {
        channelId: 'grades',
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: 'papillon_ding.wav',
      },
    });
  };

  await AsyncStorage.setItem('oldGrades', JSON.stringify(fullGrades));
  return true;
};

export default fetchGrades;
