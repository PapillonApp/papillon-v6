import type { PapillonLesson } from '../fetch/types/timetable';
import React, { useCallback, useState, useEffect, useRef, useLayoutEffect } from 'react';

import {
  Animated,
  View,
  Dimensions,
  StyleSheet,
  StatusBar,
  Platform,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from 'react-native';

import Reanimated, {ZoomIn, Easing, FadeOut} from 'react-native-reanimated';

import InfinitePager, { type InfinitePagerImperativeApi } from 'react-native-infinite-pager';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContextMenuView } from 'react-native-ios-context-menu';
import { PressableScale } from 'react-native-pressable-scale';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme, Text } from 'react-native-paper';
import TimeSeparator from '../interface/CoursScreen/TimeSeparator';

import * as Notifications from 'expo-notifications';
import * as Calendar from 'expo-calendar';
import { BlurView } from 'expo-blur';

import PapillonLoading from '../components/PapillonLoading';
import NativeText from '../components/NativeText';

import { Calendar as CalendarPapillonIcon } from '../interface/icons/PapillonIcons';
import {
  Info,
  Calendar as IconCalendar,
  CalendarDays,
  X,
  TextSelect,
  BookOpenCheck,
} from 'lucide-react-native';

import { getClosestCourseColor, getSavedCourseColor } from '../utils/cours/ColorCoursName';
import getClosestGradeEmoji from '../utils/cours/EmojiCoursName';
import formatCoursName from '../utils/cours/FormatCoursName';
import { dateToFrenchFormat } from '../utils/dates';
import { useAppContext } from '../utils/AppContext';
import GetUIColors from '../utils/GetUIColors';

