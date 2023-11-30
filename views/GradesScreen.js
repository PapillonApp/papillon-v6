import * as React from 'react';
import {
  Animated,
  Alert,
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

import { BlurView } from 'expo-blur';
import { ContextMenuButton, ContextMenuView } from 'react-native-ios-context-menu';

import LineChart from 'react-native-simple-line-chart';

import Fade from 'react-native-fade';

import { User2, Users2, TrendingDown, TrendingUp, Info, AlertTriangle, FlaskConical, Plus, PlusCircle } from 'lucide-react-native';

import { useState } from 'react';
import { PressableScale } from 'react-native-pressable-scale';

import { useActionSheet } from '@expo/react-native-action-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import PapillonIcon from '../components/PapillonIcon';
import { getSavedCourseColor } from '../utils/ColorCoursName';
import getClosestGradeEmoji from '../utils/EmojiCoursName';
import formatCoursName from '../utils/FormatCoursName';
import GetUIColors from '../utils/GetUIColors';
import { useAppContext } from '../utils/AppContext';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';
import { LinearGradient } from 'expo-linear-gradient';

function GradesScreen({ navigation }) {
  const theme = useTheme();
  const appctx = useAppContext();
  const UIColors = GetUIColors();
  const { showActionSheetWithOptions } = useActionSheet();
  const insets = useSafeAreaInsets();
  const [subjectsList, setSubjectsList] = useState([]);
  const [averagesData, setAveragesData] = useState([]);
  const [latestGrades, setLatestGrades] = useState([]);
  const [periodsList, setPeriodsList] = useState([]);
  const [remainingPeriods, setRemainingPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [allGrades, setAllGrades] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isHeadLoading, setHeadLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseModalVisible, setCourseModalVisible] = useState(false);

  const [avgValueHistory, setAvgValueHistory] = useState([]);
  const [avgChartData, setAvgChartData] = useState([]);

  const [scrollX, setScrollX] = useState(new Animated.Value(0));
  const [scrollDistance, setScrollDistance] = useState(0);

  const [calculatedAvg, setCalculatedAvg] = useState(false);
  const [calculatedClassAvg, setCalculatedClassAvg] = useState(false);

  const [hasSimulatedGrades, setHasSimulatedGrades] = useState(false);

  const yOffset = new Animated.Value(0);

  const scrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: yOffset } } }],
    { useNativeDriver: false }
  );

  const scrollY = Animated.add(yOffset, 0);

  const headerOpacity = yOffset.interpolate({
    inputRange: [-75, -60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  function calculateSubjectAverage(grades) {
    // for each grade, calculate average for all
    let student = 0;
    let classAverage = 0;
    let min = 0;
    let max = 0;

    let count = 0;
    let out_of_total = 0;

    let useless = 0;

    for (let i = 0; i < grades.length; i++) {
      if (grades[i].grade.significant !== 0 || grades[i].grade.value < 0 || grades[i].grade.coefficient === 0) {
        useless += 1;
      }
      else {
        student += grades[i].grade.value * grades[i].grade.coefficient;
        classAverage += grades[i].grade.average * grades[i].grade.coefficient;
        min += grades[i].grade.min * grades[i].grade.coefficient;
        max += grades[i].grade.max * grades[i].grade.coefficient;

        out_of_total += grades[i].grade.out_of * grades[i].grade.coefficient;
      }
    }

    student = (student / out_of_total) * 20;
    classAverage = (classAverage / out_of_total) * 20;
    min = (min / out_of_total) * 20;
    max = (max / out_of_total) * 20;

    if (useless === grades.length) {
      return {
        average: -1,
        class_average: -1,
        min: -1,
        max: -1,
        out_of: 20,
      }
    }

    return {
      average: student,
      class_average: classAverage,
      min: min,
      max: max,
      out_of: 20,
    }
  }

  function calculateExactGrades(grades) {
    // step 1 : subject list
    let subjects = [];
    grades.forEach((grade) => {
      const subjectIndex = subjects.findIndex((subject) => subject.name === grade.subject.name);
      if (subjectIndex !== -1) {
        subjects[subjectIndex].grades.push(grade);
      } else {
        subjects.push({
          name: grade.subject.name,
          subject: grade.subject,
          grades: [grade],
          averages: {
            average: -1,
            class_average: -1,
            min: -1,
            max: -1,
            out_of: 20,
          },
        });
      }
    });

    // calculate averages for each subject
    subjects.forEach((subject) => {
      subject.averages = calculateSubjectAverage(subject.grades);
    });

    // step 2 : calculate averages of all subjects
    let student = 0;
    let classAverage = 0;
    let min = 0;
    let max = 0;

    let count = 0;

    for (let i = 0; i < subjects.length; i++) {
      if (subjects[i].averages.average === -1) {
        // ignore
      }
      else {
        student += subjects[i].averages.average;
        classAverage += subjects[i].averages.class_average;
        min += subjects[i].averages.min;
        max += subjects[i].averages.max;

        count += 1;
      }
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
    }
  }

  // add button to header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => Platform.OS === 'ios' && (
        <PapillonInsetHeader
          icon={<SFSymbol name="chart.pie.fill" />}
          title="Notes"
          color="#A84700"
        />
      ),
      headerTransparent: Platform.OS === 'ios' ? true : false,
      headerBackground: Platform.OS === 'ios' ? () => (
        <Animated.View 
          style={[
            styles.header,
            {
              flex: 1,
              backgroundColor: UIColors.element + '00',
              opacity: headerOpacity,
              borderBottomColor: theme.dark ? UIColors.text + '22' : UIColors.text + '55',
              borderBottomWidth: 0.5,
            }
          ]}
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
                menuItems: periodsList.map((period) => {
                  return {
                    actionKey: period.name,
                    actionTitle: period.name,
                    menuState : selectedPeriod?.name === period.name ? 'on' : 'off',
                  }
                }),
            }}
            onPressMenuItem={({nativeEvent}) => {
              setSelectedPeriod(periodsList.find((period) => period.name === nativeEvent.actionKey));
              changePeriodPronote(periodsList.find((period) => period.name === nativeEvent.actionKey));
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== 'ios') {
                  newPeriod();
                }
              }}
              style={styles.periodButtonContainer}
            >
              <Text
                style={[styles.periodButtonText, { color: UIColors.primary }]}
              >
                {selectedPeriod?.name || ''}
              </Text>
            </TouchableOpacity>
          </ContextMenuButton>

            <TouchableOpacity
              style={[styles.addButtonContainer, {backgroundColor: UIColors.primary + '22'}]}
              onPress={() => navigation.navigate('ModalGradesSimulator')}
            >
              <FlaskConical size='22' color={UIColors.primary} />
            </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, selectedPeriod, isLoading, UIColors]);

  function newPeriod() {
    const options = periodsList.map((period) => period.name);
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
        if (selectedIndex === options.length - 1) return;
        const selectedPer = periodsList[selectedIndex];
        setSelectedPeriod(selectedPer);
        changePeriodPronote(selectedPer);
      }
    );
  }

  async function changePeriodPronote(period) {
    setIsLoading(true);
    let newPeriod = await appctx.dataprovider.changePeriod(period.name);
    await appctx.dataprovider.getUser(true);
    loadGrades(true);
    setIsLoading(false);
  }

  const [finalPeriodList, setFinalPeriodList] = useState([]);

  async function getPeriods() {
    const allPeriods = await appctx.dataprovider.getPeriods(false);

    const actualPeriod = allPeriods.find((period) => period.actual === true);
    let periods = [];
    let remaining = [];

    if (actualPeriod.name.toLowerCase().includes('trimestre')) {
      periods = allPeriods.filter((period) =>
        period.name.toLowerCase().includes('trimestre')
      );
    } else if (actualPeriod.name.toLowerCase().includes('semestre')) {
      periods = allPeriods.filter((period) =>
        period.name.toLowerCase().includes('semestre')
      );
    }
    else {
      // just add the actual period
      periods.push(actualPeriod);
    }

    // add remaining periods to the list
    remaining = allPeriods.filter((period) => !periods.includes(period));

    setPeriodsList(periods);
    setSelectedPeriod(actualPeriod);
    setRemainingPeriods(remaining);

    let finalList = [];
    periods.forEach((period) => {
      finalList.push({
        ...period,
        category : 'main'
      });
    });
    remaining.forEach((period) => {
      finalList.push({
        ...period,
        category : 'secondary'
      });
    });

    setFinalPeriodList(finalList);
  }

  function calculateAverage(grades, isClass) {
    let average = 0;
    let count = 0;
    for (let i = 0; i < grades.length; i++) {
      if(grades[i].grade.value < 0) {
        // ignorer
      }
      else if (grades[i].grade.value !== 0) {
        let correctedValue = grades[i].grade.value / grades[i].grade.out_of * 20;
        let correctedClassValue = grades[i].grade.average / grades[i].grade.out_of * 20;
  
        if (isClass) {
          average += correctedClassValue * grades[i].grade.coefficient;
        } else {
          average += correctedValue * grades[i].grade.coefficient;
        }
  
        count += grades[i].grade.coefficient;
      }
    }
    average = average / count;
    return average;
  }

  async function parseGrades(parsedData) {
    const gradesList = parsedData.grades;
    const subjects = [];

    let hasSimulated = false;

    // add simulated grades
    let customGrades = await AsyncStorage.getItem('custom-grades');
    if (customGrades !== null) {
      customGrades = JSON.parse(customGrades);
      customGrades.forEach((grade) => {
        hasSimulated = true;

        newGrade = {
          ...grade,
          isSimulated: true,
        }

        // check if grade is already in the list
        let index = gradesList.findIndex((item) => item.id === grade.id);
        
        if (index !== -1) {
        }
        else {
          gradesList.push(newGrade);
        }
      });

      // update average of subject
      let averagesList = parsedData.averages;
      customGrades.forEach((grade) => {
        const subject = averagesList.find((subj) => subj.subject.name === grade.subject.name);
        if (subject) {
          subject.average = calculateAverage(gradesList.filter((grade) => grade.subject.name === subject.subject.name), false);
          subject.class_average = calculateAverage(gradesList.filter((grade) => grade.subject.name === subject.subject.name), true);
        }
      });
    }

    setAllGrades(gradesList);
  
    gradesList.forEach((grade) => {
      const subjectIndex = subjects.findIndex((subject) => subject.name === grade.subject.name);
      if (subjectIndex !== -1) {
        subjects[subjectIndex].grades.push(grade);
      } else {
        subjects.push({
          name: grade.subject.name,
          parsedName: {
            name: grade.subject.name.split(' > ')[0],
            sub: grade.subject.name.split(' > ').length > 0 ? grade.subject.name.split(' > ')[1] : null,
          },
          grades: [grade],
        });
      }
    });
  
    const averagesList = parsedData.averages;
  
    averagesList.forEach((average) => {
      const subject = subjects.find((subj) => subj.name === average.subject.name);
      if (subject) {
        average.color = getSavedCourseColor(average.subject.name.split(' > ')[0], average.color);
        subject.averages = average;
  
        latestGrades.forEach((grade) => {
          if (grade.subject.name === subject.name) {
            grade.color = average.color;
          }
        });
  
        subject.grades.forEach((grade) => {
          grade.color = average.color;
        });
      }
    });
  
    // calculate averages
    let avgCalc = calculateExactGrades(gradesList);
    let avgNg = {
      studentAverage: parseFloat(avgCalc.average).toFixed(2),
      classAverage: parseFloat(avgCalc.class_average).toFixed(2),
      minAverage: parseFloat(avgCalc.min).toFixed(2),
      maxAverage: parseFloat(avgCalc.max).toFixed(2),
    }
    setAveragesData(avgNg);
  
    subjects.sort((a, b) => a.name.localeCompare(b.name));
  
    setSubjectsList(subjects);

    latestGradesList = gradesList.sort((a, b) => new Date(b.date) - new Date(a.date));
    setLatestGrades(latestGradesList.slice(0, 10));

    // for each last grade, calculate average
    let gradesFinalList = gradesList.sort((a, b) => new Date(a.date) - new Date(b.date));

    let chartData = [];

    for (let i = 0; i < gradesFinalList.length; i++) {
      let gradesBefore = gradesList.filter((grade) => new Date(grade.date) <= new Date(gradesFinalList[i].date));
      let avg = calculateExactGrades(gradesBefore).average;
      
      // if Nan, set to 0
      if (isNaN(avg)) {
        avg = 0;
      }

      chartData.push({
        x: new Date(gradesFinalList[i].date).getTime(),
        y: avg
      });
    }

    setAvgChartData(chartData);
    setHasSimulatedGrades(hasSimulated);

    if (parseFloat(parsedData.overall_average).toFixed(2) !== parseFloat(avgCalc.average).toFixed(2)) {
      setCalculatedAvg(true);

      if(parseFloat(parsedData.overall_average) > 0 && !hasSimulatedGrades) {
        setAveragesData({
          ...avgNg,
          studentAverage: parseFloat(parsedData.overall_average).toFixed(2),
        });

        setCalculatedAvg(false);
      }
    }
    else {
      setCalculatedAvg(false);
    }
  }
  

  async function loadGrades(force = false) {
    // fetch grades
    const grades = await appctx.dataprovider.getGrades('', force);
    parseGrades(grades);
  }

  React.useEffect(() => {
    if (periodsList.length === 0) {
      getPeriods();
    }

    if (subjectsList.length === 0) {
      loadGrades();
    }
  }, []);

  function showGrade(grade) {
    navigation.navigate('Grade', { grade, allGrades });
  }

  const onRefresh = React.useCallback(() => {
    setHeadLoading(true);
    loadGrades(true);
    setHeadLoading(false);
  }, []);

  const openSubject = (subject) => {
    setSelectedCourse(subject);
    setCourseModalVisible(true);
  }

  return (
    <>
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: UIColors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={isHeadLoading}
          onRefresh={onRefresh}
          colors={[Platform.OS === 'android' ? UIColors.primary : null]}
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

      <Modal
        animationType="slide"
        visible={courseModalVisible}
        onRequestClose={() => setCourseModalVisible(false)}
        presentationStyle='pageSheet'
        transparent
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
                  {formatCoursName(selectedCourse?.name)}
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

      {subjectsList.length === 0 && !isLoading ? (
        <Text style={[styles.noGrades]}>Aucune note à afficher.</Text>
      ) : null}

      { subjectsList.length !== 0 && !isLoading && avgChartData.length > 0 && averagesData && (
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
              onPress={() => Alert.alert(
                `${calculatedAvg ? 'Moyenne générale calculée' : 'Moyenne générale réelle'}`,
                calculatedAvg ? 
                hasSimulatedGrades ?
                  `La moyenne affichée ici est une moyenne calculée à partir de vos notes réelles et de vos notes simulées.`
                :
                  `Votre établissement ne donne pas accès à la moyenne de classe. La moyenne de classe est donc calculée en prenant votre moyenne de chaque matière.`
                :
                  `La moyenne affichée ici est celle enregistrée à ce jour par votre établissement scolaire.`
                ,
                [
                  {
                    text: 'Compris !',
                    style: 'cancel',
                  },
                ],
                { cancelable: true }
              )}
            >
              <AlertTriangle size='20' color={UIColors.primary} />
              <Text style={[styles.averagegrTitleInfoText, {color: UIColors.primary}]}>
                {calculatedAvg ? 
                  hasSimulatedGrades ? 'Simulée' : 'Estimation' 
                : 'Moyenne réelle'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.averagegrValCont]}>
              <Text style={[styles.averagegrValue]}>
                {averagesData.studentAverage}
              </Text>
              <Text style={[styles.averagegrOof]}>
                /20
              </Text>
            </View>
          </View>

          <LineChart
            lines={[
              {
                data: avgChartData,
                activePointConfig: {
                  color: 'black',
                  showVerticalLine: true,
                },
                lineColor: UIColors.primary,
                curve: 'monotone',
                endPointConfig: {
                  color: UIColors.primary,
                  radius: 8,
                  animated: true,
                },
                lineWidth: 4,
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
                      <Text style={[styles.activePointDate, styles.grTextWh, {opacity: 0.5}]}>
                        {new Date(point.x).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>

                      <View style={[styles.averagegrValCont]}>
                        <Text style={[styles.averagegrValue, styles.averagegrValueSm, styles.grTextWh]}>
                          {point.y.toFixed(2)}
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

      {latestGrades.length > 0 ? (
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
            {latestGrades.map((grade, index) => (
              <PressableScale
                weight="light"
                activeScale={0.89}
                key={index}
                style={[
                  styles.smallGradeContainer,
                  { backgroundColor: UIColors.elementHigh },
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
                  {grade.grade.significant === 0 ? (
                    <Text style={[styles.smallGradeValue]}>
                      {parseFloat(grade.grade.value).toFixed(2)}
                    </Text>
                  ) : grade.grade.significant === 3 ? (
                    <Text style={[styles.smallGradeValue]}>Abs.</Text>
                  ) : (
                    <Text style={[styles.smallGradeValue]}>N.not</Text>
                  )}
                  <Text style={[styles.smallGradeOutOf]}>
                    /{grade.grade.out_of}
                  </Text>
                </View>
              </PressableScale>
            ))}
          </ScrollView>
        </NativeList>
      ) : null}


      {subjectsList.length > 0 ? (
        <NativeList header="Moyennes" inset>
          <NativeItem
            leading={
              <View style={{marginHorizontal: 4}}>
                <Users2 color={UIColors.text} />
              </View>
            }
            trailing={
              calculatedClassAvg && (
              <TouchableOpacity
                onPress={() => Alert.alert(
                  'Moyenne de classe calculée',
                  `Votre établissement ne donne pas accès à la moyenne de classe. La moyenne de classe est donc calculée en prenant la moyenne de chaque matière.

Il s'agit uniquement d'une estimation qui variera en fonction de vos options, langues et spécialités. Celle-ci n'est pas représentative d'une réelle moyenne.`,
                  [
                    {
                      text: 'Compris !',
                      style: 'cancel',
                    },
                  ],
                  { cancelable: true }
                )}
              >
                <AlertTriangle color={UIColors.primary} />
              </TouchableOpacity>
            )}
          >
            <Text style={[styles.averageText]}>Moy. de classe</Text>
            <View style={[styles.averageValueContainer]}>
              <Text style={[styles.averageValue]}>
                {averagesData.classAverage}
              </Text>
              <Text style={[styles.averageValueOutOf]}>/20</Text>
            </View>
          </NativeItem>
          <NativeItem
            leading={
              <View style={{marginHorizontal: 4}}>
                <TrendingDown color={UIColors.text} />
              </View>
            }
            trailing={
              <TouchableOpacity
                onPress={() => Alert.alert(
                  'Moyenne la plus faible',
                  `La moyenne la plus faible est calculée en prenant la moyenne la plus basse de chaque matière.

Il s'agit uniquement d'une estimation qui variera en fonction de vos options, langues et spécialités. Celle-ci n'est pas représentative d'une réelle moyenne.`,
                  [
                    {
                      text: 'Compris !',
                      style: 'cancel',
                    },
                  ],
                  { cancelable: true }
                )}
              >
                <Info color={UIColors.text + '22'} />
              </TouchableOpacity>
            }
          >
            <Text style={[styles.averageText]}>Moy. la plus faible</Text>
            <View style={[styles.averageValueContainer]}>
              <Text style={[styles.averageValue]}>
                {averagesData.minAverage}
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
                onPress={() => Alert.alert(
                  'Moyenne la plus élevée',
                  `La moyenne la plus élevée est calculée en prenant la moyenne la plus élevée de chaque matière.

Il s'agit uniquement d'une estimation qui variera en fonction de vos options, langues et spécialités. Celle-ci n'est pas représentative d'une réelle moyenne.`,
                  [
                    {
                      text: 'Compris !',
                      style: 'cancel',
                    },
                  ],
                  { cancelable: true }
                )}
              >
                <Info color={UIColors.text + '22'} />
              </TouchableOpacity>
            }
          >
            <Text style={[styles.averageText]}>Moy. la plus élevée</Text>
            <View style={[styles.averageValueContainer]}>
              <Text style={[styles.averageValue]}>
                {averagesData.maxAverage}
              </Text>
              <Text style={[styles.averageValueOutOf]}>/20</Text>
            </View>
          </NativeItem>
        </NativeList>
      ) : null}

      

      {subjectsList.length > 0 ? (
        <View>
          {subjectsList.map((subject, index) => (
            <NativeList
              key={index}
              inset
              header={subject.parsedName.sub ? `${subject.parsedName.name} (${subject.parsedName.sub})` : `${subject.parsedName.name}`}
            >
              <Pressable
                style={[
                  styles.subjectNameContainer,
                  { backgroundColor: subject.averages.color },
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
                      subject.averages.average !== -1 ? parseFloat(subject.averages.average).toFixed(2) : "Inconnu"
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
                      <View style={[styles.gradeEmojiContainer]}>
                        <Text style={[styles.gradeEmoji]}>
                          {getClosestGradeEmoji(grade.subject.name)}
                        </Text>
                      </View>
                    }

                    trailing={
                      <View style={[styles.gradeDataContainer]}>
                        <View style={[styles.gradeValueContainer]}>
                          {grade.grade.significant === 0 ? (
                            <Text style={[styles.gradeValue]}>
                              {parseFloat(grade.grade.value).toFixed(2)}
                            </Text>
                          ) : grade.grade.significant === 3 ? (
                            <Text style={[styles.gradeValue]}>Abs.</Text>
                          ) : (
                            <Text style={[styles.gradeValue]}>N.not</Text>
                          )}

                          <Text style={[styles.gradeOutOf]}>
                            /{grade.grade.out_of}
                          </Text>
                        </View>

                        { grade.isSimulated && (
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
      ) : null}
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

  gradeEmoji: {
    fontSize: 20,
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
    fontWeight: 500,
    opacity: 0.5,
  },

  gradeValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  gradeValue: {
    fontSize: 17,
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
    fontWeight: 400,
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
    borderRadius: 0,
    marginHorizontal: 14,
    marginBottom: 14,
    paddingHorizontal: 0,
    paddingVertical: 14,
    paddingBottom: 6,
    marginTop: 14,

    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: {
      height: 1,
      width: 0,
    },
    elevation: 1,

    borderRadius: 12,
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
    fontWeight: 500,
  },

  averagegrValCont: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },

  averagegrValue: {
    fontSize: 24,
    fontFamily: 'Papillon-Semibold',
  },
  averagegrValueSm: {
    fontSize: 20,
  },

  averagegrOof: {
    fontSize: 15,
    opacity: 0.5,
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
