import * as React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Platform, Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from 'react-native-pressable-scale';

import PagerView from 'react-native-pager-view';
import {getTimetable} from '../fetch/PronoteData/PronoteTimetable';

import {useState, useEffect, useRef} from 'react';

import DateTimePicker from '@react-native-community/datetimepicker';

import formatCoursName from '../utils/FormatCoursName';

import UnstableItem from '../components/UnstableItem';

import { Info } from 'lucide-react-native';

function CoursScreen({ navigation }) {
  const theme = useTheme();

  // setting dates
  const previousDate = new Date();
  previousDate.setDate(previousDate.getDate() - 1);

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 1);

  const [currentDate, setCurrentDate] = useState({
    previous : previousDate,
    current : new Date(),
    next : nextDate,
  });

  // add datetime picker to headerRight on iOS
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <UnstableItem text="Instable" />
      ),
      headerRight: () => (
        Platform.OS === 'ios' ? (
          <DateTimePicker 
            value={new Date(currentDate.current)}
            locale='fr-FR'
            mode='date'
            display='compact'
            onChange={(event, date) => {
              if (date) {
                let newPreviousDate = new Date(date);
                let newCurrentDate = new Date(date);
                let newNextDate = new Date(date);
                newPreviousDate.setDate(newPreviousDate.getDate() - 1);
                newCurrentDate.setDate(newCurrentDate.getDate());
                newNextDate.setDate(newNextDate.getDate() + 1);
                setCurrentDate({
                  previous : newPreviousDate,
                  current : newCurrentDate,
                  next : newNextDate,
                });
                GetCours(newCurrentDate);
                GetCours(newPreviousDate);
                GetCours(newNextDate);
              }
            }}
          />
        ) : null
      ),
    });
  }, [navigation, currentDate]);

  // ref
  const pagerViewRef = useRef(null);

  // move dates
  function moveDate(direction) {
    let newPreviousDate = new Date(currentDate.previous);
    let newCurrentDate = new Date(currentDate.current);
    let newNextDate = new Date(currentDate.next);

    newPreviousDate.setDate(newPreviousDate.getDate() + direction);
    newCurrentDate.setDate(newCurrentDate.getDate() + direction);
    newNextDate.setDate(newNextDate.getDate() + direction);

    setCurrentDate({
      previous : new Date(newPreviousDate),
      current : new Date(newCurrentDate),
      next : new Date(newNextDate),
    });
  }

  const [allCours, setAllCours] = useState({});

  const PageSelected = (event) => {
    PageScroll(event);
  }

  const PageScroll = (event) => {
    // calculate direction
    let position = event.nativeEvent.position;
    let direction = position - 2;

    // move dates
    moveDate(direction);

    let day0 = new Date(currentDate.current);
    let day1 = new Date(currentDate.current);
    let day2 = new Date(currentDate.current);
    let day3 = new Date(currentDate.current);

    day0.setDate(day0.getDate() - 1);
    day1.setDate(day1.getDate());
    day2.setDate(day2.getDate() + 1);
    day3.setDate(day3.getDate() + 2);

    if(!allCours[day0.toLocaleDateString()]) {
      GetCours(day0);
    }

    if(!allCours[day1.toLocaleDateString()]) {
      GetCours(day1);
    }

    if(!allCours[day2.toLocaleDateString()]) {
      GetCours(day2);
    }

    if(!allCours[day3.toLocaleDateString()]) {
      GetCours(day3);
    }

    // move page
    pagerViewRef.current.setPageWithoutAnimation(2);
  };

  const GetCours = (date) => {
    let newDate = new Date(date);

    getTimetable(newDate).then((result) => {
      let newAllCours = allCours;
      newAllCours[newDate.toLocaleDateString()] = result;
      setAllCours(newAllCours);
    });
  }

  return (
    <>
      <View contentInsetAdjustmentBehavior="automatic" style={[styles.container, {backgroundColor: theme.dark ? "#000000" : "#f2f2f7"}]}>
        <PagerView 
          style={styles.viewPager}
          initialPage={2}
          overdrag={false}
          onPageSelected={PageSelected}
          ref={pagerViewRef}
        >
          <View style={styles.page} key="1">
            {allCours[currentDate.previous.toLocaleDateString()] ? (
              <CoursPage cours={allCours[currentDate.previous.toLocaleDateString()]} navigation={navigation} />
            ) : null}
          </View>

          <View style={styles.page} key="2">
            {allCours[currentDate.previous.toLocaleDateString()] ? (
              <CoursPage cours={allCours[currentDate.previous.toLocaleDateString()]} navigation={navigation} />
            ) : null}
          </View>

          <View style={styles.page} key="3">
            {allCours[currentDate.current.toLocaleDateString()] ? (
              <CoursPage cours={allCours[currentDate.current.toLocaleDateString()]} navigation={navigation} />
            ) : null}
          </View>

          <View style={styles.page} key="4">
            {allCours[currentDate.next.toLocaleDateString()] ? (
              <CoursPage cours={allCours[currentDate.next.toLocaleDateString()]} navigation={navigation} />
            ) : null}
          </View>

          <View style={styles.page} key="5">
            {allCours[currentDate.next.toLocaleDateString()] ? (
              <CoursPage cours={allCours[currentDate.next.toLocaleDateString()]} navigation={navigation} />
            ) : null}
          </View>
        </PagerView>
      </View>
    </>
  );
}

