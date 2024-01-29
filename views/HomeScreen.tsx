import React, { useMemo } from 'react';

import {
  View,
  Alert,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
  Easing,
  TouchableHighlight,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
  StatusBar,
  TouchableOpacity,
  type ImageSourcePropType
} from 'react-native';
import { useEffect, useState, useRef } from 'react';

// Components & Styles
import { useTheme, Text } from 'react-native-paper';
import { PressableScale } from 'react-native-pressable-scale';

// Modules
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContextMenuView, MenuElementConfig } from 'react-native-ios-context-menu';
import NextCoursElem from '../interface/HomeScreen/NextCours';
import SyncStorage from 'sync-storage';
import * as ExpoLinking from 'expo-linking';

// Icons 
import { DownloadCloud, AlertCircle, UserCircle2, Globe2 } from 'lucide-react-native';
import { Competences, Messages, Papillon as PapillonIcon, UserCheck } from '../interface/icons/PapillonIcons';

// Formatting
import GetUIColors from '../utils/GetUIColors';
import { getSavedCourseColor } from '../utils/ColorCoursName';
import formatCoursName from '../utils/FormatCoursName';

// Custom components
import PapillonList from '../components/PapillonList';
import CheckAnimated from '../interface/CheckAnimated';

import { useAppContext } from '../utils/AppContext';
import sendToSharedGroup from '../fetch/SharedValues';
import { LinearGradient } from 'expo-linear-gradient';

import { useNetInfo } from '@react-native-community/netinfo';
import AlertAnimated from '../interface/AlertAnimated';
import type { PapillonUser } from '../fetch/types/user';
import type { PapillonLesson } from '../fetch/types/timetable';
import type { PapillonGroupedHomeworks, PapillonHomework } from '../fetch/types/homework';
import { dateToFrenchFormat } from '../utils/dates';
import { convert as convertHTML } from 'html-to-text';
import { atom, useAtom, useSetAtom } from 'jotai';
import { homeworksAtom, homeworksUntilNextWeekAtom } from '../atoms/homeworks';

// Functions
const openURL = (url: string) => {
  const isURL = url.includes('http://') || url.includes('https://');

  if (!isURL) {
    Alert.alert(
      'URL invalide',
      'Le lien fourni par votre établissement ne peut pas être ouvert.',
      [
        {
          text: 'OK',
          style: 'cancel'
        },
        {
          text: 'Ouvrir quand même',
          onPress: () => {
            Linking.openURL(`https://${url}`);
          }
        }
      ]
    );
    return;
  }

  WebBrowser.openBrowserAsync(url, {
    dismissButtonStyle: 'done',
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    controlsColor: Platform.OS === 'ios' ? '#29947A' : void 0,
    readerMode: true,
    createTask: false,
  });
};

const THEME_IMAGES: Record<string, ImageSourcePropType> = {
  'papillon/default': require('../assets/themes/papillon/default.png'),
  'papillon/grospapillon': require('../assets/themes/papillon/grospapillon.png'),
  'papillon/papillonligne': require('../assets/themes/papillon/papillonligne.png'),
  'papillon/papillonlumineux': require('../assets/themes/papillon/papillonlumineux.png'),
  'papillon/papillonpapier': require('../assets/themes/papillon/papillonpapier.png'),
  'papillon/papillonplusieurs': require('../assets/themes/papillon/papillonplusieurs.png'),
  'papillon/formes': require('../assets/themes/papillon/formes.png'),
  'papillon/formescolor': require('../assets/themes/papillon/formescolor.png'),
  'hero/circuit': require('../assets/themes/hero/circuit.png'),
  'hero/damier': require('../assets/themes/hero/damier.png'),
  'hero/flakes': require('../assets/themes/hero/flakes.png'),
  'hero/movement': require('../assets/themes/hero/movement.png'),
  'hero/sparkcircle': require('../assets/themes/hero/sparkcircle.png'),
  'hero/topography': require('../assets/themes/hero/topography.png'),
  'hero/wave': require('../assets/themes/hero/wave.png'),
  'gribouillage/clouds': require('../assets/themes/gribouillage/clouds.png'),
  'gribouillage/cross': require('../assets/themes/gribouillage/cross.png'),
  'gribouillage/gribs': require('../assets/themes/gribouillage/gribs.png'),
  'gribouillage/hearts': require('../assets/themes/gribouillage/hearts.png'),
  'gribouillage/heavy': require('../assets/themes/gribouillage/heavy.png'),
  'gribouillage/lines': require('../assets/themes/gribouillage/lines.png'),
  'gribouillage/stars': require('../assets/themes/gribouillage/stars.png'),
  'artdeco/arrows': require('../assets/themes/artdeco/arrows.png'),
  'artdeco/clouds': require('../assets/themes/artdeco/clouds.png'),
  'artdeco/cubes': require('../assets/themes/artdeco/cubes.png'),
  'artdeco/sparks': require('../assets/themes/artdeco/sparks.png'),
  'artdeco/stripes': require('../assets/themes/artdeco/stripes.png'),
};

