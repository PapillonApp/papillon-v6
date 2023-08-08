import * as React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Platform, Pressable, TouchableOpacity, Button, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import * as SystemUI from 'expo-system-ui';

import formatCoursName from '../utils/FormatCoursName';
import getClosestGradeEmoji from '../utils/EmojiCoursName';
import getClosestColor from '../utils/ColorCoursName';

import { showMessage, hideMessage } from "react-native-flash-message";

import { getGrades, changePeriod } from '../fetch/PronoteData/PronoteGrades';
import { getUser } from '../fetch/PronoteData/PronoteUser';

import { User2, Users2, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PapillonIcon from '../components/PapillonIcon';

import { useState } from 'react';
import { sub } from 'react-native-reanimated';
import { PressableScale } from 'react-native-pressable-scale';

import { useActionSheet } from '@expo/react-native-action-sheet';

function GradesScreen({ navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { showActionSheetWithOptions } = useActionSheet();

  const [subjectsList, setSubjectsList] = useState([]);
  const [averagesData, setAveragesData] = useState([]);
  const [latestGrades, setLatestGrades] = useState([]);
  const [periodsList, setPeriodsList] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isHeadLoading, setHeadLoading] = useState(false);

  React.useEffect(() => {
    // change background color
    SystemUI.setBackgroundColorAsync("#000000");
  }, []);

  // add button to header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft : () => (
        isLoading ? <ActivityIndicator /> : <></>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => newPeriod()} style={[styles.periodButtonContainer]}>
          <Text style={[styles.periodButtonText]}>{selectedPeriod ? selectedPeriod.name : ""}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedPeriod, isLoading]);

  function newPeriod() {
    const options = [];

    periodsList.forEach((period) => {
      options.push(period.name);
    });

    options.push("Annuler");
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions({
      title: "Changer de période",
      message: "Sélectionnez la période de votre choix",
      options,
      cancelButtonIndex,
      }, (selectedIndex) => {
        if(selectedIndex === cancelButtonIndex) return;

        setSelectedPeriod(periodsList[selectedIndex]);
        changePeriodPronote(periodsList[selectedIndex]);
      });
  }

  function changePeriodPronote(period) {
    setIsLoading(true);
    changePeriod(period.name).then((result) => {
      getUser(true);
      loadGrades(true);
    });
  }

  function getPeriods() {
    getUser(false).then((result) => {
      const userData = result;
      const allPeriods = userData.periods;

      let periods = [];

      let actualPeriod = allPeriods.find(period => period.actual == true);

      if (actualPeriod.name.toLowerCase().includes("trimestre")) {
        for (let i = 0; i < allPeriods.length; i++) {
          if (allPeriods[i].name.toLowerCase().includes("trimestre")) {
            periods.push(allPeriods[i]);
          }
        }
      }

      // if first period contains "Semestre", add all semesters
      if (actualPeriod.name.toLowerCase().includes("semestre")) {
        for (let i = 0; i < allPeriods.length; i++) {
          if (allPeriods[i].name.toLowerCase().includes("semestre")) {
            periods.push(allPeriods[i]);
          }
        }
      }

      setPeriodsList(periods);
      setSelectedPeriod(actualPeriod);
    });
  }

  function onRefresh() {
    setHeadLoading(true);
    setHeadLoading(false);

    loadGrades(true);
  }

  function calculateAverages(grades, moy) {
    let student_average = 0;
    let class_average = 0;
    let min_average = 0;
    let max_average = 0;

    let skipNb = 0;

    // for each grade
    grades.forEach((grade) => {
      if(grade.is_bonus) return;
      if(grade.is_optional) return;

      grade.grade.value = grade.grade.value / grade.grade.out_of * 20;
      grade.grade.average = grade.grade.average / grade.grade.out_of * 20;
      grade.grade.min = grade.grade.min / grade.grade.out_of * 20;
      grade.grade.max = grade.grade.max / grade.grade.out_of * 20;

      if(grade.grade.significant == 0) {
        student_average += grade.grade.value * grade.grade.coefficient;
      }
      else {
        skipNb++;
      }

      class_average += grade.grade.average * grade.grade.coefficient;
      min_average += grade.grade.min * grade.grade.coefficient;
      max_average += grade.grade.max * grade.grade.coefficient;
    });

    student_average = student_average / grades.length - skipNb;
    class_average = class_average / grades.length;
    min_average = min_average / grades.length;
    max_average = max_average / grades.length;

    if(moy) student_average = moy;

    setAveragesData({
      student_average: student_average.toFixed(2),
      class_average: class_average.toFixed(2),
      min_average: min_average.toFixed(2),
      max_average: max_average.toFixed(2)
    });
  }

  function loadGrades(force = false) {
    setIsLoading(true);
    getGrades(force).then((grades) => {
      let gradesList = JSON.parse(grades).grades;
      let subjects = [];

      // invert gradesList
      gradesList = gradesList.reverse();

      // [TEMP] for each grade, scale it to original value
      gradesList.forEach((grade) => {
        grade.grade.value = grade.grade.value / 20 * grade.grade.out_of;
      });

      let latestGrades = [];

      // get 10 latest grades
      for (let i = 0; i < 10; i++) {
        latestGrades.push(gradesList[i]);
      }

      // for each grade, check if subject.name exists in subjects and add the grade
      gradesList.forEach((grade) => {
        let subject = subjects.find((subject) => subject.name === grade.subject.name);
        if (subject) {
          subject.grades.push(grade);
        } else {
          subjects.push({
            name: grade.subject.name,
            grades: [grade]
          });
        }
      });

      let averagesList = JSON.parse(grades).averages;

      // for each average, add it to the subject with the same subject.name
      averagesList.forEach((average) => {
        let subject = subjects.find((subject) => subject.name === average.subject.name);
        if (subject) {
          average.color = getClosestColor(average.color);
          subject.averages = average;

          // set color on latest grades
          latestGrades.forEach((grade) => {
            if (grade.subject.name === subject.name) {
              grade.color = average.color;
            }
          });

          // set color on all grades
          subject.grades.forEach((grade) => {
            grade.color = average.color;
          });
        }
      });

      // calculate averages
      calculateAverages(gradesList, JSON.parse(grades).overall_average);

      // sort subjects by name
      subjects.sort((a, b) => a.name.localeCompare(b.name));

      setSubjectsList(subjects);
      setLatestGrades(latestGrades);

      setIsLoading(false);
    });
  }

  React.useEffect(() => {
    if(periodsList.length == 0) {
      getPeriods();
    }

    if (subjectsList.length == 0) {
      loadGrades();
    }
  }, []);

  function showGrade(grade) {
    navigation.navigate('Grade', { grade: grade });
  }

  return (
    <>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        style={[styles.container]}
        refreshControl={
          <RefreshControl refreshing={isHeadLoading} onRefresh={onRefresh} />
        }>

        <StatusBar animated barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor={theme.dark ? '#000' : '#fff'} />

        { subjectsList.length == 0 && !isLoading ?
          <Text style={[styles.infoText]}>Aucune note à afficher.</Text>
        : null }

        { latestGrades.length > 0 ?
          <View style={[styles.smallSubjectList]}>
            <Text style={styles.smallListTitle}>Dernières notes</Text>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.latestGradesList]}>
            {latestGrades.map((grade, index) => {
                return (
                  <PressableScale weight="light" activeScale={0.89} key={index} style={[styles.smallGradeContainer, {backgroundColor: theme.dark ? '#151515' : '#fff'}]} onPress={() => showGrade(grade)}>
                    <View style={[styles.smallGradeSubjectContainer, {backgroundColor: grade.color}]}>
                      <Text style={[styles.smallGradeEmoji]}>{getClosestGradeEmoji(grade.subject.name)}</Text>
                      <Text style={[styles.smallGradeSubject]}>{formatCoursName(grade.subject.name)}</Text>
                    </View>

                    <View style={[styles.smallGradeNameContainer]}>
                      <Text style={[styles.smallGradeName]}>{grade.description}</Text>
                      <Text style={[styles.smallGradeDate]}>{new Date(grade.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
                    </View>

                    <View style={[styles.smallGradeValueContainer]}>
                      { grade.grade.significant == 0 ?
                        <Text style={[styles.smallGradeValue]}>{parseFloat(grade.grade.value).toFixed(2)}</Text>
                      : grade.grade.significant == 3 ?
                        <Text style={[styles.smallGradeValue]}>Abs.</Text>
                      :
                        <Text style={[styles.smallGradeValue]}>N.not</Text>
                      }
                      <Text style={[styles.smallGradeOutOf]}>/{grade.grade.out_of}</Text>
                    </View>
                  </PressableScale>
                );
              })}
            </ScrollView>
          </View>
        : null }

        { subjectsList.length > 0 ?
          <View style={[styles.smallSubjectList]}>
            <Text style={styles.smallListTitle}>Moyennes</Text>
            <View style={[styles.averagesList]}>
              <PressableScale style={[styles.averageContainer, {backgroundColor: theme.dark ? '#151515' : '#fff'}]}>
                <PapillonIcon
                  icon={<User2 color="#21826A" style={[styles.averageIcon, {color: !theme.dark ? '#151515' : '#fff'}]} />}
                  color="#21826A"
                  style={[styles.averageIcon]}
                  small
                />
                <View style={[styles.averageTextContainer]}>
                  <Text style={[styles.averageText]}>Moy. générale</Text>
                  <View style={[styles.averageValueContainer]}>
                    <Text style={[styles.averageValue]}>{averagesData.student_average}</Text>
                    <Text style={[styles.averageValueOutOf]}>/20</Text>
                  </View>
                </View>
              </PressableScale>
              <PressableScale style={[styles.averageContainer, {backgroundColor: theme.dark ? '#151515' : '#fff'}]}>
                <PapillonIcon
                  icon={<Users2 color="#21826A" style={[styles.averageIcon, {color: !theme.dark ? '#151515' : '#fff'}]} />}
                  color="#21826A"
                  style={[styles.averageIcon]}
                  small
                />
                <View style={[styles.averageTextContainer]}>
                  <Text style={[styles.averageText]}>Moy. de classe</Text>
                  <View style={[styles.averageValueContainer]}>
                    <Text style={[styles.averageValue]}>{averagesData.class_average}</Text>
                    <Text style={[styles.averageValueOutOf]}>/20</Text>
                  </View>
                </View>
              </PressableScale>
              <View style={[styles.averagesClassContainer]}>
                <PressableScale style={[styles.averageContainer, {backgroundColor: theme.dark ? '#151515' : '#fff'}]}>
                  <PapillonIcon
                    icon={<TrendingDown color="#21826A" style={[styles.averageIcon, {color: !theme.dark ? '#151515' : '#fff'}]} />}
                    color="#21826A"
                    style={[styles.averageIcon]}
                    small
                  />
                  <View style={[styles.averageTextContainer]}>
                    <Text style={[styles.averageText]}>Moy. faible</Text>
                    <View style={[styles.averageValueContainer]}>
                      <Text style={[styles.averageValue]}>{averagesData.min_average}</Text>
                      <Text style={[styles.averageValueOutOf]}>/20</Text>
                    </View>
                  </View>
                </PressableScale>
                <PressableScale style={[styles.averageContainer, {backgroundColor: theme.dark ? '#151515' : '#fff'}]}>
                  <PapillonIcon
                    icon={<TrendingUp color="#21826A" style={[styles.averageIcon, {color: !theme.dark ? '#151515' : '#fff'}]} />}
                    color="#21826A"
                    style={[styles.averageIcon]}
                    small
                  />
                  <View style={[styles.averageTextContainer]}>
                    <Text style={[styles.averageText]}>Moy. élevée</Text>
                    
                    <View style={[styles.averageValueContainer]}>
                      <Text style={[styles.averageValue]}>{averagesData.max_average}</Text>
                      <Text style={[styles.averageValueOutOf]}>/20</Text>
                    </View>
                  </View>
                </PressableScale>
              </View>
            </View>
          </View>
        : null }
        
        { subjectsList.length > 0 ?
          <View style={[styles.subjectList]}>
          <Text style={styles.ListTitle}>Liste des matières</Text>
            {subjectsList.map((subject, index) => {
              return (
                <View key={index} style={[styles.subjectContainer, {backgroundColor: theme.dark ? '#151515' : '#fff'}]}>
                  <Pressable style={[styles.subjectNameContainer, {backgroundColor: subject.averages.color}]}>
                    <Text style={[styles.subjectName]}>{formatCoursName(subject.name)}</Text>
                    <View style={[styles.subjectAverageContainer]}>
                      <Text style={[styles.subjectAverage]}>{parseFloat(subject.averages.average).toFixed(2)}</Text>
                      <Text style={[styles.subjectAverageOutOf]}>/{subject.averages.out_of}</Text>
                    </View>
                  </Pressable>

                  <View style={[styles.gradesList]}>
                    {subject.grades.map((grade, index) => {
                      return (
                        <View key={index} style={[styles.gradeContainer, {borderBottomColor: theme.dark ? '#ffffff22' : '#00000022', borderBottomWidth: (index === (subject.grades.length - 1)) ? 0 : 1}]}>
                          <PressableScale weight="light" activeScale={0.95} style={[styles.gradeUnderContainer]} onPress={() => showGrade(grade)}>
                            <View style={[styles.gradeEmojiContainer]}>
                              <Text style={[styles.gradeEmoji]}>{getClosestGradeEmoji(grade.subject.name)}</Text>
                            </View>
                            <View style={[styles.gradeNameContainer]}>
                              { grade.description ?
                                <Text style={[styles.gradeName]}>{grade.description}</Text>
                                :
                                <Text style={[styles.gradeName]}>Note en {grade.subject.name}</Text>
                              }

                              <Text style={[styles.gradeDate]}>{new Date(grade.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>

                              <Text style={[styles.gradeCoefficient]}>Coeff. : {grade.grade.coefficient}</Text>
                            </View>
                            <View style={[styles.gradeDataContainer]}>

                              <View style={[styles.gradeValueContainer]}>
                                { grade.grade.significant == 0 ?
                                  <Text style={[styles.gradeValue]}>{parseFloat(grade.grade.value).toFixed(2)}</Text>
                                : grade.grade.significant == 3 ?
                                  <Text style={[styles.gradeValue]}>Abs.</Text>
                                :
                                  <Text style={[styles.gradeValue]}>N.not</Text>
                                }

                                <Text style={[styles.gradeOutOf]}>/{grade.grade.out_of}</Text>
                              </View>

                            </View>
                          </PressableScale>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        : null }

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
  subjectName: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
    color: '#FFFFFF',
    flex: 1,
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

  periodButtonText: {
    fontSize: 17,
    marginTop: -1,
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
  },

  smallGradeContainer: {
    borderRadius: 14,
    borderCurve: 'continuous',
    width: 220,
    paddingBottom: 42,
    overflow: 'hidden',
  },

  smallGradeSubjectContainer: {
    gap : 12,
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
    fontSize: 17,
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
    gap: 0
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
});

export default GradesScreen;