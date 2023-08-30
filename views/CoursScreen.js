import * as React from 'react';
import { useCallback } from 'react';
import { View, StyleSheet, StatusBar, Platform, Pressable, ActivityIndicator, RefreshControl, Modal, TouchableOpacity } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { ScrollView } from 'react-native-gesture-handler';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale, NativePressableScale } from 'react-native-pressable-scale';

import InfinitePager from 'react-native-infinite-pager'
import {getTimetable} from '../fetch/PronoteData/PronoteTimetable';

import {useState, useEffect, useRef} from 'react';

import DateTimePicker from '@react-native-community/datetimepicker';

import formatCoursName from '../utils/FormatCoursName';
import getClosestColor from '../utils/ColorCoursName';

import UnstableItem from '../components/UnstableItem';

import { Activity, Calendar, Info } from 'lucide-react-native';
import { set } from 'react-native-reanimated';

const calcDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function CoursScreen({ navigation }) {
  const theme = useTheme();
  const pagerRef = useRef(null);

  const [today, setToday] = useState(new Date());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [calendarDate, setCalendarDate] = useState(today);
  const [cours, setCours] = useState({});
  const todayRef = useRef(today);
  const coursRef = useRef(cours);

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        Platform.OS === 'ios' ? (
          <DateTimePicker 
            value={calendarDate}
            locale='fr-FR'
            mode='date'
            display='compact'
            onChange={(event, date) => {
              setCalendarAndToday(date);
              pagerRef.current.setPage(0);
              if (currentIndex === 0) {
                setCurrentIndex(1);
                setTimeout(() => {
                  setCurrentIndex(0);
                }, 10);
              }
            }}
          />
        ) : (
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 2}} onPress={() => setCalendarModalOpen(true)}>
            <Calendar size={20} color={theme.dark ? '#ffffff' : '#000000'} />
            <Text style={{fontSize: 15, fontFamily: 'Papillon-Medium'}}>{new Date(calendarDate).toLocaleDateString('fr', {weekday: 'short', day: '2-digit', month:'short'})}</Text>
          </TouchableOpacity>
        )
      ),
    });
  }, [navigation, calendarDate]);

  const setCalendarAndToday = (date) => {
    setCalendarDate(date);
    setToday(date);
  };

  const updateCoursForDate = async (dateOffset, setDate) => {
    const newDate = calcDate(setDate, dateOffset);
    console.log("Update cours" + newDate.toLocaleDateString());
    if (!coursRef.current[newDate.toLocaleDateString()]) {
      const result = await getTimetable(newDate);
      setCours((prevCours) => ({
        ...prevCours,
        [newDate.toLocaleDateString()]: result,
      }));
    }
  };

  const handlePageChange = (page) => {
    const newDate = calcDate(todayRef.current, page);
    setCurrentIndex(page);
    setCalendarDate(newDate);

    for (let i = -2; i <= 2; i++) {
      updateCoursForDate(i, newDate);
    }
  };

  const forceRefresh = async () => {
    const newDate = calcDate(todayRef.current, 0);
    const result = await getTimetable(newDate);
    setCours((prevCours) => ({
      ...prevCours,
      [newDate.toLocaleDateString()]: result,
    }));
  };

  useEffect(() => {
    todayRef.current = today;
    coursRef.current = cours;
  }, [today, cours]);

  return (
    <>
      <View contentInsetAdjustmentBehavior="automatic" style={[styles.container, {backgroundColor: theme.dark ? "#000000" : "#f2f2f7"}]}>
        { Platform.OS === 'android' && calendarModalOpen ? (
              <DateTimePicker 
                value={calendarDate}
                locale='fr-FR'
                mode='date'
                display='calendar'
                onChange={(event, date) => {
                  if(event.type === 'dismissed') {
                    setCalendarModalOpen(false);
                    return;
                  }

                  setCalendarModalOpen(false);

                  setCalendarAndToday(date);
                  pagerRef.current.setPage(0);
                  if (currentIndex === 0) {
                    setCurrentIndex(1);
                    setTimeout(() => {
                      setCurrentIndex(0);
                    }, 10);
                  }
                }}
              />
          ) : null }

        <StatusBar animated barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor='transparent' />

        <InfinitePager
          style={[styles.viewPager]}
          pageWrapperStyle={[styles.pageWrapper]}
          onPageChange={handlePageChange}
          ref={pagerRef}
          pageBuffer={4}
          gesturesDisabled={false}
          renderPage={
            ({ index }) => (
              <>
                { cours[calcDate(today, index).toLocaleDateString()] ?
                <CoursPage cours={cours[calcDate(today, index).toLocaleDateString()] || []} navigation={navigation} theme={theme} forceRefresh={forceRefresh} />
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
        <Text numberOfLines={1} style={[styles.ctStart]}>{formattedStartTime()}</Text>
        <Text numberOfLines={1} style={[styles.ctEnd]}>{formattedEndTime()}</Text>
      </View>
      <PressableScale
        weight="light"
        delayLongPress={100}
        style={[
          styles.coursItemContainer,
          { backgroundColor: theme.dark ? '#111111' : '#ffffff' },
        ]}
        onPress={handleCoursPressed}
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

const CoursPage = ({ cours, navigation, theme, forceRefresh }) => {
  const CoursPressed = useCallback(
    (cours) => {
      navigation.navigate('Lesson', { event: cours });
    },
    [navigation]
  );

  const [isHeadLoading, setIsHeadLoading] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsHeadLoading(true);

    forceRefresh().then(() => {
      setIsHeadLoading(false);
    });
  }, []);

  return (
    <ScrollView 
      style={[styles.coursContainer]}
      nestedScrollEnabled={true}
      refreshControl={
        <RefreshControl refreshing={isHeadLoading} onRefresh={onRefresh} colors={[Platform.OS === 'android' ? '#29947A' : null]} />
      }
    >
      {cours.length === 0 ? (
        <Text style={[styles.noCourses]}>Aucun cours</Text>
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
    elevation: 1,
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

  noCourses: {
    fontSize: 17,
    fontWeight: 400,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default CoursScreen;