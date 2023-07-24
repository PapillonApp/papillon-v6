import * as React from 'react';
import { View, Animated, Easing, SafeAreaView, StyleSheet, StatusBar, Platform, Button } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import PapillonHeader from '../components/PapillonHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import formatCoursName from '../utils/FormatCoursName';

import { useState, useEffect } from 'react';
import { getTimetable } from '../fetch/PronoteData/PronoteTimetable';

import { DatePickerModal, fr, registerTranslation } from 'react-native-paper-dates';

import WeekView, { addLocale } from 'react-native-week-view';

import { useColorScheme } from 'react-native';

let currentDate = new Date();

addLocale('fr', {
  months: 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
  monthsShort: 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
  weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
  weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
});

registerTranslation('fr', fr);

function loadCourses(currentEvents, date) {
  return getTimetable(date.toISOString().slice(0, 10)).then((result) => {
    let events = currentEvents;

    result.forEach((course) => {
      // if already in events, remove it
      events = events.filter((event) => event.id != course.id);

      let start = new Date(course.start);
      let end = new Date(course.end);

      events.push({
        id: course.id,
        description: course.subject.name,
        startDate: new Date(start),
        endDate: new Date(end),
        color: course.background_color,
        cours: course,
      });
    });

    return events;
  });
}

const weekViewRef = React.createRef()

