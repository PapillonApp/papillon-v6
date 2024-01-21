import React from 'react';
import { Animated, ActivityIndicator, StatusBar, View, Dimensions, StyleSheet, Button, ScrollView, TouchableOpacity, RefreshControl, Easing, Platform, Pressable } from 'react-native';

// Custom imports
import GetUIColors from '../utils/GetUIColors';
import { useAppContext } from '../utils/AppContext';
import PapillonInsetHeader from '../components/PapillonInsetHeader';
import { SFSymbol } from 'react-native-sfsymbols';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

import { getSavedCourseColor } from '../utils/ColorCoursName';
import getClosestGradeEmoji from '../utils/EmojiCoursName';
import formatCoursName from '../utils/FormatCoursName';

import { useActionSheet } from '@expo/react-native-action-sheet';

// Icons
import { BarChart3, Users2, TrendingDown, TrendingUp, Info, AlertTriangle, MoreVertical } from 'lucide-react-native';

// Plugins
import { ContextMenuButton } from 'react-native-ios-context-menu';
import LineChart from 'react-native-simple-line-chart';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PressableScale } from 'react-native-pressable-scale';

// Interfaces
interface UIaverage {
  name: string,
  description: string,
  value: number,
  icon: any,
}

export interface gradeSettings {
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

import {calculateAverage, calculateSubjectAverage} from '../utils/grades/averages';

const GradesScreen = ({ navigation }) => {
  const UIColors = GetUIColors();
  const appContext = useAppContext();
  const insets = useSafeAreaInsets();
  const { showActionSheetWithOptions } = useActionSheet();

  // Data
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [periods, setPeriods] = React.useState<PapillonPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = React.useState<PapillonPeriod | null>(null);
  const [grades, setGrades] = React.useState([]);
  const [allGrades, setAllGrades] = React.useState<PapillonGrades | null>(null);
  const [latestGrades, setLatestGrades] = React.useState<PapillonGrades | null>(null);
  const [averages, setAverages] = React.useState<PapillonGradesViewAverages[]>({});
  const [averagesOverTime, setAveragesOverTime] = React.useState<PapillonAveragesOverTime[]>([]);
  const [classAveragesOverTime, setClassAveragesOverTime] = React.useState<PapillonAveragesOverTime[]>([]);
  const [chartLines, setChartLines] = React.useState(null);
  const [chartPoint, setChartPoint] = React.useState(null);
  const [openedSettings, setOpenedSettings] = React.useState<boolean>(true);

  // Constants
  const [gradeSettings, setGradeSettings] = React.useState<gradeSettings[]>({
    scale: 20,
    mode: 'trimestre'
  });

  const updatePeriods = async () => {
    getPeriodsFromAPI().then((period) => {
      getGradesFromAPI(false, period);
    });
  };

  // Update gradeSettings when focused
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      AsyncStorage.getItem('gradeSettings').then((value) => {
        if (value) {
          setGradeSettings(JSON.parse(value));
        }
      });

      if(openedSettings) setOpenedSettings(false);
    });

    return unsubscribe;
  }, [navigation, gradeSettings, openedSettings]);

  // UI arrays
  const [UIaverage, setUIaverage] = React.useState<UIaverage[]>([]);

  // Update UIaverage when averages change
  React.useEffect(() => {
    setUIaverage([
      {
        name: 'Moyenne groupe',
        value: averages.group || 0,
        icon: <Users2 color={UIColors.text} />,
      },
      {
        name: 'Moyenne max',
        value: averages.max || 0,
        icon: <TrendingDown color={UIColors.text} />,
      },
      {
        name: 'Moyenne min',
        value: averages.min || 0,
        icon: <TrendingUp color={UIColors.text} />,
      },
    ]);
  }, [averages, UIColors.text]);

  // Update chartLines when averagesOverTime change
  React.useEffect(() => {
    let studentLinesData = [];
    averagesOverTime.forEach((average) => {
      studentLinesData.push({
        x: new Date(average.date).getTime(),
        y: average.value,
      });
    });

    let classLinesData = [];
    classAveragesOverTime.forEach((average) => {
      classLinesData.push({
        x: new Date(average.date).getTime(),
        y: average.value,
      });
    });

    let linesSettings = {
      lineColor: UIColors.primary,
      curve: 'monotone',
      endPointConfig: {
        color: UIColors.primary,
        radius: 8,
        animated: true,
      },
      lineWidth: 3,
      activePointConfig: {
        color: UIColors.primary,
        borderColor: UIColors.element,
        radius: 7,
        borderWidth: 0,
        showVerticalLine: true,
        verticalLineColor: UIColors.text,
        verticalLineOpacity: 0.2,
        verticalLineWidth: 1.5,
      }
    };

    let lines = [
      {
        ...linesSettings,
        key: 'student2',
        data: studentLinesData,
      },
      {
        ...linesSettings,
        key: 'class',
        lineColor: UIColors.border,
        lineWidth: 2,
        trailingOpacity: 0,
        endPointConfig: {
          radius: 0,
          animated: false,
          color: 'transparent',
        },
        activePointConfig: {
          radius: 0,
          borderWidth: 0,
          showVerticalLine: false,
          color: 'transparent',
          borderColor: 'transparent',
        },
        data: classLinesData,
      },
      {
        ...linesSettings,
        key: 'student',
        data: studentLinesData,
      }
    ];
    
    setChartLines(lines);
  }, [averagesOverTime, classAveragesOverTime, UIColors.text, UIColors.border, UIColors.primary, UIColors.element]);

  async function getPeriodsFromAPI (mode:string=gradeSettings.mode): Promise<PapillonPeriod> {
    return AsyncStorage.getItem('gradeSettings').then(async (value) => {
      if (value) {
        value = JSON.parse(value);
        if (value.mode !== mode) {
          mode = value.mode;
        }

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
    });
  }

  async function getGradesFromAPI (force = false, period = selectedPeriod): Promise<void> {
    if(!force) setIsLoading(true);

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
    setIsRefreshing(false);
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

      // add background_color to each grade
      grade.background_color = subject?.color;
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
    setAllGrades(grades.grades);

    // get 10 latest grades
    let newGrades = [
      ...grades.grades,
    ];
    newGrades.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    const latest = newGrades.slice(0, 10);
    setLatestGrades(latest);
  }

  // Calculate averages over time
  async function calculateAveragesOverTime (grades: PapillonGrades, type= 'value'): Promise<Array> {
    let data = [];

    // for each grade.grades
    for (let i = 0; i < grades.length; i++) {
      // get a list of all grades until i
      const gradesUntil = grades.slice(0, i + 1);

      // calculate average
      const average = await calculateSubjectAverage(gradesUntil, type, gradeSettings.scale);

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
    let averagesOverTime = await calculateAveragesOverTime(grades, 'value');
    let classAveragesOverTime = await calculateAveragesOverTime(grades, 'average');
    setAveragesOverTime(averagesOverTime);
    setClassAveragesOverTime(classAveragesOverTime);
  }

  // Parse grades
  async function parseGrades (grades: PapillonGrades): Promise<void> {
    addGradesToSubject(grades);
    estimatedStudentAverages(grades?.grades);
    estimateAveragesOverTime(grades?.grades);
  }

  function androidPeriodChangePicker () {
    const options = periods.map((item) => item.name);
    options.push('Annuler');
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex : cancelButtonIndex,
        tintColor: UIColors.primary,
      },
      (buttonIndex) => {
        if (buttonIndex !== cancelButtonIndex) {
          changePeriod(periods[buttonIndex].name);
        }
      }
    );
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

  // Header animation
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

  // Change header title
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: Platform.OS === 'ios' ? () => (
        <PapillonInsetHeader
          icon={<SFSymbol name="chart.pie.fill" />}
          title="Notes"
          color="#A84700"
        />
      ) : 'Notes',
      headerRight: () => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginRight: 6,
          }}
        >
          { isLoading && (
            <ActivityIndicator />
          )}
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
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 10,
                borderCurve : 'continuous',
                backgroundColor: UIColors.primary + '22',
              }}
              onPress={() => {
                if (Platform.OS !== 'ios') {
                  androidPeriodChangePicker();
                }
              }}
            >
              <NativeText
                heading="p"
                style={{
                  color: UIColors.primary,
                  fontSize: 17,
                  fontFamily: 'Papillon-Medium',
                }}
              >
                {selectedPeriod?.name}
              </NativeText>
            </TouchableOpacity>
          </ContextMenuButton>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('GradesSettings');
              setOpenedSettings(true);
            }}
          >
            <MoreVertical size={20} strokeWidth={2.2} color={UIColors.text + '88'} />
          </TouchableOpacity>
        </View>
      ),
      headerShadowVisible: false,
      headerTransparent: Platform.OS === 'ios' ? true : false,
      headerStyle: Platform.OS === 'android' ? {
        backgroundColor: UIColors.background,
        elevation: 0,
      } : undefined,
    });
  }, [navigation, periods, selectedPeriod, UIColors, headerOpacity, setOpenedSettings, showActionSheetWithOptions]);

  return (
    <>
      { Platform.OS === 'ios' && (
        <Animated.View 
          style={
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 44 + insets.top,
              width: '100%',
              zIndex: 999,
              backgroundColor: UIColors.element + '00',
              opacity: headerOpacity,
              borderBottomColor: UIColors.dark ? UIColors.text + '22' : UIColors.text + '55',
              borderBottomWidth: 0.5,
            }
          }
        >
          <BlurView
            tint={UIColors.dark ? 'dark' : 'light'}
            intensity={80}
            style={{
              flex: 1,
              zIndex: 999,
            }}
          />
        </Animated.View>
      )}
      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
        style={{ backgroundColor: UIColors.backgroundHigh, flex: 1 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              getPeriodsFromAPI().then((period) => {
                getGradesFromAPI(true, period);
              });
            }}
          />
        }
      >
        <StatusBar animated barStyle={UIColors.dark ? 'light-content' : 'dark-content'} translucent={true} backgroundColor={UIColors.backgroundHigh} />

        {grades.length === 0 && (
          <NativeList inset>
            <NativeItem>
              <NativeText heading="p2">
                Aucune note à afficher.
              </NativeText>
            </NativeItem>
          </NativeList>
        )}

        { averages.student && averages.student > 0 && (
          <GradesAverageHistory
            isLoading={isLoading}
            averages={averages}
            chartLines={chartLines}
            chartPoint={chartPoint}
            setChartPoint={setChartPoint}
            gradeSettings={gradeSettings}
          />
        )}

        { latestGrades && latestGrades.length > 0 && (
          <LatestGradesList
            isLoading={isLoading}
            grades={latestGrades}
            gradeSettings={gradeSettings}
            navigation={navigation}
            allGrades={allGrades}
          />
        )}

        { Platform.OS === 'android' && (
          <View style={{ height: 16 }} />
        )}

        { averages.student && averages.student > 0 && (
          <GradesAveragesList
            isLoading={isLoading}
            UIaverage={UIaverage}
            gradeSettings={gradeSettings}
          />
        )}

        <GradesList
          grades={grades}
          allGrades={allGrades}
          gradeSettings={gradeSettings}
          navigation={navigation}
        />
      
      </ScrollView>
    </>
  );
};