export default function CoursScreen ({ navigation }: {
  navigation: any // TODO
}) {
  const appContext = useAppContext();
  const insets = useSafeAreaInsets();
  const UIColors = GetUIColors();
  const theme = useTheme();

  const pagerRef = useRef<InfinitePagerImperativeApi | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Simple cache to prevent sneaking into the `AsyncStorage`.
   * Keys are made from the function `dateToFrenchFormat`.
   * 
   * @example
   * {
   *   "24/01/2024": { // To read only lessons from this day, use `Object.values()`.
   *     "123#...": { ...PapillonLesson },
   *     "123#...": { ...PapillonLesson },
   *   }
   * }
   */
  type TimetableViewCache = Record<string, { [id: string]: PapillonLesson }>;
  const [cours, _setCours] = useState<TimetableViewCache>({});

  // We make a ref of it to be accessible inside our event handlers.
  // See <https://medium.com/geographit/accessing-react-state-in-event-listeners-with-usestate-and-useref-hooks-8cceee73c559>.
  const coursRef = useRef(cours); 
  const setCours = (cours: TimetableViewCache) => {
    coursRef.current = cours;
    _setCours(cours);
  };

  const lessonsFromPage = useCallback((page: number) => {
    const dayKey = dateToFrenchFormat(getDateFromPageNumber(page));
    if (dayKey in cours) return Object.values(cours[dayKey]);
    
    // Not yet fetched...
    return [];
  }, [cours]);

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  // animate calendar modal
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
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
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
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
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 0,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [calendarModalOpen]);

  async function addToCalendar (cours: Record<string, PapillonLesson>): Promise<void> {
    // get calendar permission
    const { status } = await Calendar.requestCalendarPermissionsAsync();

    if (status === 'granted') {
      Object.values(cours).forEach(async (cours) => {
        if (!cours.subject) return;

        // get calendar
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

        // if Papillon-(cours.subject.name) calendar exists
        let calendarId: string | undefined;

        for (const calendar of calendars) {
          if (calendar.title === `Papillon-${cours.subject.name}`) {
            calendarId = calendar.id;
            break;
          }
        }

        // if not, create it
        if (!calendarId) {
          await Calendar.createCalendarAsync({
            title: `Papillon-${cours.subject.name}`,
            color: cours.background_color ?? getClosestCourseColor(cours.subject.name),
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

        // if we still don't have it, then skip.
        if (!calendarId) return;
          
        // add event to calendar
        if (!cours.is_cancelled) {
          await Calendar.createEventAsync(calendarId, {
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
  }

  async function notifyAll (_cours: Record<string, PapillonLesson>): Promise<void> {
    // for each cours
    for (const coursThis of Object.values(_cours)) {
      if (!coursThis.subject) continue;

      const identifier = coursThis.subject.name + new Date(coursThis.start).getTime();

      // if notification already exists
      const value = await Notifications.getAllScheduledNotificationsAsync();
      // if item.identifier is found in value
      for (const item of value) {
        if (item.identifier === identifier) {
          // cancel it
          await Notifications.cancelScheduledNotificationAsync(identifier);
          break;
        }
      }

      const time = new Date(coursThis.start);
      time.setMinutes(time.getMinutes() - 5);

      // schedule notification
      await Notifications.scheduleNotificationAsync({
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

  /**
   * Update the navigation bar according to the current
   * states of the view.
   */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Emploi du temps',
      headerShadowVisible: false,
      headerTransparent: Platform.OS === 'ios',
      headerStyle: Platform.OS === 'android' ? {
        backgroundColor: UIColors.background,
        elevation: 0,
      } : undefined,
      headerRight: () =>
        <ContextMenuView
          style={{ marginRight: 16 }}
          previewConfig={{
            borderRadius: 10,
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
                actionKey: 'addToCalendar',
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
            const dayKey = dateToFrenchFormat(calendarDate);
            const cours = coursRef.current;

            if (!(dayKey in cours)) return; // Pretty useless otherwise...

            if (nativeEvent.actionKey === 'addToCalendar') {
              addToCalendar(cours[dayKey]);
            } else if (nativeEvent.actionKey === 'notifyAll') {
              notifyAll(cours[dayKey]);
            }
          }}
        >
          <TouchableOpacity
            onPress={() => setCalendarModalOpen(true)}
            style={[
              styles.calendarDateContainer,
              { backgroundColor: '#0065A8' + '20' }
            ]}
          >
            <CalendarPapillonIcon stroke={'#0065A8'} />
            <Text style={[styles.calendarDateText, {color: '#0065A8'}]}>
              {new Date(calendarDate).toLocaleDateString('fr', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
              })}
            </Text>
          </TouchableOpacity>
        </ContextMenuView>
    });
  }, [navigation, calendarDate, UIColors]);

  const getDateFromPageNumber = (page: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + page);

    return date;
  };

  /**
   * Handler that triggers whenever the user changes the date
   * using the selector on the navigation bar.
   */
  const handleCalendarAndTodaySelection = (date: Date) => {
    const today = new Date();
    // Read the new page number, to set the page to it.
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Change the selected page, it'll automatically trigger the
    // `handlePageChange` function and then do `setCalendarDate(date)`.
    if (pagerRef.current) pagerRef.current.setPage(diffDays, { animated: false });
  };
  
  const refreshStateCache = async (date: Date, force: boolean): Promise<void> => {
    if (!appContext.dataProvider) return;
    // Temporary clone.
    let lessonsViewCache = { ...coursRef.current };

    console.info('timetable: fetching from scratch for state.');
    
    const lessons = await appContext.dataProvider.getTimetable(date, force);
    if (!lessons) return; // No-op, not sure if that's good here.
    
    // We fill undefined objects.
    const mondayIndex = date.getDate() - date.getDay() + 1;
    for (let i = 0; i <= 6; i++) {
      const day = new Date(date);
      day.setDate(mondayIndex + i);

      const dayKey = dateToFrenchFormat(day);

      // Create the object if not done.
      if (!(dayKey in lessonsViewCache)) {
        lessonsViewCache[dayKey] = {};
      }
    }

    // Empty every lessons of the week inside our state cache.
    for (let dayKey in lessonsViewCache) {
      lessonsViewCache[dayKey] = {};
    }

    // Register every lessons of the week inside our state cache.
    for (const lesson of lessons) {
      const dayKey = dateToFrenchFormat(new Date(lesson.start));
      // Insert the lesson in the day object.
      lessonsViewCache[dayKey][String(lesson.id) + '-papillon'] = lesson;
    }

    setCours(lessonsViewCache);
  };

  const handlePageChange = async (page: number) => {
    console.info('timetable: page change to', page);
    // Get the date selected using the page number.
    const date = getDateFromPageNumber(page);
    
    // Change the calendar.
    // Should be the only place where it changes it !
    setCalendarDate(date);

    // If inside cache, then simply use it.
    const currentDayKey = dateToFrenchFormat(date);
    if (currentDayKey in coursRef.current) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    // Otherwise, we need to fetch. Make sure to not
    // force to also use storage cache, if it's in there.
    await refreshStateCache(date, false);
    setIsLoading(false);
  };

  const forceRefresh = () => refreshStateCache(calendarDate, true);

  return (
    <View
      style={[styles.container, {
        backgroundColor: UIColors.background,
        paddingTop: Platform.OS === 'ios' ? insets.top + 44 : 0
      }]}
    >
      {Platform.OS === 'android' && calendarModalOpen && (
        <DateTimePicker
          value={calendarDate}
          mode="date"
          display="calendar"
          onChange={(event, date) => {
            if (event.type === 'dismissed' || !date) {
              setCalendarModalOpen(false);
              return;
            }

            setCalendarModalOpen(false);
            handleCalendarAndTodaySelection(date);
          }}
        />
      )}

      {Platform.OS === 'ios' && calendarModalOpen && (
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
                  <CalendarDays size={24} color={'#ffffff'} />
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
              <X size={24} color={'#ffffff'} />
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
                    backgroundColor: !UIColors.dark ? UIColors.background + 'ff' : UIColors.background + 'aa',
                  },
                ]}
              >
                <DateTimePicker
                  value={calendarDate}
                  locale="fr_FR"
                  mode="date"
                  display="inline"
                  onChange={(event, date) => {
                    if (event.type === 'dismissed' || !date) {
                      setCalendarModalOpen(false);
                      return;
                    }

                    setCalendarModalOpen(false);
                    handleCalendarAndTodaySelection(date);
                  }}
                />
              </BlurView>
            </Animated.View>
          </Animated.View>
        </Modal>
      )}

      <StatusBar
        animated
        translucent
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />

      <InfinitePager
        ref={pagerRef}
        style={styles.viewPager}
        pageWrapperStyle={styles.pageWrapper}
        
        pageBuffer={1}
        gesturesDisabled={false}
        onPageChange={handlePageChange}
        
        renderPage={({ index }) => (
          !isLoading ? (
            <CoursPage
              cours={lessonsFromPage(index)}
              navigation={navigation}
              forceRefresh={() => forceRefresh()}
            />
          ) : (
            <View style={styles.coursContainer}>
              <PapillonLoading
                title="Chargement des cours..."
                subtitle="Obtention des cours en cours"
              />
            </View>
          )
        )}
      />
    </View>
  );
}

const CoursItem = ({ cours, lessonPressed, navigation }: {
  cours: PapillonLesson
  navigation: any // TODO
  lessonPressed: () => unknown
}) => {
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

  function lz(num: number) {
    return num < 10 ? `0${num}` : num;
  }

  const length = Math.floor((end.getTime() - start.getTime()) / 60000);
  let lengthString = `${Math.floor(length / 60)}h ${lz(
    Math.floor(length % 60)
  )}min`;

  if (Math.floor(length / 60) === 0) {
    lengthString = `${lz(Math.floor(length % 60))} min`;
  }

  // if ~5 min around 1h
  if (Math.floor(length % 60) < 9) {
    lengthString = `${Math.floor(length / 60)} heure${length / 60 > 1 ? 's' : ''}`;
  }

  if (Math.floor(length % 60) > 49) {
    lengthString = `${Math.floor((length / 60) + 1)} heure${length / 60 > 1 ? 's' : ''}`;
  }

  const theme = useTheme();
  const UIColors = GetUIColors();

  return (
    <Reanimated.View
      style={[styles.fullCours]}
      entering={ZoomIn.duration(200).easing(Easing.out(Easing.bezierFn(0.5, 0, 1, 0)))}
      exiting={FadeOut.duration(200)}
    >
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
        previewConfig={{
          borderRadius: 10,
        }}
        menuConfig={{
          menuTitle: cours.subject?.name ?? '',
          menuItems: [
            {
              actionKey: 'data-room',
              actionTitle: 'Salle de cours',
              actionSubtitle: cours.rooms.join(', ') || 'Aucune salle',
            },
            {
              actionKey: 'data-teacher',
              actionTitle: `Professeur${cours.teachers.length > 1 ? 's' : ''}`,
              actionSubtitle: cours.teachers.join(', ') || 'Aucun professeur',
            },
            ...(cours.group_names.length > 0 ? [{
              actionKey: 'data-groupes',
              actionTitle: `Groupe${cours.group_names.length > 1 ? 's' : ''}`,
              actionSubtitle: cours.group_names.join(', ') || 'Aucun groupe',
            }] : []),
            {
              menuTitle: '',
              menuOptions: ['displayInline'],
              menuItems: [
                {
                  actionKey: 'open',
                  actionTitle: 'Voir le cours en détail',
                  icon: {
                    type: 'IMAGE_SYSTEM',
                    imageValue: {
                      systemName: 'book.pages',
                    },
                  },
                },
              ]
            }
          ],
        }}
        onPressMenuItem={({ nativeEvent }) => {
          if (nativeEvent.actionKey === 'open') {
            navigation.navigate('Lesson', { event: cours });
          }
        }}
      >
        <PressableScale
          weight="light"
          delayLongPress={100}
          style={[
            styles.coursItemContainer,
            { backgroundColor: theme.dark ? '#111111' : '#ffffff' },
            { opacity: cours.is_cancelled || cours.is_exempted ? 0.5 : 1 },
          ]}
          onPress={() => lessonPressed()}
        >
          <View
            style={[
              styles.coursItem,
              {
                backgroundColor: `${getSavedCourseColor(
                  cours.subject?.name ?? '',
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
                    cours.subject?.name ?? '',
                    cours.background_color
                  ),
                },
              ]}
            />
            <View style={[styles.coursInfo]}>
              <Text style={[styles.coursTime]}>{lengthString}</Text>
              <Text style={[styles.coursMatiere]}>
                {formatCoursName(cours.subject?.name ?? 'Cours')}
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

              <View style={[styles.coursIcons]}>
                {cours.memo && (
                  <TextSelect
                    size={21}
                    color={UIColors.text}
                    strokeWidth={2.2}
                  />
                )}
                {cours.is_test && (
                  <BookOpenCheck
                    size={21}
                    color={UIColors.text}
                    strokeWidth={2.2}
                  />
                )}
              </View>

              {cours.is_exempted && (
                !cours.is_cancelled && (
                  <View
                    style={[
                      styles.coursStatus,
                      {
                        backgroundColor: `${getSavedCourseColor(
                          cours.subject?.name ?? '',
                          cours.background_color
                        )}22`,
                      },
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
                      ]}
                    >
                      Dispensé
                    </Text>
                  </View>
                )
              )}

              {cours.status && (
                !cours.is_exempted || cours.is_cancelled ? (
                  <View
                    style={[
                      styles.coursStatus,
                      {
                        backgroundColor: `${getSavedCourseColor(
                          cours.subject?.name ?? '',
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
                ) : null
              )}
            </View>
          </View>
        </PressableScale>
      </ContextMenuView>
    </Reanimated.View>
  );
};

function CoursPage({ cours, navigation, forceRefresh }: {
  cours: PapillonLesson[]
  navigation: any // TODO
  forceRefresh: () => Promise<unknown>
}) {
  const [isHeadLoading, setIsHeadLoading] = useState(false);

  const onRefresh = async () => {
    setIsHeadLoading(true);
    await forceRefresh();
    setIsHeadLoading(false);
  };

  function lz (nb: number) {
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
          colors={[Platform.OS === 'android' ? '#0065A8' : '']}
        />
      }
      contentContainerStyle={{
        minHeight: Platform.OS === 'android' ? Dimensions.get('window').height - 150 : 0,
      }}
    >
      {cours.length === 0 && (
        <PapillonLoading
          icon={<IconCalendar size={26} color={UIColors.text} />}
          title="Aucun cours"
          subtitle="Vous n'avez aucun cours ce jour"
          style={{ marginTop: 36 }}
        />
      )}

      {cours.map((lesson, index) => (
        <View key={lesson.id}>
          {index !== 0 && new Date(lesson.start).getTime() - new Date(cours[index - 1].end).getTime() > 1800000 && (
            <TimeSeparator
              reason={
                (new Date(cours[index - 1].end).getHours() < 13 &&
                new Date(lesson.start).getHours() >= 12) ?
                  'Pause méridienne'
                  : 'Pas de cours'
              }
              time={`${Math.floor(
                (new Date(lesson.start).getTime() -
                    new Date(cours[index - 1].end).getTime()) /
                    3600000
              )} h ${lz(
                Math.floor(
                  ((new Date(lesson.start).getTime() -
                      new Date(cours[index - 1].end).getTime()) %
                      3600000) /
                      60000
                )
              )} min`}
              lunch={
                new Date(cours[index - 1].end).getHours() < 13 &&
                new Date(lesson.start).getHours() >= 12
              }
              showLine
              style={{
                marginHorizontal: 0,
                marginTop: 0,
                marginBottom: 8,
                height: 38,
                marginLeft: 69,
              }}
            />
          )}

          <CoursItem
            key={index}
            cours={lesson}
            navigation={navigation}
            lessonPressed={() => {
              navigation.navigate('Lesson', { event: lesson });
            }}
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
    fontWeight: '600',
    fontFamily: 'Papillon-Semibold',
  },
  ctEnd: {
    fontSize: 15,
    fontWeight: '400',
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
    fontWeight: '500',
    fontFamily: 'Papillon-Semibold',
  },
  coursProf: {
    fontSize: 14.5,
    fontWeight: '400',
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
    fontWeight: '500',
  },

  coursStatusCancelled: {
    backgroundColor: '#B42828',
  },
  coursStatusCancelledText: {
    color: '#fff',
  },

  noCourses: {
    fontSize: 17,
    fontWeight: '400',
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
    fontWeight: '500',
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
  },

  coursIcons: {
    position: 'absolute',
    right: 16,
    bottom: 15,
    flexDirection: 'row',
    gap: 12,
    opacity: 0.5,
  }
});
