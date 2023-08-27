import * as React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Platform, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import * as SystemUI from 'expo-system-ui';

import formatCoursName from '../utils/FormatCoursName';
import getClosestGradeEmoji from '../utils/EmojiCoursName';
import getClosestColor from '../utils/ColorCoursName';

import { ListFilter } from 'lucide-react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PapillonHeader from '../components/PapillonHeader';
import { PressableScale } from 'react-native-pressable-scale';

import { getRecap } from '../fetch/PronoteData/PronoteRecap';
import { set } from 'react-native-reanimated';

function HomeScreen({ navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [nextClasses, setNextClasses] = React.useState(null);
  const currentDate = new Date();

  const [timetable, setTimetable] = React.useState(null);
  const [homeworks, setHomeworks] = React.useState(null);
  const [grades, setGrades] = React.useState(null);
  
  // change header text and size
  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: props => <HomeHeader props={props} timetable={timetable} navigation={navigation} />,
    });
  }, [navigation, timetable]);

  // refresh
  React.useEffect(() => {
    // get recap
    getRecap(currentDate).then((result) => {
      console.log(result);

      setTimetable(result[0]);
      setHomeworks(result[1]);
      setGrades(result[2]);

      // get next classes
      const nextClasses = getNextCours(result[0]).nextClasses;

      setNextClasses(nextClasses);

      const interval = setInterval(() => {
        const nextClasses = getNextCours(result[0]).nextClasses;
        setNextClasses(nextClasses);
      }, 300);
      return () => clearInterval(interval);
    });
  }, []);

  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={[styles.container, {backgroundColor: theme.dark ? "#000000" : "#f2f2f7"}]} contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>
        <StatusBar animated barStyle={theme.dark ? 'light-content' : 'dark-content'}/>

        {/* next classes */}
        { nextClasses ?
          <View style={[styles.nextClassesList, {backgroundColor : theme.dark ? '#151515' : '#ffffff'}]}>
            { nextClasses.slice(0,2).map((cours, index) => (
              <View key={index} style={[styles.nextClassesListItemContainer, {borderBottomWidth: (index != nextClasses.slice(0,2).length - 1) ? 1 : 0, borderBottomColor: theme.dark ? '#ffffff10' : '#00000010' }]}>
                <TouchableOpacity style={[styles.nextClassesListItem]} onPress={() => navigation.navigate('Lesson', { event: cours })}>
                  <Text numberOfLines={1} style={[styles.nextClassesListItemEmoji]}>{getClosestGradeEmoji(cours.subject.name)}</Text>

                  <Text numberOfLines={1} style={[styles.nextClassesListItemText]}>{formatCoursName(cours.subject.name)}</Text>

                  <Text numberOfLines={1} style={[styles.nextClassesListItemTime]}>{new Date(cours.start).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        : null }
      
      </ScrollView>
    </>
  );
}

function getNextCours(classes) {
  const now = new Date();
  let currentOrNextClass = null;
  let minTimeDiff = Infinity;

  for (const classInfo of classes) {
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

  if (currentOrNextClass == null) {
      // No classes today or all classes today are over
      return {
        next: null,
        nextClasses: [],
      };
  }

  // get all classes after currentOrNextClass
  const nextClasses = classes.filter((classInfo) => {
    const startTime = new Date(classInfo.start);
    return startTime > new Date(currentOrNextClass.start);  
  });

  return {
    next: currentOrNextClass,
    nextClasses: nextClasses,
  };
}

function HomeHeader({ props, navigation, timetable }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [nextCourse, setNextCourse] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // refresh
  React.useEffect(() => {
    if (timetable !== null) {
      setLoading(false);
      const nextCours = getNextCours(timetable).next;
      setNextCourse(nextCours);
    }

    const interval = setInterval(() => {
      if (timetable !== null) {
        setLoading(false);
        const nextCours = getNextCours(timetable).next;
        setNextCourse(nextCours);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [timetable]);
  
  return (
    <View style={[styles.header, {backgroundColor: theme.dark ? '#151515' : '#ffffff', paddingTop: insets.top + 13, borderColor: theme.dark ? '#ffffff15' : '#00000032', borderBottomWidth: 1}]}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Vue d'ensemble</Text>
      </View>

      { nextCourse && nextCourse.id !== null ?
        <NextCours cours={nextCourse} navigation={navigation} />
      : null }

      { loading ?
        <PressableScale style={[styles.nextCoursContainer, {backgroundColor: theme.dark ? '#222222' : '#ffffff'}, styles.nextCoursLoading]}>
          <ActivityIndicator size={12} />
          <Text style={[styles.nextCoursLoadingText]}>Chargement du prochain cours</Text>
        </PressableScale>
      : null }

      { !loading && !nextCourse ?
        <PressableScale style={[styles.nextCoursContainer, {backgroundColor: theme.dark ? '#222222' : '#ffffff'}, styles.nextCoursLoading]}>
          <Text style={[styles.nextCoursLoadingText]}>Pas de prochain cours</Text>
        </PressableScale>
      : null }
    </View>
  );
}

function NextCours({ cours, navigation }) {
  const theme = useTheme();

  const [time, setTime] = React.useState("...");

  function calculateTimeLeft(date) {
    // return mm:ss
    const now = new Date();
    const start = new Date(date);

    const diff = start - now;

    if (diff > 0) {
      const diffHours = Math.floor(diff / 1000 / 60 / 60);
      const diffMinutes = Math.floor(diff / 1000 / 60) - (diffHours * 60);
      const diffSeconds = Math.floor(diff / 1000) - (diffMinutes * 60) - (diffHours * 60 * 60);

      if (diffHours > 0) {
        return `dans ${diffHours}h ${diffMinutes < 10 ? '0' + diffMinutes : diffMinutes}mn`;
      }
      else if(diffMinutes < 20) {
        return `dans ${diffMinutes < 10 ? '0' + diffMinutes : diffMinutes}:${diffSeconds < 10 ? '0' + diffSeconds : diffSeconds}`;
      }
      else {
        return `dans ${diffMinutes} min.`;
      }
    }
    else {
      return "maintenant";
    }
  }

  // refresh
  React.useEffect(() => {
    start = new Date(cours.start);

    setTime(calculateTimeLeft(start));

    const interval = setInterval(() => {
      setTime(calculateTimeLeft(start));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  function openCours() {
    navigation.navigate('Lesson', { event: cours });
  }

  return (
    ( cours ?
      <PressableScale style={[styles.nextCoursContainer, {backgroundColor: getClosestColor(cours.background_color)}]} onPress={() => openCours()}>
        <View style={[styles.nextCoursLeft]}>
          <View style={[styles.nextCoursEmoji]}>
            <Text style={[styles.nextCoursEmojiText]}>{getClosestGradeEmoji(cours.subject.name)}</Text>
          </View>
          <View style={[styles.nextCoursLeftData]}>
            <Text numberOfLines={1} style={[styles.nextCoursLeftDataText]}>{formatCoursName(cours.subject.name)}</Text>
            <Text numberOfLines={1} style={[styles.nextCoursLeftDataTextRoom]}>salle {cours.rooms[0]} - avec {cours.teachers[0]}</Text>
          </View>
        </View>
        <View style={[styles.nextCoursRight]}>
          <Text numberOfLines={1} style={[styles.nextCoursRightTime]}>à {new Date(cours.start).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</Text>

          { time != "..." ?
            <Text numberOfLines={1} style={[styles.nextCoursRightDelay]}>{time}</Text>
          :
            <Text numberOfLines={1} style={[styles.nextCoursRightDelay]}>fin {new Date(cours.end).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</Text>
          }
        </View>
      </PressableScale>
    :
      null
    )
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
  },

  header : {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerContainer: {
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',

    width: '92%',
  },
  headerText: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
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
    shadowOpacity: .15,
    shadowRadius: 1,

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
    fontVariant: ["tabular-nums"],
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
    marginTop: 12,

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
});

export default HomeScreen;