const LatestGradesList = ({ isLoading, grades, allGrades, gradeSettings, navigation }) => {
  const UIColors = GetUIColors();
  console;

  const showGrade = (grade) => {
    navigation.navigate('Grade', {
      grade,
      allGrades: allGrades,
    });
  };

  return (
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
          subjectStyles.latestGradesList,
        ]}
      >
        <View
          style={[
            {
              flexDirection: 'row',
              paddingHorizontal: 16,
              gap: 16,
            }
          ]}
        >
          {grades.map((grade, index) => (
            <PressableScale
              weight="light"
              activeScale={0.95}
              onPress={() => showGrade(grade)}
              key={index}
              style={[
                subjectStyles.smallGrade,
                {
                  backgroundColor: UIColors.element,
                }
              ]}
            >
              <View style={[subjectStyles.listItem, {
                backgroundColor: getSavedCourseColor(grade.subject.name, grade.background_color),
              }]}>
                <View style={[subjectStyles.subjectInfoContainer, {
                  paddingVertical: 5.5,
                }]}>
                  <NativeText style={subjectStyles.subjectEmoji}>
                    {getClosestGradeEmoji(grade.subject.name)}
                  </NativeText>
                  <NativeText style={subjectStyles.subjectName} numberOfLines={1} ellipsizeMode="tail">
                    {formatCoursName(grade.subject.name)}
                  </NativeText>
                </View>
              </View>
              <View style={subjectStyles.smallGradeData}>
                <NativeText heading="h4">
                  {grade.description || 'Aucune description'}
                </NativeText>
                <NativeText heading="p2">
                  {new Date(grade.date).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' })}
                </NativeText>

                <View style={subjectStyles.smallGradeContainer}>
                  <NativeText style={subjectStyles.smallGradeValue}>
                    {((grade.grade.value.value / grade.grade.out_of.value) * gradeSettings.scale).toFixed(2)}
                  </NativeText>
                  <NativeText style={subjectStyles.smallGradeScale}>
                    /{gradeSettings.scale.toFixed(0)}
                  </NativeText>
                </View>
              </View>
            </PressableScale>
          ))}
        </View>
      </ScrollView>
    </NativeList>
  );
};

