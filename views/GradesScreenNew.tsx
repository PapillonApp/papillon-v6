import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Button, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';

// Custom imports
import GetUIColors from '../utils/GetUIColors';
import { useAppContext } from '../utils/AppContext';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

// Plugins
import { ContextMenuButton } from 'react-native-ios-context-menu';

// Interfaces
interface UIaverage {
  name: string,
  description: string,
  value: number,
}

interface gradeSettings {
  scale: number,
  mode: string,
}

interface PapillonAveragesOverTime {
  date: Date,
  value: number,
}

// Pawnote
import { PapillonPeriod } from '../fetch/types/period';
import { PapillonGrades, PapillonGradesViewAverages } from '../fetch/types/grades';
import { PapillonSubject } from '../fetch/types/subject';
import { PronoteApiGradeType } from 'pawnote';
import { formatPapillonGradeValue } from '../utils/grades/format';
import { StatusBar } from 'expo-status-bar';

const GradesScreen = ({ navigation }) => {
  const UIColors = GetUIColors();
  const appContext = useAppContext();

  // Data
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [periods, setPeriods] = React.useState<PapillonPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = React.useState<PapillonPeriod | null>(null);
  const [grades, setGrades] = React.useState([]);
  const [averages, setAverages] = React.useState<PapillonGradesViewAverages[]>({});
  const [averagesOverTime, setAveragesOverTime] = React.useState<PapillonAveragesOverTime[]>([]);

  // Constants
  const [gradeSettings, setGradeSettings] = React.useState<gradeSettings[]>({
    scale: 20,
    mode: 'semestre'
  });

  // UI arrays
  const [UIaverage, setUIaverage] = React.useState<UIaverage[]>([]);

  // Update UIaverage when averages change
  React.useEffect(() => {
    setUIaverage([
      {
        name: 'Moyenne générale',
        description: 'Moyenne élève calculée à partir des notes',
        value: averages.student || 0
      },
      {
        name: 'Moyenne groupe',
        description: 'Moyenne de classe de chaque matière',
        value: averages.group || 0
      },
      {
        name: 'Moyenne max',
        description: 'Moyenne la plus faible des matières',
        value: averages.max || 0
      },
      {
        name: 'Moyenne min',
        description: 'Moyenne la plus élevée des matières',
        value: averages.min || 0
      },
    ]);
  }, [averages]);

  async function getPeriodsFromAPI (mode:string=gradeSettings.mode): Promise<PapillonPeriod> {
    const allPeriods = await appContext.dataProvider!.getPeriods();

    let periods: PapillonPeriod[] = [];
    periods = allPeriods;

    // only keep periods that contains mode in their name
    periods = periods.filter((period) => period.name.toLowerCase().normalize('NFD').includes(mode));

    setPeriods(periods);
    const firstPeriod = periods[0];
    
    // TODO: Select current by default.
    setSelectedPeriod(firstPeriod);
    return firstPeriod;
  }

  async function getGradesFromAPI (force = false, period = selectedPeriod): Promise<void> {
    setIsLoading(true);

    if (appContext.dataProvider && period) {
      const grades = await appContext.dataProvider.getGrades(period.name, force);
      const start = performance.now();
      if (grades) await parseGrades(grades);
      else {
        // TODO: Warn user that cache is missing.
        console.warn('CACHE NEEDED !');
      }
      console.log('took', performance.now() - start, 'ms');
    }

    setIsLoading(false);
  }

  async function addGradesToSubject(grades: PapillonGrades): Promise<void> {
    const data = [];

    // for each grade.averages
    grades.averages.forEach((average) => {
      let newAverage = {
        ...average,
        grades: [],
      };

      data.push(newAverage);
    });

    // for each grade.grade
    grades.grades.forEach((grade) => {
      // find corresponding fullGrade
      const subject = data.find((subject) => subject.subject.id === grade.subject.id);

      // if found, add grade to fullGrade
      if (subject) {
        subject.grades.push(grade);
      }
    });

    // sort grades by date
    data.forEach((subject) => {
      subject.grades.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    });

    // sort averages by name
    data.sort((a, b) => {
      return a.subject.name.localeCompare(b.subject.name);
    });

    setGrades(data);
  }

  // Calculate averages over time
  async function calculateAveragesOverTime (grades: PapillonGrades): Promise<Array> {
    let data = [];

    // for each grade.grades
    for (let i = 0; i < grades.length; i++) {
      // get a list of all grades until i
      const gradesUntil = grades.slice(0, i + 1);

      // calculate average
      const average = await calculateSubjectAverage(gradesUntil, 'value', gradeSettings.scale);

      // add to data
      data.push({
        date: new Date(grades[i].date),
        value: average,
      });
    }

    // sort by date
    data.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return data;
  }

  // Estimate averages
  async function estimatedStudentAverages (grades: PapillonGrades): Promise<void> {
    let student = await calculateSubjectAverage(grades, 'value', gradeSettings.scale);
    let group = await calculateSubjectAverage(grades, 'average', gradeSettings.scale);
    let max = await calculateSubjectAverage(grades, 'max', gradeSettings.scale);
    let min = await calculateSubjectAverage(grades, 'min', gradeSettings.scale);

    setAverages({
      student,
      group,
      max,
      min,
    });
  }

  // Estimate averages over time
  async function estimateAveragesOverTime (grades: PapillonGrades): Promise<void> {
    let averagesOverTime = await calculateAveragesOverTime(grades);
    console.log(averagesOverTime);
    setAveragesOverTime(averagesOverTime);
  }

  // Parse grades
  async function parseGrades (grades: PapillonGrades): Promise<void> {
    addGradesToSubject(grades);
    estimatedStudentAverages(grades?.grades);
    estimateAveragesOverTime(grades?.grades);
  }

  // Change period
  function changePeriod (name: string) {
    const period = periods.find((period) => period.name === name);
    if (period) setSelectedPeriod(period);
    if (period) getGradesFromAPI(false, period);
  }

  // On mount
  React.useEffect(() => {
    getPeriodsFromAPI().then((period) => {
      getGradesFromAPI(false, period);
    });
  }, []);

  // Change header title
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ContextMenuButton
          isMenuPrimaryAction={true}
          menuConfig={{
            menuTitle: 'Périodes',
            menuItems: periods.map((period) => ({
              actionKey: period.name,
              actionTitle: period.name,
              menuState: selectedPeriod?.name === period.name ? 'on' : 'off',
            })),
          }}
          onPressMenuItem={({ nativeEvent }) => {
            if (nativeEvent.actionKey === selectedPeriod?.name) return;
            changePeriod(nativeEvent.actionKey);
          }}
        >
          <TouchableOpacity>
            <NativeText
              heading="p"
              style={{
                color: UIColors.primary,
                fontSize: 17,
              }}
            >
              {selectedPeriod?.name}
            </NativeText>
          </TouchableOpacity>
        </ContextMenuButton>
      ),
    });
  }, [navigation, periods, selectedPeriod, UIColors]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior='automatic'
      style={{ backgroundColor: UIColors.backgroundHigh }}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => getGradesFromAPI(true)}
        />
      }
    >
      <StatusBar barStyle={UIColors.dark ? 'light-content' : 'dark-content'} />

      <GradesAveragesList
        isLoading={isLoading}
        UIaverage={UIaverage}
        gradeSettings={gradeSettings}
      />

      <GradesAverageHistory
        isLoading={isLoading}
        averagesOverTime={averagesOverTime}
      />
      
    </ScrollView>
  );
};

