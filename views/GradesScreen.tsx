import React, { useEffect } from 'react';
import {
  Animated,
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  Pressable,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { SFSymbol } from 'react-native-sfsymbols';
import PapillonInsetHeader from '../components/PapillonInsetHeader';

import AlertBottomSheet from '../interface/AlertBottomSheet';

import { BlurView } from 'expo-blur';
import { ContextMenuButton} from 'react-native-ios-context-menu';

import LineChart from 'react-native-simple-line-chart';

import { BarChart3, Users2, TrendingDown, TrendingUp, Info, AlertTriangle } from 'lucide-react-native';

import { PressableScale } from 'react-native-pressable-scale';

import { useActionSheet } from '@expo/react-native-action-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getSavedCourseColor } from '../utils/ColorCoursName';
import getClosestGradeEmoji from '../utils/EmojiCoursName';
import formatCoursName from '../utils/FormatCoursName';
import GetUIColors from '../utils/GetUIColors';
import { useAppContext } from '../utils/AppContext';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

import * as StoreReview from 'expo-store-review';
import { PapillonPeriod } from '../fetch/types/period';
import { PapillonGrades, PapillonGradesViewAverages } from '../fetch/types/grades';
import { PapillonSubject } from '../fetch/types/subject';
import { PronoteApiGradeType } from 'pawnote';
import { formatPapillonGradeValue } from '../utils/grades/format';

function GradesScreen({ navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();
  const appContext = useAppContext();
  const insets = useSafeAreaInsets();
  const { showActionSheetWithOptions } = useActionSheet();
  
  const [state, setState] = React.useState<{
    latestGrades: PapillonGrades['grades'],
    averagesData: PapillonGradesViewAverages | null,
    subjectsList: PapillonSubject[],
    avgChartData: Array<{ x: number, y: number }>,
    hasSimulatedGrades: boolean,
    calculatedClassAvg: boolean,
    calculatedAvg: boolean,
  }>({
    latestGrades: [],
    averagesData: null,
    subjectsList: [],
    avgChartData: [],
    hasSimulatedGrades: false,
    calculatedClassAvg: false,
    calculatedAvg: false,
  });
  
  // No need to be reactive, so we just write it as is.
  let allGradesNonReactive: PapillonGrades['grades'] = [];

  const [moyReelleAlert, setMoyReelleAlert] = React.useState(false);
  const [moyClasseReelleAlert, setClasseReelleAlert] = React.useState(false);
  const [moyClasseBasseAlert, setClasseBasseAlert] = React.useState(false);
  const [moyClasseHauteAlert, setClasseHauteAlert] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isHeadLoading, setHeadLoading] = React.useState(false);

  const [selectedCourse, setSelectedCourse] = React.useState<PapillonSubject | null>(null);
  const [courseModalVisible, setCourseModalVisible] = React.useState(false);


  const [gradeOpened, setGradeOpened] = React.useState(false);
  const [selectedPeriod, setSelectedPeriod] = React.useState<PapillonPeriod | null>(null);
  
  const [periods, setPeriods] = React.useState<PapillonPeriod[]>([]);

  const yOffset = new Animated.Value(0);

  const scrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: yOffset } } }],
    { useNativeDriver: false }
  );

  const headerOpacity = yOffset.interpolate({
    inputRange: [-75, -60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const sum = (arr: number[]) => arr.reduce((a,b) => a+b, 0);

  function calculateSubjectAverage (grades: PapillonGrades['grades']): PapillonSubject['averages'] {
    let totalGradesInSubject = 0;

    type Values = Array<[value: number, outOf: number]>;

    const studentValues: Values = [];
    const classValues: Values = [];
    const minValues: Values = [];
    const maxValues: Values = [];

    for (let i = 0; i < grades.length; i++) {
      const grade = grades[i].grade;

      let studentValue: number | undefined;
      let classValue: number | undefined;
      let minValue: number | undefined;
      let maxValue: number | undefined;

      // Student's grade value.
      if (grade.value.significant) { // TODO: Handle for Skolengo ?
        if (grade.value.type === PronoteApiGradeType.AbsentZero || grade.value.type === PronoteApiGradeType.UnreturnedZero) {
          studentValue = 0;
        }
      } else studentValue = grade.value.value;

      // Class' grade value.
      if (grade.average.significant) { // TODO: Handle for Skolengo ?
        if (grade.average.type === PronoteApiGradeType.AbsentZero || grade.average.type === PronoteApiGradeType.UnreturnedZero) {
          classValue = 0;
        }
      } else classValue = grade.average.value;
      
      // Minimum grade value.
      if (grade.min.significant) { // TODO: Handle for Skolengo ?
        if (grade.min.type === PronoteApiGradeType.AbsentZero || grade.min.type === PronoteApiGradeType.UnreturnedZero) {
          minValue = 0;
        }
      } else minValue = grade.min.value;
      
      // Maximum grade value.
      if (grade.max.significant) { // TODO: Handle for Skolengo ?
        if (grade.max.type === PronoteApiGradeType.AbsentZero || grade.max.type === PronoteApiGradeType.UnreturnedZero) {
          maxValue = 0;
        }
      } else maxValue = grade.max.value;

      // Useless grade, go to next grade.
      if (grade.coefficient === 0) continue;
      if (grade.out_of.significant) continue;

      totalGradesInSubject += 1;
      const outOf = grade.out_of.value * grade.coefficient;
      
      if (typeof studentValue !== 'undefined') {
        studentValues.push([studentValue * grade.coefficient, outOf]);
      }

      if (typeof classValue !== 'undefined') {
        classValues.push([classValue * grade.coefficient, outOf]);
      }

      if (typeof minValue !== 'undefined') {
        minValues.push([minValue * grade.coefficient, outOf]);
      }

      if (typeof maxValue !== 'undefined') {
        maxValues.push([maxValue * grade.coefficient, outOf]);
      }
    }

    if (totalGradesInSubject === 0) {
      return {
        average: -1,
        class_average: -1,
        min: -1,
        max: -1,
        out_of: 20,
      };
    }

    const student = sum(studentValues.map(v => v[0])) / sum(studentValues.map(v => v[1])) * 20;
    const classAverage = sum(classValues.map(v => v[0])) / sum(classValues.map(v => v[1])) * 20;
    const min = sum(minValues.map(v => v[0])) / sum(minValues.map(v => v[1])) * 20;
    const max = sum(maxValues.map(v => v[0])) / sum(maxValues.map(v => v[1])) * 20;

    return {
      average: student,
      class_average: classAverage,
      min: min,
      max: max,
      out_of: 20,
    };
  }

  function calculateAveragesFromGrades (grades: PapillonGrades['grades']): PapillonSubject['averages'] {
    const subjects: PapillonSubject[] = [];

    // 1. Read subjects from grades.
    grades.forEach((grade) => {
      const subjectIndex = subjects.findIndex(({ subject }) => subject.id === grade.subject.id);
      if (subjectIndex !== -1) { // found, push to grades of this subject.
        subjects[subjectIndex].grades.push(grade);
      } else { // insert the subject in the array.
        subjects.push({
          name: grade.subject.name,
          subject: grade.subject,
          grades: [grade],
          averages: { // default values before we get to step 2.
            average: -1,
            class_average: -1,
            min: -1,
            max: -1,
            out_of: 20,
          },
        });
      }
    });

    // 2. Calculate averages for each subject.
    subjects.forEach((subject) => {
      subject.averages = calculateSubjectAverage(subject.grades);
    });

    // 3. Calculate averages of all subjects
    let student = 0;
    let classAverage = 0;
    let min = 0;
    let max = 0;

    let count = 0;

    for (let i = 0; i < subjects.length; i++) {
      if (subjects[i].averages.average === -1) continue;

      student += subjects[i].averages.average;
      classAverage += subjects[i].averages.class_average;
      min += subjects[i].averages.min;
      max += subjects[i].averages.max;

      count += 1;
    }

    student = student / count;
    classAverage = classAverage / count;
    min = min / count;
    max = max / count;

    if (isNaN(student)) {
      student = 0;
    }
    if (isNaN(classAverage)) {
      classAverage = 0;
    }
    if (isNaN(min)) {
      min = 0;
    }
    if (isNaN(max)) {
      max = 0;
    }

    return {
      average: student,
      class_average: classAverage,
      min: min,
      max: max,
      out_of: 20,
    };
  }

  // Add buttons to navigation header.
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: Platform.OS === 'ios' ? () => (
        <PapillonInsetHeader
          style={{}}
          textStyle={{}}
          icon={<SFSymbol name="chart.pie.fill" />}
          title="Notes"
          color="#A84700"
        />
      ) : 'Notes',
      headerTransparent: Platform.OS === 'ios' ? true : false,
      headerStyle: Platform.OS === 'android' ? {
        backgroundColor: UIColors.background,
        elevation: 0,
      } : undefined,
      headerBackground: Platform.OS === 'ios' ? () => (
        <Animated.View 
          style={
            {
              flex: 1,
              backgroundColor: UIColors.element + '00',
              opacity: headerOpacity,
              borderBottomColor: theme.dark ? UIColors.text + '22' : UIColors.text + '55',
              borderBottomWidth: 0.5,
            }
          }
        >
          <BlurView
            tint={theme.dark ? 'dark' : 'light'}
            intensity={120}
            style={{
              flex: 1,
            }}
          />
        </Animated.View>
      ) : undefined,
      headerRight: () => (
        <View style={styles.rightActions}>
          <ContextMenuButton
            isMenuPrimaryAction={true}
            menuConfig={{
              menuTitle: 'Périodes',
              menuItems: periods.map((period) => {
                return {
                  actionKey: period.name,
                  actionTitle: period.name,
                  menuState : selectedPeriod?.name === period.name ? 'on' : 'off',
                };²
              }),
            }}
            onPressMenuItem={({nativeEvent}) => {
              setSelectedPeriod(periods.find((period) => period.name === nativeEvent.actionKey) ?? null);
              getGradesFromAPI(true);
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== 'ios') {
                  openPeriodSelectionSheet();
                }
              }}
              style={styles.periodButtonContainer}
            >
              <Text
                style={[styles.periodButtonText, { color: '#A84700' }]}
              >
                {selectedPeriod?.name || ''}
              </Text>
            </TouchableOpacity>
          </ContextMenuButton>

          {/* <TouchableOpacity
              style={[styles.addButtonContainer, {backgroundColor: "#A84700" + '22'}]}
              onPress={() => navigation.navigate('ModalGradesSimulator')}
            >
              <FlaskConical size='22' color={"#A84700"} />
            </TouchableOpacity> */}
        </View>
      ),
    });
  }, [navigation, selectedPeriod, isLoading, UIColors]);

  const openPeriodSelectionSheet = (): void => {
    const options = periods.map((period) => period.name);
    options.push('Annuler');

    showActionSheetWithOptions(
      {
        title: 'Changer de période',
        message: 'Sélectionnez la période de votre choix',
        options,
        tintColor: UIColors.primary,
        cancelButtonIndex: options.length - 1,
        containerStyle: {
          paddingBottom: insets.bottom,
          backgroundColor: UIColors.elementHigh,
        },
        textStyle: {
          color: UIColors.text,
        },
        titleTextStyle: {
          color: UIColors.text,
          fontWeight: 'bold',
        },
        messageTextStyle: {
          color: UIColors.text,
        },
      },
      (selectedIndex) => {
        // If the selected was "Annuler", then do nothing.
        if (selectedIndex === options.length - 1) return;
        // Make sure we're using a number.
        if (typeof selectedIndex !== 'number') return;

        const selectedPeriod = periods[selectedIndex];
        setSelectedPeriod(selectedPeriod);
        getGradesFromAPI(true);
      }
    );
  };

  /**
   * Read periods from the API.
   * 
   * Defines the following states :
   * - periods (setPeriods)
   * - remainingPeriods (setRemainingPeriods) - NOTE: Unused ?
   * - selectedPeriod (setSelectedPeriod)
   */
  async function getPeriodsFromAPI (): Promise<PapillonPeriod> {
    console.log('get periods ?');
    const allPeriods = await appContext.dataProvider!.getPeriods();
    const firstPeriod = allPeriods[0]; // TODO: Define `actual` on the connector.

    let periods: PapillonPeriod[] = [];
    periods = allPeriods;

    setPeriods(periods);
    
    // TODO: Select current by default.
    setSelectedPeriod(firstPeriod);
    return firstPeriod;
  }

  function calculateAverage (grades: PapillonGrades['grades'], isClass: boolean): number {
    let sumOfGrades = 0;
    let sumOfCoefficients = 0;

    for (const { grade } of grades) {
      if (!grade.value.significant && !grade.average.significant && !grade.out_of.significant) {
        if (isClass) {
          const correctedClassValue = grade.average.value / grade.out_of.value * 20;
          sumOfGrades += correctedClassValue * grade.coefficient;
        } else {
          const correctedValue = grade.value.value / grade.out_of.value * 20;
          sumOfGrades += correctedValue * grade.coefficient;
        }
  
        sumOfCoefficients += grade.coefficient;
      }
    }

    return sumOfGrades / sumOfCoefficients;
  }

  async function parseGrades (overview: PapillonGrades): Promise<void> {
    const subjects: PapillonSubject[] = [];

    /**
     * Whether the user set custom grades.
     * We store this to know if the average displayed is real or not.
     */
    let hasCustomGrades = false;

    // Add custom grades in the list, if exist.
    const storedCustomGrades = await AsyncStorage.getItem('custom-grades');
    if (storedCustomGrades) {
      const customGrades = JSON.parse(storedCustomGrades) as PapillonGrades['grades'];
      hasCustomGrades = customGrades.length > 0;
      
      for (const grade of customGrades) {
        const newGrade: PapillonGrades['grades'][number] = {
          ...grade,
          isSimulated: true,
        };
        
        // We don't add the grade if it already exists (!== -1)
        const alreadyExistsIndex = overview.grades.findIndex((item) => item.id === grade.id);
        if (alreadyExistsIndex !== -1) continue;
        
        overview.grades.push(newGrade);
      }

      // Update averages value of subjects, due to custom grades.
      for (const grade of customGrades) {
        const subject = overview.averages.find((average) => average.subject.name === grade.subject.name);
        if (!subject) continue;
        
        const filteredGrades = overview.grades.filter((grade) => grade.subject.name === subject.subject.name);
        subject.average = { significant: false, value: calculateAverage(filteredGrades, false) };
        subject.class_average = { significant: false, value: calculateAverage(filteredGrades, true) };
      }
    }

    allGradesNonReactive = overview.grades;
  
    allGradesNonReactive.forEach((grade) => {
      const subjectIndex = subjects.findIndex((subject) => subject.id === grade.subject.id);
      if (subjectIndex !== -1) {
        subjects[subjectIndex].grades.push(grade);
      } else {
        subjects.push({
          id : grade.subject.id,
          name: grade.subject.name,
          parsedName: {
            name: grade.subject.name.split(' > ')[0],
            sub: grade.subject.name.split(' > ').length > 0 ? grade.subject.name.split(' > ')[1] : void 0,
          },

          subject: grade.subject,
          grades: [grade],
          
          // Default values, will be replaced below.
          averages: {
            average: -1,
            class_average: -1,
            max: -1,
            min: -1,
            out_of: -1
          },
        });
      }
    });
  
    overview.averages.forEach((average) => {
      const subject = subjects.find((subject) => subject.id === average.subject.id);
      if (!subject) return;

      average.color = getSavedCourseColor(average.subject.name.split(' > ')[0], average.color);
      subject.averages = {
        average: average.average.significant ? -1 : average.average.value,
        class_average: average.class_average.significant ? -1 : average.class_average.value,
        min: average.min.significant ? -1 : average.min.value,
        max: average.max.significant ? -1 : average.max.value,
        out_of: average.out_of.significant ? -1 : average.out_of.value,
      };

      allGradesNonReactive.forEach((grade) => {
        if (grade.subject.name === subject.name) {
          grade.color = average.color;
        }
      });

      subject.grades.forEach((grade) => {
        grade.color = average.color;
      });
    });

    // Calculate averages from grades.
    let averagesCalculation = calculateAveragesFromGrades(allGradesNonReactive);
    // Structure averages gotten.
    const averagesData: PapillonGradesViewAverages = {
      studentAverage: averagesCalculation.average.toFixed(2),
      classAverage: averagesCalculation.class_average.toFixed(2),
      minAverage: averagesCalculation.min.toFixed(2),
      maxAverage: averagesCalculation.max.toFixed(2),
    };
    
    // Sort subjects.
    subjects.sort((a, b) => a.name.localeCompare(b.name));
    // Oldest grades first.
    allGradesNonReactive.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // For each last grade, calculate average, to create the graph.
    const chartData: Array<{ x: number, y: number }> = [];
    for (const grade of allGradesNonReactive) {
      const currentGradeTime = new Date(grade.date).getTime();
      const gradesBefore = allGradesNonReactive.filter((grade) => new Date(grade.date).getTime() <= currentGradeTime);
      let average = calculateAveragesFromGrades(gradesBefore).average;
      
      // If NaN, set to 0.
      if (isNaN(average)) {
        average = 0;
      }

      chartData.push({
        x: currentGradeTime,
        y: average
      });
    }

    let isCalculatedClassAvg = true;
    if (!overview.class_overall_average.significant && overview.class_overall_average.value.toFixed(2) !== averagesCalculation.class_average.toFixed(2)) {
      if (overview.class_overall_average.value > 0 && !hasCustomGrades) {
        averagesData.classAverage = overview.class_overall_average.value.toFixed(2);
      } else isCalculatedClassAvg = true;
    }

    let isCalculatedAvg = true;
    if (!overview.overall_average.significant && overview.overall_average.value.toFixed(2) !== averagesCalculation.average.toFixed(2)) {
      if (overview.overall_average.value > 0 && !hasCustomGrades) {
        averagesData.studentAverage = overview.overall_average.value.toFixed(2);
      } else isCalculatedAvg = true;
    }

    setState({
      // Store only the 10 latest grades.
      latestGrades: allGradesNonReactive.slice(-10).reverse(),
      averagesData,
      subjectsList: subjects,
      avgChartData: chartData,
      hasSimulatedGrades: hasCustomGrades,
      calculatedClassAvg: isCalculatedClassAvg,
      calculatedAvg: isCalculatedAvg
    });
  }
  
  /**
   * Get grades for the `selectedPeriod` from service API.
   * @param force - Whether to forbid using the cache or not.
   */
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

  useEffect(() => {
    (async () => {
      console.log('GradesScreen(onMount): getPeriodsFromAPI');
      const selectedPeriod = await getPeriodsFromAPI();
      console.log('GradesScreen(onMount): getGradesFromAPI ->', selectedPeriod.name);
      await getGradesFromAPI(false, selectedPeriod);
    })();
  }, []);

  function showGrade (grade: PapillonGrades['grades'][number]): void {
    navigation.navigate('Grade', { grade, allGrades: allGradesNonReactive });
    setGradeOpened(true);
  }

  // On grade modal close
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (gradeOpened) {
        if (await StoreReview.hasAction()) {
          const triedValue = parseInt((await AsyncStorage.getItem('review-tried')) || '0');

          if (triedValue >= 5) {
            const reviewValue = await AsyncStorage.getItem('review-requested');

            if (reviewValue) {
              // check if date is more than 3 days
              const now = new Date();
              const date = new Date(reviewValue);
              const diffTime = Math.abs(now.getTime() - date.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays < 7) return;
            }

            console.log('gradeModalClose: Review requested');
            await StoreReview.requestReview();
            await AsyncStorage.setItem('review-requested', new Date().toString());
          }

          await AsyncStorage.setItem('review-tried', (triedValue + 1).toString());
        }
      }

      setGradeOpened(false);
    });

    return unsubscribe;
  }, [navigation, gradeOpened]);

  const openSubject = (subject: PapillonSubject): void => {
    setSelectedCourse(subject);
    setCourseModalVisible(true);
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={[styles.container, { backgroundColor: UIColors.backgroundHigh }]}
        refreshControl={
          <RefreshControl
            refreshing={isHeadLoading}
            onRefresh={async () => {
              setHeadLoading(true);
              await getPeriodsFromAPI();
              await getGradesFromAPI(true);
              setHeadLoading(false);
            }}
            colors={[Platform.OS === 'android' ? UIColors.primary : '']}
          />
        }
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <StatusBar
          animated
          barStyle={
            courseModalVisible ? 'light-content' :
              theme.dark ? 'light-content' : 'dark-content'
          }
          backgroundColor="transparent"
        />

        <AlertBottomSheet
          title={`${state.calculatedAvg ? 'Moyenne générale calculée' : 'Moyenne générale réelle'}`}
          subtitle={state.calculatedAvg ? 
            state.hasSimulatedGrades ?
              'La moyenne affichée ici est une moyenne calculée à partir de vos notes réelles et de vos notes simulées.'
              :
              'Votre établissement ne donne pas accès à la moyenne de classe. La moyenne de classe est donc calculée en prenant votre moyenne de chaque matière.'
            :
            `La moyenne affichée ici est celle enregistrée à ce jour par votre établissement scolaire.
            
Les notes affichées dans le graphique sont des estimations sachant que votre établissement ne donne pas accès à votre moyenne passée.`}
          icon={<BarChart3 />}
          color='#29947a'
          visible={moyReelleAlert}
          cancelAction={() => {
            setMoyReelleAlert(false);
          }}
        />

        <Modal
          animationType="slide"
          visible={courseModalVisible}
          onRequestClose={() => setCourseModalVisible(false)}
          presentationStyle='pageSheet'
          transparent={false}
        >
          <Pressable
            style={{flex: 1}}
            onPress={() => setCourseModalVisible(false)}
          />
          <View style={[styles.modalContainer, { backgroundColor: UIColors.background }]}>
            {selectedCourse !== null && (
              <View>
                <View style={[styles.modalSubjectNameContainer, { backgroundColor: selectedCourse?.averages.color }]}>
                  <Text style={[styles.subjectName]} numberOfLines={1}>
                    {formatCoursName(selectedCourse.name)}
                  </Text>
                </View>

            
                <NativeList inset header="Moyennes de l'élève">
                  <NativeItem
                    trailing={
                      <View style={{flexDirection:'row', alignItems:'flex-end'}}>
                        <NativeText heading="h3">
                          {parseFloat(selectedCourse.averages.average).toFixed(2)}
                        </NativeText>
                        <NativeText heading="h4" style={{opacity: 0.5}}>
                        /{selectedCourse.averages.out_of}
                        </NativeText>
                      </View>
                    }
                  >
                    <NativeText heading="p2">
                    Moyenne élève
                    </NativeText>
                  </NativeItem>
                </NativeList>

                <NativeList inset header="Moyennes de la classe">
                  <NativeItem
                    trailing={
                      <View style={{flexDirection:'row', alignItems:'flex-end'}}>
                        <NativeText heading="h3">
                          {parseFloat(selectedCourse.averages.class_average).toFixed(2)}
                        </NativeText>
                        <NativeText heading="h4" style={{opacity: 0.5}}>
                        /{selectedCourse.averages.out_of}
                        </NativeText>
                      </View>
                    }
                  >
                    <NativeText heading="p2">
                    Moyenne de classe
                    </NativeText>
                  </NativeItem>
                  <NativeItem
                    trailing={
                      <View style={{flexDirection:'row', alignItems:'flex-end'}}>
                        <NativeText heading="h3">
                          {parseFloat(selectedCourse.averages.min).toFixed(2)}
                        </NativeText>
                        <NativeText heading="h4" style={{opacity: 0.5}}>
                        /{selectedCourse.averages.out_of}
                        </NativeText>
                      </View>
                    }
                  >
                    <NativeText heading="p2">
                    Moyenne min.
                    </NativeText>
                  </NativeItem>
                  <NativeItem
                    trailing={
                      <View style={{flexDirection:'row', alignItems:'flex-end'}}>
                        <NativeText heading="h3">
                          {parseFloat(selectedCourse.averages.max).toFixed(2)}
                        </NativeText>
                        <NativeText heading="h4" style={{opacity: 0.5}}>
                        /{selectedCourse.averages.out_of}
                        </NativeText>
                      </View>
                    }
                  >
                    <NativeText heading="p2">
                    Moyenne max.
                    </NativeText>
                  </NativeItem>
                </NativeList>
              </View>
            )}
          </View>
        </Modal>

        {isLoading && (
          <Text style={[styles.noGrades]}>Chargement en cours de vos notes...</Text>
        )}

        {state.subjectsList.length === 0 && !isLoading && (
          <Text style={[styles.noGrades]}>Aucune note à afficher.</Text>
        )}

        {state.subjectsList.length > 0 && !isLoading && state.avgChartData.length > 0 && state.averagesData && (
          <View 
            style={[
              styles.averageChart,
              {
                backgroundColor: UIColors.element,
              }
            ]}
          >
            <View style={[styles.averagesgrClassContainer]}>
              <Text style={[styles.averagegrTitle]}>
              Moyenne générale
              </Text>

              <TouchableOpacity 
                style={[styles.averagegrTitleInfo]}
                onPress={() => setMoyReelleAlert(true)}
              >
                <AlertTriangle size='20' color={UIColors.primary} />
                <Text style={[styles.averagegrTitleInfoText, {color: UIColors.primary}]}>
                  {state.calculatedAvg ? 
                    state.hasSimulatedGrades ? 'Simulée' : 'Estimation' 
                    : 'Moyenne réelle'}
                </Text>
              </TouchableOpacity>

              <View style={[styles.averagegrValCont]}>
                <Text style={[styles.averagegrValue]}>
                  {state.averagesData?.studentAverage}
                </Text>
                <Text style={[styles.averagegrOof]}>
                /20
                </Text>
              </View>
            </View>

            <LineChart
              lines={[
                {
                  data: state.avgChartData,
                  lineColor: UIColors.primary,
                  curve: 'monotone',
                  endPointConfig: {
                    color: UIColors.primary,
                    radius: 8,
                    animated: true,
                  },
                  lineWidth: 4,
                  activePointConfig: {
                    color: UIColors.primary,
                    borderColor: UIColors.element,
                    radius: 7,
                    borderWidth: 0,
                    // animated: true,
                    showVerticalLine: true,
                    verticalLineColor: UIColors.text,
                    verticalLineDashArray: [5, 5],
                    verticalLineOpacity: 0.5,
                    verticalLineWidth: 2,
                  },
                  activePointComponent: (point) => {
                    return (
                      <View
                        style={[
                          {
                            backgroundColor: UIColors.primary
                          },
                          styles.activePoint,
                        ]}
                      >
                        <Text style={[styles.grTextWh, {opacity: 0.5}]}>
                          {new Date(point!.x).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>

                        <View style={[styles.averagegrValCont]}>
                          <Text style={[styles.averagegrValue, styles.averagegrValueSm, styles.grTextWh]}>
                            {point!.y.toFixed(2)}
                          </Text>
                          <Text style={[styles.averagegrOof, styles.grTextWh]}>
                          /20
                          </Text>
                        </View>
                      </View>
                    );
                  },
                }
              ]}
              height={100}
              width={Dimensions.get('window').width - 28 - 14}
              extraConfig={{
                alwaysShowActivePoint: true,
              }}
            />
          </View>
        )}

        {state.latestGrades.length > 0 && !isLoading && (
          <NativeList
            header="Dernières notes"
            sectionProps={{
              hideSurroundingSeparators: true,
              headerTextStyle: {
                marginLeft: 15,
              },
            }}
            containerStyle={
              Platform.OS !== 'ios' && { backgroundColor: 'transparent' }
            }
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.latestGradesList,
                Platform.OS !== 'ios' && {paddingHorizontal: 0}
              ]}
            >
              {state.latestGrades.map((grade) => (
                <PressableScale
                  key={grade.id}
                  weight="light"
                  activeScale={0.89}
                  style={[
                    styles.smallGradeContainer,
                    { backgroundColor: UIColors.element },
                  ]}
                  onPress={() => showGrade(grade)}
                >
                  <View
                    style={[
                      styles.smallGradeSubjectContainer,
                      { backgroundColor: grade.color },
                    ]}
                  >
                    <Text style={[styles.smallGradeEmoji]}>
                      {getClosestGradeEmoji(grade.subject.name)}
                    </Text>
                    <Text
                      style={[styles.smallGradeSubject]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {formatCoursName(grade.subject.name.split(' > ')[0])}
                    </Text>
                  </View>

                  <View style={[styles.smallGradeNameContainer]}>
                    {grade.description ? (
                      <Text
                        style={[styles.smallGradeName]}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                      >
                        {grade.description}
                      </Text>
                    ) : (
                      <Text style={[styles.smallGradeName]}>
                        Note en {formatCoursName(grade.subject.name)}
                      </Text>
                    )}

                    <Text style={[styles.smallGradeDate]}>
                      {new Date(grade.date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>

                  { grade.isSimulated && (
                    <Text style={[styles.smallGradeSimulated, {color: grade.color, borderColor: grade.color}]}>
                      Simulée
                    </Text>
                  )}

                  <View style={[styles.smallGradeValueContainer]}>
                    <Text style={styles.smallGradeValue}>
                      {formatPapillonGradeValue(grade.grade.value)}
                    </Text>

                    <Text style={styles.smallGradeOutOf}>
                      /{formatPapillonGradeValue(grade.grade.out_of)}
                    </Text>
                  </View>
                </PressableScale>
              ))}
            </ScrollView>
          </NativeList>
        )}

        {state.averagesData && !isLoading && (
          <NativeList header="Moyennes" inset>
            <NativeItem
              leading={
                <View style={{marginHorizontal: 4}}>
                  <Users2 color={UIColors.text} />
                </View>
              }
              trailing={
                state.calculatedClassAvg ? (
                  <TouchableOpacity
                    onPress={() => setClasseReelleAlert(true)}
                  >
                    <AlertTriangle color={UIColors.primary} />
                  </TouchableOpacity>
                ): null}
            >
              <Text style={[styles.averageText]}>Moy. de classe</Text>
              <View style={[styles.averageValueContainer]}>
                <Text style={[styles.averageValue]}>
                  {state.averagesData?.classAverage}
                </Text>
                <Text style={[styles.averageValueOutOf]}>/20</Text>
              </View>
            </NativeItem>
            <AlertBottomSheet
              title={state.calculatedClassAvg ? state.hasSimulatedGrades ? 'Moyenne de classe simulée' : 'Moyenne de classe calculée' : 'Moyenne de classe réelle'}
              subtitle={state.calculatedClassAvg ? state.hasSimulatedGrades ? 'La moyenne affichée ici est une moyenne calculée à partir des notes réelles et des notes simulées de la classe.' : 'Votre établissement ne donne pas accès à la moyenne de classe. La moyenne de classe est donc calculée en prenant la moyenne de chaque matière.' : 'La moyenne affichée ici est celle enregistrée à ce jour par votre établissement scolaire.'}
              icon={<Users2/>}
              visible={moyClasseReelleAlert}
              cancelButton='Compris !'
              cancelAction={() => {
                setClasseReelleAlert(false);
              }}
            />
            <NativeItem
              leading={
                <View style={{marginHorizontal: 4}}>
                  <TrendingDown color={UIColors.text} />
                </View>
              }
              trailing={
                <TouchableOpacity
                  onPress={() => setClasseBasseAlert(true)}
                >
                  <Info color={UIColors.text + '22'} />
                </TouchableOpacity>
              }
            >
              <AlertBottomSheet
                title={'Moyenne la plus faible'}
                subtitle={'La moyenne la plus faible est calculée en prenant la moyenne la plus basse de chaque matière.\n\nIl s\'agit uniquement d\'une estimation qui variera en fonction de vos options, langues et spécialités. Celle-ci n\'est pas représentative d\'une réelle moyenne.'}
                icon={<TrendingDown />}
                color='#29947a'
                visible={moyClasseBasseAlert}
                cancelButton='Compris !'
                cancelAction={() => {
                  setClasseBasseAlert(false);
                }}
              />
              <Text style={[styles.averageText]}>Moy. la plus faible</Text>
              <View style={[styles.averageValueContainer]}>
                <Text style={[styles.averageValue]}>
                  {state.averagesData?.minAverage}
                </Text>
                <Text style={[styles.averageValueOutOf]}>/20</Text>
              </View>
            </NativeItem>
            <NativeItem
              leading={
                <View style={{marginHorizontal: 4}}>
                  <TrendingUp color={UIColors.text} />
                </View>
              }
              trailing={
                <TouchableOpacity
                  onPress={() => setClasseHauteAlert(true)}
                >
                  <Info color={UIColors.text + '22'} />
                </TouchableOpacity>
              }
            >
              <AlertBottomSheet
                title={'Moyenne la plus élevée'}
                subtitle={'La moyenne la plus élevée est calculée en prenant la moyenne la plus élevée de chaque matière.\n\nIl s\'agit uniquement d\'une estimation qui variera en fonction de vos options, langues et spécialités. Celle-ci n\'est pas représentative d\'une réelle moyenne.'}
                icon={<TrendingUp />}
                color='#29947a'
                visible={moyClasseHauteAlert}
                cancelButton='Compris !'
                cancelAction={() => {
                  setClasseHauteAlert(false);
                }}
              />
              <Text style={[styles.averageText]}>Moy. la plus élevée</Text>
              <View style={[styles.averageValueContainer]}>
                <Text style={[styles.averageValue]}>
                  {state.averagesData?.maxAverage}
                </Text>
                <Text style={[styles.averageValueOutOf]}>/20</Text>
              </View>
            </NativeItem>
          </NativeList>
        )}

        {state.subjectsList.length > 0 && !isLoading && (
          <View>
            {state.subjectsList.map((subject, index) => (
              <NativeList
                key={index}
                inset
                header={subject.parsedName.sub ? `${subject.parsedName.name} (${subject.parsedName.sub})` : `${subject.parsedName.name}`}
              >
                <Pressable
                  style={[
                    styles.subjectNameContainer,
                    { backgroundColor: subject.grades[0]?.color },
                  ]}
                  onPress={() => openSubject(subject)}
                >
                  <View style={[styles.subjectNameGroup]}>
                    <Text style={[styles.subjectName]} numberOfLines={1}>
                      {formatCoursName(subject.parsedName.name)}
                    </Text>
                    { subject.parsedName.sub && (
                      <Text style={[styles.subjectSub]} numberOfLines={1}>
                        {formatCoursName(subject.parsedName.sub)}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.subjectAverageContainer]}>
                    <Text style={[styles.subjectAverage]}>
                      {
                        subject.averages.average !== -1 ? subject.averages.average.toFixed(2) : 'Inconnu'
                      }
                    </Text>
                    <Text style={[styles.subjectAverageOutOf]}>
                    /{subject.averages.out_of}
                    </Text>
                  </View>
                </Pressable>
                {subject.grades.map((grade, i) => (
                  <NativeItem
                    key={i}
                    onPress={() => showGrade(grade)}

                    leading={
                      <View style={[styles.gradeEmojiContainer, {backgroundColor: subject.averages.color + '28', borderColor: subject.averages.color + '42'}]}>
                        <Text style={[styles.gradeEmoji]}>
                          {getClosestGradeEmoji(grade.subject.name)}
                        </Text>
                      </View>
                    }

                    trailing={
                      <View style={[styles.gradeDataContainer]}>
                        <View style={[styles.gradeValueContainer]}>
                          {!grade.grade.value.significant ? (
                            <Text style={styles.gradeValue}>
                              {grade.grade.value.value.toFixed(2)}
                            </Text>
                          ) : grade.grade.value.type === PronoteApiGradeType.Absent ? (
                            <Text style={styles.gradeValue}>Abs.</Text>
                          ) : grade.grade.value.type === PronoteApiGradeType.NotGraded ? (
                            <Text style={styles.gradeValue}>N.not</Text>
                          ) : (
                            <Text style={styles.gradeValue}>??</Text>
                          )}

                          <Text style={styles.gradeOutOf}>
                            /{!grade.grade.out_of.significant ? (
                              grade.grade.out_of.value
                            ) : '??'}
                          </Text>
                        </View>

                        {grade.isSimulated && (
                          <Text style={[styles.gradeSimulated, {color: grade.color, borderColor: grade.color}]}>
                            Simulée
                          </Text>
                        )}
                      </View>
                    }
                  >
                    <View style={[styles.gradeNameContainer]}>
                      {grade.description ? (
                        <Text style={[styles.gradeName]}>
                          {grade.description}
                        </Text>
                      ) : (
                        subject.parsedName.sub ? (
                          subject.parsedName.sub == 'Ecrit' || subject.parsedName.sub == 'Oral' ? (
                            <Text style={[styles.gradeName]}>
                              Note d'{formatCoursName(subject.parsedName.sub).toLowerCase()} en {formatCoursName(subject.parsedName.name)}
                            </Text>
                          ) : (
                            <Text style={[styles.gradeName]}>
                              Note de {formatCoursName(subject.parsedName.sub)} en {formatCoursName(subject.parsedName.name)}
                            </Text>
                          )
                        ) : (
                          <Text style={[styles.gradeName]}>
                            Note en {formatCoursName(subject.parsedName.name)}
                          </Text>
                        )
                      )}

                      <Text style={[styles.gradeDate]}>
                        {new Date(grade.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>

                      <Text style={[styles.gradeCoefficient]}>
                        Coeff. : {grade.grade.coefficient}
                      </Text>
                    </View>
                  </NativeItem>
                ))}
              </NativeList>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subjectList: {
    width: '100%',
    paddingHorizontal: 14,
    gap: 12,
    marginBottom: 14,
  },

  subjectContainer: {
    width: '100%',
    borderRadius: 14,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  subjectNameContainer: {
    width: '100%',
    height: 44,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  subjectNameGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
    marginRight: 10,
  },
  subjectName: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
    color: '#FFFFFF',
    flex: 1,
  },
  subjectSub: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
    color: '#FFFFFF',

    borderColor: '#FFFFFF75',
    borderWidth: 1,

    overflow: 'hidden',
    
    borderRadius: 8,
    borderCurve: 'continuous',

    backgroundColor: '#FFFFFF31',

    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  subjectAverageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  subjectAverage: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
    color: '#FFFFFF',
  },
  subjectAverageOutOf: {
    fontSize: 15,
    fontFamily: 'Papillon-Semibold',
    color: '#FFFFFF',
    opacity: 0.5,
  },

  gradesList: {
    width: '100%',
  },

  gradeContainer: {
    width: '100%',
  },
  gradeUnderContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 16,
  },

  gradeEmojiContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderCurve: 'continuous',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  gradeEmoji: {
    fontSize: 22,
  },

  gradeNameContainer: {
    flex: 1,
    gap: 3,
    marginRight: 10,
  },
  gradeName: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
  },
  gradeDate: {
    fontSize: 14,
    opacity: 0.5,
  },
  gradeCoefficient: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.5,
  },

  gradeValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  gradeValue: {
    fontSize: 19,
    fontFamily: 'Papillon-Semibold',
  },
  gradeOutOf: {
    fontSize: 14,
    opacity: 0.5,
  },


  periodButtonContainer: {
    
  },
  periodButtonText: {
    fontSize: 17,
    color: '#21826A',
    fontFamily: 'Papillon-Semibold',
  },

  ListTitle: {
    paddingLeft: 14,
    marginTop: 18,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },
  smallListTitle: {
    paddingLeft: 28,
    marginTop: 18,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },

  smallSubjectList: {
    width: '100%',
    gap: 12,
  },
  latestGradesList: {
    gap: 14,
    paddingHorizontal: 14,
    paddingBottom: 2,
  },

  smallGradeContainer: {
    borderRadius: 14,
    borderCurve: 'continuous',
    width: 220,
    paddingBottom: 42,
    overflow: 'hidden',
  },

  smallGradeSubjectContainer: {
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },
  smallGradeEmoji: {
    fontSize: 20,
  },
  smallGradeSubject: {
    fontSize: 15,
    fontFamily: 'Papillon-Semibold',
    color: '#FFFFFF',
    width: '82%',
  },

  smallGradeNameContainer: {
    flex: 1,
    gap: 3,
    marginHorizontal: 16,
  },
  smallGradeName: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
  },
  smallGradeDate: {
    fontSize: 15,
    opacity: 0.5,
  },

  smallGradeValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,

    position: 'absolute',
    bottom: 14,
    left: 16,
  },
  smallGradeValue: {
    fontSize: 20,
    fontFamily: 'Papillon-Semibold',
  },
  smallGradeOutOf: {
    fontSize: 15,
    opacity: 0.5,
  },

  averagesList: {
    flex: 1,
    marginHorizontal: 14,
    gap: 8,
  },

  averageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 16,
    borderRadius: 14,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  averagesClassContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  averageTextContainer: {
    gap: 0,
  },
  averageText: {
    fontSize: 15,
    opacity: 0.5,
  },
  averageValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  averageValue: {
    fontSize: 19,
    fontFamily: 'Papillon-Semibold',
  },
  averageValueOutOf: {
    fontSize: 15,
    opacity: 0.5,
  },

  infoText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.5,
    marginVertical: 14,
  },

  noGrades: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 12,
  },

  headerTitle: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
  },

  modalContainer: {
    height: '60%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  modalSubjectNameContainer: {
    height: 52,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderCurve: 'continuous',
  },

  averageChart: {
    marginHorizontal: 14,
    marginBottom: 14,
    paddingHorizontal: 0,
    paddingVertical: 14,
    paddingBottom: 6,
    marginTop: 14,

    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: {
      height: 0,
      width: 0,
    },
    elevation: 1,

    borderRadius: 14,
    borderCurve: 'continuous',
  },

  averagesgrClassContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },

  averagegrTitle: {
    fontSize: 15,
    opacity: 0.5,
    marginBottom: 2,
    fontFamily: 'Papillon-Medium',
  },

  averagegrTitleInfo: {
    position: 'absolute',
    right: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  averagegrTitleInfoText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Papillon-Semibold',
  },

  averagegrValCont: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },

  averagegrValue: {
    fontSize: 26,
    fontFamily: 'Papillon-Semibold',
  },
  averagegrValueSm: {
    fontSize: 20,
    fontFamily: 'Papillon-Semibold',
  },

  averagegrOof: {
    fontSize: 15,
    opacity: 0.5,
    fontFamily: 'Papillon-Medium',
  },

  activePoint: {
    borderRadius: 8,
    borderCurve: 'continuous',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  grTextWh: {
    color: '#FFFFFF',
  },

  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },

  addButtonContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderCurve: 'continuous',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  smallGradeSimulated: {
    fontSize: 16,
    fontFamily: 'Papillon-Semibold',
    letterSpacing: 0.15,

    borderRadius: 8,
    borderCurve: 'continuous',

    borderWidth: 1,
    alignSelf: 'flex-start',

    paddingHorizontal: 6,
    paddingVertical: 3,

    position: 'absolute',
    right: 16,
    bottom: 16,
  },

  gradeDataContainer : {
    alignItems: 'flex-end',
  },

  gradeSimulated: {
    fontSize: 16,
    fontFamily: 'Papillon-Semibold',
    letterSpacing: 0.15,

    borderRadius: 8,
    borderCurve: 'continuous',

    borderWidth: 1,
    alignSelf: 'flex-start',

    paddingHorizontal: 6,
    paddingVertical: 3,

    marginTop: 4,
  },
});

export default GradesScreen;