const GradesList = ({ grades, allGrades, gradeSettings, navigation }) => {
  const UIColors = GetUIColors();

  const showGrade = (grade) => {
    navigation.navigate('Grade', {
      grade,
      allGrades: allGrades,
    });
  };

  return (
    <View style={subjectStyles.container}>
      {grades.map((subject, index) => (
        <NativeList
          key={index}
          inset
          style={subjectStyles.listContainer}
          header={formatCoursName(subject.subject.name)}
        >
          <Pressable style={[subjectStyles.listItem, {
            backgroundColor: getSavedCourseColor(subject.subject.name, subject.color),
          }]}>
            <View style={subjectStyles.subjectInfoContainer}>
              <NativeText style={subjectStyles.subjectName} numberOfLines={1} ellipsizeMode="tail">
                {formatCoursName(subject.subject.name)}
              </NativeText>
            </View>

            <View style={subjectStyles.gradeContainer}>
              <NativeText style={subjectStyles.subjectGradeValue}>
                {((subject.average.value / subject.out_of.value) * gradeSettings.scale).toFixed(2)}
              </NativeText>
              <NativeText style={subjectStyles.subjectGradeScale}>
                /{gradeSettings.scale.toFixed(0)}
              </NativeText>
            </View>
          </Pressable>

          {subject.grades.map((grade, index) => (
            <NativeItem
              key={index}
              style={subjectStyles.gradeItem}

              onPress={() => showGrade(grade)}

              leading={
                <NativeText heading="h2" style={subjectStyles.gradeEmoji}>
                  {getClosestGradeEmoji(subject.subject.name)}
                </NativeText>
              }

              cellProps={{
                contentContainerStyle: {
                  paddingVertical: 2,
                },
              }}

              trailing={
                <View style={subjectStyles.inGradeContainer}>
                  <View style={subjectStyles.gradeTextContainer}>
                    <NativeText heading="p" style={subjectStyles.gradeValue}>
                      {grade.grade.value.value.toFixed(2)}
                    </NativeText>
                    <NativeText heading="p" style={subjectStyles.gradeScale}>
                        /{grade.grade.out_of.value.toFixed(0)}
                    </NativeText>
                  </View>
                 

                  { parseFloat(grade.grade.coefficient) !== 1 && (
                    <NativeText heading="p" style={[subjectStyles.gradeCoef]}>
                      Coeff. {grade.grade.coefficient}
                    </NativeText>
                  )}
                </View>
              }
            >
              <NativeText
                heading="h4"
                style={subjectStyles.gradeDescription}
              >
                {grade.description || 'Aucune description'}
              </NativeText>
              <NativeText
                heading="p2"
                style={subjectStyles.gradeDescription}
              >
                {new Date(grade.date).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' })}
              </NativeText>
            </NativeItem>
          ))}
        </NativeList>
      ))}
    </View>
  );
};

const GradesAverageHistory = ({ isLoading, averages, chartLines, chartPoint, setChartPoint, gradeSettings }) => {
  const UIColors = GetUIColors();
  if (chartLines === null || chartLines === undefined) return null;

  const [currentDate, setCurrentDate] = React.useState<Date>(null);
  const [finalAvg, setFinalAvg] = React.useState<number>(averages.student);

  React.useEffect(() => {
    setFinalAvg(averages.student);
  }, [averages]);

  React.useEffect(() => {
    if (chartPoint) {
      setFinalAvg(chartPoint.y);
      setCurrentDate(chartPoint.x);
    } else {
      setFinalAvg(averages.student);
      setCurrentDate(null);
    }
  }, [chartPoint]);

  return (
    <View style={[
      styles.chart.container,
      {
        backgroundColor: UIColors.element,
        borderColor: UIColors.dark ? UIColors.border + '55' : UIColors.border + 'c5',
        borderWidth: 0.5,
      }
    ]}>
      <View style={[styles.chart.header.container]}>
        <View style={[styles.chart.header.title.container]}>
          {currentDate ? (
            <NativeText heading="p" style={[styles.chart.header.title.text, {opacity: 0.5}]}>
              au {new Date(currentDate).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })}
            </NativeText>
          ) : (
            <NativeText heading="p" style={[styles.chart.header.title.text]}>
                Moyenne générale
            </NativeText>
          )}

          <TouchableOpacity style={[{flexDirection: 'row', alignItems: 'center', gap:6}]}>
            <AlertTriangle size={20} strokeWidth={2.2} color={UIColors.primary} />
            <NativeText heading="p" style={[styles.chart.header.title.text, {color: UIColors.primary}]}>
              Estimation
            </NativeText>
          </TouchableOpacity>
        </View>
        <View style={[styles.chart.avg.container]}>
          <NativeText heading="h2" style={[styles.chart.avg.value]}>
            {finalAvg.toFixed(2)}
          </NativeText>

          <NativeText heading="p2" style={[styles.chart.avg.out_of]}>
            /{gradeSettings.scale.toFixed(0)}
          </NativeText>
        </View>
      </View>
      <View>
        <LineChart
          lines={chartLines}
          width={Dimensions.get('window').width - (16 * 2)}
          height={110}
          extraConfig={{
            alwaysShowActivePoint: true,
          }}

          onPointFocus={(point) => {
            setChartPoint(point);
          }}
          onPointLoseFocus={() => {
            setChartPoint(null);
          }}
        />
      </View>
    </View>
  );
};