function HomeScreen({ navigation }: { navigation: any }) {
  const appContext = useAppContext();
  const theme = useTheme();
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const expoLinkedURL = ExpoLinking.useURL();

  const [refreshing, setRefreshing] = useState(false);
  const [customHomeworks, setCustomHomeworks] = useState([]);
  const [homeworksDays, setHomeworksDays] = useState<Array<{ custom: boolean, date: number }>>([]);

  const [showsTomorrowLessons, setShowsTomorrowLessons] = useState(false);
  const net = useNetInfo();
  const now = new Date();

  const setHomeworks = useSetAtom(homeworksAtom);
  const [groupedHomeworks] = useAtom(
    useMemo( // We group homeworks by day, so we can display them in a list.
      () => atom((get) => {
        // Make sure to only display the homeworks until the next week.
        const homeworks = get(homeworksUntilNextWeekAtom);
        if (homeworks === null) return null;

        const groupedHomeworks = homeworks.reduce((grouped, homework) => {
          const homeworkDate = new Date(homework.date);
          homeworkDate.setHours(0, 0, 0, 0);

          setHomeworksDays((prevDays) => {
            let days = [...prevDays]; // Copy of the old value.

            const existingDay = days.find((day) => day.date === homeworkDate.getTime());
            if (!existingDay) {
              days.push({
                date: homeworkDate.getTime(),
                custom: false,
              });
            }

            days.sort((a, b) => a.date - b.date);
            return days;
          });

          const formattedDate = homeworkDate.getDate() === now.getDate() + 1
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

        return Object.values(groupedHomeworks).sort((a, b) => a.time - b.time);
      }),
      []
    )
  );

  // url handling
  useEffect(() => {
    setTimeout(() => {
      if (expoLinkedURL) handleURL(expoLinkedURL);
    }, 1000);

    // subscribe to url changes
    ExpoLinking.addEventListener('url', ({ url }) => {
      handleURL(url);
    });
  }, [expoLinkedURL]);

  /**
   * For now, it only handles papillon://grade?=... URLs.
   * @param url The URL to handle.
   */
  const handleURL = (url: string): void => {
    // if url is papillon://grade?=...
    if (!url || !url.startsWith('papillon://grade?=')) return;
    const grade = url.split('papillon://grade?=')[1];

    // decode base64
    const decodedGrade = Buffer.from(grade, 'base64').toString();

    // remove everything before the first { and after the last }
    const decodedGradeRegex = decodedGrade.replace(/.*?({.*}).*/g, '$1');

    // parse JSON
    const decodedGradeJSON = JSON.parse(decodedGradeRegex);
    
    // open grade modal
    navigation.navigate('Grade', { grade: decodedGradeJSON, allGrades: [decodedGradeJSON] });
  };

  const [themeAdjustments, setThemeAdjustments] = useState({
    enabled: true,
    color: '#32AB8E',
    image: 'papillon/default'
  });

  const [nextColor, setNextColor] = useState('#32AB8E');

  const refreshSettings = () => {
    const settings = SyncStorage.get('adjustments');
    if (settings) {
      setThemeAdjustments({
        enabled: true,
        color: settings.homeThemeColor ?? '#32AB8E',
        image: settings.homeThemeImage ?? 'papillon/default'
      });
    }
  };

  useEffect(() => {
    // Refresh on first load.
    refreshSettings();
    
    // Refresh settings every time the screen is focused
    return navigation.addListener('focus', () => refreshSettings());
  }, []);

  const loadCustomHomeworks = async (): Promise<void> => {
    return; // TODO
    const customHomeworks = await AsyncStorage.getItem('customHomeworks');
    const homeworks: any[] = JSON.parse(customHomeworks || '[]');

    homeworks.forEach((homework) => {
      let hwDate = new Date(homework.date);
      hwDate.setHours(0, 0, 0, 0);

      setHomeworksDays((prevDays) => {
        const newDays = [...prevDays];

        // check if day already exists
        if (!newDays.find((day) => day.date === hwDate.getTime())) {
          newDays.push({
            date: hwDate.getTime(),
            custom: true,
          });
        }

        // sort days
        newDays.sort((a, b) => a.date - b.date);

        return newDays;
      });
    });
      
    // setCustomHomeworks(homeworks);
  };

  /**
   * Once the data has been fetched from either cache or APIs,
   * we need to process them before displaying.
   */
  const applyHomeworksAndLessonsData = async (lessons: PapillonLesson[]): Promise<void> => {
    setLessons({ loading: false, data: lessons });
    
    await loadCustomHomeworks();
    await sendToSharedGroup(lessons);
  };

  /**
   * `data` is only allowed when we strictly
   * check that the state is not loading.
   */
  type LazyLoadedValue<T> = { 
    loading: true
    data: null
  } | {
    loading: false,
    data: T
  }

  const [user, setUser] = useState<LazyLoadedValue<PapillonUser>>({
    loading: true,
    data: null
  });

  const [lessons, setLessons] = useState<LazyLoadedValue<PapillonLesson[]>>({
    loading: true,
    data: null
  });

  /**
   * Fetch timetable (1st) and homeworks (2nd) and apply them
   * so that they can be displayed.
   * 
   * @param force - Whether to force the refresh of the data.
   */
  const refreshScreenData = async (force: boolean): Promise<void> => {
    try {
      if (!appContext.dataProvider) return;
  
      const todayKey = dateToFrenchFormat(now);
      let timetable = await appContext.dataProvider.getTimetable(now, force);
      // Take only the lessons that are for today.
      let lessons = timetable.filter(lesson => dateToFrenchFormat(new Date(lesson.start)) === todayKey);
  
      // Check if all lessons for today are done.
      const todayLessonsDone = lessons.every(lesson => new Date(lesson.end) < now);
  
      if (todayLessonsDone) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowKey = dateToFrenchFormat(tomorrow);
  
        // Check if tomorrow is monday.
        const isTomorrowMonday = tomorrow.getDay() === 1;
  
        // We need to fetch next week's timetable.
        if (isTomorrowMonday) {
          timetable = await appContext.dataProvider.getTimetable(tomorrow, force);
        } // else, we just keep our current timetable array.
  
        lessons = timetable.filter(lesson => dateToFrenchFormat(new Date(lesson.start)) === tomorrowKey);
        setShowsTomorrowLessons(true);
      }

      if (groupedHomeworks === null) {
        const homeworks = await appContext.dataProvider.getHomeworks(force);
        setHomeworks(homeworks);
      }

      await applyHomeworksAndLessonsData(lessons);
    }
    catch { /** No-op. */}
  };

  // On first mount, we need to fetch user data
  // and finally all the data that will be displayed.
  // We don't force the refresh of the data, so cache can be used.
  useEffect(() => {
    (async () => {
      if (!appContext.dataProvider) return;

      const userData = await appContext.dataProvider.getUser();
      setUser({ loading: false, data: userData });

      await refreshScreenData(false);
    })();
  }, []);


  const yOffset = new Animated.Value(0);

  // Load navigation bar data.
  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <Animated.View
          style={[{
            backgroundColor: nextColor,
            overflow: 'hidden',
          }]}
        >
          <Animated.Image
            source={THEME_IMAGES[themeAdjustments.image]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: 150,
              opacity: themeImageOpacity,
              transform: [{
                scale: themeImageTransform.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.9],
                })
              }],
            }}
          />
          <LinearGradient
            colors={[nextColor + '00', nextColor + 'FF']}
            locations={[0, 0.8]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: 150,
            }}
          />
          <View
            style={[{
              backgroundColor: '#00000032',
              paddingTop: insets.top,
              paddingBottom: 0,
              flexDirection: 'column',
              zIndex: 3,
            }]}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingBottom: 6,
                paddingTop: 4,
              }}
            >
              <PapillonIcon fill={'#ffffff99'} width={32} height={32} />
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 17,
                  fontFamily: 'Papillon-Semibold',
                }}
              >
                Vue d'ensemble
              </Text>
              <TouchableOpacity
                style={headerStyles.headerPfpContainer}
                onPress={() => navigation.navigate('InsetSettings', { isModal: true })}
              >
                {!user.loading && user.data.profile_picture ? (
                  <Image
                    source={{ uri: user.data.profile_picture }}
                    style={headerStyles.headerPfp}
                  />
                ) : (
                  <UserCircle2
                    size={36}
                    style={headerStyles.headerPfp}
                    color="#ccc"
                  />
                )}
              </TouchableOpacity>
            </View>
            <Animated.View
              style={[
                {
                  marginTop: 0,
                  height: Platform.OS === 'ios' ? nextCoursHeight : 108,
                }
              ]}
            >
              <NextCoursElem
                cours={lessons.data}
                navigation={navigation}
                setNextColor={(color) => {
                  setNextColor(color);
                }}
                yOffset={yOffset}
                color={themeAdjustments.enabled ? nextColor : void 0}
                style={{
                  marginHorizontal: 16,
                  marginVertical: 0,
                  marginTop: 2,
                }}
              />
              <View style={{ height: 16 }} />
            </Animated.View>
          </View>
        </Animated.View>
      )
    });
  }, [navigation, user, themeAdjustments, insets, yOffset, UIColors, theme, nextColor, setNextColor]);

  // Animations
  const scrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: yOffset } } }],
    { useNativeDriver: false }
  );

  const nextCoursHeight = yOffset.interpolate({
    inputRange: Platform.OS === 'ios' ? [0, 150] : [0, 1],
    outputRange: [106, 0],
    extrapolate: 'clamp',
  });

  const themeImageOpacity = yOffset.interpolate({
    inputRange: Platform.OS === 'ios' ? [0, 100] : [0, 1],
    outputRange: [0.8, 0],
    extrapolate: 'clamp',
  });

  const themeImageTransform = yOffset.interpolate({
    inputRange: Platform.OS === 'ios' ? [0, 100] : [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <ScrollView
      style={{ backgroundColor: UIColors.backgroundHigh }}
      contentInsetAdjustmentBehavior='automatic'
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          colors={[Platform.OS === 'android' ? UIColors.primary : '']}
          onRefresh={async () => {
            // Refresh data
            setRefreshing(true);
            setLessons({ loading: true, data: null });

            await refreshScreenData(true);
            setRefreshing(false);
          }}
        />
      }
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    >
      {Platform.OS === 'android' ? (
        <View style={{ height: 10 }} />
      ) : (
        <View style={{ height: 10 }} />
      )}

      {isFocused ? (
        <StatusBar
          barStyle={
            themeAdjustments.enabled ? 'light-content' :
              theme.dark ? 'light-content' : 'dark-content'
          }
          translucent={true}
          backgroundColor={'transparent'}
        />
      ) : null }

      <TabsElement navigation={navigation} />

      <AlertAnimated
        visible={!net.isConnected}
        title="Vous êtes hors-ligne"
        subtitle="Les informations affichées peuvent être obsolètes."
        left={<Globe2 color={UIColors.text} />}
        height={80}
        style={{marginHorizontal: 16}}
      />

      <CoursElement
        cours={lessons.data}
        navigation={navigation}
        loading={lessons.loading}
        showsTomorrow={showsTomorrowLessons}
      />
      
      <DevoirsElement
        homeworks={groupedHomeworks}
        customHomeworks={customHomeworks}
        homeworksDays={homeworksDays}
        navigation={navigation}
        loading={groupedHomeworks === null}
      />
    </ScrollView>
  );
}

