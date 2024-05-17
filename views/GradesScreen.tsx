import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Animated, ActivityIndicator, StatusBar, View, Dimensions, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Easing, Platform, Pressable } from 'react-native';

// Custom imports
import GetUIColors from '../utils/GetUIColors';
import { useAppContext } from '../utils/AppContext';
import PapillonInsetHeader from '../components/PapillonInsetHeader';
import { SFSymbol } from 'react-native-sfsymbols';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

import { getSavedCourseColor } from '../utils/cours/ColorCoursName';
import getClosestGradeEmoji from '../utils/cours/EmojiCoursName';
import formatCoursName from '../utils/cours/FormatCoursName';

import { useActionSheet } from '@expo/react-native-action-sheet';

// Icons
import {Users2, File, TrendingDown, TrendingUp, AlertTriangle, MoreVertical, EyeOff, DivideSquare} from 'lucide-react-native';
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
  value: number,
  icon: React.ReactElement,
}

export interface GradeSettings {
  scale: number,
}

interface PapillonAveragesOverTime {
  date: Date,
  value: number,
}

// Pawnote
import { PapillonPeriod } from '../fetch/types/period';
import { PapillonGrades, PapillonGradesViewAverages } from '../fetch/types/grades';

import { calculateSubjectAverage, calculateSubjectMedian } from '../utils/grades/averages';
import PapillonLoading from '../components/PapillonLoading';

