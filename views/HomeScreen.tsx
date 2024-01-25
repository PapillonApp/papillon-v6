import React from 'react';

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
  type ImageSourcePropType,
} from 'react-native';
import { useEffect, useState, useRef } from 'react';

// Components & Styles
import { useTheme, Text } from 'react-native-paper';
import { PressableScale } from 'react-native-pressable-scale';

// Modules
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContextMenuView } from 'react-native-ios-context-menu';
import NextCoursElem from '../interface/HomeScreen/NextCours';
import SyncStorage, { set } from 'sync-storage';
import * as ExpoLinking from 'expo-linking';

// Icons 
import { DownloadCloud, Check, AlertCircle, UserCircle2, Globe2 } from 'lucide-react-native';
import { Competences, Messages, Papillon as PapillonIcon, UserCheck } from '../interface/icons/PapillonIcons';

// Formatting
import GetUIColors from '../utils/GetUIColors';
import { getSavedCourseColor } from '../utils/ColorCoursName';
import formatCoursName from '../utils/FormatCoursName';
import getClosestGradeEmoji from '../utils/EmojiCoursName';

// Custom components
import PapillonList from '../components/PapillonList';
import CheckAnimated from '../interface/CheckAnimated';

import { useAppContext } from '../utils/AppContext';
import sendToSharedGroup from '../fetch/SharedValues';
import { LinearGradient } from 'expo-linear-gradient';

import { useNetInfo } from '@react-native-community/netinfo';
import AlertAnimated from '../interface/AlertAnimated';
import { PapillonUser } from '../fetch/types/user';
import { PapillonLesson } from '../fetch/types/timetable';
import { dateToFrenchFormat } from '../utils/dates';

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