const TabsElement: React.FC<{ navigation: any }> = ({ navigation }) => {
  const theme = useTheme();
  const UIColors = GetUIColors();

  return (
    <View style={styles.tabsTabsContainer}>
      <View style={styles.tabsTabRow}>
        <PressableScale
          style={[styles.tabsTab, { backgroundColor: UIColors.element }]}
          weight="light"
          activeScale={0.9}
          onPress={() => navigation.navigate('InsetSchoollife')}
        >
          <UserCheck width={26} height={26} stroke={theme.dark ? '#ffffff' : '#000000'} />
          <Text style={styles.tabsTabText}>Vie scolaire</Text>
        </PressableScale>
        <PressableScale
          style={[styles.tabsTab, { backgroundColor: UIColors.element }]}
          weight="light"
          activeScale={0.9}
          onPress={() => navigation.navigate('InsetConversations')}
        >
          <Messages stroke={theme.dark ? '#ffffff' : '#000000'} />
          <Text style={styles.tabsTabText}>Messages</Text>
        </PressableScale>
        <PressableScale
          style={[styles.tabsTab, { backgroundColor: UIColors.element }]}
          weight="light"
          activeScale={0.9}
          onPress={() => navigation.navigate('InsetEvaluations')}
        >
          <Competences stroke={theme.dark ? '#ffffff' : '#000000'} />
          <Text style={styles.tabsTabText}>
            Compét.
          </Text>
        </PressableScale>
      </View>
    </View>
  );
};

