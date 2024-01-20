import React from 'react';
import { Animated, ActivityIndicator, StatusBar, View, Dimensions, StyleSheet, Button, ScrollView, TouchableOpacity, RefreshControl, Easing, Platform } from 'react-native';

// Custom imports
import GetUIColors from '../utils/GetUIColors';
import { useAppContext } from '../utils/AppContext';
import PapillonInsetHeader from '../components/PapillonInsetHeader';
import { SFSymbol } from 'react-native-sfsymbols';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

// Icons
import { BarChart3, Users2, TrendingDown, TrendingUp, Info, AlertTriangle, MoreVertical } from 'lucide-react-native';

// Plugins
import { ContextMenuButton } from 'react-native-ios-context-menu';
import LineChart from 'react-native-simple-line-chart';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const GradesScreen = ({ navigation }) => {
  const UIColors = GetUIColors();
  const appContext = useAppContext();
  const insets = useSafeAreaInsets();

  // Data
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [periods, setPeriods] = React.useState<PapillonPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = React.useState<PapillonPeriod | null>(null);
  const [grades, setGrades] = React.useState([]);
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
        description: 'Moyenne de classe de chaque matière',
        value: averages.group || 0,
        icon: <Users2 color={UIColors.text} />,
      },
      {
        name: 'Moyenne max',
        description: 'Moyenne la plus faible des matières',
        value: averages.max || 0,
        icon: <TrendingDown color={UIColors.text} />,
      },
      {
        name: 'Moyenne min',
        description: 'Moyenne la plus élevée des matières',
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
  }, [averagesOverTime, classAveragesOverTime, UIColors.text]);

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
            >
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
  }, [navigation, periods, selectedPeriod, UIColors, headerOpacity, setOpenedSettings]);

  return (
    <>
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
      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
        style={{ backgroundColor: UIColors.backgroundHigh, flex: 1 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              getPeriodsFromAPI().then((period) => {
                getGradesFromAPI(true, period);
              });
            }}
          />
        }
      >
        <StatusBar animated barStyle={UIColors.dark ? 'light-content' : 'dark-content'} />

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

        <GradesAveragesList
          isLoading={isLoading}
          UIaverage={UIaverage}
          gradeSettings={gradeSettings}
        />
      
      </ScrollView>
    </>
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
  // When loading
  if (isLoading) return (
    <NativeList inset>
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
    <NativeList inset>
      <NativeItem>
        <NativeText heading="p2">
          Aucune moyenne à afficher.
        </NativeText>
      </NativeItem>
    </NativeList>
  );

  // When loaded
  return (
    <NativeList inset>
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
          <NativeText heading="p2">
            {item.name}
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
  chart: {
    container: {
      margin: 16,
      marginTop: 6,
      marginBottom: 0,
      borderRadius: 12,
      borderCurve: 'continuous',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
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

export default GradesScreen;