// @ts-expect-error : Type inside react-navigation
function HomeScreen({ navigation }) {
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
    enabled: false,
    color: '#32AB8E',
    image: 'papillon/default'
  });

  const refreshSettings = () => {
    const settings = SyncStorage.get('adjustments');
    if (settings) {
      setThemeAdjustments({
        enabled: settings.homeThemesEnabled ?? false,
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

  const now = new Date();
  const loadCustomHomeworks = async (): Promise<void> => {
    return;
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
  const applyHomeworksAndLessonsData = async (homeworks: unknown[], lessons: PapillonLesson[]): Promise<void> => {
    setLessons({ loading: false, data: lessons });
    setHomeworks({ loading: false, data: [] });
    
    // const groupedHomeworks = homeworks.reduce((grouped, homework) => {
    //   const homeworkDate = new Date(homework.date);
    //   homeworkDate.setHours(0, 0, 0, 0);

    //   setHomeworksDays((prevDays) => {
    //     let newDays = prevDays;

    //     // check if day already exists
    //     if (!newDays.find((day) => day.date === homeworkDate.getTime())) {
    //       newDays.push({
    //         date: homeworkDate.getTime(),
    //         custom: false,
    //       });
    //     }

    //     // sort days
    //     newDays.sort((a, b) => a.date - b.date);

    //     return newDays;
    //   });

    //   const formattedDate = homeworkDate.getDate() === now.getDate() + 1
    //     ? 'demain'
    //     : new Date(homeworkDate).toLocaleDateString('fr-FR', {
    //       weekday: 'long',
    //       day: 'numeric',
    //       month: 'long',
    //     });

    //   const formattedTime = homeworkDate.getTime();

    //   if (!grouped[formattedDate]) {
    //     grouped[formattedDate] = {
    //       date: homeworkDate,
    //       formattedDate: formattedDate,
    //       time: formattedTime,
    //       homeworks: [],
    //     };
    //   }

    //   // find all homeworks for tomorrow
    //   let tomorrow = new Date();
    //   tomorrow.setDate(tomorrow.getDate() + 1);
    //   tomorrow.setHours(0, 0, 0, 0);

    //   let tomorrowHomeworks = hwData.filter((hw) => {
    //     const hwDate = new Date(hw.date);
    //     hwDate.setHours(0, 0, 0, 0);

    //     return hwDate.getDate() === tomorrow.getDate();
    //   });

    //   grouped[formattedDate].homeworks.push(homework);
    //   return grouped;
    // }, {});

    // const result = Object.values(groupedHomeworks).sort((a, b) => a.date - b.date);
    // setHomeworks(result);
    // setLoadingHw(false);
    // setTimetable(coursData);
    // setLoadingCours(false);
    
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

  const [homeworks, setHomeworks] = useState<LazyLoadedValue<PapillonLesson[]>>({
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
    if (!appContext.dataProvider) return;

    const todayKey = dateToFrenchFormat(now);
    let timetable = await appContext.dataProvider.getTimetable(now, force);
    // Take only the lessons that are for today.
    let lessons = timetable.filter(lesson => dateToFrenchFormat(new Date(lesson.start)) === todayKey);

    // const [hwData, coursData] = await Promise.all([
    //   appContext.dataProvider.getHomeworks(today, false, new Date(today).setDate(today.getDate() + 7)).then(e=>e?.flat()),
    // ]);

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
    
    await applyHomeworksAndLessonsData([], lessons);
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

  // Load navigation bar data.
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => Platform.OS === 'ios' && (
        themeAdjustments.enabled
          ? <PapillonIcon fill={'#ffffff'} width={32} height={32} />
          : <PapillonIcon fill={UIColors.text + '26'} width={32} height={32} />
      ),
      headerTitle: 'Vue d\'ensemble',
      headerLargeTitle: false,
      headerShadowVisible: false,
      headerTransparent: true,
      headerTintColor: themeAdjustments.enabled ? '#ffffff' : UIColors.text,
      headerLargeStyle: {
        backgroundColor: themeAdjustments.enabled ? themeAdjustments.color + '00' : UIColors.backgroundHigh + '00',
      },
      headerRight: () => (
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
      ),
      headerBackground: () => Platform.OS === 'ios' ? ( 
        <Animated.View
          style={{
            backgroundColor: themeAdjustments.enabled ? themeAdjustments.color : UIColors.background,
            borderBottomColor: UIColors.dark ? UIColors.text + '25' : UIColors.text + '40',
            borderBottomWidth: 0.5,
            position: 'absolute',
            top: 0,
            left: 0,
            height: 44 + insets.top,
            width: '100%',
            opacity: topOpacity,
          }}
        >
          {themeAdjustments.enabled && (
            <View
              style={{
                backgroundColor: '#00000038',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
          )}
        </Animated.View>
      ) : (
        <View
          style={{
            backgroundColor: themeAdjustments.enabled && !UIColors.dark ? themeAdjustments.color : UIColors.background,
            position: 'absolute',
            top: 0,
            left: 0,
            height: 54 + insets.top,
            width: '100%',
          }}
        />
      ),
    });
  }, [navigation, user, themeAdjustments, showsTomorrowLessons, UIColors, theme]);

  // Animations
  const yOffset = new Animated.Value(0);

  const scrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: yOffset } } }],
    { useNativeDriver: false }
  );

  let mainHeaderSize = [-60, -30];
  if (insets.top > 30) {
    mainHeaderSize = [-85, -50];
  }

  const headerOpacity = yOffset.interpolate({
    inputRange: Platform.OS === 'ios' ? mainHeaderSize : [0, 40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerScale = yOffset.interpolate({
    inputRange: Platform.OS === 'ios' ? mainHeaderSize : [0, 40],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const tabsOpacity = yOffset.interpolate({
    inputRange: Platform.OS === 'ios' ? [0, 30] : [30, 70],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const tabsScale = yOffset.interpolate({
    inputRange: Platform.OS === 'ios' ? [0, 30] : [30, 70],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const topOpacity = yOffset.interpolate({
    inputRange: Platform.OS === 'ios' ? [0, 20] : [0, 40],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const bannerTranslate = yOffset.interpolate({
    inputRange: Platform.OS === 'ios' ? [-44, 20] : [0, 40],
    outputRange: [0, 64],
    extrapolate: 'clamp',
  });

  const loaderOpacity = yOffset.interpolate({
    inputRange: Platform.OS === 'ios' ? [-150, -100] : [0, 40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const loaderRotate = yOffset.interpolate({
    inputRange: Platform.OS === 'ios' ? [-240, -100] : [0, 40],
    outputRange: ['180deg', '0deg'],
    extrapolate: 'clamp',
  });

  const loaderScale = yOffset.interpolate({
    inputRange: Platform.OS === 'ios' ? [-240, -100] : [0, 40],
    outputRange: [1.5, 1],
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
            setHomeworks({ loading: true, data: null });
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
        <View style={{ height: 100 }} />
      ) : (
        <View style={{ height: 10 }} />
      )}

      {isFocused ? (
        <StatusBar
          barStyle={
            themeAdjustments.enabled ? 'light-content' :
              theme.dark ? 'light-content' : 'dark-content'
          }
          backgroundColor={UIColors.backgroundHigh}
        />
      ) : null }

      {themeAdjustments.enabled && (
        <Animated.View
          style={[
            styles.headerTheme,
            {
              backgroundColor: themeAdjustments.color,
              top: -300 - insets.top,
              transform: [{ translateY: bannerTranslate }],
              borderBottomColor: UIColors.dark ? UIColors.text + '30' : UIColors.text + '35',
              borderBottomWidth: 0.5,
            }
          ]}
        >
          <Animated.View
            style={[{
              position: 'absolute',
              top: 310,
              left: 0,
              width: '100%',
              zIndex: 9999,
              opacity: loaderOpacity,
              transform: [{ rotate: loaderRotate }, { scale: loaderScale }],
            }]}
          >
            <ActivityIndicator
              hidesWhenStopped={false}
              animating={refreshing}
              color={'#ffffff'}
            />
          </Animated.View>

          <View
            style={{
              backgroundColor: '#00000038',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 9999,
            }}
          />  

          <LinearGradient
            colors={[themeAdjustments.color, themeAdjustments.color + '00']}
            style={[{
              top: 150,
              left: 0,
              width: '100%',
              height: 150,
              zIndex: 999,
            }]}
          />
          <Image 
            source={THEME_IMAGES[themeAdjustments.image]}
            style={styles.headerThemeImage}
          />
        </Animated.View>
      )}
      
      <Animated.View
        style={{ 
          opacity: headerOpacity,
          transform: [{ scale: headerScale }],
        }}
      >
        <NextCoursElem
          cours={lessons.data}
          navigation={navigation}
          color={themeAdjustments.enabled ? themeAdjustments.color : void 0}
          style={{
            marginHorizontal: 16,
            marginVertical: 0,
          }}
        />
      </Animated.View>

      <Animated.View
        style={{
          opacity: tabsOpacity,
          transform: [{ scale: tabsScale }],
        }}
      >
        <TabsElement navigation={navigation} />
      </Animated.View>

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
        homeworks={homeworks.data}
        customHomeworks={customHomeworks}
        homeworksDays={homeworksDays}
        navigation={navigation}
        loading={homeworks.loading}
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
            <Text style={styles.loadingText}>Aucun cours aujourd'hui</Text>
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

function DevoirsElement ({ homeworks, customHomeworks, homeworksDays, navigation, loading }) {
  return (
    !loading ? (
      homeworks.length > 0 ? (
        <PapillonList inset title="Travail à faire" style={styles.homeworksDevoirsElementContainer}>
          {homeworksDays.map((day, index) => (
            <DevoirsDay
              key={index}
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
                    date : day.date,
                    homeworks: [],
                  }
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

const DevoirsDay = ({ homeworks, customHomeworks, navigation, index }) => {
  const UIColors = GetUIColors();
  const theme = useTheme();

  // sort homeworks by index
  homeworks.homeworks.sort((a, b) => a.index - b.index);

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
      { homeworks.homeworks.length > 0 || customHomeworks.length > 0 ? (<>
        <View
          style={[styles.homeworksDevoirsDayHeaderContainer, UIColors.theme == 'dark' && Platform.OS !== 'ios' ? { backgroundColor: UIColors.text + '22' } : { backgroundColor: UIColors.primary + '22' }]}
        >
          <Text
            style={[
              styles.homeworksDevoirsDayHeaderTitle,
              UIColors.theme == 'dark' && Platform.OS !== 'ios' ? { color: UIColors.text } : { color: UIColors.primary }
            ]}
          >
          pour {homeworks.formattedDate}
          </Text>
        </View>

        <View style={styles.homeworksDevoirsDayContent}>
          { homeworks.homeworks.map((homework, index) => (
            <DevoirsContent key={index} index={index} parentIndex={parentIndex} homework={homework} theme={theme} UIColors={UIColors} navigation={navigation} />
          ))}

          { customHomeworks.map((homework, index) => (
            <DevoirsContent key={index} index={index} parentIndex={parentIndex} homework={homework} theme={theme} UIColors={UIColors} navigation={navigation} />
          ))}
        </View>
      </>) : null }
    </Animated.View>
  );
};

function DevoirsContent({ homework, theme, UIColors, navigation, index, parentIndex }) {
  const [checkLoading, setCheckLoading] = useState(false);
  const [checked, setChecked] = useState(homework.done);
  const appctx = useAppContext();

  const checkThis = () => {
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

    appctx.dataprovider.changeHomeworkState(!checked, homework.date, homework.local_id).then((result) => {

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
    if (checked) {
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
  }, [checked]);
  
  if(!homework || !homework.subject) return;
  return (
    <ContextMenuView
      style={{ flex: 1 }}
      borderRadius={14}
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
            menuState  : checked ? 'on' : 'off',
            icon: {
              type: 'IMAGE_SYSTEM',
              imageValue: {
                systemName: 'checkmark.circle',
              },
            },
          },
          homework.files.length > 0 ? {
            actionKey  : 'files',
            actionTitle: 'Ouvrir la pièce jointe',
            actionSubtitle: homework.files[0].name,
            icon: {
              type: 'IMAGE_SYSTEM',
              imageValue: {
                systemName: 'paperclip',
              },
            },
          } : null,
        ],
      }}
      onPressMenuItem={({nativeEvent}) => {
        if (nativeEvent.actionKey === 'open') {
          navigation.navigate('Devoir', { homework: {... homework, done: checked}});
        }
        else if (nativeEvent.actionKey === 'check') {
          checkThis();
        }
        else if (nativeEvent.actionKey === 'files') {
          openURL(homework.files[0].url);
        }
      }}
      onPressMenuPreview={() => {
        navigation.navigate('Devoir', { homework: {... homework, done: checked}});
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
          onPress={() => navigation.navigate('Devoir', { homework: {... homework, done: checked} })}
        >
          <View style={styles.homeworksDevoirsContentInner}>
            <CheckAnimated
              backgroundColor={'#ffffff00'}
              checked={checked}
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
                  {homework.description}
                </Text>
              </Animated.View>

              { homework.files.length > 0 && (
                <View style={styles.homeworksDevoirsContentFooterContainer}>
                  <View style={styles.homeworksDevoirsContentFooterFilesContainer}>
                    { homework.files.map((file, index) => (
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

function HwCheckbox({ checked, theme, pressed, UIColors, loading }) {
  return (
    !loading ? (
      <PressableScale
        style={[
          styles.checkboxCheckContainer,
          { borderColor: theme.dark ? '#333333' : '#c5c5c5' },
          checked ? styles.checkboxCheckChecked : void 0,
          checked ? {backgroundColor: UIColors.primary, borderColor: UIColors.primary} : null,
        ]}
        weight="light"
        activeScale={0.7}
        onPress={() => {
          pressed();
        }}
      >
        {checked ? <Check size={20} color="#ffffff" /> : null}
      </PressableScale>
    ) : (
      <ActivityIndicator size={26} />
    )
  );
}

const lightenDarkenColor = (color, amount) => {
  let colorWithoutHash = color.replace('#', '');
  if (colorWithoutHash.length === 3) {
    colorWithoutHash = colorWithoutHash
      .split('')
      .map((c) => `${c}${c}`)
      .join('');
  }

  const getColorChannel = (substring) => {
    let colorChannel = parseInt(substring, 16) + amount;
    colorChannel = Math.max(Math.min(255, colorChannel), 0).toString(16);

    if (colorChannel.length < 2) {
      colorChannel = `0${colorChannel}`;
    }

    return colorChannel;
  };

  const colorChannelRed = getColorChannel(colorWithoutHash.substring(0, 2));
  const colorChannelGreen = getColorChannel(colorWithoutHash.substring(2, 4));
  const colorChannelBlue = getColorChannel(colorWithoutHash.substring(4, 6));

  return `#${colorChannelRed}${colorChannelGreen}${colorChannelBlue}`;
};

function NextCours({ cours, navigation }) {
  const lz = (number) => (number < 10 ? `0${number}` : number);

  const calculateTimeLeft = (date) => {
    const now = new Date();
    const start = new Date(date);
    const diff = start - now;

    if (diff > 0) {
      const diffMinutes = Math.floor(diff / 1000 / 60);
      const diffSeconds = Math.floor((diff / 1000) % 60);

      if (diffMinutes < 60) {
        return `dans ${lz(diffMinutes)}:${lz(diffSeconds)}`;
      }

      return `dans ${Math.ceil((diffMinutes / 60) - 1)}h${lz(diffMinutes % 60)}`;
    }
    return 'maintenant';
  };

  const openCours = () => {
    navigation.navigate('Lesson', { event: cours });
  };

  const isTimeSet = !!cours?.start;

  const formattedStartTime = isTimeSet
    ? new Date(cours.start).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    : '';

  const formattedEndTime = isTimeSet
    ? new Date(cours.end).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    : '';

  const timeLeft = isTimeSet ? calculateTimeLeft(cours.start) : '';

  if (!cours) {
    return null;
  }

  return (
    <PressableScale
      style={[
        nextCoursStyles.nextCoursContainer,
        { backgroundColor: getSavedCourseColor(cours.subject.name, cours.background_color) },
      ]}
      onPress={openCours}
    >
      <View style={nextCoursStyles.nextCoursLeft}>
        <View style={nextCoursStyles.nextCoursEmoji}>
          <Text style={nextCoursStyles.nextCoursEmojiText}>
            {getClosestGradeEmoji(cours.subject.name)}
          </Text>
        </View>
        <View style={nextCoursStyles.nextCoursLeftData}>
          <Text numberOfLines={1} style={nextCoursStyles.nextCoursLeftDataText}>
            {formatCoursName(cours.subject.name)}
          </Text>

          <Text numberOfLines={1} style={nextCoursStyles.nextCoursLeftDataTextRoom}>
            {cours.status === null
              ? `salle ${cours.rooms[0] || 'inconnue'} - avec ${cours.teachers[0]}`
              : `${cours.status} - salle ${cours.rooms[0] || 'inconnue'} - avec ${cours.teachers[0]}`}
          </Text>
        </View>
      </View>
      <View style={nextCoursStyles.nextCoursRight}>
        <Text numberOfLines={1} style={nextCoursStyles.nextCoursRightTime}>
          à {formattedStartTime}
        </Text>

        {isTimeSet ? (
          <Text numberOfLines={1} style={nextCoursStyles.nextCoursRightDelay}>
            {timeLeft}
          </Text>
        ) : (
          <Text numberOfLines={1} style={nextCoursStyles.nextCoursRightDelay}>
            {formattedEndTime}
          </Text>
        )}
      </View>
    </PressableScale>
  );
}

function getNextCours(classes) {
  if (!classes || classes.length === 0) {
    return {
      next: null,
      nextClasses: [],
    };
  }

  const now = new Date();

  const activeClasses = classes.filter((classInfo) => !classInfo.is_cancelled);

  let currentOrNextClass = null;
  let minTimeDiff = Infinity;

  for (const classInfo of activeClasses) {
    const startTime = new Date(classInfo.start);
    const endTime = new Date(classInfo.end);

    if (startTime <= now && now <= endTime) {
      currentOrNextClass = classInfo;
      break; // Found the current class, no need to continue
    } else if (startTime > now) {
      const timeDiff = startTime - now;

      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        currentOrNextClass = classInfo;
      }
    }
  }

  if (currentOrNextClass === null) {
    return {
      next: null,
      nextClasses: [],
    };
  }

  const nextClasses = activeClasses.filter((classInfo) => {
    const startTime = new Date(classInfo.start);
    return startTime > new Date(currentOrNextClass.start);
  });

  return {
    next: currentOrNextClass,
    nextClasses,
  };
}

function HomeHeader({ navigation, timetable, user, showsTomorrow }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [nextCourse, setNextCourse] = React.useState(null);
  const [leftCourses, setLeftCourses] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const isFocused = useIsFocused();

  const fetchNextCourses = () => {
    if (timetable !== null) {
      const { next, nextClasses } = getNextCours(timetable);
      setNextCourse(next);
      setLeftCourses(nextClasses);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNextCourses();
    const interval = setInterval(fetchNextCourses, 1000);
    return () => clearInterval(interval);
  }, [timetable]);

  const getColorCoursBg = (color) =>
    lightenDarkenColor(color, -20);

  const getPrenom = (name) => name.split(' ').pop();

  const getFormulePolitesse = () => {
    const hours = new Date().getHours();
    return hours > 17 ? 'Bonsoir' : 'Bonjour';
  };

  const openProfile = () => {
    navigation.navigate('InsetSettings', { isModal: true });
  };

  const openNextCours = () => {
    if (nextCourse && nextCourse.id !== null) {
      navigation.navigate('Lesson', { event: nextCourse });
    } else {
      navigation.navigate('CoursHandler');
    }
  };

  const UIColors = GetUIColors();
  const hasTimetable = timetable && leftCourses && leftCourses.length > 0;

  let plural = false;
  if (leftCourses && leftCourses.length > 1) {
    plural = true;
  }

  let atAGlance = '';
  if (hasTimetable) {
    if(!showsTomorrow) {
      atAGlance = `${leftCourses.length + 1} cours ${plural ? 'restants' : 'restant'} dans ta journée.`;
    }
    else {
      atAGlance = `${leftCourses.length + 1} cours ${plural ? 'sont' : 'est'} prévu${plural ? 's' : ''} demain.`;
    }
  }
  else {
    if(!showsTomorrow) {
      atAGlance = 'Aucun cours restant aujourd\'hui.';
    }
    else {
      atAGlance = 'Aucun cours prévu demain.';
    }
  }

  return (
    <View
      style={[
        headerStyles.header,
        {
          backgroundColor: nextCourse
            ? getColorCoursBg(getSavedCourseColor(nextCourse.subject.name, nextCourse.background_color))
            : UIColors.primaryBackground,
          paddingTop: insets.top + 13,
          borderColor: theme.dark ? '#ffffff15' : '#00000032',
          borderBottomWidth: 1,
        },
      ]}
    >
      <View style={headerStyles.headerContainer}>
        <Text style={[headerStyles.headerNameText]}>
          {`${getFormulePolitesse()}${user ? `, ${getPrenom(user.name)} !` : ' !'}`}
        </Text>
        <Text style={[headerStyles.headerCoursesText]}>
          {atAGlance}
        </Text>

        
        <TouchableOpacity
          style={[headerStyles.headerPfpContainer]}
          onPress={openProfile}
        >
          {user && user.profile_picture ? (<Image
            source={{ uri: user.profile_picture }}
            style={[headerStyles.headerPfp]}
          />) : (
            <UserCircle2 size={36} style={[headerStyles.headerPfp]} color="#ccc" />
          )
          }
        </TouchableOpacity>
        
      </View>

      { !loading && (
        <View style={styles.nextCoursContainer}>
          <NextCoursElem
            cours={timetable}
            navigation={navigation}
            style={[{
              marginHorizontal: 16,
              marginVertical: 14,
            }]}
          />
        </View>
      )}
    </View>
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

const nextCoursStyles = StyleSheet.create({
  nextCoursContainer: {
    marginHorizontal: 16,
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
});

export default HomeScreen;