const CoursElement: React.FC<{
  cours: PapillonLesson[] | null
  navigation: any // TODO: type from react-navigation
  loading: boolean
  showsTomorrow: boolean
}> = ({ cours, navigation, loading, showsTomorrow }) => {
  return (
    <PapillonList inset title={!showsTomorrow ? 'Emploi du temps' : 'Votre journée de demain'} style={styles.coursContainer}>
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
            <Text style={styles.loadingText}>Aucun cours {!showsTomorrow ? 'aujourd\'hui' : 'demain'}</Text>
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
    </PapillonList>
  );
};

function CoursItem ({ lesson, cours, navigation, index }: {
  lesson: PapillonLesson
  cours: PapillonLesson[]
  index: number
  navigation: any // TODO: type from react-navigation
}) {
  const UIColors = GetUIColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.elastic(1),
      useNativeDriver: true,
      delay: index * 50,
    }).start();
  });

  function lz(nb: number) {
    return nb < 10 ? `0${nb}` : nb.toString();
  }

  return (
    <>
      {cours[index - 1] && new Date(lesson.start).getTime() - new Date(cours[index - 1].end).getTime() > 1800000 && (
        <Animated.View
          style={[
            styles.coursSeparator,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  })
                },
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  })
                }
              ],
            }
          ]}
        >
          <View style={[styles.coursSeparatorLine, { backgroundColor: UIColors.text + '15' }]} />

          <Text style={{ color: UIColors.text + '30' }}>
            {`${Math.floor((new Date(lesson.start).getTime() - new Date(cours[index - 1].end).getTime()) / 3600000)} h ${lz(Math.floor(((new Date(lesson.start).getTime() - new Date(cours[index - 1].end).getTime()) % 3600000) / 60000))} min`}
          </Text>
          
          <View style={[styles.coursSeparatorLine, { backgroundColor: UIColors.text + '15' }]} />
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
              actionKey  : 'open',
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
        onPressMenuItem={({nativeEvent}) => {
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
            {
            // Bind opacity to animated value
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  })
                },
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  })
                }
              ],
            },
          ]}
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
              <View style={[styles.coursItemColor, {backgroundColor: getSavedCourseColor(lesson.subject?.name ?? '', lesson.background_color)}]} />
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
                  <Text style={[styles.coursItemDataStatus, {
                    backgroundColor: getSavedCourseColor(lesson.subject?.name ?? '', lesson.background_color) + '22',
                    color: getSavedCourseColor(lesson.subject?.name ?? '', lesson.background_color)
                  }]}>
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

