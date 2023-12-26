/* eslint-disable prettier/prettier */
import * as React from 'react';
import { useCallback, useState, useEffect, useRef } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { BlurView } from 'expo-blur';

import { SFSymbol } from 'react-native-sfsymbols';
import PapillonInsetHeader from '../components/PapillonInsetHeader';

import { ContextMenuView } from 'react-native-ios-context-menu';

import { ScrollView } from 'react-native-gesture-handler';

import { PressableScale } from 'react-native-pressable-scale';

import InfinitePager from 'react-native-infinite-pager';
import DateTimePicker from '@react-native-community/datetimepicker';

import * as Notifications from 'expo-notifications';

import * as Calendar from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import PapillonLoading from '../components/PapillonLoading';

import {
  DoorOpen,
  User2,
  Info,
  Calendar as IconCalendar,
  Users,
  CalendarDays,
  X,
} from 'lucide-react-native';

import formatCoursName from '../utils/FormatCoursName';
import { getClosestCourseColor, getSavedCourseColor } from '../utils/ColorCoursName';

import getClosestGradeEmoji from '../utils/EmojiCoursName';

import GetUIColors from '../utils/GetUIColors';

import ListItem from '../components/ListItem';

import { useAppContext } from '../utils/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarFill, Calendar as CalendarPapillonIcon } from '../interface/icons/PapillonIcons';
import AlertAnimated from '../interface/AlertAnimated';
import NativeText from '../components/NativeText';

const calcDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

