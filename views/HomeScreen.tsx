import React, { useEffect, useState, useLayoutEffect, useRef, useMemo } from 'react';
import { View, Platform, ScrollView, StyleSheet, Image, TouchableOpacity, RefreshControl, ActivityIndicator, StatusBar, TouchableHighlight } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { atom, useAtom, useSetAtom } from 'jotai';
import { homeworksAtom, homeworksUntilNextWeekAtom } from '../atoms/homeworks';

import CheckAnimated from '../interface/CheckAnimated';
import { convert as convertHTML } from 'html-to-text';

import formatCoursName from '../utils/cours/FormatCoursName';
import TimeSeparator from '../interface/CoursScreen/TimeSeparator';

import {
  ContextMenuView,
  MenuElementConfig,
} from 'react-native-ios-context-menu';

import Animated, {
  FadeInDown,
  FadeOutUp,
  ZoomInEasyDown,
  ZoomOutEasyUp,
  ZoomIn,
  ZoomOut,
  FadeIn,
  FadeOut,
  FlipInXUp,
  FlipInXDown,
  LinearTransition,
  ZoomInEasyUp,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  FadeOutDown
} from 'react-native-reanimated';

import NativeText from '../components/NativeText';

import GetUIColors from '../utils/GetUIColors';
import { useAppContext } from '../utils/AppContext';
import { PapillonUser } from '../fetch/types/user';
import { PapillonLesson } from '../fetch/types/timetable';
import GetNextCours from '../utils/cours/GetNextCours';
import GetLessonStartTime from '../utils/cours/GetLessonStartTime';
import { PressableScale } from 'react-native-pressable-scale';
import { getClosestCourseColor, getSavedCourseColor } from '../utils/cours/ColorCoursName';

import {
  User2,
  Locate,
  DownloadCloud,
  AlertCircle,
  UserCircle2,
  Globe2,
  X,
  MapPin,
} from 'lucide-react-native';

import { useTheme, Text } from 'react-native-paper';

import {
  Competences,
  Messages,
  Papillon as PapillonIcon,
  UserCheck,
  CalendarFill as PapillonIconsCalendarFill,
  Book as PapillonIconsBook,
} from '../interface/icons/PapillonIcons';

import { GetRessource } from '../utils/GetRessources/GetRessources';
import { PapillonGroupedHomeworks } from '../fetch/types/homework';
import { BlurView } from 'expo-blur';

