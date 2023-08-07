import * as React from 'react';
import { useCallback } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Platform, Pressable, ActivityIndicator } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale, NativePressableScale } from 'react-native-pressable-scale';

import InfinitePager from 'react-native-infinite-pager'
import {getTimetable} from '../fetch/PronoteData/PronoteTimetable';

import {useState, useEffect, useRef} from 'react';

import DateTimePicker from '@react-native-community/datetimepicker';

import formatCoursName from '../utils/FormatCoursName';
import getClosestColor from '../utils/ColorCoursName';

import UnstableItem from '../components/UnstableItem';

import { Activity, Info } from 'lucide-react-native';

const calcDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function CoursScreen({ navigation }) {
  const theme = useTheme();

  // global date
  const [today, setToday] = useState(new Date());
  const [currentIndex, setCurrentIndex] = useState(0);

  // calendar date
  const [calendarDate, setCalendarDate] = useState(new Date());

  // cours 
  const [cours, setCours] = useState({});

  const pagerRef = useRef(null);

  // add datetime picker to headerRight on iOS
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <UnstableItem text="Instable" />
      ),
      headerRight: () => (
        Platform.OS === 'ios' ? (
          <DateTimePicker 
            value={calendarDate}
            locale='fr-FR'
            mode='date'
            display='compact'
            onChange={(event, date) => {
              setCalendarDate(date);
              setToday(date);

              pagerRef.current.setPage(0);

              if(currentIndex == 0) {
                setCurrentIndex(1);
                setTimeout(() => {
                  setCurrentIndex(0);
                }, 10);
              }
            }}
          />
        ) : null
      ),
    });
  }, [navigation, calendarDate, today, pagerRef]);

  const todayRef = useRef(today);
  const coursRef = useRef(cours);

  const handlePageChange = (page) => {
    const newDate = calcDate(todayRef.current, page);
    setCurrentIndex(page);
    setCalendarDate(newDate);

    if(!cours[calcDate(newDate, -2).toLocaleDateString()]) {
      getTimetable(calcDate(newDate, -2)).then((result) => {
        setCours((cours) => {
          cours[calcDate(newDate, -2).toLocaleDateString()] = result;
          return cours;
        });
      });
    }

    if(!cours[calcDate(newDate, -1).toLocaleDateString()]) {
      getTimetable(calcDate(newDate, -1)).then((result) => {
        setCours((cours) => {
          cours[calcDate(newDate, -1).toLocaleDateString()] = result;
          return cours;
        });
      });
    }

    if(!cours[calcDate(newDate, 0).toLocaleDateString()]) {
      getTimetable(calcDate(newDate, 0)).then((result) => {
        setCours((cours) => {
          cours[calcDate(newDate, 0).toLocaleDateString()] = result;
          return cours;
        });
      });
    }

    if(!cours[calcDate(newDate, 1).toLocaleDateString()]) {
      getTimetable(calcDate(newDate, 1)).then((result) => {
        setCours((cours) => {
          cours[calcDate(newDate, 1).toLocaleDateString()] = result;
          return cours;
        });
      });
    }

    if(!cours[calcDate(newDate, 2).toLocaleDateString()]) {
      getTimetable(calcDate(newDate, 2)).then((result) => {
        setCours((cours) => {
          cours[calcDate(newDate, 2).toLocaleDateString()] = result;
          return cours;
        });
      });
    }
  };

  useEffect(() => {
    todayRef.current = today;
    coursRef.current = cours;
  }, [today]);

  return (
    <>
      <View contentInsetAdjustmentBehavior="automatic" style={[styles.container, {backgroundColor: theme.dark ? "#000000" : "#f2f2f7"}]}>
        <InfinitePager
          style={[styles.viewPager]}
          pageWrapperStyle={[styles.pageWrapper]}
          onPageChange={handlePageChange}
          ref={pagerRef}
          pageBuffer={4}
          renderPage={
            ({ index }) => (
              <>
                { cours[calcDate(today, index).toLocaleDateString()] ?
                <CoursPage cours={cours[calcDate(today, index).toLocaleDateString()] || []} navigation={navigation} theme={theme} />
                : 
                <View style={[styles.coursContainer]}>
                  <ActivityIndicator size="small" />
                </View>
                }
              </>
            )
          }
        />
      </View>
    </>
  );
}