function CoursScreen({ navigation }) {
  const theme = useTheme();
  const pagerRef = useRef(null);
  const insets = useSafeAreaInsets();

  const [today, setToday] = useState(new Date());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [calendarDate, setCalendarDate] = useState(today);
  const [cours, setCours] = useState({});
  const todayRef = useRef(today);
  const coursRef = useRef(cours);

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  // animate calendar modal
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  // animate modal when visible changes
  useEffect(() => {
    if (calendarModalOpen) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [calendarModalOpen]);

  async function addToCalendar(cours) {

      // get calendar permission
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        // for each cours
        
        cours.forEach(async (cours) => {
          // get calendar
          const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

          // if Papillon-(cours.subject.name) calendar exists
          let calendarId = null;

          for (const calendar of calendars) {
            if (calendar.title === `Papillon-${cours.subject.name}`) {
              calendarId = calendar.id;
              break;
            }
          }

          // if not, create it
          if (calendarId === null) {
            await Calendar.createCalendarAsync({
              title: `Papillon-${cours.subject.name}`,
              color: getClosestCourseColor(cours.subject.name, cours.background_color),
              entityType: Calendar.EntityTypes.EVENT,
            });

            // get calendar
            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

            // get calendar id

            for (const calendar of calendars) {
              if (calendar.title === `Papillon-${cours.subject.name}`) {
                calendarId = calendar.id;
                break;
              }
            }
          }
          
          // add event to calendar

          if (!cours.is_cancelled) {
            const event = await Calendar.createEventAsync(calendarId, {
              startDate: new Date(cours.start),
              endDate: new Date(cours.end),
              title: cours.subject.name,
              location: cours.rooms.join(', '),
              notes: `
                Professeur(s) : ${cours.teachers.length > 1 ? 's' : ''} : ${cours.teachers.join(', ')}
Statut : ${cours.status || 'Aucun'}
              `.trim(),
              status: cours.is_cancelled ? 'CANCELED' : 'CONFIRMED',
              organizer: cours.teachers[0],
              creationDate: new Date(),
              lastModifiedDate: new Date(),
            });
          }
        });

        // alert user
        Alert.alert(
          'Cours ajoutés au calendrier',
          'Les cours ont été ajoutés au calendrier.',
          [
            {
              text: 'OK',
              style: 'cancel'
            },
          ]
        );
      }
      else {
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
  };

  async function notifyAll(_cours) {
    // for each cours
    for (let i = 0; i < _cours.length; i++) {
      const coursThis = _cours[i];
      const identifier =
        coursThis.subject.name + new Date(coursThis.start).getTime();

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

      const time = new Date(coursThis.start);
      time.setMinutes(time.getMinutes() - 5);

      // schedule notification
      Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: `${getClosestGradeEmoji(coursThis.subject.name)} ${
            coursThis.subject.name
          } - Ça commence dans 5 minutes`,
          body: `Le cours est en salle ${coursThis.rooms[0]} avec ${coursThis.teachers[0]}.`,
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
          style: 'cancel',
        },
      ]
    );
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: Platform.OS === 'ios' ? () => (
        <PapillonInsetHeader
          icon={<SFSymbol name="calendar" />}
          title="Emploi du temps"
          color="#0065A8"
        />
      ) : 'Emploi du temps',
      headerShadowVisible: Platform.OS !== 'ios',
      headerTransparent: Platform.OS === 'ios',
      headerRight: () =>
      <ContextMenuView
            previewConfig={{
              borderRadius: 10,
            }}
            menuConfig={{
              borderRadius: 10,
              menuTitle: calendarDate.toLocaleDateString('fr', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }),
              menuItems: [
                {
                  actionKey: 'addtoCalendar',
                  actionTitle: 'Ajouter au calendrier',
                  actionSubtitle:
                    'Ajoute tous les cours de la journée au calendrier',
                  icon: {
                    type: 'IMAGE_SYSTEM',
                    imageValue: {
                      systemName: 'calendar.badge.plus',
                    },
                  },
                },
              ],
            }}
            onPressMenuItem={({ nativeEvent }) => {
              if (nativeEvent.actionKey === 'addtoCalendar') {
                addToCalendar(cours[calendarDate.toLocaleDateString()]);
              } else if (nativeEvent.actionKey === 'notifyAll') {
                notifyAll(cours[calendarDate.toLocaleDateString()]);
              }
            }}
          >
            <TouchableOpacity
              style={[
                styles.calendarDateContainer,
                {
                  backgroundColor: "#0065A8" + "20",
                }
              ]}
              onPress={() => setCalendarModalOpen(true)}
            >
              <CalendarPapillonIcon stroke={"#0065A8"} />
              <Text style={[styles.calendarDateText, {color: "#0065A8"}]}>
                {new Date(calendarDate).toLocaleDateString('fr', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                })}
              </Text>
            </TouchableOpacity>
        </ContextMenuView>
      ,
    });
  }, [navigation, calendarDate, UIColors]);

  const setCalendarAndToday = (date) => {
    setCalendarDate(date);
    setToday(date);
    setCalendarDate(date);
    for (let i = -2; i <= 2; i++) {
      updateCoursForDate(i, date);
    }
  };

  const appctx = useAppContext();

  const updateCoursForDate = async (dateOffset, setDate) => {
    const newDate = calcDate(setDate, dateOffset);
    if (!coursRef.current[newDate.toLocaleDateString()]) {
      // load cache before fetching
      const cacheResult = await AsyncStorage.getItem('@cours');
      if (cacheResult) {
        const cache = JSON.parse(cacheResult);
        if (cache[newDate.toLocaleDateString()]) {
          setCours((prevCours) => ({
            ...prevCours,
            [newDate.toLocaleDateString()]: cache[newDate.toLocaleDateString()],
          }));
        }
      }

      // fetch
      const result = await appctx.dataprovider.getTimetable(newDate);
      setCours((prevCours) => ({
        ...prevCours,
        [newDate.toLocaleDateString()]: result,
      }));

      // save to cache
      AsyncStorage.getItem('@cours').then((value) => {
        const c = JSON.parse(value) || {};
        c[newDate.toLocaleDateString()] = result;
        AsyncStorage.setItem('@cours', JSON.stringify(cours));
      });
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
    const newDate = calcDate(calendarDate, 0);
    const result = await appctx.dataprovider.getTimetable(newDate, true);

    const newCours = cours;
    newCours[newDate.toLocaleDateString()] = result;
    setCours(newCours);
  };

  useEffect(() => {
    todayRef.current = today;
    coursRef.current = cours;
  }, [today, cours]);

  const UIColors = GetUIColors();

  return (
    <View
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: UIColors.background, paddingTop: Platform.OS === 'ios' ? insets.top + 44 : 0 }]}
    >
      {Platform.OS === 'android' && calendarModalOpen ? (
        <DateTimePicker
          value={calendarDate}
          locale="fr_FR"
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

      {Platform.OS === 'ios' && calendarModalOpen ? (
        <Modal
          transparent={true}
          animationType='fade'
        >
          <Animated.View
            style={[
              styles.calendarModalContainer,
              {paddingBottom: insets.bottom + 6},
              {
                opacity
              },
            ]}
          >
            <Animated.View
              style={[
                styles.modalTipOverContainer,
                {
                  top: insets.top,
                  opacity,
                  transform: [
                    {
                      translateY: translateY.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 48],
                      }),
                    },
                    {
                      scale: scale.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                }
              ]}
            >
              <BlurView
                style={[
                  styles.modalTipContainer
                ]}
              >
                <View style={[
                  styles.modalTip,
                  {
                    backgroundColor: UIColors.dark ? '#00000066' : '#ffffff12',
                  }
                ]}>
                  <CalendarDays size={24} color={"#ffffff"} style={styles.modalTipIcon}/>
                  <View style={styles.modalTipData}>
                    <NativeText heading="subtitle3" style={{color: '#ffffff'}}>
                      Astuce
                    </NativeText>
                    <NativeText heading="p" style={{color: '#ffffff'}}>
                      Vous pouvez également balayer d'un bord à l'autre pour changer de jour.
                    </NativeText>
                  </View>
                </View>
              </BlurView>
            </Animated.View>

            <Animated.View
              style={[
                {opacity}
              ]}
            >
              <Pressable style={{flex: 1, width:'100%'}} onPress={() => setCalendarModalOpen(false)} />
            </Animated.View>

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setCalendarModalOpen(false)}>
                <X size={24} color={"#ffffff"} style={styles.modalCloseIcon}/>
            </TouchableOpacity>

            <Animated.View 
              style={[
                styles.calendarModalViewContainer,
                {
                  opacity,
                  transform: [
                    {
                      translateY: translateY.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0],
                      }),
                    },
                    {
                      scale: scale.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <BlurView
                style={[
                  styles.calendarModalView,
                  {
                    backgroundColor: !UIColors.dark ? UIColors.background + "ff" : UIColors.background + "aa",
                  },
                ]}
              >
                <DateTimePicker
                  value={calendarDate}
                  locale="fr_FR"
                  mode="date"
                  display="inline"
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
              </BlurView>
            </Animated.View>
          </Animated.View>
        </Modal>
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
              <PapillonLoading
                title="Chargement des cours..."
                subtitle="Obtention des cours en cours"
              />
            </View>
          )
        }
      />
    </View>
  );
}