const useRealTimeCourse = (lessons: PapillonLesson[] | null) => {
  // Initialise le prochain cours et son heure de début
  const [nextCourse, setNextCourse] = useState<PapillonLesson | null>(null);
  const [nextCourseStartTime, setNextCourseStartTime] = useState<string | null>('');

  // Effectue une mise à jour du prochain cours et de son heure de début toutes les secondes
  useEffect(() => {
    if (lessons) {
      // Récupère le prochain cours
      const next = GetNextCours(lessons);
      setNextCourse(next);

      // Met à jour l'heure de début du prochain cours
      setNextCourseStartTime(next ? GetLessonStartTime(next) : '');
    }

    // Intervalle pour la mise à jour
    const intervalId = setInterval(() => {
      if (lessons) {
        // Vérifie s'il y a un nouveau prochain cours
        const updatedNextCourse = GetNextCours(lessons);
        if (updatedNextCourse !== nextCourse) {
          setNextCourse(updatedNextCourse);
          setNextCourseStartTime(GetLessonStartTime(updatedNextCourse) || '');
        }
      }
    }, 1000);

    // Libère l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, [lessons]);

  // Retourne le prochain cours et son heure de début
  return { nextCourse, nextCourseStartTime };
};

const HomeScreen = ({ navigation }) => {
  // Récupère le contexte de l'application, les couleurs de l'interface et les insets
  const appContext = useAppContext();
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  // Initialise l'état pour le rafraîchissement des données
  const [refreshCount, setRefreshCount] = useState<number>(0);

  // Initialise l'état pour le chargement des données
  const [loading, setLoading] = useState<boolean>(false);
  const [hwLoading, setHwLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Initialise les états pour l'utilisateur et les données des cours
  const [user, setUser] = useState<PapillonUser | null>(null);
  const [lessons, setLessons] = useState<PapillonLesson[] | null>(null);

  const [homeworksDays, setHomeworksDays] = useState<
    Array<{ custom: boolean; date: number }>
  >([]);

  const setHomeworks = useSetAtom(homeworksAtom);
  const [groupedHomeworks] = useAtom(
    useMemo(
      // We group homeworks by day, so we can display them in a list.
      () =>
        atom((get) => {
          // Make sure to only display the homeworks until the next week.
          const homeworks = get(homeworksUntilNextWeekAtom);
          if (homeworks === null) return null;

          const groupedHomeworks = homeworks.reduce((grouped, homework) => {
            const homeworkDate = new Date(homework.date);
            homeworkDate.setHours(0, 0, 0, 0);

            setHomeworksDays((prevDays) => {
              let days = [...prevDays]; // Copy of the old value.

              const existingDay = days.find(
                (day) => day.date === homeworkDate.getTime()
              );
              if (!existingDay) {
                days.push({
                  date: homeworkDate.getTime(),
                  custom: false,
                });
              }

              days.sort((a, b) => a.date - b.date);
              return days;
            });

            const formattedDate =
              homeworkDate.getDate() === new Date().getDate() + 1
                ? 'demain'
                : new Date(homeworkDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                });

            const formattedTime = homeworkDate.getTime();

            if (!(formattedDate in grouped)) {
              grouped[formattedDate] = {
                date: homeworkDate,
                formattedDate: formattedDate,
                time: formattedTime,
                homeworks: [],
              };
            }

            grouped[formattedDate].homeworks.push(homework);
            return grouped;
          }, {} as Record<string, PapillonGroupedHomeworks>);

          return Object.values(groupedHomeworks).sort(
            (a, b) => a.time - b.time
          );
        }),
      []
    )
  );

  // Récupère le prochain cours et son heure de début à partir du hook useRealTimeCourse
  const { nextCourse, nextCourseStartTime } = useRealTimeCourse(lessons);

  // Effectue le chargement des données de l'utilisateur et des cours lors du montage du composant
  useEffect(() => {
    const fetchData = async () => {
      // Vérifie si le dataProvider est disponible
      if (!appContext.dataProvider) return;

      // Indique que le chargement est en cours
      setLoading(true);
      setHwLoading(true);

      // Récupère les informations de l'utilisateur
      const userData = await appContext.dataProvider.getUser(refreshCount > 0);
      setUser(userData);

      // Définit la date de fin pour récupérer les cours de la semaine
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      // Récupère les données des cours de la semaine
      const lessons = await appContext.dataProvider.getTimetable(new Date(), refreshCount > 0, endDate);
      setLessons(lessons);

      // Indique que le chargement est terminé
      setTimeout(() => setLoading(false), 1000);

      // Récupère les données des devoirs
      const homeworks = await appContext.dataProvider.getHomeworks(refreshCount > 0);
      setHomeworks(homeworks);

      // Indique que le chargement est terminé
      setHwLoading(false);
    };

    // Exécute la fonction de chargement des données
    fetchData();
  }, [appContext.dataProvider, refreshCount]);

  const translationY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    translationY.value = event.contentOffset.y;
  });

  // interpolate opacity from 0 to 1
  const stylez = useAnimatedStyle(() => {
    return {
      opacity: interpolate(translationY.value, [0, 30], [0, 1]),
    };
  });

  // Met à jour les options de navigation en fonction de l'utilisateur connecté
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Animated.View>
          {loading && (
            <Animated.View
              style={{}}
              entering={FadeInDown.springify()}
              exiting={FadeOutUp}
            >
              <Text style={{
                fontSize: 16,
                opacity: 0.5,
                color: UIColors.text,
                fontFamily: 'Papillon-Medium'
              }}>
                Chargement...
              </Text>
            </Animated.View>
          )}

          {!loading && (
            <Animated.View
              style={{}}
              entering={FadeInDown.springify()}
              exiting={FadeOutUp}
            >
              <Text
                style={{
                  fontSize: 17,
                  color: UIColors.text,
                  fontFamily: 'Papillon-Semibold',
                }}
                numberOfLines={1}
              >
                {(user && user?.name) ? `Bonjour, ${user?.name?.split(' ').pop()} !` : 'Bonjour !'}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      ),
      headerLeft: () => (
        <Animated.View>
          {loading && (
            <Animated.View
              style={{ marginLeft: 18, marginRight: 2 }}
              entering={ZoomInEasyDown.springify()}
              exiting={ZoomOutEasyUp}
            >
              <ActivityIndicator />
            </Animated.View>
          )}

          {!loading && (
            <Animated.View
              style={{ marginLeft: 16, marginRight: -6 }}
              entering={ZoomInEasyDown.springify()}
              exiting={ZoomOutEasyUp}
            >
              <Text style={{ fontSize: 26 }}>
                👋
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      ),
      headerRight: () => (
        user?.profile_picture && ( // check for profile picture before rendering
          <TouchableOpacity onPress={() => navigation.navigate('InsetSettings')}
            style={{
              width: 32,
              height: 32,
              borderRadius: 20,
              marginRight: 16,
              backgroundColor: UIColors.text + '22',
            }}
          >
            {user && user?.profile_picture && (
              <Animated.Image
                source={{ uri: user?.profile_picture }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 20,
                }}
                entering={FadeIn.duration(100)}
              />
            )}
          </TouchableOpacity>
        )
      ),
      headerTransparent: true,
      headerBackground: () => (
        Platform.OS === 'ios' ?
          <Animated.View
            style={[
              {
                flex: 1,
                backgroundColor: '#00000000',
                borderBottomWidth: 0.5,
                borderBottomColor: UIColors.text + '40',
              },
              stylez,
            ]}
          >
            <BlurView
              intensity={100}
              tint={UIColors.dark ? 'dark' : 'light'}
              style={{
                flex: 1,
              }}
            />
          </Animated.View>
          :
          <Animated.View
            style={[
              {
                flex: 1,
                backgroundColor: UIColors.backgroundHigh,
                elevation: 4,
              },
              stylez,
            ]}
          />
      ),
    });
  }, [navigation, user, loading, UIColors, stylez]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <View style={{ flex: 1, backgroundColor: UIColors.backgroundHigh }}>
      <StatusBar animated barStyle={UIColors.dark ? 'light-content' : 'dark-content'} backgroundColor={'transparent'} translucent />

      <Animated.ScrollView
        style={{
          flex: 1,
          backgroundColor: UIColors.backgroundHigh,
          paddingTop: insets.top + 44,
        }}
        scrollIndicatorInsets={{ top: insets.top }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            progressViewOffset={insets.top + 44}
            onRefresh={() => {
              setRefreshCount(refreshCount + 1);
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 200);
            }}
          />
        }
        layout={LinearTransition}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {nextCourse && (
          <Animated.View
            style={{
              margin: 16,
              marginTop: Platform.OS == 'ios' ? 8 : 18,
              marginBottom: 0,
            }}
            entering={FadeInDown.springify()}
            exiting={FadeOutUp.springify()}
            layout={LinearTransition}
          >
            <PressableScale
              style={[
                styles.nextCourse__container,
                {
                  backgroundColor: getSavedCourseColor(nextCourse?.subject?.name, nextCourse?.background_color) || UIColors.primary,
                }
              ]}
              onPress={() => navigation.navigate('Lesson', { event: nextCourse })}
            >
              <View
                style={[
                  styles.nextCourse__left,
                ]}
              >
                <Text
                  style={[
                    styles.nextCourse__left_start,
                  ]}
                  numberOfLines={1}
                >
                  {new Date(nextCourse?.start).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>

                <Text
                  style={[
                    styles.nextCourse__left_end,
                  ]}
                  numberOfLines={1}
                >
                  {new Date(nextCourse?.end).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              <View
                style={[
                  styles.nextCourse__content,
                ]}
              >
                <Text
                  style={[
                    styles.nextCourse__content_name,
                  ]}
                  numberOfLines={1}
                >
                  {formatCoursName(nextCourse?.subject?.name)}
                </Text>

                <Text
                  style={[
                    styles.nextCourse__content_start_time,
                  ]}
                  numberOfLines={1}
                >
                  {nextCourseStartTime}
                </Text>

                <View
                  style={[
                    styles.nextCourse__content_list,
                  ]}
                >
                  <View
                    style={[
                      styles.nextCourse__content_list_item,
                    ]}
                  >
                    <User2 size={16} strokeWidth={2.5} color={'#fff'} />
                    <Text
                      style={[
                        styles.nextCourse__content_list_item_text,
                      ]}
                      numberOfLines={1}
                    >
                      {nextCourse?.teachers.join(', ')}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.nextCourse__content_list_item,
                    ]}
                    numberOfLines={1}
                  >
                    <MapPin size={16} strokeWidth={2.5} color={'#fff'} />
                    <Text
                      style={[
                        styles.nextCourse__content_list_item_text,
                      ]}
                    >
                      {nextCourse?.rooms.join(', ')}
                    </Text>
                  </View>
                </View>

              </View>
            </PressableScale>
          </Animated.View>
        )}

        <Animated.View
          layout={LinearTransition}
        >
          <TabsElement navigation={navigation} />
        </Animated.View>

        <Animated.View
          layout={LinearTransition}
        >
          <CoursElement
            cours={lessons?.filter(
              (lesson) =>
                new Date(lesson.start).getDate() === new Date().getDate()
            )}
            navigation={navigation}
            loading={loading}
            showsTomorrow={false}
            date={new Date()}
          />
        </Animated.View>

        <Animated.View
          layout={LinearTransition}
        >
          <DevoirsElement
            homeworks={groupedHomeworks}
            customHomeworks={[]}
            homeworksDays={homeworksDays}
            navigation={navigation}
            loading={hwLoading}
          />
        </Animated.View>

        <View style={{ height: insets.bottom + 66 }} />

      </Animated.ScrollView>
    </View>
  );
};