const GradesScreen = ({ navigation }: {
  navigation: any // TODO
}) => {
  const UIColors = GetUIColors();
  const appContext = useAppContext();
  const insets = useSafeAreaInsets();
  const { showActionSheetWithOptions } = useActionSheet();

  // Data
  const [hideNotesTab, setHideNotesTab] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [periods, setPeriods] = React.useState<PapillonPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = React.useState<string | null>(null);
  const [grades, setGrades] = React.useState([]);
  const [allGrades, setAllGrades] = React.useState<PapillonGrades | null>(null);
  const [latestGrades, setLatestGrades] = React.useState<PapillonGrades | null>(null);
  const [averages, setAverages] = React.useState<PapillonGradesViewAverages>({} as PapillonGradesViewAverages);
  const [pronoteStudentAverage, setPronoteStudentAverage] = React.useState<number|null>(null);
  const [pronoteClassAverage, setPronoteClassAverage] = React.useState<number|null>(null);
  const [averagesOverTime, setAveragesOverTime] = React.useState<PapillonAveragesOverTime[]>([]);
  const [classAveragesOverTime, setClassAveragesOverTime] = React.useState<PapillonAveragesOverTime[]>([]);
  const [chartLines, setChartLines] = React.useState(null);
  const [chartPoint, setChartPoint] = React.useState(null);
  const [openedSettings, setOpenedSettings] = React.useState<boolean>(true);

  // Constants
  const [gradeSettings, setGradeSettings] = React.useState<GradeSettings>({
    scale: 20,
  });

  // Update gradeSettings when focused
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      AsyncStorage.getItem('gradeSettings').then((value) => {
        if (value) {
          setGradeSettings(JSON.parse(value));
        }
      });

      if (openedSettings) setOpenedSettings(false);
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
        name: 'Moyenne médiane',
        value: averages.median || 0,
        icon: <DivideSquare color={UIColors.text} />,
      },
      {
        name: 'Moyenne max',
        value: averages.max || 0,
        icon: <TrendingUp color={UIColors.text} />,
      },
      {
        name: 'Moyenne min',
        value: averages.min || 0,
        icon: <TrendingDown color={UIColors.text} />,
      },
    ]);
  }, [averages, UIColors.text, pronoteClassAverage]);

  // Update chartLines when averagesOverTime change
  React.useEffect(() => {
    const createLineData = (averages: PapillonAveragesOverTime[]) => averages.map(average => ({
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

  async function getPeriodsFromAPI (): Promise<PapillonPeriod> {
    if (hideNotesTab) return null;
    return appContext.dataProvider!.getUser().then((user) => {
      const periods = user.periodes.grades;

      setPeriods(periods);
      const currentPeriod = periods.find((period) => period.actual)!;

      setSelectedPeriod(currentPeriod.name);
      return currentPeriod;
    });
  }

  function getGradesFromAPI (force = false, periodName = selectedPeriod): Promise<void> {
    if (hideNotesTab) return null;
    if (!isRefreshing) {
      setIsLoading(true);
    }

    try {
      if (appContext.dataProvider && periodName) {
        return appContext.dataProvider.getGrades(periodName, force).then((grades) => {
          if (grades) {
            return parseGrades(grades);
          }
          else {
            return Promise.reject('No grades');
          }
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  function addGradesToSubject(grades: PapillonGrades): Promise<void> {
    const data = grades.averages.map(average => ({ ...average, grades: [] as PapillonGrades['grades'] }));

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
  async function calculateAveragesOverTime (grades: PapillonGrades[], type= 'value'): Promise<Array> {
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
    const [student, group, max, min, median] = await Promise.all([
      calculateSubjectAverage(grades, 'value', gradeSettings.scale),
      calculateSubjectAverage(grades, 'average', gradeSettings.scale),
      calculateSubjectAverage(grades, 'max', gradeSettings.scale),
      calculateSubjectAverage(grades, 'min', gradeSettings.scale),
      calculateSubjectMedian(grades, 'value', gradeSettings.scale),
    ]);

    setAverages({
      student,
      group,
      max,
      min,
      median,
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
    const containerStyle = Platform.OS === 'android' ? { paddingBottom: insets.bottom, backgroundColor: UIColors.background} : null;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex : cancelButtonIndex,
        tintColor: UIColors.primary,
        containerStyle,
      },
      (buttonIndex) => {
        if (typeof buttonIndex !== 'undefined' && buttonIndex !== cancelButtonIndex) {
          setSelectedPeriod(periods[buttonIndex].name);
        }
      }
    );
  }

  // On mount
  React.useEffect(() => { getPeriodsFromAPI(); }, []);
  React.useEffect(() => { getGradesFromAPI(false, selectedPeriod); }, [selectedPeriod]);

  // Header animation
  const yOffset = new Animated.Value(0);

  const scrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: yOffset } } }],
    { useNativeDriver: false }
  );

  const headerOpacity = yOffset.interpolate({
    inputRange: [-40, 0],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const HeaderRight = ({
    navigation,
    periods,
    selectedPeriod,
    UIColors,
    isLoading,
    androidPeriodChangePicker,
    setOpenedSettings
  }: {
    navigation: any,
    periods: PapillonPeriod[]
    selectedPeriod: string | null
  }) => {
    const menuConfig = useMemo(() => ({
      menuTitle: '',
      menuItems: periods.map((period) => ({
        actionKey: period.name,
        actionTitle: period.name,
        menuState: selectedPeriod === period.name ? 'on' : 'off',
      })),
    }), [periods, selectedPeriod]);
  
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginRight: 16,
      }}>
        { isLoading && (
          <ActivityIndicator />
        )}
        <ContextMenuButton
          isMenuPrimaryAction={true}
          menuConfig={menuConfig}
          onPressMenuItem={({ nativeEvent }) => {
            if (nativeEvent.actionKey === selectedPeriod) return;
            setSelectedPeriod(nativeEvent.actionKey);
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
              {selectedPeriod}
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

  //check if notes tab is enable
  async function checkIfTabEnable() {
    let hideNotesTab = await AsyncStorage.getItem('hideNotesTab');
    setHideNotesTab(hideNotesTab === 'true');
  }
  // Change header title
  React.useLayoutEffect(() => {
    checkIfTabEnable();
    navigation.setOptions({
      headerTitle : 'Notes',
      headerRight: () => <HeaderRight
        navigation={navigation}
        periods={periods}
        selectedPeriod={selectedPeriod}
        UIColors={UIColors}
        isLoading={isLoading}
        androidPeriodChangePicker={androidPeriodChangePicker}
        setOpenedSettings={setOpenedSettings}
      />,
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
        style={{ backgroundColor: UIColors.backgroundHigh, flex: 1, paddingTop: Platform.OS === 'ios' && insets.top }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={hideNotesTab ? false:isRefreshing}
            progressViewOffset={Platform.OS === 'ios' ? 100 : 0}
            onRefresh={() => {
              setIsRefreshing(true);
              getGradesFromAPI(true);
            }}
          />
        }
      >
        <StatusBar translucent animated barStyle={UIColors.dark ? 'light-content' : 'dark-content'} backgroundColor={UIColors.backgroundHigh} />

        { insets.top < 24 && Platform.OS === 'ios' && (
          <View style={{ height: 32 }} />
        )}

        {hideNotesTab && (
          <PapillonLoading
            title='Onglet notes désactivé'
            subtitle='Vos notes sont masquées.'
            icon={<EyeOff stroke={UIColors.text}/>}
          />
        )}

        {grades.length === 0 && !hideNotesTab && (
          <PapillonLoading
            title='Aucune note à afficher'
            subtitle='Vos notes apparaîtront ici.'
            icon={<Stats stroke={UIColors.text}/>}
          />
        )}

        { averages.student && averages.student > 0 && !hideNotesTab && (
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

        { latestGrades && latestGrades.length > 0 && !hideNotesTab && (
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

        { averages.student && averages.student > 0 && !hideNotesTab && (
          <GradesAveragesList
            isLoading={isLoading}
            UIaverage={UIaverage}
            gradeSettings={gradeSettings}
          />
        )}
        {!hideNotesTab && (
          <GradesList
            grades={grades}
            allGrades={allGrades}
            gradeSettings={gradeSettings}
            navigation={navigation}
            UIColors={UIColors}
          />
        )}
        <View style={{ height: 56 }} />
      
      </ScrollView>
    </>
  );
};

const LatestGradesList = React.memo(({ isLoading, grades, allGrades, gradeSettings, navigation }) => {
  const UIColors = GetUIColors(null, 'ios');

  const showGrade = useCallback((grade) => {
    navigation.navigate('Grade', {
      grade,
      allGrades: allGrades,
    });
  }, [allGrades, navigation]);

  const typeSignificantType: { [key: string]: string } = {
    '-1|ERROR': 'Erreur',
    '1|ABSENT': 'Abs.',
    '2|EXEMPTED': 'Disp.',
    '3|NOT_GRADED': 'N.not',
    '4|UNFIT': 'Inap.',
    '5|UNRETURNED': 'N.Rdu',
    '6|ABSENT_ZERO': 'Abs.0',
    '7|UNRETURNED_ZERO': 'N.Rdu.0',
    '8|CONGRATULATIONS': 'Félicitations',
  };

  return (<>
    <NativeList
      header="Dernières notes"
      sectionProps={{
        hideSurroundingSeparators: true,
        headerTextStyle: {
          marginLeft: 15,
          marginBottom: 4,
        },
      }}
      containerStyle={
        Platform.OS !== 'ios' ? { backgroundColor: 'transparent' } : void 0
      }
    >
      <View />
    </NativeList>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        subjectStyles.latestGradesList,
        Platform.OS === 'android' && {
          paddingHorizontal: 16,
          overflow: 'visible',
          paddingBottom: 16,
          marginBottom: -16,
        },
      ]}
      style={[{
        marginTop: Platform.OS === 'ios' ? -16 : -8,
        overflow: 'visible',
      }]}
    >
      <View
        style={[
          {
            flexDirection: 'row',
            paddingHorizontal: Platform.OS === 'ios' ? 16 : 0,
            gap: 12,
            overflow: 'visible',
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
              },
              Platform.OS === 'android' && {
                borderColor: UIColors.border,
                borderWidth: 0.5,
                shadowColor: '#00000055',
                elevation: 3,
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
                <NativeText style={subjectStyles.subjectName} numberOfLines={1}>
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
                    {typeSignificantType[grade.grade.value?.type]}
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
  </>);
});

const GradesList = React.memo(({ grades, allGrades, gradeSettings, navigation, UIColors }) => {
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
            inset
            plain
            key={index}
            header={formattedCourseName}
          >
            <Pressable style={[
              subjectStyles.listItem,
              { backgroundColor },
              Platform.OS === 'android' && {
                borderRadius: 6,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                overflow: 'hidden',
              }
            ]}>
              <View style={subjectStyles.subjectInfoContainer}>
                <NativeText style={subjectStyles.subjectName} numberOfLines={1}>
                  {formattedCourseName}
                </NativeText>
              </View>

              <View style={subjectStyles.gradeContainer}>
                <NativeText style={subjectStyles.subjectGradeValue}>
                  {gradeValue !== 'NaN' ? gradeValue : 'N.éval'}
                </NativeText>
                <NativeText style={subjectStyles.subjectGradeScale}>
                  /{gradeScale}
                </NativeText>
              </View>
            </Pressable>

            {subject.grades.map((grade, index) => {
              const typeSignificantType: { [key: string]: string } = {
                '-1|ERROR': 'Erreur',
                '1|ABSENT': 'Abs.',
                '2|EXEMPTED': 'Disp.',
                '3|NOT_GRADED': 'N.not',
                '4|UNFIT': 'Inap.',
                '5|UNRETURNED': 'N.Rdu',
                '6|ABSENT_ZERO': 'Abs.0',
                '7|UNRETURNED_ZERO': 'N.Rdu.0',
                '8|CONGRATULATIONS': 'Félicitations',
              };
              const gradeEmoji = getClosestGradeEmoji(subject.subject.name);
              const gradeValue = grade.grade.value?.value?.toFixed(2) || typeSignificantType[grade.grade.value?.type];
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
                  trailing={
                    <View style={subjectStyles.inGradeView}>
                      {(grade.subjectFile  || grade.correctionFile) && (
                        <File size={20} strokeWidth={2.2} color={UIColors.text} />
                      )}

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
                          <NativeText heading="p" style={subjectStyles.gradeCoef}>
                            Coeff. {grade.grade.coefficient}
                          </NativeText>
                        )}
                      </View>
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
  const UIColors = GetUIColors(null, 'ios');
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
      },
      Platform.OS === 'android' && {
        shadowColor: '#00000055',
        elevation: 3,
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
          <NativeText heading="h2" style={styles.chart.avg.value}>
            {finalAvg.toFixed(2)}
          </NativeText>

          <NativeText heading="p2" style={styles.chart.avg.out_of}>
            /{gradeSettings.scale.toFixed(0)}
          </NativeText>
        </View>
      </View>
      { chartLines[0] && chartLines[0].data.length > 2 ? (
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
      ) : (
        <View style={{height: 8}} />
      )}
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
            {item.value > 0 ? item.value.toFixed(2) : 'N.not'}
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
    <NativeList inset plain header="Moyennes">
      {UIaverage.map(renderNativeItem)}
    </NativeList>
  ), [UIaverage]);

  if (UIaverage.length === 0 && !isLoading) {
    return (
      <NativeList inset plain header="Moyennes">
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

  inGradeView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
