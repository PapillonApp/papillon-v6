import React, { useEffect, useState, useCallback, useMemo } from 'react';
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

// Components & Styles
import { useTheme } from 'react-native-paper';

// Icons
import { Users2, TrendingDown, TrendingUp, AlertTriangle, MoreVertical } from 'lucide-react-native';
import { Stats } from '../interface/icons/PapillonIcons';

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
  icon: React.ReactElement,
}

export interface GradeSettings {
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
import PapillonLoading from '../components/PapillonLoading';

const GradesScreen = ({ navigation }) => {
  const UIColors = GetUIColors();
  const theme = useTheme();
  const appContext = useAppContext();
  const insets = useSafeAreaInsets();
  const { showActionSheetWithOptions } = useActionSheet();

  // Data
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [periods, setPeriods] = React.useState<PapillonPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = React.useState<PapillonPeriod | null>(null);
  const [changedPeriod, setChangedPeriod] = React.useState<boolean>(false);
  const [grades, setGrades] = React.useState([]);
  const [allGrades, setAllGrades] = React.useState<PapillonGrades | null>(null);
  const [latestGrades, setLatestGrades] = React.useState<PapillonGrades | null>(null);
  const [averages, setAverages] = React.useState<PapillonGradesViewAverages[]>({});
  const [pronoteStudentAverage, setPronoteStudentAverage] = React.useState<number|null>(null);
  const [pronoteClassAverage, setPronoteClassAverage] = React.useState<number|null>(null);
  const [averagesOverTime, setAveragesOverTime] = React.useState<PapillonAveragesOverTime[]>([]);
  const [classAveragesOverTime, setClassAveragesOverTime] = React.useState<PapillonAveragesOverTime[]>([]);
  const [chartLines, setChartLines] = React.useState(null);
  const [chartPoint, setChartPoint] = React.useState(null);
  const [openedSettings, setOpenedSettings] = React.useState<boolean>(true);

  // Constants
  const [gradeSettings, setGradeSettings] = React.useState<GradeSettings[]>({
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
        value: pronoteClassAverage ? pronoteClassAverage : (averages.group || 0),
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
  }, [averages, UIColors.text, pronoteClassAverage]);

  // Update chartLines when averagesOverTime change
  React.useEffect(() => {
    const createLineData = (averages) => averages.map(average => ({
      x: new Date(average.date).getTime(),
      y: average.value,
    }));

    const linesSettings = {
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

    const studentLinesData = createLineData(averagesOverTime);
    const classLinesData = createLineData(classAveragesOverTime);

    const lines = [
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
    // const value = await AsyncStorage.getItem('gradeSettings');
    // if (!value) return;

    // const settings = JSON.parse(value);
    // mode = settings.mode !== mode ? settings.mode : mode;

    const allPeriods = await appContext.dataProvider!.getPeriods();
    const periods: PapillonPeriod[] = allPeriods.filter((period) => period.name.toLowerCase().normalize('NFD').includes(mode));

    setPeriods(periods);
    const firstPeriod = periods[0];

    if (changedPeriod) {
      const period = periods.find((period) => period.name === selectedPeriod?.name);
      if (period) {
        setSelectedPeriod(period);
        return period;
      }
    }

    setSelectedPeriod(firstPeriod);
    return firstPeriod;
  }

  async function getGradesFromAPI (force = false, period = selectedPeriod): Promise<void> {
    if (!isRefreshing) {
      setIsLoading(true);
    }

    try {
      if (appContext.dataProvider && period) {
        const grades = await appContext.dataProvider.getGrades(period.name, force);
        if (grades) await parseGrades(grades);
        // else {
        //   console.warn('CACHE NEEDED !');
        // }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function addGradesToSubject(grades: PapillonGrades): Promise<void> {
    const data = grades.averages.map(average => ({...average, grades: []}));

    grades.grades.forEach((grade) => {
      const subject = data.find((subject) => subject.subject.id === grade.subject.id);
      if (subject) {
        subject.grades.push(grade);
        grade.background_color = subject.color;
      }
    });

    data.forEach((subject) => {
      subject.grades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    data.sort((a, b) => a.subject.name.localeCompare(b.subject.name));

    if(grades.class_overall_average?.value > 0) {
      setPronoteClassAverage(grades.class_overall_average.value);
    }

    if(grades.overall_average?.value > 0) {
      setPronoteStudentAverage(grades.overall_average.value);
    }

    setGrades(data);
    setAllGrades(grades.grades);

    const latest = [...grades.grades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    setLatestGrades(latest);
  }

  // Calculate averages over time
  async function calculateAveragesOverTime (grades: PapillonGrades, type= 'value'): Promise<Array> {
    // map grades to data with date and average value
    const data = await Promise.all(grades.map(async (grade, i) => {
      const gradesUntil = grades.slice(0, i + 1);
      const average = await calculateSubjectAverage(gradesUntil, type, gradeSettings.scale);
      return {
        date: new Date(grade.date),
        value: average,
      };
    }));

    // sort by date
    data.sort((a, b) => a.date.getTime() - b.date.getTime());

    return data;
  }

  // Estimate averages
  async function estimatedStudentAverages (grades: PapillonGrades): Promise<void> {
    const [student, group, max, min] = await Promise.all([
      calculateSubjectAverage(grades, 'value', gradeSettings.scale),
      calculateSubjectAverage(grades, 'average', gradeSettings.scale),
      calculateSubjectAverage(grades, 'max', gradeSettings.scale),
      calculateSubjectAverage(grades, 'min', gradeSettings.scale)
    ]);

    setAverages({
      student,
      group,
      max,
      min,
    });
  }

  // Estimate averages over time
  async function estimateAveragesOverTime (grades: PapillonGrades): Promise<void> {
    const [averagesOverTime, classAveragesOverTime] = await Promise.all([
      calculateAveragesOverTime(grades, 'value'),
      calculateAveragesOverTime(grades, 'average')
    ]);
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
    if (period) setChangedPeriod(true);
  }

  function loadAll(mode) {
    getPeriodsFromAPI(mode).then((period) => {
      getGradesFromAPI(true, period);
    });
  }

  // On mount
  React.useEffect(() => {
    AsyncStorage.getItem('gradeSettings').then(async (value) => {
      if (value) {
        value = JSON.parse(value);
        loadAll(value.mode || 'trimestre');
      }
      else {
        loadAll();
      }
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
  const HeaderTitle = ({ navigation, UIColors }) => {
    return Platform.OS === 'ios' ? (
      <PapillonInsetHeader
        icon={<SFSymbol name="chart.pie.fill" />}
        title="Notes"
        color="#A84700"
      />
    ) : 'Notes';
  };
  
  const HeaderRight = ({ navigation, periods, selectedPeriod, UIColors, isLoading, changePeriod, androidPeriodChangePicker, setOpenedSettings }) => {
    const menuConfig = useMemo(() => ({
      menuTitle: 'Périodes',
      menuItems: periods.map((period) => ({
        actionKey: period.name,
        actionTitle: period.name,
        menuState: selectedPeriod?.name === period.name ? 'on' : 'off',
      })),
    }), [periods, selectedPeriod]);
  
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginRight: 6,
      }}>
        { isLoading && (
          <ActivityIndicator />
        )}
        <ContextMenuButton
          isMenuPrimaryAction={true}
          menuConfig={menuConfig}
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
    );
  };
  
  // Change header title
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: Platform.OS === 'ios' ? () => <HeaderTitle navigation={navigation} UIColors={UIColors} /> : () => (<></>),
      headerTitle : Platform.OS === 'ios' ? ' ' : 'Notes',
      headerRight: () => <HeaderRight navigation={navigation} periods={periods} selectedPeriod={selectedPeriod} UIColors={UIColors} isLoading={isLoading} changePeriod={changePeriod} androidPeriodChangePicker={androidPeriodChangePicker} setOpenedSettings={setOpenedSettings} />,
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
              loadAll();
            }}
          />
        }
      >
        <StatusBar animated barStyle={UIColors.dark ? 'light-content' : 'dark-content'} translucent={true} backgroundColor={UIColors.backgroundHigh} />

        {grades.length === 0 && (
          <PapillonLoading
            title='Aucune note à afficher'
            subtitle='Vos notes apparaîtront ici.'
            icon={<Stats stroke={UIColors.text}/>}
          />
        )}

        { averages.student && averages.student > 0 && (
          <GradesAverageHistory
            isLoading={isLoading}
            averages={averages}
            chartLines={chartLines}
            chartPoint={chartPoint}
            setChartPoint={setChartPoint}
            gradeSettings={gradeSettings}
            pronoteStudentAverage={pronoteStudentAverage}
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

const LatestGradesList = React.memo(({ isLoading, grades, allGrades, gradeSettings, navigation }) => {
  const UIColors = GetUIColors();

  const showGrade = useCallback((grade) => {
    navigation.navigate('Grade', {
      grade,
      allGrades: allGrades,
    });
  }, [allGrades, navigation]);

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
          subjectStyles.latestGradesList
        ]}
      >
        <View
          style={[
            {
              flexDirection: 'row',
              paddingHorizontal: Platform.OS === 'ios' ? 16 : 0,
              gap: 12,
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
                  paddingVertical: 5,
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
                  { grade.grade.value?.value ? ( 
                    <NativeText style={subjectStyles.smallGradeValue}>
                      {((grade.grade.value?.value / grade.grade.out_of.value) * gradeSettings.scale).toFixed(2)}
                    </NativeText>
                  ) : (
                    <NativeText style={subjectStyles.smallGradeValue}>
                      N/A
                    </NativeText>
                  )}
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
});

const GradesList = React.memo(({ grades, allGrades, gradeSettings, navigation }) => {
  const UIColors = GetUIColors();

  const showGrade = useCallback((grade) => {
    navigation.navigate('Grade', {
      grade,
      allGrades: allGrades,
    });
  }, [navigation, allGrades]);

  return (
    <View style={subjectStyles.container}>
      {grades.map((subject, index) => {
        const formattedCourseName = formatCoursName(subject.subject.name);
        const backgroundColor = getSavedCourseColor(subject.subject.name, subject.color);
        const gradeValue = ((subject.average.value / subject.out_of.value) * gradeSettings.scale).toFixed(2);
        const gradeScale = gradeSettings.scale.toFixed(0);

        return (
          <NativeList
            key={index}
            inset
            style={subjectStyles.listContainer}
            header={formattedCourseName}
          >
            <Pressable style={[subjectStyles.listItem, { backgroundColor }]}>
              <View style={subjectStyles.subjectInfoContainer}>
                <NativeText style={subjectStyles.subjectName} numberOfLines={1} ellipsizeMode="tail">
                  {formattedCourseName}
                </NativeText>
              </View>

              <View style={subjectStyles.gradeContainer}>
                <NativeText style={subjectStyles.subjectGradeValue}>
                  {gradeValue}
                </NativeText>
                <NativeText style={subjectStyles.subjectGradeScale}>
                  /{gradeScale}
                </NativeText>
              </View>
            </Pressable>

            {subject.grades.map((grade, index) => {
              const gradeEmoji = getClosestGradeEmoji(subject.subject.name);
              const gradeValue = grade.grade.value?.value?.toFixed(2) || 'N/A';
              const gradeScale = grade.grade.out_of.value.toFixed(0);
              const gradeDescription = grade.description || 'Aucune description';
              const gradeDate = new Date(grade.date).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' });

              return (
                <NativeItem
                  key={index}
                  style={subjectStyles.gradeItem}
                  onPress={() => showGrade(grade)}
                  leading={
                    <NativeText heading="h2" style={subjectStyles.gradeEmoji}>
                      {gradeEmoji}
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
                          {gradeValue}
                        </NativeText>
                        <NativeText heading="p" style={subjectStyles.gradeScale}>
                            /{gradeScale}
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
                    {gradeDescription}
                  </NativeText>
                  <NativeText
                    heading="p2"
                    style={subjectStyles.gradeDescription}
                  >
                    {gradeDate}
                  </NativeText>
                </NativeItem>
              );
            })}
          </NativeList>
        );
      })}
    </View>
  );
});

const GradesAverageHistory = React.memo(({ isLoading, averages, chartLines, chartPoint, setChartPoint, gradeSettings, pronoteStudentAverage }) => {
  const UIColors = GetUIColors();
  if (chartLines === null || chartLines === undefined) return null;

  const [isReal, setIsReal] = useState<boolean>(false);
  const [reevaluated, setReevaluated] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [finalAvg, setFinalAvg] = useState<number>(averages.student);

  useEffect(() => {
    if (pronoteStudentAverage) {
      setFinalAvg(pronoteStudentAverage);
      setIsReal(true);
    } else {
      setFinalAvg(averages.student);
      setIsReal(false);
    }
  }, [averages, pronoteStudentAverage]);

  useEffect(() => {
    setReevaluated(false);

    if (chartPoint) {
      setIsReal(false);
      setCurrentDate(chartPoint.x);

      if (pronoteStudentAverage) {
        const diff = Math.abs(pronoteStudentAverage - averages.student);
        const correctedAvg = chartPoint.y - diff;
        setFinalAvg(correctedAvg);
        setReevaluated(true);
      } else {
        setFinalAvg(chartPoint.y);
      }
    } else {
      if (pronoteStudentAverage) {
        setFinalAvg(pronoteStudentAverage);
        setIsReal(true);
      } else {
        setFinalAvg(averages.student);
        setIsReal(false);
      }

      setCurrentDate(null);
    }
  }, [chartPoint]);

  const handlePointFocus = useCallback((point) => {
    setChartPoint(point);
  }, [setChartPoint]);

  const handlePointLoseFocus = useCallback(() => {
    setChartPoint(null);
  }, [setChartPoint]);

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
              {isReal ? 'Moyenne réelle' :
                reevaluated ? 'Estim. réévaluée' : 'Estimation'}
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

          onPointFocus={handlePointFocus}
          onPointLoseFocus={handlePointLoseFocus}
        />
      </View>
    </View>
  );
});

const GradesAveragesList = ({ isLoading, UIaverage, gradeSettings }) => {
  const renderNativeItem = (item, index) => (
    <NativeItem
      key={index}
      leading={<View>{item.icon}</View>}
      trailing={
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
          <NativeText heading="h2">
            {item.value > 0 ? item.value.toFixed(2) : 'N/A'}
          </NativeText>
          <NativeText heading="p2">
            /{gradeSettings.scale.toFixed(0)}
          </NativeText>
        </View>
      }
    >
      <NativeText heading={item.description && item.description.trim() !== '' ? 'h4' : 'p2'}>
        {item.name}
      </NativeText>
      {item.description && item.description.trim() !== '' && (
        <NativeText heading="p2">
          {item.description}
        </NativeText>
      )}
    </NativeItem>
  );

  const renderNativeList = useMemo(() => (
    <NativeList inset header="Moyennes">
      {UIaverage.map(renderNativeItem)}
    </NativeList>
  ), [UIaverage]);

  if (UIaverage.length === 0 && !isLoading) {
    return (
      <NativeList inset header="Moyennes">
        <NativeItem>
          <NativeText heading="p2">
            Aucune moyenne à afficher.
          </NativeText>
        </NativeItem>
      </NativeList>
    );
  }

  return renderNativeList;
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
  },
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