function DevoirsElement ({ homeworks, customHomeworks, homeworksDays, navigation, loading }: {
  homeworks: PapillonGroupedHomeworks[] | null
  customHomeworks: any[] // TODO
  homeworksDays: Array<{ custom: boolean, date: number }>
  navigation: any // TODO: type from react-navigation
  loading: boolean
}) {
  return (
    !loading ? (
      homeworks ? (
        <PapillonList inset title="Travail à faire" style={styles.homeworksDevoirsElementContainer}>
          {homeworksDays.map((day, index) => (
            <DevoirsDay
              key={day.date}
              index={index}
              homeworks={
                !day.custom ?
                  homeworks.find((hw) => hw.time === day.date)
                  : {
                    formattedDate: new Date(day.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    }),
                    time: day.date,
                    date: new Date(day.date),
                    homeworks: [] as PapillonHomework[],
                  } as PapillonGroupedHomeworks
              }
              navigation={navigation}
              customHomeworks={customHomeworks.filter((hw) => {
                let hwDate = new Date(hw.date);
                hwDate.setHours(0, 0, 0, 0);

                return hwDate.getTime() === day.date;
              })}
            />
          ))}
        </PapillonList>
      ) : (
        <PapillonList inset title="Travail à faire" style={styles.homeworksDevoirsElementContainer}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Aucun devoir à faire</Text>
          </View>
        </PapillonList>
      )
    ) : (
      <PapillonList inset title="Travail à faire" style={styles.homeworksDevoirsElementContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Chargement des devoirs...</Text>
        </View>
      </PapillonList>
    )
  );
}