const GradesAveragesList = ({ isLoading, UIaverage, gradeSettings }) => {
  // if UIaverage is empty
  if (UIaverage.length === 0 && !isLoading) return (
    <NativeList inset header="Moyennes">
      <NativeItem>
        <NativeText heading="p2">
          Aucune moyenne à afficher.
        </NativeText>
      </NativeItem>
    </NativeList>
  );

  // When loaded
  return (
    <NativeList inset header="Moyennes">
      { UIaverage.map((item, index) => (
        <NativeItem
          key={index}
          leading={
            <View>
              {item.icon}
            </View>
          }
          trailing={
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 2,
              }}
            >
              {item.value > 0 ? (
                <NativeText heading="h2">
                  {item.value?.toFixed(2)}
                </NativeText>
              ) : (
                <NativeText heading="h2">
                  N/A
                </NativeText>
              )}

              <NativeText heading="p2">
                /{gradeSettings.scale.toFixed(0)}
              </NativeText>
            </View>
          }
        >
          { item.description && item.description.trim() !== '' ? (<>
            <NativeText heading="h4">
              {item.name}
            </NativeText>
            <NativeText heading="p2">
              {item.description}
            </NativeText>
          </>) : (
            <NativeText heading="p2">
              {item.name}
            </NativeText>
          )}
        </NativeItem>
      ))}
    </NativeList>
  );
};