const GradesAverageHistory = ({ isLoading, averagesOverTime }) => {
  return (
    <NativeList header="Historique des moyennes">
      { averagesOverTime.reverse().map((item, index) => (
        <NativeItem
          trailing= {
            <NativeText heading="p2">
              {item.value?.toFixed(2)} / 20
            </NativeText>
          }
        >
          <NativeText heading="p">
            {item.date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}
          </NativeText>
        </NativeItem>
      ))}
    </NativeList>
  );
};

const GradesAveragesList = ({ isLoading, UIaverage, gradeSettings }) => {
  // When loading
  if (isLoading) return (
    <NativeList>
      <NativeItem
        trailing={
          <ActivityIndicator />
        }
      >
        <NativeText heading="p2">
          Chargement des moyennes...
        </NativeText>
      </NativeItem>
    </NativeList>
  );

  // if UIaverage is empty
  if (UIaverage.length === 0) return (
    <NativeList>
      <NativeItem>
        <NativeText heading="p2">
          Aucune moyenne à afficher.
        </NativeText>
      </NativeItem>
    </NativeList>
  );

  // When loaded
  return (
    <NativeList>
      { UIaverage.map((item, index) => (
        <NativeItem
          key={index}
          trailing={
            <NativeText heading="p2">
              {item.value?.toFixed(2)} / {gradeSettings.scale.toFixed(2)}
            </NativeText>
          }
        >
          <NativeText heading="h4">
            {item.name}
          </NativeText>
          <NativeText heading="subtitle2">
            {item.description}
          </NativeText>
        </NativeItem>
      ))}
    </NativeList>
  );
};

const calculateAverage = async (grades: PapillonGrades, type: string = 'value', base: number = 20): Promise<number> => {
  let gradel = 0;
  let coefs = 0;

  // Formule de calcul de moyenne volée à Pronote
  grades.forEach((grade) => {
    let val = grade.grade[type].value;
    let out_of = grade.grade.out_of.value;

    const coef = grade.grade.coefficient;

    if (out_of > base) {
      val = val * (base / out_of);
      out_of = base;
    }

    // TODO: Check if grade is significant
    const significant = !grade.grade[type].significant || true;

    if (val && out_of && significant) {
      gradel += (val * coef);
      coefs += (out_of * coef);
    }
  });

  const res = (gradel / coefs) * base;

  if (gradel > 0 && coefs > 0) return res;
  else return -1;
};

const calculateSubjectAverage = async (grades: PapillonGrades, type: string = 'value', base: number = 20): Promise<number> => {
  let subjects = [];

  // sort all grades by subject
  grades.forEach((grade) => {
    const subject = subjects.find((subject) => subject.id === grade.subject.id);
    if (subject) subject.grades.push(grade);
    else subjects.push({ id: grade.subject.id, grades: [grade] });
  });

  // calculate average for each subject using calculateAverage
  let total = 0;
  let count = 0;

  await subjects.forEach(async (subject) => {
    const avg = await calculateAverage(subject.grades, type, base);
    if (avg > 0) {
      total += avg;
      count++;
    }
  });

  if (count > 0) return total / count;
  else return -1;
};

const styles = StyleSheet.create({
});

export default GradesScreen;