const DevoirsDay = ({ homeworks, customHomeworks, navigation, index }: {
  homeworks?: PapillonGroupedHomeworks
  customHomeworks: any[] // TODO
  navigation: any // TODO: type from react-navigation
  index: number
}) => {
  const UIColors = GetUIColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.elastic(1),
      useNativeDriver: true,
      delay: index * 150,
    }).start();
  });

  const parentIndex = index;

  return (
    <Animated.View
      style={[
        styles.homeworksDevoirsDayContainer,
        {
          // Bind opacity to animated value
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            },
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              })
            }
          ],
        },
      ]}
    >
      {((homeworks && homeworks.homeworks.length > 0) || customHomeworks.length > 0) && (
        <>
          <View
            style={[styles.homeworksDevoirsDayHeaderContainer, UIColors.theme == 'dark' && Platform.OS !== 'ios' ? { backgroundColor: UIColors.text + '22' } : { backgroundColor: UIColors.primary + '22' }]}
          >
            <Text
              style={[
                styles.homeworksDevoirsDayHeaderTitle,
                UIColors.theme == 'dark' && Platform.OS !== 'ios' ? { color: UIColors.text } : { color: UIColors.primary }
              ]}
            >
              pour {homeworks?.formattedDate}
            </Text>
          </View>

          <View style={styles.homeworksDevoirsDayContent}>
            {homeworks && homeworks.homeworks.map((homework, index) => (
              <DevoirsContent
                key={homework.localID}
                index={index}
                parentIndex={parentIndex}
                homework={homework}
                navigation={navigation}
              />
            ))}

            {customHomeworks && customHomeworks.map((homework, index) => (
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

function DevoirsContent({ homework, navigation, index, parentIndex }: {
  homework: PapillonHomework
  index: number
  parentIndex: number
  navigation: any // TODO: type from react-navigation
}) {
  const UIColors = GetUIColors();

  const [checkLoading, setCheckLoading] = useState(false);
  const appContext = useAppContext();

  // TODO
  const checkThis = () => {
    return;
    // définir le loading
    setCheckLoading(true);

    if (homework.custom) {
      AsyncStorage.getItem('customHomeworks').then((customHomeworks) => {
        let hw = [];
        if (customHomeworks) {
          hw = JSON.parse(customHomeworks);
        }

        // find the homework
        for (let i = 0; i < hw.length; i++) {
          if (hw[i].local_id === homework.local_id) {
            hw[i].done = !checked;
          }
        }

        setChecked(!checked);
        AsyncStorage.setItem('customHomeworks', JSON.stringify(hw));

        setTimeout(() => {
          setCheckLoading(false);
        }, 100);
      });

      return;
    }

    appContext.dataProvider.changeHomeworkState(!checked, homework.date, homework.local_id).then((result) => {

      setCheckLoading(false);

      if (result.status === 'not found') {
        return;
      }
      else if (result.status === 'ok') {
        setChecked(!checked);

        // if tomorrow, update badge
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        // if this homework is for tomorrow
        if (new Date(homework.date).getDate() === tomorrow.getDate()) {
          AsyncStorage.getItem('badgesStorage').then((value) => {
            let currentSyncBadges = JSON.parse(value);

            if (currentSyncBadges === null) {
              currentSyncBadges = {
                homeworks: 0,
              };
            }

            let newBadges = currentSyncBadges;
            newBadges.homeworks = checked ? newBadges.homeworks + 1 : newBadges.homeworks - 1;

            AsyncStorage.setItem('badgesStorage', JSON.stringify(newBadges));
          });
        }
      }
    });
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.elastic(1),
      useNativeDriver: true,
      delay: (index * 50) + (parentIndex * 150) + 100,
    }).start();
  });

  const textMaxHeight = useRef(new Animated.Value(42)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const textMargin = useRef(new Animated.Value(0)).current;

  // when check, animate text to 0
  useEffect(() => {
    if (homework.done) {
      Animated.parallel([
        Animated.timing(textMaxHeight, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(textMargin, {
          toValue: -5,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    }
    else {
      Animated.parallel([
        Animated.timing(textMaxHeight, {
          toValue: 42,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(textMargin, {
          toValue: 0,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
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
            actionKey  : 'open',
            actionTitle: 'Voir le devoir en détail',
            icon: {
              type: 'IMAGE_SYSTEM',
              imageValue: {
                systemName: 'book.pages',
              },
            },
          },
          {
            actionKey  : 'check',
            actionTitle: 'Marquer comme fait',
            menuState  : homework.done ? 'on' : 'off',
            icon: {
              type: 'IMAGE_SYSTEM',
              imageValue: {
                systemName: 'checkmark.circle',
              },
            },
          },
          ...[homework.attachments.length > 0 ? {
            actionKey  : 'files',
            actionTitle: 'Ouvrir la pièce jointe',
            actionSubtitle: homework.attachments[0].name,
            icon: {
              type: 'IMAGE_SYSTEM',
              imageValue: {
                systemName: 'paperclip',
              },
            },
          } : void 0] as MenuElementConfig[],
        ],
      }}
      onPressMenuItem={({nativeEvent}) => {
        if (nativeEvent.actionKey === 'open') {
          navigation.navigate('Devoir', { homeworkLocalID: homework.localID });
        }
        else if (nativeEvent.actionKey === 'check') {
          checkThis();
        }
        else if (nativeEvent.actionKey === 'files') {
          openURL(homework.attachments[0].url);
        }
      }}
      onPressMenuPreview={() => {
        navigation.navigate('Devoir', { homeworkLocalID: homework.localID });
      }}
    >
      <Animated.View
        style={[
          {
          // Bind opacity to animated value
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })
              },
              {
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                })
              }
            ],
          },
        ]}
      >
        <TouchableHighlight
          style={[styles.homeworksDevoirsContentContainer]}
          underlayColor={UIColors.text + '12'}
          onPress={() => navigation.navigate('Devoir', { homeworkLocalID: homework.localID })}
        >
          <View style={styles.homeworksDevoirsContentInner}>
            <CheckAnimated
              backgroundColor={'#ffffff00'}
              checked={homework.done}
              pressed={() => {checkThis();}}
              loading={checkLoading}
            />

            <View style={styles.homeworksDevoirsContentParent}>
              <View>
                <View style={styles.homeworksDevoirsContentHeaderSubjectContainer}>
                  <View style={[styles.homeworksDevoirsContentHeaderSubjectColor, { backgroundColor: homework.background_color ?? getSavedCourseColor(homework.subject.name) }]} />
                  <Text style={[styles.homeworksDevoirsContentHeaderSubjectTitle, { color: UIColors.text }]} numberOfLines={1} ellipsizeMode='tail'>{formatCoursName(homework.subject.name)}</Text>
                </View>
              </View>

              <Animated.View
                style={{
                  maxHeight: textMaxHeight,
                  overflow:'visible',
                  opacity: textOpacity,
                  marginTop: textMargin
                }}
              >
                <Text numberOfLines={2}
                  style={[
                    styles.homeworksDevoirsContentContentDescription, 
                    {
                      color: UIColors.text,
                      height: homework.description.length > 40 ? 38 : 20,
                    }
                  ]}
                >
                  {convertHTML(homework.description)}
                </Text>
              </Animated.View>

              { homework.attachments.length > 0 && (
                <View style={styles.homeworksDevoirsContentFooterContainer}>
                  <View style={styles.homeworksDevoirsContentFooterFilesContainer}>
                    { homework.attachments.map((file, index) => (
                      <PressableScale
                        key={index}
                        style={[
                          styles.homeworksDevoirsContentFooterFilesFileContainer,
                          { backgroundColor: UIColors.text + '12' }
                        ]}
                        onPress={() => openURL(file.url)}
                      >
                        { file.url ? 
                          <DownloadCloud size={22} color={UIColors.text} />
                          : <AlertCircle size={22} color={'#ff0000'} />
                        }
                        <Text style={styles.homeworksDevoirsContentFooterFilesFileText} numberOfLines={1}>{file.name ? file.name : 'Lien invalide'}</Text>
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
    borderRadius:3,
  },

  tabsTabsContainer: {
    marginTop: 8,
    marginHorizontal: 16,
    gap: 6,
    marginBottom: 16,
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

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1,

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
});

const headerStyles = StyleSheet.create({
  header: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#29947A',

    elevation: 1,
  },

  ListTitle: {
    paddingLeft: 16,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,

    marginTop: 24,
    width: '92%',
  },

  headerContainer: {
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',

    paddingLeft: 2,

    width: '92%',
  },

  headerNameText: {
    fontSize: 16,
    fontFamily: 'Papillon-Medium',
    color: '#ffffff',
    opacity: 0.6,
    maxWidth: '85%',
  },
  headerCoursesText: {
    fontSize: 18,
    fontFamily: 'Papillon-Semibold',
    color: '#ffffff',
    marginTop: 4,
    marginBottom: 3,
    letterSpacing: -0.1,
    maxWidth: '85%',
  },

  nextCoursContainer: {
    width: '92%',
    height: 68,
    borderRadius: 12,
    borderCurve: 'continuous',

    marginTop: 2,
    marginBottom: -32,

    borderWidth: 0,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1,

    elevation: 3,

    flexDirection: 'row',
  },

  nextCoursLoading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  nextCoursLoadingText: {
    fontSize: 15,
    opacity: 0.5,
  },

  nextCoursLeft: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',

    paddingHorizontal: 14,
    paddingVertical: 12,

    gap: 14,
  },
  nextCoursEmoji: {
    width: 42,
    height: 42,
    borderRadius: 24,
    backgroundColor: '#ffffff10',
    borderColor: '#ffffff25',
    borderWidth: 1,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextCoursEmojiText: {
    fontSize: 22,
  },

  nextCoursLeftData: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 2,
    flex: 1,
  },
  nextCoursLeftDataText: {
    fontSize: 18,
    fontFamily: 'Papillon-Semibold',
    color: '#ffffff',
    flex: 1,
    marginTop: 2,
  },
  nextCoursLeftDataTextRoom: {
    fontSize: 15,
    color: '#ffffff99',
    flex: 1,
  },

  nextCoursRight: {
    width: '35%',

    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',

    paddingHorizontal: 16,
    paddingVertical: 12,

    backgroundColor: '#ffffff10',
    borderLeftWidth: 1,
    borderLeftColor: '#ffffff25',

    gap: 0,

    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  nextCoursRightTime: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
    color: '#ffffff',
    flex: 1,
    marginTop: 3,

    letterSpacing: 0.5,
  },
  nextCoursRightDelay: {
    fontSize: 15,
    color: '#ffffff99',
    flex: 1,
    fontVariant: ['tabular-nums'],
  },

  nextCoursInfo: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextCoursInfoText: {
    fontSize: 15,
    opacity: 0.5,
  },

  nextClassesList: {
    width: '92%',

    borderRadius: 12,
    borderCurve: 'continuous',
  },

  nextClassesListItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,

    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 16,
  },
  nextClassesListItemEmoji: {
    fontSize: 20,
    marginHorizontal: 7,
  },
  nextClassesListItemText: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
    flex: 1,
    marginTop: 2,
  },
  nextClassesListItemTime: {
    fontSize: 15,
    opacity: 0.5,
    marginLeft: 10,
  },

  headerPfpContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#ffffff10',
    borderRadius: 24,
  },
  headerPfp: {
    width: 32,
    height: 32,
    borderRadius: 24,
    borderColor: '#ffffff25',
    borderWidth: 1,
  },
});

export default HomeScreen;
