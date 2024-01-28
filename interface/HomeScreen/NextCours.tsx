import React, { useState, useRef, useEffect } from 'react';
import { Animated, View, StyleSheet, type ViewStyle, Platform } from 'react-native';

import { Text } from 'react-native-paper';

import { PressableScale } from 'react-native-pressable-scale';

import GetUIColors from '../../utils/GetUIColors';

import { getSavedCourseColor } from '../../utils/ColorCoursName';
import formatCoursName from '../../utils/FormatCoursName';
import { MapPin, UserCircle2 } from 'lucide-react-native';
import { PapillonLesson } from '../../fetch/types/timetable';

function lz(num: number): string {
  return (num < 10 ? '0' : '') + num;
}

const NextCours = ({ cours, yOffset, style, setNextColor = (color) => {}, navigation, color }: {
  cours: PapillonLesson[] | null
  style?: ViewStyle
  color?: string,
  navigation: any
}) => {
  const UIColors = GetUIColors();

  const [nxid, setNxid] = useState(0);
  const [lenText, setLenText] = useState('À venir');
  const [barPercent, setBarPercent] = useState(0);

  // TODO: @Vexcited to contributors : is this implemented ?
  // I don't see any usage of `setCoursEnded` but `coursEnded` is used...
  const [coursEnded, setCoursEnded] = useState(false);

  function updateNext() {
    if(!cours || !cours[nxid]) return;

    let st = new Date(cours[nxid].start);
    let en = new Date(cours[nxid].end);

    let hb = new Date(cours[nxid].start); // hour before
    hb.setHours(hb.getHours() - 1);

    let now = new Date();

    // if the cours is in the next hour
    if (hb.getTime() < new Date(now).getTime() && st.getTime() > new Date(now).getTime()) {
      // calculate the time between now and the start
      let diff = new Date(now).getTime() - st.getTime();
      diff = Math.floor(diff / 1000 / 60);
      setLenText('dans ' + Math.abs(diff) + ' min');

      // calculate the progression
      let q = Math.abs(now.getTime() - hb.getTime());
      let d = Math.abs(st.getTime() - hb.getTime());
      diff = q / d * 100;
      setBarPercent(diff);
    }
    // if the cours is in progress
    else if (st < new Date(now) && en > new Date(now)) {
      // calculate the time between now and the end
      let diff: string | number = en.getTime() - new Date(now).getTime();
      diff = Math.floor(diff / 1000 / 60);

      if (diff == 0) {
        diff = 'moins d\'une';
      }

      setLenText(diff + ' min rest.');

      // calculate the progression between the start and the end
      let q = Math.abs(now.getTime()-st.getTime());
      let d = Math.abs(en.getTime()-st.getTime());
      diff = q / d * 100;
      setBarPercent(diff);
    }
    // if the cours has not started yet
    else if (st > new Date(now)) {
      // calculate the time between now and the start
      let diff = st.getTime() - new Date(now).getTime();
      diff = Math.floor(diff / 1000 / 60);

      let hours = Math.floor(diff / 60);
      let minutes = diff % 60;

      setLenText('dans ' + Math.abs(hours) + 'h ' + lz(Math.abs(minutes)) + 'min');

      // calculate the progression
      setBarPercent(0);
    }
  }

  // check which cours is next
  function checkCours() {
    let now = new Date();

    if(!cours) return;

    const activeClasses = cours.filter((classInfo) => !classInfo.is_cancelled);

    // sort the classes by start time
    activeClasses.sort((a, b) => {
      const aStart = new Date(a.start);
      const bStart = new Date(b.start);

      if (aStart < bStart) return -1;
      if (aStart > bStart) return 1;
      return 0;
    });

    let minTimeDiff = Infinity;

    // find the class that is currently happening or next
    for (let i = 0; i < activeClasses.length; i++) {
      const classInfo = activeClasses[i];
      const classStart = new Date(classInfo.start);
      const classEnd = new Date(classInfo.end);

      // if the class is currently happening
      if (classStart < now && classEnd > now) {
        setNxid(cours.indexOf(classInfo));
        break;
      }

      // if the class is in the future
      if (classStart > now) {
        const timeDiff = classStart.getTime() - now.getTime();

        // if the class is closer than the current closest class
        if (timeDiff < minTimeDiff) {
          setNxid(cours.indexOf(classInfo));
          minTimeDiff = timeDiff;
        }
      }
    }
  }

  useEffect(() => {
    // Setup an interval to update the next cours
    // every second.
    const interval = setInterval(() => {
      updateNext();
      checkCours();
    }, 1000);
    
    // Also update when mounted.
    updateNext();
    checkCours();

    return () => clearInterval(interval);
  }, [cours, nxid]);

  // set the color of the next cours
  useEffect(() => {
    if (!setNextColor) return;
    if(!cours || !cours[nxid]) return;

    setNextColor(getSavedCourseColor(cours[nxid].subject?.name ?? '', cours[nxid].background_color));
  }, [cours, nxid]);

  if(!cours || !cours[nxid]) return (
    <PressableScale
      style={[
        styles.container,
        styles.end.container,
        { backgroundColor: '#ffffff30' },
        style
      ]}
      onPress={() => {
        if(navigation) {
          navigation.navigate('CoursHandler');
        }
      }}
    >
      <Text
        numberOfLines={1}
        style={[styles.end.text, { color: '#ffffff' }]}
      >
        Aucun cours aujourd'hui
      </Text>
    </PressableScale>
  );

  if(coursEnded) return (
    <PressableScale
      style={[
        styles.container,
        styles.end.container,
        { backgroundColor: '#ffffff30' },
        style
      ]}
      onPress={() => {
        if(navigation) {
          navigation.navigate('CoursHandler');
        }
      }}
    >
      <Text
        numberOfLines={1}
        style={[styles.end.text, { color: '#ffffff' }]}
      >
        Pas de prochain cours
      </Text>
    </PressableScale>
  );

  return (
    cours && cours[nxid] && !coursEnded &&

    <PressableScale
      style={[
        styles.container,
        { backgroundColor: color ? color : getSavedCourseColor(cours[nxid].subject?.name ?? '', cours[nxid].background_color) },
        style,
      ]}
      onPress={() => {
        if (navigation) {
          navigation.navigate('Lesson', { event: cours[nxid] });
        }
      }}
    >
      <Animated.View
        style={[
          styles.inContainer,
          {
            opacity: Platform.OS === 'ios' ? yOffset.interpolate({
              inputRange: [40, 70],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }) : 1,
            transform: [
              {
                scale: Platform.OS === 'ios' ? yOffset.interpolate({
                  inputRange: [30, 70],
                  outputRange: [1, 0.95],
                  extrapolate: 'clamp',
                }) : 1,
              }
            ]
          }
        ]}
      >
        <View style={styles.time.container}>
          <Text style={styles.time.text}>
            { new Date(cours[nxid].start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
          </Text>
        </View>
        <Animated.View
          style={[
            styles.data.container,
            {
              marginTop: Platform.OS === 'ios' ? yOffset.interpolate({
                inputRange: [1, 25],
                outputRange: [0, 24],
                extrapolate: 'clamp',
              }) : 0,
            }
          ]}
        >
          <View style={styles.subject.container}>
            <Text style={styles.subject.text} numberOfLines={1}>
              { formatCoursName(cours[nxid].subject?.name ?? '(inconnu)') }
            </Text>
          </View>

          <View style={[styles.len.container]}>
            <Text style={[styles.len.startText]}>
              {lenText}
            </Text>

            <View style={[styles.len.bar]}>
              <View style={[
                styles.len.barFill,
                {
                  width: barPercent + '%',
                }
              ]} />
            </View>

            <Text style={[styles.len.endText]}>
              { new Date(cours[nxid].end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
            </Text>
          </View>

          <Animated.View style={[
            styles.details.container,
            {
              opacity: Platform.OS === 'ios' ? yOffset.interpolate({
                inputRange: [1, 25],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }) : 1,
            }
          ]}>
            { cours[nxid].rooms && cours[nxid].rooms.length > 0 && (
              <View style={[styles.details.item]}>
                <MapPin size={20} color={'#ffffff'} style={[styles.details.icon]} />
                <Text style={[styles.details.text]} numberOfLines={1}>
                  { cours[nxid].rooms[0] }
                </Text>
              </View>
            )}

            { cours[nxid].teachers && cours[nxid].teachers.length > 0 && (
              <View style={[styles.details.separator]} />
            )}

            { cours[nxid].teachers && cours[nxid].teachers.length > 0 && (
              <View style={[styles.details.item]}>
                <UserCircle2 size={20} color={'#ffffff'} style={[styles.details.icon]} />
                <Text style={[styles.details.text]} numberOfLines={1}>
                  { cours[nxid].teachers[0] }
                </Text>
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  container : {
    borderRadius: 12,
    borderCurve: 'continuous',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  
    elevation: 2,

    flex: 1,
    overflow: 'hidden',
  },

  inContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',

    paddingHorizontal: 16,
    paddingVertical: 12,

    gap: 16,
    flex: 1,
  },

  time: {
    container: {
      height: 26,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      borderRadius: 8,
      borderCurve: 'continuous',
      backgroundColor: '#ffffff22'
    },
    text: {
      fontSize: 16,
      fontFamily: 'Papillon-Semibold',
      opacity: 1,
      color: '#ffffff',
    }
  },

  data: {
    container: {
      gap: 0,
      flex: 1,
      height: 64,
      overflow: 'hidden',
    }
  },

  details: {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 0,
      flex: 1,
      paddingTop: 4,
      overflow: 'hidden',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    icon: {
      opacity: 0.8,
    },
    text: {
      fontFamily: 'Papillon-Medium',
      fontSize: 15,
      opacity: 0.8,
      color: '#ffffff',
    },
    separator: {
      width: 2,
      height: 18,
      backgroundColor: '#ffffff',
      opacity: 0.3,
      borderRadius: 2,
    }
  },

  subject: {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    text: {
      fontSize: 17,
      fontFamily: 'Papillon-Semibold',
      opacity: 1,
      color: '#ffffff',
    }
  },

  len: {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'justify-content',
      gap: 10,
      paddingTop: 4,
    },
    startText: {
      fontFamily: 'Papillon-Medium',
      fontSize: 15,
      opacity: 0.6,
      color: '#ffffff',
    },
    endText: {
      fontFamily: 'Papillon-Medium',
      fontSize: 15,
      opacity: 0.6,
      color: '#ffffff',
    },

    bar: {
      flex: 1,
      width: '100%',
      height: 4,
      borderRadius: 4,
      borderCurve: 'continuous',
      backgroundColor: '#ffffff32',
    },

    barFill: {
      width: '50%',
      height: '100%',
      borderRadius: 4,
      borderCurve: 'continuous',
      backgroundColor: '#ffffff',
    }
  },

  end: {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      shadowOpacity: 0.1,
      paddingVertical: 24,
    },
    text: {
      fontFamily: 'Papillon-Medium',
      fontSize: 15,
      opacity: 0.6,
    },
  }
});

export default NextCours;