const CoursItem = React.memo(({ cours, theme, CoursPressed, navigation }) => {
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
    return num < 10 ? `0${num}` : num;
  }

  const length = Math.floor((end - start) / 60000);
  let lengthString = `${Math.floor(length / 60)}h ${lz(
    Math.floor(length % 60)
  )}min`;

  if (Math.floor(length / 60) === 0) {
    lengthString = `${lz(Math.floor(length % 60))} min`;
  }

  // if ~5 min around 1h
  if (Math.floor(length % 60) < 9) {
    lengthString = `${Math.floor(length / 60)} heure(s)`;
  }

  if (Math.floor(length % 60) > 49) {
    lengthString = `${Math.floor((length / 60) + 1)} heure(s)`;
  }

  

  const handleCoursPressed = useCallback(() => {
    CoursPressed(cours);
  }, [CoursPressed, cours]);

  const UIColors = GetUIColors();
  const mainColor = theme.dark ? '#ffffff' : '#444444';

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
      <ContextMenuView
        style={{ flex: 1 }}
        borderRadius={10}
        previewConfig={{
          borderRadius: 10,
          previewType: 'CUSTOM',
          previewSize: 'INHERIT',
          backgroundColor: 'rgba(255,255,255,0)',
          preferredCommitStyle: 'pop',
        }}
        menuConfig={{
          menuTitle: cours.subject.name,
          menuItems: [
            {
              actionKey: 'open',
              actionTitle: 'Voir le cours en détail',
              actionSubtitle: 'Ouvrir la page détaillée du cours',
              icon: {
                type: 'IMAGE_SYSTEM',
                imageValue: {
                  systemName: 'book.pages',
                },
              },
            },
          ],
        }}
        onPressMenuItem={({ nativeEvent }) => {
          if (nativeEvent.actionKey === 'open') {
            navigation.navigate('Lesson', { event: cours });
          }
        }}
        onPressMenuPreview={() => {
          navigation.navigate('Lesson', { event: cours });
        }}
        renderPreview={() => (
          <View
            style={{
              flex: 1,
              backgroundColor: `${UIColors.background}99`,
              width: 350,
            }}
          >
            <View style={styles.coursPreviewList}>
              {cours.rooms.length > 0 ? (
                <ListItem
                  title="Salle de cours"
                  subtitle={cours.rooms.join(', ')}
                  color={mainColor}
                  left={<DoorOpen size={24} color={mainColor} />}
                  width
                  center
                />
              ) : null}
              {cours.teachers.length > 0 ? (
                <ListItem
                  title={`Professeur${cours.teachers.length > 1 ? 's' : ''}`}
                  subtitle={cours.teachers.join(', ')}
                  color={mainColor}
                  left={<User2 size={24} color={mainColor} />}
                  width
                  center
                />
              ) : null}
              {cours.group_names.length > 0 ? (
                <ListItem
                  title={`Groupe${cours.group_names.length > 1 ? 's' : ''}`}
                  subtitle={cours.group_names.join(', ')}
                  color={mainColor}
                  left={<Users size={24} color={mainColor} />}
                  width
                  center
                />
              ) : null}
              {cours.status !== null ? (
                <ListItem
                  title="Statut du cours"
                  subtitle={cours.status}
                  color={!cours.is_cancelled ? mainColor : '#B42828'}
                  left={
                    <Info
                      size={24}
                      color={!cours.is_cancelled ? mainColor : '#ffffff'}
                    />
                  }
                  fill={!!cours.is_cancelled}
                  width
                  center
                />
              ) : null}
            </View>
          </View>
        )}
      >
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
              {
                backgroundColor: `${getSavedCourseColor(
                  cours.subject.name,
                  cours.background_color
                )}22`,
              },
            ]}
          >
            <View
              style={[
                styles.coursColor,
                {
                  backgroundColor: getSavedCourseColor(
                    cours.subject.name,
                    cours.background_color
                  ),
                },
              ]}
            />
            <View style={[styles.coursInfo]}>
              <Text style={[styles.coursTime]}>{lengthString}</Text>
              <Text style={[styles.coursMatiere]}>
                {formatCoursName(cours.subject.name)}
              </Text>

              {length / 60 > 1.4 ? <View style={{ height: 25 }} /> : null}

              {cours.rooms.length > 0 ? (
                <Text style={[styles.coursSalle]}>
                  Salle {cours.rooms.join(', ')}
                </Text>
              ) : (
                <Text style={[styles.coursSalle]}>Aucune salle</Text>
              )}
              {cours.teachers.length > 0 ? (
                <Text style={[styles.coursProf]}>
                  {cours.teachers.join(', ')}
                </Text>
              ) : (
                <Text style={[styles.coursProf]}>Aucun professeur</Text>
              )}

              {cours.status && (
                <View
                  style={[
                    styles.coursStatus,
                    {
                      backgroundColor: `${getSavedCourseColor(
                        cours.subject.name,
                        cours.background_color
                      )}22`,
                    },
                    cours.is_cancelled ? styles.coursStatusCancelled : null,
                  ]}
                >
                  {cours.is_cancelled ? (
                    <Info size={20} color="#ffffff" />
                  ) : (
                    <Info
                      size={20}
                      color={theme.dark ? '#ffffff' : '#000000'}
                    />
                  )}

                  <Text
                    style={[
                      styles.coursStatusText,
                      { color: theme.dark ? '#ffffff' : '#000000' },
                      cours.is_cancelled
                        ? styles.coursStatusCancelledText
                        : null,
                    ]}
                  >
                    {cours.status}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </PressableScale>
      </ContextMenuView>
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
        <PapillonLoading
          icon={<IconCalendar size={26} color={UIColors.text} />}
          title="Aucun cours"
          subtitle="Vous n'avez aucun cours aujourd'hui"
          style={{ marginTop: 36 }}
        />
      ) : null}

      {cours.map((_cours, index) => (
        <View key={index}>
          {/* si le cours précédent était il y a + de 30 min du cours actuel */}
          {index !== 0 &&
          new Date(_cours.start) - new Date(cours[index - 1].end) > 1800000 ? (
            <View style={styles.coursSeparator}>
              <View
                style={[
                  styles.coursSeparatorLine,
                  { backgroundColor: `${UIColors.text}15` },
                ]}
              />

              <Text style={{ color: `${UIColors.text}30` }}>
                {`${Math.floor(
                  (new Date(_cours.start) - new Date(cours[index - 1].end)) /
                    3600000
                )} h ${lz(
                  Math.floor(
                    ((new Date(_cours.start) - new Date(cours[index - 1].end)) %
                      3600000) /
                      60000
                  )
                )} min`}
              </Text>

              <View
                style={[
                  styles.coursSeparatorLine,
                  { backgroundColor: `${UIColors.text}15` },
                ]}
              />
            </View>
          ) : null}

          <CoursItem
            key={index}
            cours={_cours}
            theme={theme}
            navigation={navigation}
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
    padding: 8,
  },

  fullCours: {
    width: '100%',
    marginBottom: 8,
    flexDirection: 'row',
  },
  coursTimeContainer: {
    width: 56,
    marginRight: 10,
    marginLeft: 4,
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
    borderRadius: 10,
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
    opacity: 0.4,
    marginBottom: 2,
    fontFamily: 'Papillon-Medium',
  },
  coursLength: {
    position: 'absolute',
    right: 12,
    top: 10,
    opacity: 0.3,
  },
  coursMatiere: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
    marginBottom: 10,
  },
  coursSalle: {
    fontSize: 14.5,
    fontWeight: 500,
    fontFamily: 'Papillon-Semibold',
  },
  coursProf: {
    fontSize: 14.5,
    fontWeight: 400,
    opacity: 0.5,
    fontFamily: 'Papillon-Medium',
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
    borderRadius: 3,
  },

  coursPreviewList: {
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 9,
  },

  calendarModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#00000099',
    paddingHorizontal: 12,
  },

  calendarModalViewContainer: {
    borderRadius: 16,
    borderCurve: 'continuous',
    overflow: 'hidden',

    width: '100%',
  },

  calendarModalView: {
    paddingHorizontal: 14,
    paddingBottom: 18,
    backgroundColor: '#ffffff12',
  },

  modalCloseButton: {
    width: 40,
    height: 40,

    justifyContent: 'center',
    alignItems: 'center',

    alignSelf: 'flex-end',

    backgroundColor: '#ffffff39',
    borderRadius: 12,
    borderCurve: 'continuous',
    marginTop: -40,
    marginBottom: 10,
  },

  calendarDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    opacity: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderCurve: 'continuous',
  },
  calendarDateText: {
    fontSize: 16,
    fontWeight: 500,
    fontFamily: 'Papillon-Medium',
  },

  modalTipOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    marginHorizontal: 16,
  },
  modalTipContainer: {
    flex: 1,
    borderRadius: 12,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  modalTip: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#ffffff12',
    borderRadius: 12,
    borderCurve: 'continuous',
    borderColor: '#ffffff12',
    borderWidth: 1,
  },

  modalTipData: {
    flex: 1,
    paddingRight: 16,
  }
});

export default CoursScreen;
