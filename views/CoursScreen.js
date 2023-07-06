import * as React from 'react';
import { View, SafeAreaView, StyleSheet, StatusBar, Platform, Button } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { useState, useEffect } from 'react';
import { getTimetable } from '../fetch/PronoteData/PronoteTimetable';

import DateTimePickerModal from "react-native-modal-datetime-picker";

import WeekView, { addLocale } from 'react-native-week-view';

import { useColorScheme } from 'react-native';

let currentDate = new Date();

addLocale('fr', {
  months: 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
  monthsShort: 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
  weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
  weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
});

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
      });
    });

    return events;
  });
}

function PapillonAgendaCourse(item) {
  return (
    <View>
      <Text>{item.name}</Text>
    </View>
  )
}

const weekViewRef = React.createRef()

function PapillonAgenda({ events, dayPress }) {
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
      onRefresh();
      // add date to loadedDays
      setLoadedDays([...loadedDays, date.toISOString().slice(0, 10)]);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    loadCourses(myEvents, currentDate).then((result) => {
      setMyEvents(result);
      setRefreshing(false);
    });
  }

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <>
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

        onDayPress={(date, formattedDate) => dayPress(date, formattedDate)}
      />
    </>
  )
}

function CoursScreen({ navigation }) {
  const theme = useTheme();

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [rnDate, setRnDate] = useState(new Date());

  function openCalendar(date) {
    setRnDate(currentDate);
    showDatePicker();
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    hideDatePicker();
    dateChanged(date);
    weekViewRef.current.goToDate(date);
  };

  return (
    <>
      <PapillonAgenda dayPress={openCalendar} />

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={rnDate}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}

        confirmTextIOS="Sélectionner"
        cancelTextIOS="Annuler"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
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
    opacity: 0.25,
  },
});

export default CoursScreen;