function CoursItem({ event }) {
  const [itemSize, setItemSize] = useState({});
  const theme = useTheme();

  const onLayout=(event)=> {
    setItemSize(event.nativeEvent.layout)
  }

  // make a copy of event
  let finalEvent = JSON.parse(JSON.stringify(event));

  let cancelled = false;

  if(!finalEvent.cours.rooms[0].startsWith("Salle")) {
    finalEvent.cours.rooms[0] = "Salle " + finalEvent.cours.rooms[0];
  }

  if(finalEvent.cours.is_cancelled) {
    finalEvent.cours.color = '#B42828';
    finalEvent.cours.status = '';
    cancelled = true;
  }

  let textColor = theme.dark ? '#fff' : '#000';
  
  // animation
  const [fadeCours, setFadeCours] = useState(new Animated.Value(0));
  const [animateCours, setAnimateCours] = useState(new Animated.Value(0.9));
  const [translateCours, setTranslateCours] = useState(new Animated.Value(10));

  useEffect(() => {
    Animated.timing(fadeCours, {
      toValue: 1,
      duration: 100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(animateCours, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(translateCours, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View 
      style={[styles.coursContainer, {backgroundColor: theme.dark ? '#111' : '#fff', opacity: fadeCours, transform: [{scale: animateCours}, {translateY: translateCours}]}]}
      onLayout={onLayout}
    >
      <View style={[styles.cours, {backgroundColor: !cancelled ? finalEvent.color + '18' : '#B4282800'}]}>
        <View style={[styles.coursColor, {backgroundColor: !cancelled ? finalEvent.color : '#B42828'}]}></View>
        <View style={styles.coursData}>
          <Text style={styles.coursDataTime}>{new Date(finalEvent.startDate).toLocaleDateString('fr', {hour: '2-digit', minute:'2-digit'}).split(" ")[1]}</Text>
          <Text numberOfLines={1} style={[styles.coursDataSubject, {opacity: cancelled ? 0.5 : 1}]}>{formatCoursName(finalEvent.cours.subject.name)}</Text>

          <Text numberOfLines={1} style={[styles.coursDataStatus, {display: itemSize.width < 180 ? 'none' : 'flex'}]}>{finalEvent.cours.status}</Text>

          <View style={[styles.coursDataDetails, {display: itemSize.height < 78 ? 'none' : 'flex'}]}>
            <Text numberOfLines={1} style={[styles.coursDataRoom, {color : cancelled ? '#B42828' : textColor}]}>{cancelled ? "Cours annulé" : finalEvent.cours.rooms[0]}</Text>
            <Text numberOfLines={1} style={[styles.coursDataTeacher, {display: itemSize.height < 90 ? 'none' : 'flex'}]}>{finalEvent.cours.teachers[0]}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  )
}

function PapillonAgenda({ events, dayPress, navigation }) {
  const theme = useTheme();
  const scheme = useColorScheme();

  const [refreshing, setRefreshing] = useState(false);

  const [myEvents, setMyEvents] = useState([]);
  const [loadedDays, setLoadedDays] = useState([]);

  const dateChanged = (date) => {
    // add 1 day to date
    date.setDate(date.getDate() + 1);

    // check if date is in loadedDays
    if (loadedDays.includes(date.toISOString().slice(0, 10))) {
      // if yes, set currentDate to date
      currentDate = date;
    }
    else {
      // if no, load courses for date
      currentDate = date;
      onRefresh()
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    loadCourses(myEvents, currentDate).then((result) => {
      setMyEvents(result);
      setRefreshing(false);

      // add currentDate to loadedDays
      setLoadedDays([...loadedDays, currentDate.toISOString().slice(0, 10)]);
    });
  }

  useEffect(() => {
    onRefresh();
  }, []);

  const [open, setOpen] = React.useState(false);
  const [rnDate, setRnDate] = useState(new Date());

  function openCalendar() {
    setRnDate(new Date(currentDate));
    setOpen(true);
  }

  function eventPressed(e) {
    navigation.navigate('Lesson', { event: e.cours });
  }

  const onDismissSingle = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = React.useCallback(
    (params) => {
      setOpen(false);
      setRnDate(params.date);

      handleConfirm(params.date);
    },
    [setOpen, setRnDate]
  );

  const handleConfirm = (date) => {
    // remove 1 day to date
    date.setDate(date.getDate() - 1);

    dateChanged(date);
    weekViewRef.current.goToDate(date);
  };

  return (
    <>
      <DatePickerModal
        locale='fr'
        mode="single"
        visible={open}
        onDismiss={onDismissSingle}
        date={rnDate}
        onConfirm={onConfirmSingle}
        label="Sélectionner une date"
        saveLabel="Valider"
      />

      <WeekView
        events={myEvents}
        selectedDate={currentDate}
        numberOfDays={1}
        pageStartAt={{ weekday: 1 }}
        showNowLine={true}
        showTitle={false}
        locale='fr'
        hoursInDisplay={9}
        beginAgendaAt={7*60}
        endAgendaAt={19*60}

        formatDateHeader="dddd D MMMM"

        isRefreshing={refreshing}

        ref={weekViewRef}

        headerStyle={{...styles.header, backgroundColor: theme.dark ? '#111' : '#fff', borderColor: theme.dark ? '#191919' : '#e5e5e5' }}
        headerTextStyle={{...styles.headerText, color: theme.dark ? '#fff' : "#000" }}
        hourTextStyle={{...styles.hourText, color: theme.dark ? '#fff' : "#000" }}
        eventContainerStyle={styles.eventContainer}
        gridColumnStyle={{...styles.gridColumn, borderColor: theme.dark ? '#191919' : '#e5e5e5' }}
        gridRowStyle={{...styles.gridRow, borderColor: theme.dark ? '#888' : '#888' }}
        hourContainerStyle={styles.hourContainer}

        onSwipeNext={dateChanged}
        onSwipePrev={dateChanged}

        onDayPress={openCalendar}

        onEventPress={(event) => {eventPressed(event)}}

        EventComponent={CoursItem}
      />
    </>
  )
}

function CoursScreen({ navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View contentInsetAdjustmentBehavior="automatic" style={[styles.container, {backgroundColor: theme.dark ? '#050505' : '#F2F2F7'}]}>
      <View style={[{flex: 1}]}>
        <PapillonAgenda
          navigation={navigation}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    
  },
  headerText: {
    fontSize: 17,
    fontFamily: 'Papillon-Medium',
  },
  hourText: {
    fontSize: 14,
    textAlign: 'center',
    opacity : 0.35,
    marginTop: -1,
    fontFamily: 'Papillon-Medium',
  },
  gridColumn: {
    borderLeftWidth: 0,
  },
  gridRow: {
    opacity: 0.15,
  },
  eventContainer: {
    backgroundColor: 'transparent',
  },

  coursContainer: {
    backgroundColor: '#fff',
    borderRadius: 0,
    overflow: 'hidden',

    width: '108.5%',
    marginLeft: '8.5%',

    height: '100%',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: .5,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cours: {
    flexDirection: 'row',
    flex: 1,
  },
  coursColor: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,

    width: 4,
  },
  coursData: {
    marginHorizontal: 14,
    marginVertical: 8,
    flex: 1,
  },

  coursDataTime: {
    fontSize: 13,
    opacity: 0.6,
  },
  coursDataSubject: {
    marginTop: 1,
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
    flex: 1,
  },
  coursDataStatus: {
    fontSize: 13,
    opacity: 0.5,
    fontWeight: 400,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  coursDataDetails: {
    position: 'absolute',
    bottom: 0,
    flex : 1,
  },

  coursDataRoom: {
    fontWeight: 500,
    flex: 1,
    fontSize: 13,
  },
  coursDataTeacher: {
    marginTop: 1,
    fontWeight: 500,
    opacity: 0.6,
    flex: 1,
    fontSize: 13,
  },
  dayButton: {
    textAlign: 'right',
  }
});

export default CoursScreen;