const TabsElement: React.FC<{ navigation: any }> = ({ navigation }) => {
  const theme = useTheme();
  const UIColors = GetUIColors(null, 'ios');

  const [message, setMessage] = useState(null);

  useEffect(() => {
    GetRessource('messages')
      .then(data => setMessage(data.warning.content))
      .catch(error => console.error(error));
  }, []);

  const [showWanring, setShowWarning] = useState(true);

  return (
    <Animated.View style={styles.tabsTabsContainer}>
      {message && showWanring && message.trim() !== "" && (
        <Animated.View
          style={{
            borderRadius: 12,
            padding: 12,
            backgroundColor: "#E1462322",
            borderColor: '#E1462300',
            borderWidth: 1,
          }}
          entering={ZoomIn}
          exiting={ZoomOut}
          layout={LinearTransition}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: UIColors.text,
                fontFamily: 'Papillon-Semibold',
                fontSize: 16.5,
              }}
            >
              Message de l'équipe Papillon
            </Text>
            <TouchableOpacity
              style={{
                padding: 4,
                borderRadius: 20,
                backgroundColor: UIColors.text + '22',
                opacity: 0.7,
              }}
              onPress={() => setShowWarning(false)}
            >
              <X size={16} strokeWidth={3.5} color={UIColors.text} />
            </TouchableOpacity>
          </View>

          <Text style={{
            color: UIColors.text,
            fontFamily: 'Papillon-Medium',
            fontSize: 15,
            opacity: 0.8,
          }}>
            {message}
          </Text>
        </Animated.View>
      )}

      <Animated.View
        style={styles.tabsTabRow}
        layout={LinearTransition}
      >
        <PressableScale
          style={[
            styles.tabsTab,
            {
              backgroundColor: UIColors.element,
              borderColor: UIColors.borderLight + 77,
            },
            Platform.OS === 'android' && {
              borderColor: UIColors.border + 55,
              borderWidth: 0.5,
              shadowColor: '#00000055',
              elevation: 3,
            },
          ]}
          weight="light"
          activeScale={0.9}
          onPress={() => navigation.navigate('InsetSchoollife')}
        >
          <UserCheck
            width={26}
            height={26}
            stroke={theme.dark ? '#ffffff' : '#000000'}
          />
          <Text style={styles.tabsTabText}>Vie scolaire</Text>
        </PressableScale>
        <PressableScale
          style={[
            styles.tabsTab,
            {
              backgroundColor: UIColors.element,
              borderColor: UIColors.borderLight + 77,
            },
            Platform.OS === 'android' && {
              borderColor: UIColors.border + 55,
              borderWidth: 0.5,
              shadowColor: '#00000055',
              elevation: 3,
            },
          ]}
          weight="light"
          activeScale={0.9}
          onPress={() => navigation.navigate('InsetConversations')}
        >
          <Messages stroke={theme.dark ? '#ffffff' : '#000000'} />
          <Text style={styles.tabsTabText}>Messages</Text>
        </PressableScale>
        <PressableScale
          style={[
            styles.tabsTab,
            {
              backgroundColor: UIColors.element,
              borderColor: UIColors.borderLight + 77,
            },
            Platform.OS === 'android' && {
              borderColor: UIColors.border + 55,
              borderWidth: 0.5,
              shadowColor: '#00000055',
              elevation: 3,
            },
          ]}
          weight="light"
          activeScale={0.9}
          onPress={() => navigation.navigate('InsetEvaluations')}
          accessibilityLabel="Compétences"
        >
          <Competences stroke={theme.dark ? '#ffffff' : '#000000'} />
          <Text style={styles.tabsTabText}>Compét.</Text>
        </PressableScale>
      </Animated.View>
    </Animated.View>
  );
};