const CoursItem = React.memo(({ cours, theme, CoursPressed }) => {
  const formattedStartTime = useCallback(
    () => new Date(cours.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [cours.start]
  );

  const formattedEndTime = useCallback(
    () => new Date(cours.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [cours.end]
  );

  const handleCoursPressed = useCallback(() => {
    CoursPressed(cours);
  }, [CoursPressed, cours]);

  return (
    <View style={[styles.fullCours]}>
      <View style={[styles.coursTimeContainer]}>
        <Text style={[styles.ctStart]}>{formattedStartTime()}</Text>
        <Text style={[styles.ctEnd]}>{formattedEndTime()}</Text>
      </View>
      <PressableScale
        weight="light"
        delayLongPress={100}
        style={[
          styles.coursItemContainer,
          { backgroundColor: theme.dark ? '#111111' : '#ffffff' },
        ]}
        onLongPress={handleCoursPressed}
      >
        <View
          style={[
            styles.coursItem,
            { backgroundColor: getClosestColor(cours.background_color) + '22' },
          ]}
        >
          <View style={[styles.coursColor, { backgroundColor: getClosestColor(cours.background_color) }]} />
          <View style={[styles.coursInfo]}>
            <Text style={[styles.coursTime]}>{formattedStartTime()}</Text>
            <Text style={[styles.coursMatiere]}>{formatCoursName(cours.subject.name)}</Text>

            <Text style={[styles.coursSalle]}>Salle {cours.rooms[0]}</Text>
            <Text style={[styles.coursProf]}>{cours.teachers[0]}</Text>

            {cours.status && (
              <View
                style={[
                  styles.coursStatus, { backgroundColor: getClosestColor(cours.background_color) + '22' },
                  cours.is_cancelled ? styles.coursStatusCancelled : null
                ]}
              >
                {cours.is_cancelled ? (
                <Info size={20} color={'#ffffff'} />
                ) : (
                <Info size={20} color={theme.dark ? '#ffffff' : '#000000'} />
                )}

                <Text style={[styles.coursStatusText, {color: theme.dark ? '#ffffff' : '#000000'}, cours.is_cancelled ? styles.coursStatusCancelledText : null]}>
                  {cours.status}
                </Text>
              </View>
            )}
          </View>
        </View>
      </PressableScale>
    </View>
  );
});

const CoursPage = ({ cours, navigation, theme }) => {
  const CoursPressed = useCallback(
    (cours) => {
      navigation.navigate('Lesson', { event: cours });
    },
    [navigation]
  );

  return (
    <ScrollView style={[styles.coursContainer]}>
      {cours.length === 0 ? (
        <Text style={[styles.ctEnd, { textAlign: 'center' }]}>Aucun cours</Text>
      ) : null}

      {cours.map((cours, index) => (
        <CoursItem
          key={index}
          cours={cours}
          theme={theme}
          CoursPressed={CoursPressed}
        />
      ))}

      <View style={{ height: 12 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewPager: {
    flex: 1,
  },
  pageWrapper: {
    flex: 1,
  },

  coursContainer: {
    flex: 1,
    padding: 12,
  },

  fullCours: {
    width: '100%',
    marginBottom: 10,
    flexDirection: 'row',
  },
  coursTimeContainer: {
    width: 56,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  ctStart: {
    fontSize: 18,
    fontWeight: 600,
    fontFamily: 'Papillon-Semibold',
  },
  ctEnd: {
    fontSize: 15,
    fontWeight: 400,
    opacity: 0.5,
    fontFamily: 'Papillon-Regular',
  },
  
  coursItemContainer: {
    flex: 1,
    borderRadius: 12,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  coursItem: {
    flex: 1,
    flexDirection: 'row',
  },
  coursColor: {
    width: 4,
    height: '100%',
  },
  coursInfo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 1,
  },
  coursTime: {
    fontSize: 14,
    opacity: 0.5,
  },
  coursMatiere: {
    fontSize: 18,
    fontFamily: 'Papillon-Semibold',
    marginBottom: 10,
  },
  coursSalle: {
    fontSize: 15,
    fontWeight: 500,
  },
  coursProf: {
    fontSize: 15,
    fontWeight: 400,
    opacity: 0.5,
  },

  coursStatus: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,

    borderRadius: 8,
    borderCurve: 'continuous',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  coursStatusText: {
    fontSize: 15,
    fontWeight: 500,
  },

  coursStatusCancelled: {
    backgroundColor: '#B42828',
  },
  coursStatusCancelledText: {
    color: '#fff',
  },
});

export default CoursScreen;