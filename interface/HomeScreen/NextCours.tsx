import React, { useState, useRef, useEffect } from 'react';
import { Animated, View, StyleSheet, type ViewStyle, Platform } from 'react-native';

import { Text } from 'react-native-paper';

import { PressableScale } from 'react-native-pressable-scale';

import GetUIColors from '../../utils/GetUIColors';

import { getSavedCourseColor } from '../../utils/cours/ColorCoursName';
import formatCoursName from '../../utils/cours/FormatCoursName';
import { MapPin, UserCircle2 } from 'lucide-react-native';
import { PapillonLesson } from '../../fetch/types/timetable';

function lz(num: number): string {
  return (num < 10 ? '0' : '') + num;
}

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NextCours = ({ cours, yOffset, style, setNextColor = (color) => {}, navigation, color, tiny, mainAction = () => {}, longPressAction = () => {} }: {
  cours: PapillonLesson[] | null
  style?: ViewStyle
  color?: string
  yOffset: Animated.Value
  setNextColor?: (color: string) => unknown
  mainAction?: () => unknown,
  longPressAction?: (cours: PapillonLesson | null) => unknown,
  tiny?: boolean
  navigation: any // TODO
}) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const [nxid, setNxid] = useState(0);
  const [lenText, setLenText] = useState('À venir');
  const [timeCount, setTimeCount] = useState('00:00');
  const [barPercent, setBarPercent] = useState(0);
  const [coursEnded, setCoursEnded] = useState(false);

  const [hideDetail, setHideDetail] = useState(false);
  const detailAnim = useRef(new Animated.Value(0)).current;

  const [hideAll, setHideAll] = useState(false);
  const hideAnim = useRef(new Animated.Value(0)).current;

  yOffset.addListener(({ value }) => {
    if(Platform.OS === 'ios') {
      if (value > 0 - insets.top + 10) {
        setHideDetail(true);
      }
      else {
        setHideDetail(false);
      }
    }
  });

  useEffect(() => {
    if (hideDetail) {
      Animated.spring(detailAnim, {
        toValue: 1,
        useNativeDriver: false,
      }).start();
    }
    else {
      Animated.spring(detailAnim, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [hideDetail]);

  useEffect(() => {
    if (hideAll) {
      Animated.spring(hideAnim, {
        toValue: 1,
        useNativeDriver: false,
      }).start();
    }
    else {
      Animated.spring(hideAnim, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [hideAll]);

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

    // set the time count to the time left before the cours
    let hours = Math.floor(Math.abs(st.getTime() - new Date(now).getTime()) / 1000 / 60 / 60);
    let minutes = Math.floor(Math.abs(st.getTime() - new Date(now).getTime()) / 1000 / 60 % 60);
    let seconds = Math.floor(Math.abs(st.getTime() - new Date(now).getTime()) / 1000 % 60);

    if (hours > 0) {
      setTimeCount(lz(hours) + ' : ' + lz(minutes) + ' : ' + lz(seconds));
    }
    else {
      setTimeCount(lz(minutes) + ' : ' + lz(seconds));
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

  if (tiny && coursEnded || tiny && !cours || tiny && !cours?.[nxid]) {
    return (
      <PressableScale
        style={[
          styles.tinyContainer,
          { backgroundColor: UIColors.text + '12' },
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
          style={[styles.end.text, { color: UIColors.text }]}
        >
          Aucun cours aujourd'hui
        </Text>
      </PressableScale>
    );
  }

  if(!cours || !cours[nxid] || coursEnded) return (
    <PressableScale
      style={[
        styles.container,
        styles.end.container,
        {
          backgroundColor: '#ffffff20',
        },
        style
      ]}
      onPress={() => {
        if(navigation) {
          navigation.navigate('CoursHandler');
        }
      }}
      onLongPress={() => {
        longPressAction(cours[nxid]);
      }}
      delayLongPress={150}
    >
      <Animated.Text
        numberOfLines={1}
        style={[styles.end.text, {
          color: '#ffffff',
          opacity: yOffset.interpolate({
            inputRange: [0, 20],
            outputRange: [0.6, 0],
            extrapolate: 'clamp',
          })
        }]}
      >
        Aucun cours aujourd'hui
      </Animated.Text>
    </PressableScale>
  );

  if (tiny) {
    return (
      <PressableScale
        style={[
          styles.tinyContainer,
          { backgroundColor: color ? color : getSavedCourseColor(cours[nxid].subject?.name ?? '', cours[nxid].background_color) },
          style,
        ]}
        onPress={() => {
          mainAction();
        }}
      >
        <Text style={styles.tinyStart} numberOfLines={1}>
          { new Date(cours[nxid].start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
        </Text>

        <View style={styles.tinyBar} />

        <Text style={styles.tinyCourse} numberOfLines={1}>
          { formatCoursName(cours[nxid].subject?.name ?? '(inconnu)') }
        </Text>
      </PressableScale>
    );
  }

  return (
    cours && cours[nxid] && !coursEnded &&

    <Animated.View
      style={{
        height: detailAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [90, 60],
          extrapolate: 'clamp',
        }),
        marginTop: detailAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 30],
          extrapolate: 'clamp',
        }),
      }}
    >
    <PressableScale
      style={[
        styles.container,
        tiny && styles.tinyContainer,
        { backgroundColor: color ? color : getSavedCourseColor(cours[nxid].subject?.name ?? '', cours[nxid].background_color) },
        style,
      ]}
      onPress={() => {
        if (navigation) {
          navigation.navigate('Lesson', { event: cours[nxid] });
        }
      }}
      onLongPress={() => {
        longPressAction(cours[nxid]);
      }}
      delayLongPress={150}
    >
      <Animated.View
        style={[
          styles.inContainer,
          tiny && styles.tinyInContainer,
          {
            opacity: Platform.OS === 'ios' ? hideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }) : 1,
            transform: [
              {
                scale: Platform.OS === 'ios' ? hideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.95],
                  extrapolate: 'clamp',
                }) : 1,
              }
            ]
          }
        ]}
      >
        <View style={styles.time.container}>
          <Text style={styles.time.start}>
            { new Date(cours[nxid].start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
          </Text>
          <Text style={styles.time.end}>
            { new Date(cours[nxid].end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
          </Text>
        </View>
        <Animated.View
          style={[
            styles.data.container
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
              opacity: Platform.OS === 'ios' ? detailAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }) : 1,
              marginBottom: detailAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -30],
                extrapolate: 'clamp',
              }),
            }
          ]}>
            
            <View style={[styles.details.item, styles.details.room]}>
              <MapPin size={20} color={'#ffffff'} style={[styles.details.icon]} />
              { cours[nxid].rooms && cours[nxid].rooms.length > 0 ? (
                <Text style={[styles.details.text]} numberOfLines={1}>
                  { cours[nxid].rooms[0] }
                </Text>
              ) : (
                <Text style={[styles.details.text]} numberOfLines={1}>
                    inconnue
                </Text>
              )}
            </View>

            { (cours[nxid].teachers && cours[nxid].teachers.length > 0) && (cours[nxid].rooms && cours[nxid].rooms.length > 0) && (
              <View style={[styles.details.separator]} />
            )}

            { cours[nxid].teachers && cours[nxid].teachers.length > 0 && (
              <View style={[styles.details.item, styles.details.teacher]}>
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container : {
    borderRadius: 12,
    borderCurve: 'continuous',
  
    elevation: 2,

    flex: 1,
    overflow: 'hidden',
  },

  inContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },

  time: {
    container: {
      height: '100%',
      width: 70,
      paddingLeft: 2.5,
      alignItems: 'center',
      justifyContent: 'center',
      borderRightWidth: 1,
      borderRightColor: '#ffffff20',
      gap: 2,
      backgroundColor: '#ffffff10',
    },
    start: {
      fontSize: 17,
      fontFamily: 'Papillon-Semibold',
      opacity: 1,
      color: '#ffffff',
    },
    end: {
      fontSize: 15,
      fontFamily: 'Papillon-Medium',
      opacity: 0.6,
      color: '#ffffff',
    }
  },

  data: {
    container: {
      gap: 0,
      flex: 1,
      overflow: 'visible',
      paddingHorizontal: 16,
      paddingVertical: 0,
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: 2,
    }
  },

  details: {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 0,
      overflow: 'visible',
      marginTop: 4,
      marginRight: 22,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    room: {
      backgroundColor: '#ffffff20',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 300,
    },
    teacher: {
      flex: 1,
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
      elevation: 0,
    },
    text: {
      fontFamily: 'Papillon-Medium',
      fontSize: 15,
      opacity: 0.6,
    },
  },

  tinyContainer: {
    maxWidth: '100%',
    height: '100%',
    borderRadius: 12,
    borderCurve: 'continuous',
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    alignSelf: 'center',
  },

  tinyStart: {
    fontFamily: 'Papillon-Semibold',
    fontSize: 16,
    color: '#ffffff',
    opacity: 1,
  },

  tinyBar: {
    width: 2,
    height: '60%',
    backgroundColor: '#ffffff',
    opacity: 0.3,
    borderRadius: 2,
  },

  tinyCourse: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    opacity: 0.8,
    maxWidth: '70%',
    fontFamily: 'Papillon-Medium',
  },
});

export default NextCours;
