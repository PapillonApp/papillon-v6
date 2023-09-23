import * as React from 'react';
import { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { ContextMenuView } from 'react-native-ios-context-menu';

import { ScrollView } from 'react-native-gesture-handler';

import { PressableScale } from 'react-native-pressable-scale';

import InfinitePager from 'react-native-infinite-pager';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Info } from 'lucide-react-native';

import formatCoursName from '../utils/FormatCoursName';
import getClosestColor from '../utils/ColorCoursName';
import { getClosestCourseColor } from '../utils/ColorCoursName';
import getClosestGradeEmoji from '../utils/EmojiCoursName';

import GetUIColors from '../utils/GetUIColors';
import { IndexData } from '../fetch/IndexData';

import * as ExpoCalendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';

const calcDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

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

  async function addToCalendar(cours) {
    Alert.alert(
      'Cette fonctionnalité n\'est pas encore disponible',
      'Nous travaillons sur cette fonctionnalité. Elle sera disponible dans une prochaine mise à jour.',
      [
        {
          text: 'OK',
          style: 'cancel'
        },
      ]
    );

    // Attendre que https://github.com/expo/expo/pull/24545 soit prêt !!!

    /*
      // get calendar permission
      const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        // get default calendar
        const calendars = await ExpoCalendar.getCalendarsAsync();
        const defaultCalendar = calendars.find(
          (calendar) => calendar.source.name === 'Default'
        );
      }
      else {
        console.log('Permission refusée');
        Alert.alert(
          'Permission refusée',
          'Vous devez autoriser l\'application à accéder à votre calendrier pour pouvoir ajouter des cours au calendrier.',
          [
            {
              text: 'OK',
              style: 'cancel'
            },
          ]
        );
      }
    */
  };

  async function notifyAll(cours) {
    // for each cours
    for (let i = 0; i < cours.length; i++) {
      const lesson = cours[i];
      const identifier = lesson.subject.name + new Date(lesson.start).getTime();

      // if notification already exists
      Notifications.getAllScheduledNotificationsAsync().then((value) => {
        // if item.identifier is found in value
        for (const item of value) {
          if (item.identifier === identifier) {
            // cancel it
            Notifications.cancelScheduledNotificationAsync(identifier);
            break;
          }
        }
      });

      let time = new Date(lesson.start);
      time.setMinutes(time.getMinutes() - 5);

      // schedule notification
      Notifications.scheduleNotificationAsync({
        identifier: identifier,
        content: {
          title: `${getClosestGradeEmoji(lesson.subject.name)} ${lesson.subject.name} - Ça commence dans 5 minutes`,
          body: `Le cours est en salle ${lesson.rooms[0]} avec ${lesson.teachers[0]}.`,
          sound: 'papillon_ding.wav',
        },
        trigger: {
          channelId: 'coursReminder',
          date: new Date(time),
        },
      });
    }

    // alert user
    Alert.alert(
      'Notifications activées',
      'Vous recevrez une notification pour chaque cours de la journée.',
      [
        {
          text: 'OK',
          style: 'cancel'
        },
      ]
    );
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        Platform.OS === 'ios' ? (
          <ContextMenuView
            previewConfig={{
              borderRadius: 8,
            }}
            menuConfig={{
              menuTitle: calendarDate.toLocaleDateString('fr', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }),
              menuItems: [
                {
                  actionKey  : 'addtoCalendar',
                  actionTitle: 'Ajouter au calendrier',
                  actionSubtitle: 'Ajoute tous les cours de la journée au calendrier',
                  icon: {
                    type: 'IMAGE_SYSTEM',
                    imageValue: {
                      systemName: 'calendar.badge.plus',
                    },
                  },
                },
                {
                  actionKey  : 'notifyAll',
                  actionTitle: 'Programmer les notifications',
                  actionSubtitle: 'Vous notifiera 5 min. avant chaque cours',
                  icon: {
                    type: 'IMAGE_SYSTEM',
                    imageValue: {
                      systemName: 'bell.badge.fill',
                    },
                  },
                },
              ],
            }}
            onPressMenuItem={({nativeEvent}) => {
              if (nativeEvent.actionKey === 'addtoCalendar') {
                addToCalendar(cours[calendarDate.toLocaleDateString()]);
              }
              else if (nativeEvent.actionKey === 'notifyAll') {
                notifyAll(cours[calendarDate.toLocaleDateString()]);
              }
            }}
          >
          <DateTimePicker
            value={calendarDate}
            locale="fr-FR"
            mode="date"
            display="compact"
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
          </ContextMenuView>
        ) : (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginRight: 2,
            }}
            onPress={() => setCalendarModalOpen(true)}
          >
            <Calendar size={20} color={UIColors.text} />
            <Text style={{ fontSize: 15, fontFamily: 'Papillon-Medium' }}>
              {new Date(calendarDate).toLocaleDateString('fr', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
              })}
            </Text>
          </TouchableOpacity>
        ),
    });
  }, [navigation, calendarDate]);

  const setCalendarAndToday = (date) => {
    setCalendarDate(date);
    setToday(date);
  };

  const updateCoursForDate = async (dateOffset, setDate) => {
    const newDate = calcDate(setDate, dateOffset);
    if (!coursRef.current[newDate.toLocaleDateString()]) {
      const result = await IndexData.getTimetable(newDate);
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
    const result = await IndexData.getTimetable(newDate, true);
    setCours((prevCours) => ({
      ...prevCours,
      [newDate.toLocaleDateString()]: result,
    }));
  };

  useEffect(() => {
    todayRef.current = today;
    coursRef.current = cours;
  }, [today, cours]);

  const UIColors = GetUIColors();

  return (
    <View
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: UIColors.background }]}
    >
      {Platform.OS === 'android' && calendarModalOpen ? (
        <DateTimePicker
          value={calendarDate}
          locale="fr-FR"
          mode="date"
          display="calendar"
          onChange={(event, date) => {
            if (event.type === 'dismissed') {
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
      ) : null}

      <StatusBar
        animated
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />

      <InfinitePager
        style={[styles.viewPager]}
        pageWrapperStyle={[styles.pageWrapper]}
        onPageChange={handlePageChange}
        ref={pagerRef}
        pageBuffer={4}
        gesturesDisabled={false}
        renderPage={({ index }) =>
          cours[calcDate(today, index).toLocaleDateString()] ? (
            <CoursPage
              cours={cours[calcDate(today, index).toLocaleDateString()] || []}
              navigation={navigation}
              theme={theme}
              forceRefresh={forceRefresh}
            />
          ) : (
            <View style={[styles.coursContainer]}>
              <ActivityIndicator size="small" />
            </View>
          )
        }
      />
    </View>
  );
}

const CoursItem = React.memo(({ cours, theme, CoursPressed }) => {
  const formattedStartTime = useCallback(
    () =>
      new Date(cours.start).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    [cours.start]
  );

  const formattedEndTime = useCallback(
    () =>
      new Date(cours.end).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    [cours.end]
  );

  const start = new Date(cours.start);
  const end = new Date(cours.end);

  function lz(num) {
    return num < 10 ? '0' + num : num;
  }

  const length = Math.floor((end - start) / 60000);
  let lengthString = `${Math.floor(length / 60)}h ${lz(Math.floor(length % 60))}min`;

  if (Math.floor(length / 60) == 0) {
    lengthString = `${lz(Math.floor(length % 60))} min`;
  }
 
  const handleCoursPressed = useCallback(() => {
    CoursPressed(cours);
  }, [CoursPressed, cours]);

  return (
    <View style={[styles.fullCours]}>
      <View style={[styles.coursTimeContainer]}>
        <Text numberOfLines={1} style={[styles.ctStart]}>
          {formattedStartTime()}
        </Text>
        <Text numberOfLines={1} style={[styles.ctEnd]}>
          {formattedEndTime()}
        </Text>
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
            { backgroundColor: `${getClosestCourseColor(cours.subject.name)}22` },
          ]}
        >
          <View
            style={[
              styles.coursColor,
              { backgroundColor: getClosestCourseColor(cours.subject.name) },
            ]}
          />
          <View style={[styles.coursInfo]}>
            <Text style={[styles.coursTime]}>{lengthString}</Text>
            <Text style={[styles.coursMatiere]}>
              {formatCoursName(cours.subject.name)}
            </Text>

            { (length / 60 > 1.4) ? (
              <View style={{height: 25}} />
            ) : null }

            { cours.rooms.length > 0 ? (
              <Text style={[styles.coursSalle]}>Salle {cours.rooms.join(', ')}</Text>
            ) :
              <Text style={[styles.coursSalle]}>Aucune salle</Text>
            }
            { cours.teachers.length > 0 ? (
              <Text style={[styles.coursProf]}>{cours.teachers.join(', ')}</Text>
            ) : 
              <Text style={[styles.coursProf]}>Aucun professeur</Text>
            }

            {cours.status && (
              <View
                style={[
                  styles.coursStatus,
                  {
                    backgroundColor: `${getClosestCourseColor(
                      cours.subject.name
                    )}22`,
                  },
                  cours.is_cancelled ? styles.coursStatusCancelled : null,
                ]}
              >
                {cours.is_cancelled ? (
                  <Info size={20} color="#ffffff" />
                ) : (
                  <Info size={20} color={theme.dark ? '#ffffff' : '#000000'} />
                )}

                <Text
                  style={[
                    styles.coursStatusText,
                    { color: theme.dark ? '#ffffff' : '#000000' },
                    cours.is_cancelled ? styles.coursStatusCancelledText : null,
                  ]}
                >
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

function CoursPage({ cours, navigation, theme, forceRefresh }) {
  const CoursPressed = useCallback(
    (_cours) => {
      navigation.navigate('Lesson', { event: _cours });
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

  function lz(nb) {
    return nb < 10 ? `0${nb}` : nb.toString();
  }

  const UIColors = GetUIColors();

  return (
    <ScrollView
      style={[styles.coursContainer]}
      nestedScrollEnabled
      refreshControl={
        <RefreshControl
          refreshing={isHeadLoading}
          onRefresh={onRefresh}
          colors={[Platform.OS === 'android' ? '#29947A' : null]}
        />
      }
    >
      {cours.length === 0 ? (
        <Text style={[styles.noCourses]}>Aucun cours</Text>
      ) : null}

      {cours.map((_cours, index) => (
        <View key={index}>
          {/* si le cours précédent était il y a + de 30 min du cours actuel */}
          {index !== 0 &&
          new Date(_cours.start) - new Date(cours[index - 1].end) > 1800000 ? (
            <View style={styles.coursSeparator}>
              <View style={[styles.coursSeparatorLine, { backgroundColor: UIColors.text + '15' }]} />

              <Text style={{ color: UIColors.text + '30' }}>
                {`${Math.floor((new Date(_cours.start) - new Date(cours[index - 1].end)) / 3600000)} h ${lz(Math.floor(((new Date(_cours.start) - new Date(cours[index - 1].end)) % 3600000) / 60000))} min`}
              </Text>
              
              <View style={[styles.coursSeparatorLine, { backgroundColor: UIColors.text + '15' }]} />
            </View>
          ) : null}

          <CoursItem
            key={index}
            cours={_cours}
            theme={theme}
            CoursPressed={CoursPressed}
          />
        </View>
      ))}

      <View style={{ height: 12 }} />
    </ScrollView>
  );
}

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
  coursLength: {
    position: 'absolute',
    right: 12,
    top: 10,
    opacity: 0.3,
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

  coursSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,

    gap: 12,
  },
  coursSeparatorLine: {
    flex: 1,
    height: 2,
    borderRadius:3,
  },
});

export default CoursScreen;