const CoursElement: React.FC<{
  cours: PapillonLesson[] | null;
  navigation: any; // TODO: type from react-navigation
  loading: boolean;
  showsTomorrow: boolean;
  date: Date;
}> = ({ cours, navigation, loading, showsTomorrow, date }) => {
  const UIColors = GetUIColors(null, 'ios');

  return (
    <View>
      <View style={[styles.sectionHeader]}>
        <View style={[styles.sectionHeaderText]}
          accessible={true}
          accessibilityLabel={'Journée du' + new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        >
          <NativeText style={[styles.sectionHeaderDay]}>
            {showsTomorrow ? 'Votre journée de demain' : 'Votre journée'}
          </NativeText>
          <NativeText style={[styles.sectionHeaderDate]}>
            {new Date(date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </NativeText>
        </View>
        <TouchableOpacity
          style={[
            styles.sectionHeaderIcon,
            { backgroundColor: UIColors.text + '22' },
          ]}
          onPress={() => {
            navigation.navigate('CoursHandler');
          }}
          accessible={true}
          accessibilityLabel="Voir l'emploi du temps"
        >
          <PapillonIconsCalendarFill
            fill={UIColors.text}
            stroke={UIColors.text}
          />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.sectionContainer,
          {
            backgroundColor: UIColors.element,
            borderColor: UIColors.borderLight + '77',
            borderWidth: Platform.OS === 'android' ? 0.5 : 0,
          },
        ]}
      >
        {!loading ? (
          cours && cours.length > 0 ? (
            cours.map((lesson, index) => (
              <View key={index}>
                <CoursItem
                  key={lesson.id}
                  index={index}
                  lesson={lesson}
                  cours={cours}
                  navigation={navigation}
                />
              </View>
            ))
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                Aucun cours {!showsTomorrow ? 'aujourd\'hui' : 'demain'}
              </Text>
            </View>
          )
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>
              Chargement de l'emploi du temps...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

function CoursItem({
  lesson,
  cours,
  navigation,
  index,
}: {
  lesson: PapillonLesson;
  cours: PapillonLesson[];
  index: number;
  navigation: any; // TODO: type from react-navigation
}) {
  const UIColors = GetUIColors(null, 'ios');

  function lz(nb: number) {
    return nb < 10 ? `0${nb}` : nb.toString();
  }

  return (
    <>
      {cours[index - 1] &&
        new Date(lesson.start).getTime() -
        new Date(cours[index - 1].end).getTime() >
        1800000 && (
          <Animated.View
            style={[
              styles.coursSeparator,
            ]}
            entering={FadeInDown.delay(200 + 100 * index)}
            exiting={FadeOut}
          >
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
            />
          </Animated.View>
        )}

      <ContextMenuView
        style={{ flex: 1 }}
        previewConfig={{
          borderRadius: 12,
          backgroundColor: UIColors.element,
        }}
        menuConfig={{
          menuTitle: lesson.subject?.name ?? '(inconnu)',
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
          ],
        }}
        onPressMenuItem={({ nativeEvent }) => {
          if (nativeEvent.actionKey === 'open') {
            navigation.navigate('Lesson', { event: lesson });
          }
        }}
        onPressMenuPreview={() => {
          navigation.navigate('Lesson', { event: lesson });
        }}
      >
        <Animated.View
          style={[
            styles.homeworksDevoirsDayContainer,
          ]}
          entering={FadeInDown.springify().delay(100 * index)}
          exiting={FadeOut}
        >
          <TouchableHighlight
            style={styles.coursItemContainer}
            underlayColor={UIColors.text + '12'}
            onPress={() => navigation.navigate('Lesson', { event: lesson })}
          >
            <>
              <View style={styles.coursItemTimeContainer}>
                <Text style={styles.coursItemTimeStart}>
                  {new Date(lesson.start).toLocaleTimeString('fr-FR', {
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </Text>
                <Text style={styles.coursItemTimeEnd}>
                  {new Date(lesson.end).toLocaleTimeString('fr-FR', {
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </Text>
              </View>
              <View
                style={[
                  styles.coursItemColor,
                  {
                    backgroundColor: getSavedCourseColor(
                      lesson.subject?.name ?? '',
                      lesson.background_color
                    ),
                  },
                ]}
              />
              <View style={styles.coursItemDataContainer}>
                <Text style={[styles.coursItemDataSubject]}>
                  {formatCoursName(lesson.subject?.name ?? '(inconnu)')}
                </Text>
                <Text style={[styles.coursItemDataTeachers]}>
                  {lesson.teachers.join(', ')}
                </Text>
                <Text style={[styles.coursItemDataRoom]}>
                  {lesson.rooms.join(', ') || 'Aucune salle'}
                </Text>

                {lesson.status && (
                  <Text
                    style={[
                      styles.coursItemDataStatus,
                      {
                        backgroundColor:
                          getSavedCourseColor(
                            lesson.subject?.name ?? '',
                            lesson.background_color
                          ) + '22',
                        color: getSavedCourseColor(
                          lesson.subject?.name ?? '',
                          lesson.background_color
                        ),
                      },
                    ]}
                  >
                    {lesson.status}
                  </Text>
                )}
              </View>
            </>
          </TouchableHighlight>
        </Animated.View>
      </ContextMenuView>
    </>
  );
}

function DevoirsElement({
  homeworks,
  customHomeworks,
  homeworksDays,
  navigation,
  loading,
}: {
  homeworks: PapillonGroupedHomeworks[] | null;
  customHomeworks: any[]; // TODO
  homeworksDays: Array<{ custom: boolean; date: number }>;
  navigation: any; // TODO: type from react-navigation
  loading: boolean;
}) {
  const UIColors = GetUIColors(null, 'ios');

  return (
    <View>
      <View style={[styles.sectionHeader]}>
        <View style={[styles.sectionHeaderText]}
          accessible={true}
          accessibilityLabel="Travail à faire pour les prochains jours"
        >
          <NativeText style={[styles.sectionHeaderDay]}>
            Travail à faire
          </NativeText>
          <NativeText style={[styles.sectionHeaderDate]}>
            pour les prochains jours
          </NativeText>
        </View>
        <TouchableOpacity
          style={[
            styles.sectionHeaderIcon,
            { backgroundColor: UIColors.text + '22' },
          ]}
          onPress={() => {
            navigation.navigate('DevoirsHandler');
          }}
          accessible={true}
          accessibilityLabel="Voir les devoirs"
        >
          <PapillonIconsBook
            stroke={UIColors.text}
          />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.sectionContainer,
          {
            backgroundColor: UIColors.element,
            borderColor: UIColors.borderLight + '77',
            borderWidth: Platform.OS === 'android' ? 0.5 : 0,
          },
        ]}
      >
        {!loading ? (
          homeworks?.length != 0 ? (
            homeworksDays.map((day, index) => (
              <DevoirsDay
                key={day.date}
                index={index}
                homeworks={
                  !day.custom
                    ? homeworks?.find((hw) => hw.time === day.date)
                    : ({
                      formattedDate: new Date(day.date).toLocaleDateString(
                        'fr-FR',
                        {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        }
                      ),
                      time: day.date,
                      date: new Date(day.date),
                      homeworks: [] as PapillonHomework[],
                    } as PapillonGroupedHomeworks)
                }
                navigation={navigation}
                customHomeworks={customHomeworks.filter((hw) => {
                  let hwDate = new Date(hw.date);
                  hwDate.setHours(0, 0, 0, 0);

                  return hwDate.getTime() === day.date;
                })}
              />
            ))
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Pas de travail à faire</Text>
            </View>
          )
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>
              Chargement des travaux à faire...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const DevoirsDay = ({
  homeworks,
  customHomeworks,
  navigation,
  index,
}: {
  homeworks?: PapillonGroupedHomeworks;
  customHomeworks: any[]; // TODO
  navigation: any; // TODO: type from react-navigation
  index: number;
}) => {
  const UIColors = GetUIColors();

  const parentIndex = index;

  return (
    <Animated.View
      style={[
        styles.homeworksDevoirsDayContainer,
      ]}
      entering={FadeInDown.springify().delay(100 * index)}
      exiting={FadeOut}
    >
      {((homeworks && homeworks.homeworks.length > 0) ||
        customHomeworks.length > 0) && (
          <>
            <View
              style={[
                styles.homeworksDevoirsDayHeaderContainer,
                UIColors.theme == 'dark' && Platform.OS !== 'ios'
                  ? { backgroundColor: UIColors.text + '22' }
                  : { backgroundColor: UIColors.primary + '22' },
              ]}
            >
              <Text
                style={[
                  styles.homeworksDevoirsDayHeaderTitle,
                  UIColors.theme == 'dark' && Platform.OS !== 'ios'
                    ? { color: UIColors.text }
                    : { color: UIColors.primary },
                ]}
              >
                pour {homeworks?.formattedDate}
              </Text>
            </View>

            <View style={styles.homeworksDevoirsDayContent}>
              {homeworks &&
                homeworks.homeworks.map((homework, index) => (
                  <DevoirsContent
                    key={homework.id}
                    index={index}
                    parentIndex={parentIndex}
                    homework={homework}
                    navigation={navigation}
                  />
                ))}

              {customHomeworks &&
                customHomeworks.map((homework, index) => (
                  <DevoirsContent
                    key={homework.localID}
                    index={index}
                    parentIndex={parentIndex}
                    homework={homework}
                    navigation={navigation}
                  />
                ))}
            </View>
          </>
        )}
    </Animated.View>
  );
};

function DevoirsContent({
  homework,
  navigation,
  index,
  parentIndex,
}: {
  homework: PapillonHomework;
  index: number;
  parentIndex: number;
  navigation: any; // TODO: type from react-navigation
}) {
  const UIColors = GetUIColors(null, 'ios');

  const [checkLoading, setCheckLoading] = useState(false);
  const appContext = useAppContext();

  const handleCheckChange = async () => {
    setCheckLoading(true);

    // if (homework.custom) {
    //   AsyncStorage.getItem('customHomeworks').then((customHomeworks) => {
    //     let hw = [];
    //     if (customHomeworks) {
    //       hw = JSON.parse(customHomeworks);
    //     }

    //     // find the homework
    //     for (let i = 0; i < hw.length; i++) {
    //       if (hw[i].local_id === homework.local_id) {
    //         hw[i].done = !checked;
    //       }
    //     }

    //     setChecked(!checked);
    //     AsyncStorage.setItem('customHomeworks', JSON.stringify(hw));

    //     setTimeout(() => {
    //       setCheckLoading(false);
    //     }, 100);
    //   });

    //   return;
    // }

    await appContext.dataProvider?.changeHomeworkState(
      homework,
      !homework.done
    );
    setCheckLoading(false);
  };

  // when check, animate text to 0
  useEffect(() => {
    if (homework.done) {

    }
  }, [homework.done]);

  if (!homework || !homework.subject) return null;

  return (
    <ContextMenuView
      style={{ flex: 1 }}
      previewConfig={{
        borderRadius: 12,
        backgroundColor: UIColors.element,
      }}
      menuConfig={{
        menuTitle: homework.subject.name,
        menuItems: [
          {
            actionKey: 'open',
            actionTitle: 'Voir le devoir en détail',
            icon: {
              type: 'IMAGE_SYSTEM',
              imageValue: {
                systemName: 'book.pages',
              },
            },
          },
          {
            actionKey: 'check',
            actionTitle: 'Marquer comme fait',
            menuState: homework.done ? 'on' : 'off',
            icon: {
              type: 'IMAGE_SYSTEM',
              imageValue: {
                systemName: 'checkmark.circle',
              },
            },
          },
          ...([
            homework.attachments.length > 0
              ? {
                actionKey: 'files',
                actionTitle: 'Ouvrir la pièce jointe',
                actionSubtitle: homework.attachments[0].name,
                icon: {
                  type: 'IMAGE_SYSTEM',
                  imageValue: {
                    systemName: 'paperclip',
                  },
                },
              }
              : void 0,
          ] as MenuElementConfig[]),
        ],
      }}
      onPressMenuItem={({ nativeEvent }) => {
        if (nativeEvent.actionKey === 'open') {
          navigation.navigate('Devoir', { homeworkLocalID: homework.localID });
        } else if (nativeEvent.actionKey === 'check') {
          handleCheckChange();
        } else if (nativeEvent.actionKey === 'files') {
          openURL(homework.attachments[0].url);
        }
      }}
      onPressMenuPreview={() => {
        navigation.navigate('Devoir', { homeworkLocalID: homework.localID });
      }}
    >
      <Animated.View
        style={[
        ]}
        entering={FadeInDown.springify().delay(100 * index)}
        exiting={FadeOut}
      >
        <TouchableHighlight
          style={[styles.homeworksDevoirsContentContainer]}
          underlayColor={UIColors.text + '12'}
          onPress={() =>
            navigation.navigate('Devoir', { homeworkLocalID: homework.localID })
          }
        >
          <View style={styles.homeworksDevoirsContentInner}>
            <CheckAnimated
              backgroundColor={UIColors.element}
              checked={homework.done && !checkLoading}
              pressed={handleCheckChange}
              loading={checkLoading}
            />

            <View style={styles.homeworksDevoirsContentParent}>
              <View>
                <View
                  style={styles.homeworksDevoirsContentHeaderSubjectContainer}
                >
                  <View
                    style={[
                      styles.homeworksDevoirsContentHeaderSubjectColor,
                      {
                        backgroundColor: getSavedCourseColor(homework.subject.name) ?? homework.background_color,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.homeworksDevoirsContentHeaderSubjectTitle,
                      { color: UIColors.text },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {formatCoursName(homework.subject.name)}
                  </Text>
                </View>
              </View>

              <Animated.View
                style={{
                  overflow: 'visible',
                }}
              >
                <Text
                  numberOfLines={2}
                  style={[
                    styles.homeworksDevoirsContentContentDescription,
                    {
                      color: UIColors.text,
                      height: homework.description.length > 40 ? 38 : 20,
                    },
                  ]}
                >
                  {convertHTML(homework.description)}
                </Text>
              </Animated.View>

              {homework.attachments.length > 0 && (
                <View style={styles.homeworksDevoirsContentFooterContainer}>
                  <View
                    style={styles.homeworksDevoirsContentFooterFilesContainer}
                  >
                    {homework.attachments.map((file, index) => (
                      <PressableScale
                        key={index}
                        style={[
                          styles.homeworksDevoirsContentFooterFilesFileContainer,
                          { backgroundColor: UIColors.text + '12' },
                        ]}
                        onPress={() => openURL(file.url)}
                      >
                        {file.url ? (
                          <DownloadCloud size={22} color={UIColors.text} />
                        ) : (
                          <AlertCircle size={22} color={'#ff0000'} />
                        )}
                        <Text
                          style={
                            styles.homeworksDevoirsContentFooterFilesFileText
                          }
                          numberOfLines={1}
                        >
                          {file.name ? file.name : 'Lien invalide'}
                        </Text>
                      </PressableScale>
                    ))}
                  </View>

                  <View style={{}} />
                </View>
              )}
            </View>
          </View>
        </TouchableHighlight>
      </Animated.View>
    </ContextMenuView>
  );
}

const styles = StyleSheet.create({
  nextCourse__container: {
    borderRadius: 14,
    borderCurve: 'continuous',
    overflow: 'hidden',
    flexDirection: 'row',
    height: 84,
  },

  nextCourse__left: {
    padding: 14,
    gap: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff33',
    borderRightWidth: 1,
    borderRightColor: '#ffffff33',
  },

  nextCourse__left_start: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
    color: '#ffffff',
  },

  nextCourse__left_end: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    color: '#ffffff99',
  },

  nextCourse__content: {
    flex: 1,
  },

  nextCourse__content: {
    padding: 14,
    gap: 0,
    justifyContent: 'center',
    gap: 3,
  },

  nextCourse__content_name: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
    color: '#ffffff',
  },

  nextCourse__content_start_time: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    color: '#ffffff99',
  },

  nextCourse__content_list: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },

  nextCourse__content_list_item: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },

  nextCourse__content_list_item_text: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    color: '#ffffff',
  },

  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
  },

  loadingText: {
    fontSize: 15,
    opacity: 0.5,
  },

  homeworksDevoirsElementContainer: {
    paddingVertical: 8,

    borderRadius: 12,
    borderCurve: 'continuous',

    overflow: 'hidden',
  },
  homeworksDevoirsDayContainer: {
    flex: 1,
    marginTop: 5,
  },
  homeworksDevoirsDayHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  homeworksDevoirsDayHeaderTitle: {
    fontSize: 15,
    fontFamily: 'Papillon-Semibold',
  },
  homeworksDevoirsDayContent: {
    paddingTop: 5,
  },

  homeworksDevoirsContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
  },
  homeworksDevoirsContentInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  homeworksDevoirsContentParent: {
    flex: 1,
    paddingHorizontal: 14,
    gap: 6,
  },

  homeworksDevoirsContentHeaderSubjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  homeworksDevoirsContentHeaderSubjectColor: {
    width: 10,
    height: 10,
    borderRadius: 8,
  },
  homeworksDevoirsContentHeaderSubjectTitle: {
    fontSize: 16,
    fontFamily: 'Papillon-Semibold',
  },

  homeworksDevoirsContentContentDescription: {
    fontSize: 15,
  },

  homeworksDevoirsContentFooterContainer: {
    marginTop: 4,
  },
  homeworksDevoirsContentFooterFilesContainer: {
    gap: 2,
  },
  homeworksDevoirsContentFooterFilesFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  homeworksDevoirsContentFooterFilesFileText: {
    fontSize: 15,
    fontFamily: 'Papillon-Semibold',
  },

  checkboxCheckContainer: {
    width: 26,
    height: 26,
    borderRadius: 16,
    borderCurve: 'continuous',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
  },
  checkboxCheckChecked: {
    backgroundColor: '#159C5E',
    borderColor: '#159C5E',
  },

  coursContainer: {
    paddingVertical: 6,
    overflow: 'hidden',
    gap: 0,
  },

  coursItemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: -4,
  },

  coursItemTimeContainer: {
    width: 50,
    justifyContent: 'space-between',
  },
  coursItemTimeStart: {
    textAlign: 'right',
    fontWeight: '600',
  },
  coursItemTimeEnd: {
    textAlign: 'right',
    opacity: 0.5,
  },

  coursItemColor: {
    width: 5,
    height: '100%',
    borderRadius: 8,
  },
  coursItemDataContainer: {
    flex: 1,
  },
  coursItemDataSubject: {
    fontSize: 16,
    fontFamily: 'Papillon-Semibold',
    marginBottom: 8,
  },
  coursItemDataTeachers: {
    opacity: 0.5,
  },
  coursItemDataRoom: {
    fontWeight: '500',
  },
  coursItemDataStatus: {
    fontWeight: '500',
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },

  coursSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 2,
    marginHorizontal: 12,
    marginBottom: 2,
  },
  coursSeparatorLine: {
    flex: 1,
    height: 2,
    borderRadius: 3,
  },

  tabsTabsContainer: {
    marginTop: 8,
    marginHorizontal: 16,
    gap: 9,
    marginBottom: 16,
  },

  warningMessageContainer: {
    borderWidth: 2,
    borderColor: '#B42828',
    backgroundColor: '#E8BEBE',
    padding: 10,
    gap: 10,
    borderRadius: 10,
  },
  warningMessageText: {
    textAlign: 'center',
    color: '#4D2527',
    fontFamily: 'Papillon-Semibold',
  },

  tabsTabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },

  tabsTab: {
    borderRadius: 12,
    borderCurve: 'continuous',

    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 4,

    borderWidth: 0,
    shadowColor: '#00000055',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,

    marginBottom: 14,
    elevation: 0,
  },

  tabsTabText: {
    fontSize: 14.5,
    fontFamily: 'Onest-Semibold',
  },

  nextCoursContainer: {
    height: 117,
    width: '100%',

    marginTop: -12,
    marginBottom: -52,
  },

  headerTheme: {
    width: '100%',
    height: 400,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerThemeImage: {
    width: '100%',
    height: 150,
  },

  sectionContainer: {
    marginHorizontal: 16,
    paddingVertical: 6,

    borderRadius: 12,
    borderCurve: 'continuous',

    shadowColor: '#00000055',
    shadowOffset: {
      width: 0,
      height: 1.5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,

    elevation: 3,
    marginBottom: 14,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 14,
  },
  sectionHeaderText: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 2,
  },
  sectionHeaderDay: {
    fontSize: 15,
    opacity: 0.5,
    fontFamily: 'Papillon-Medium',
  },
  sectionHeaderDate: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
  },
  sectionHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
