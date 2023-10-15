import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  Pressable,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import Fade from 'react-native-fade';

import { User2, Users2, TrendingDown, TrendingUp } from 'lucide-react-native';

import { useState } from 'react';
import { PressableScale } from 'react-native-pressable-scale';

import { useActionSheet } from '@expo/react-native-action-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PapillonIcon from '../components/PapillonIcon';
import { IndexData } from '../fetch/IndexData';
import getClosestColor from '../utils/ColorCoursName';
import { getClosestCourseColor, getSavedCourseColor } from '../utils/ColorCoursName';
import getClosestGradeEmoji from '../utils/EmojiCoursName';
import formatCoursName from '../utils/FormatCoursName';
import GetUIColors from '../utils/GetUIColors';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

function GradesScreen({ navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();
  const { showActionSheetWithOptions } = useActionSheet();
  const insets = useSafeAreaInsets();
  const [subjectsList, setSubjectsList] = useState([]);
  const [averagesData, setAveragesData] = useState([]);
  const [latestGrades, setLatestGrades] = useState([]);
  const [periodsList, setPeriodsList] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [allGrades, setAllGrades] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isHeadLoading, setHeadLoading] = useState(false);

  React.useEffect(() => {
    // change background color
    // This effect doesn't contain any code, you can remove it if not needed.
  }, []);

  // add button to header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Fade visible={selectedPeriod} direction="up" duration={200}>
          <TouchableOpacity
            onPress={newPeriod}
            style={styles.periodButtonContainer}
          >
            <Text
              style={[styles.periodButtonText, { color: UIColors.primary }]}
            >
              {selectedPeriod?.name || ''}
            </Text>
          </TouchableOpacity>
        </Fade>
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
    await IndexData.changePeriod(period.name);
    IndexData.getUser(true);
    loadGrades(true);
    setIsLoading(false);
  }

  async function getPeriods() {
    const result = await IndexData.getUser(false);
    const userData = result;
    const allPeriods = userData.periods;

    const actualPeriod = allPeriods.find((period) => period.actual === true);
    let periods = [];

    if (actualPeriod.name.toLowerCase().includes('trimestre')) {
      periods = allPeriods.filter((period) =>
        period.name.toLowerCase().includes('trimestre')
      );
    } else if (actualPeriod.name.toLowerCase().includes('semestre')) {
      periods = allPeriods.filter((period) =>
        period.name.toLowerCase().includes('semestre')
      );
    }

    setPeriodsList(periods);
    setSelectedPeriod(actualPeriod);
  }

  async function parseGrades(grades) {
    const parsedData = JSON.parse(grades);
    const gradesList = parsedData.grades;
    const subjects = [];

    setAllGrades(gradesList);
  
    function calculateAverages(averages) {
      const studentAverage = (averages.reduce((acc, avg) => acc + (avg.average / avg.out_of) * 20, 0) / averages.length).toFixed(2);
      const classAverage = (averages.reduce((acc, avg) => acc + (avg.class_average / avg.out_of) * 20, 0) / averages.length).toFixed(2);
      const minAverage = (averages.reduce((acc, avg) => acc + (avg.min / avg.out_of) * 20, 0) / averages.length).toFixed(2);
      const maxAverage = (averages.reduce((acc, avg) => acc + (avg.max / avg.out_of) * 20, 0) / averages.length).toFixed(2);
  
      setAveragesData({
        studentAverage: studentAverage,
        classAverage: classAverage,
        minAverage: minAverage,
        maxAverage: maxAverage,
      });
    }
  
    gradesList.forEach((grade) => {
      const subjectIndex = subjects.findIndex((subject) => subject.name === grade.subject.name);
      if (subjectIndex !== -1) {
        subjects[subjectIndex].grades.push(grade);
      } else {
        subjects.push({
          name: grade.subject.name,
          grades: [grade],
        });
      }
    });
  
    const averagesList = parsedData.averages;
  
    averagesList.forEach((average) => {
      const subject = subjects.find((subj) => subj.name === average.subject.name);
      if (subject) {
        average.color = getSavedCourseColor(average.subject.name, average.color);
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
  
    calculateAverages(averagesList);
  
    subjects.sort((a, b) => a.name.localeCompare(b.name));
  
    setSubjectsList(subjects);
    setLatestGrades(gradesList.slice(0, 10));
  }
  

  async function loadGrades(force = false) {
    // get grades from cache
    AsyncStorage.getItem('@grades').then((grades) => {
      if (grades) {
        parseGrades(grades);
      }
    })

    // fetch grades
    const grades = await IndexData.getGrades(force);
    parseGrades(grades);

    // save grades to cache
    AsyncStorage.setItem('@grades', grades);
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

  return (
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
    >
      <StatusBar
        animated
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />

      {subjectsList.length === 0 && !isLoading ? (
        <Text style={[styles.noGrades]}>Aucune note à afficher.</Text>
      ) : null}

      {latestGrades.length > 0 ? (
        <NativeList
          header="Dernières notes"
          sectionProps={{
            hideSurroundingSeparators: true,
            headerTextStyle: {
              marginLeft: 15,
            },
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.latestGradesList]}
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
                    {formatCoursName(grade.subject.name)}
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
                <User2 color={UIColors.text} />
              </View>
            }
          >
            <Text style={[styles.averageText]}>Moy. générale</Text>
            <View style={[styles.averageValueContainer]}>
              <Text style={[styles.averageValue]}>
                {averagesData.studentAverage}
              </Text>
              <Text style={[styles.averageValueOutOf]}>/20</Text>
            </View>
          </NativeItem>
          <NativeItem
            leading={
              <View style={{marginHorizontal: 4}}>
                <Users2 color={UIColors.text} />
              </View>
            }
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
              header={subject.name}
            >
              <Pressable
                style={[
                  styles.subjectNameContainer,
                  { backgroundColor: subject.averages.color },
                ]}
              >
                <Text style={[styles.subjectName]} numberOfLines={1}>
                  {formatCoursName(subject.name)}
                </Text>
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
                      </View>
                    }
                  >
                    <View style={[styles.gradeNameContainer]}>
                      {grade.description ? (
                        <Text style={[styles.gradeName]}>
                          {grade.description}
                        </Text>
                      ) : (
                        <Text style={[styles.gradeName]}>
                          Note en {formatCoursName(grade.subject.name)}
                        </Text>
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
    elevation: 1,
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


  periodButtonContainer: {
    position: 'absolute',
    top: -16,
    right: 0,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
    elevation: 2,
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
});

export default GradesScreen;
