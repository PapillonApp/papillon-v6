import React, { useState, useRef, useEffect } from 'react';
import { Animated, View, StyleSheet, type ViewStyle, Platform, TextStyle, ImageStyle } from 'react-native';
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

type Styles = {
  [key: string]: ViewStyle | TextStyle | ImageStyle;
};

const NextCours = ({ cours, yOffset, style, setNextColor = (color) => {}, navigation, color, tiny, mainAction = () => {}, longPressAction = () => {}, }: {
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
    if (Platform.OS === 'ios') {
      if (value > 0 - insets.top + 10) {
        setHideDetail(true);
      } else {
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
    } else {
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
    } else {
      Animated.spring(hideAnim, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [hideAll]);

  function updateNext() {
    if (!cours || !cours[nxid]) return;

    let st = new Date(cours[nxid].start);
    let en = new Date(cours[nxid].end);

    let hb = new Date(cours[nxid].start); // hour before
    hb.setHours(hb.getHours() - 1);

    let now = new Date();

    // if the cours is in the next hour
    if (hb.getTime() < now.getTime() && st.getTime() > now.getTime()) {
      // calculate the time between now and the start
      let diff = now.getTime() - st.getTime();
      diff = Math.floor(diff / 1000 / 60);
      setLenText('dans ' + Math.abs(diff) + ' min');

      // calculate the progression
      let q = Math.abs(now.getTime() - hb.getTime());
      let d = Math.abs(st.getTime() - hb.getTime());
      diff = q / d * 100;
      setBarPercent(diff);
    }
    // if the cours is in progress
    else if (st < now && en > now) {
      // calculate the time between now and the end
      let diff: string | number = en.getTime() - now.getTime();
      diff = Math.floor(diff / 1000 / 60);

      if (diff == 0) {
        diff = 'moins d\'une';
      }

      setLenText(diff + ' min rest.');

      // calculate the progression between the start and the end
      let q = Math.abs(now.getTime() - st.getTime());
      let d = Math.abs(en.getTime() - st.getTime());
      diff = q / d * 100;
      setBarPercent(diff);
    }
    // if the cours has not started yet
    else if (st > now) {
      // calculate the time between now and the start
      let diff = st.getTime() - now.getTime();
      diff = Math.floor(diff / 1000 / 60);

      let hours = Math.floor(diff / 60);
      let minutes = diff % 60;

      setLenText('dans ' + Math.abs(hours) + 'h ' + lz(Math.abs(minutes)) + 'min');

      // calculate the progression
      setBarPercent(0);
    }

    // set the time count to the time left before the cours
    let hours = Math.floor(Math.abs(st.getTime() - now.getTime()) / 1000 / 60 / 60);
    let minutes = Math.floor(Math.abs(st.getTime() - now.getTime()) / 1000 / 60 % 60);
    let seconds = Math.floor(Math.abs(st.getTime() - now.getTime()) / 1000 % 60);

    if (hours > 0) {
      setTimeCount(lz(hours) + ' : ' + lz(minutes) + ' : ' + lz(seconds));
    } else {
      setTimeCount(lz(minutes) + ' : ' + lz(seconds));
    }
  }

  // check which cours is next
  function checkCours() {
    let now = new Date();

    if (!cours) return;

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
    if (!cours || !cours[nxid]) return;

    setNextColor(getSavedCourseColor(cours[nxid].subject?.name ?? '', cours[nxid].background_color));
  }, [cours, nxid]);

  if (
    (tiny && (coursEnded || !cours || !cours[nxid]))
  ) {
    return null;
  }

  return (
    <Animated.View style={[
      {
        height: 'auto',
        justifyContent: 'flex-start',
        borderRadius: 10,
        overflow: 'hidden',
        width: '100%',
        paddingHorizontal: 15,
        paddingVertical: 12,
        transform: [{
          translateY: detailAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 20],
          }),
        }],
        opacity: detailAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0],
        }),
        backgroundColor: UIColors.background
      },
      style
    ]}>
      {cours && cours[nxid] && (
        <PressableScale
          weight="light"
          style={styles.nextPressable}
          activeScale={0.98}
          onPress={() => mainAction()}
          onLongPress={() => longPressAction(cours[nxid])}
        >
          <View style={styles.row}>
            <Text style={[
              styles.nextTitle,
              { color: UIColors.text }
            ]}>
              {formatCoursName(cours[nxid].subject?.name ?? '')}
            </Text>
          </View>

          <View style={[
            styles.row,
            { paddingVertical: 2, paddingHorizontal: 0 }
          ]}>
            {cours[nxid].is_cancelled && (
              <Text style={[styles.nextSubtitle, { color: UIColors.textLight }]}>Annulé</Text>
            )}
            {!cours[nxid].is_cancelled && (
              <>
                <Text style={[
                  styles.nextSubtitle,
                  { color: UIColors.textLight }
                ]}>
                  {lenText}
                </Text>
                <Text style={[
                  styles.nextTime,
                  { color: UIColors.textLight }
                ]}>
                  {' | ' + timeCount}
                </Text>
              </>
            )}
          </View>

          <View style={[
            styles.row,
            { paddingVertical: 2, paddingHorizontal: 0 }
          ]}>
            {cours[nxid].teachers && (
              <View style={[
                styles.row,
                { flex: 0, marginRight: 10 }
              ]}>
                <UserCircle2 size={20} color={UIColors.textLight} style={{ marginRight: 4 }} />
                <Text style={[
                  styles.nextInfo,
                  { color: UIColors.textLight }
                ]}>
                  {cours[nxid].teachers}
                </Text>
              </View>
            )}
            {cours[nxid].classroom && (
              <View style={[
                styles.row,
                { flex: 0 }
              ]}>
                <MapPin size={20} color={UIColors.textLight} style={{ marginRight: 4 }} />
                <Text style={[
                  styles.nextInfo,
                  { color: UIColors.textLight }
                ]}>
                  {cours[nxid].classroom}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.bar}>
            <Animated.View style={[
              styles.barProgress,
              { width: `${barPercent}%`, backgroundColor: color || '#000' } // Ensure proper format for width and provide a default color
            ]}></Animated.View>
          </View>
        </PressableScale>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create<Styles>({
  nextPressable: {
    width: '100%',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  row: {
    width: '100%',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  nextTitle: {
    fontWeight: '600',
    fontSize: 18,
  },
  nextSubtitle: {
    fontWeight: '500',
    fontSize: 15,
  },
  nextTime: {
    fontWeight: '500',
    fontSize: 15,
  },
  nextInfo: {
    fontWeight: '400',
    fontSize: 15,
  },
  bar: {
    marginTop: 10,
    height: 3,
    width: '100%',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    backgroundColor: '#cccccc',
  },
  barProgress: {
    height: 3,
  }
});

export default NextCours;