const styles = StyleSheet.create({
  chart: {
    container: {
      margin: 15,
      marginTop: 6,
      marginBottom: 0,
      borderRadius: 12,
      borderCurve: 'continuous',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },

    header: {
      container: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingBottom: 6,
      },
      title: {
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 1,
        },
        text: {
          fontFamily: 'Papillon-Medium',
        }
      }
    },

    avg: {
      container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
      },
      value: {
        fontFamily: 'Papillon-Semibold',
        fontSize: 26,
        fontVariant: ['tabular-nums'],
      },
      out_of: {
        fontFamily: 'Papillon-Medium',
        fontSize: 16,
      }
    }
  }
});

const subjectStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listItem: {
    paddingHorizontal: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subjectInfoContainer: {
    flex: 1,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subjectEmoji: {
    color: '#ffffff',
    fontFamily: 'Papillon-Semibold',
    fontSize: 24,
  },
  subjectName: {
    color: '#ffffff',
    fontFamily: 'Papillon-Semibold',
    fontSize: 16,
    flex: 1,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 0,
  },
  subjectGradeValue: {
    color: '#ffffff',
    fontFamily: 'Papillon-Semibold',
    fontSize: 17,
  },
  subjectGradeScale: {
    color: '#ffffff99',
    fontFamily: 'Papillon-Medium',
    fontSize: 15,
  },
  gradeItem: {
    // Add any additional styling for the grade items here
  },
  gradeDescription: {
    // Add any additional styling for the grade descriptions here
  },

  gradeEmoji: {
    color: '#ffffff',
    fontFamily: 'Papillon-Semibold',
    fontSize: 24,
  },

  inGradeContainer : {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 3,
  },

  gradeCoef: {
    fontFamily: 'Papillon-Medium',
    fontSize: 15,
    opacity: 0.5,
  },

  gradeTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 0,
  },
  gradeValue: {
    fontFamily: 'Papillon-Semibold',
    fontSize: 17,
  },
  gradeScale: {
    fontFamily: 'Papillon-Medium',
    fontSize: 15,
    opacity: 0.5,
  },

  smallGrade: {
    width: 200,
    borderRadius: 12,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },

  smallGradeData: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 4,
    flex: 1,

    paddingBottom: 38,
  },

  smallGradeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 0,
    position: 'absolute',
    bottom: 12,
    left: 15,
  },

  smallGradeValue: {
    fontFamily: 'Papillon-Semibold',
    fontSize: 20,
  },

  smallGradeScale: {
    fontFamily: 'Papillon-Medium',
    fontSize: 15,
    opacity: 0.5,
  },
});

export default GradesScreen;