function CoursPage({ cours, navigation }) {
  const theme = useTheme();

  const CoursPressed = (cours) => {
    navigation.navigate('Lesson', {event: cours});
  }

  return (
    <ScrollView style={[styles.coursContainer]}>
      {cours.length == 0 ? (
        <Text style={[styles.ctEnd, {textAlign: 'center'}]}>Aucun cours</Text>
      ) : null}

      {cours.map((cours, index) => (
        <View key={index} style={[styles.fullCours]}>
          <View style={[styles.coursTimeContainer]}>
            <Text style={[styles.ctStart]}>{new Date(cours.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
            <Text style={[styles.ctEnd]}>{new Date(cours.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
          </View>
          <PressableScale weight="light" activeScale={0.89} style={[styles.coursItemContainer, {backgroundColor: theme.dark ? "#111111" : "#ffffff"}]} onPress={() => {CoursPressed(cours)}}>
            <View key={index} style={[styles.coursItem, {backgroundColor: cours.background_color + "22"}]}>
              <View style={[styles.coursColor, {backgroundColor: cours.background_color}]}></View>
              <View style={[styles.coursInfo]}>
                <Text style={[styles.coursTime]}>{new Date(cours.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                <Text style={[styles.coursMatiere]}>{formatCoursName(cours.subject.name)}</Text>

                <Text style={[styles.coursSalle]}>Salle {cours.rooms[0]}</Text>
                <Text style={[styles.coursProf]}>{cours.teachers[0]}</Text>

                { cours.status && !cours.is_cancelled ? (
                  <View style={[styles.coursStatus, {backgroundColor: theme.dark ? '#ffffff16' : "#00000016"}]}>
                    <Info size={20} color={theme.dark ? '#ffffff' : "#000000"} />
                    <Text style={[styles.coursStatusText]}>{cours.status}</Text>
                  </View>
                ) : null }

                { cours.status && cours.is_cancelled ? (
                  <View style={[styles.coursStatus, styles.coursStatusCancelled]}>
                    <Info size={20} color="#fff" />
                    <Text style={[styles.coursStatusText, styles.coursStatusCancelledText]}>{cours.status}</Text>
                  </View>
                ) : null }
              </View>
            </View>
          </PressableScale>
        </View>
      ))}

      <View style={{height: 12}}></View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewPager: {
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