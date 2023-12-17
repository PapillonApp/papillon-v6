import React, {useState, useEffect} from "react";
import {View, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, StatusBar, RefreshControl} from "react-native";

import {Text, useTheme} from "react-native-paper";

import { PressableScale } from "react-native-pressable-scale";

import GetUIColors from "../../utils/GetUIColors";

import { getSavedCourseColor } from "../../utils/ColorCoursName";
import formatCoursName from "../../utils/FormatCoursName";
import { MapPin, UserCircle2 } from "lucide-react-native";

function lz(num) {
  return (num < 10 ? '0' : '') + num;
}

const NextCours = ({ cours, style, navigation }) => {
  const UIColors = GetUIColors();

  const [nxid, setNxid] = useState(0);

  const [showLen, setShowLen] = useState(true);
  const [coursStarted, setCoursStarted] = useState(false);
  const [lenText, setLenText] = useState('à venir');
  const [barPercent, setBarPercent] = useState(0);

  const [coursEnded, setCoursEnded] = useState(false);

  function updateNext() {
    if(!cours || !cours[nxid]) return;

      st = new Date(cours[nxid].start);
      en = new Date(cours[nxid].end);

      hb = new Date(cours[nxid].start); // hour before
      hb.setHours(hb.getHours() - 1);

      now = new Date();

      // if the cours is in the next hour
      if (hb < new Date(now) && st > new Date(now)) {
        setCoursStarted(false);
        
        // calculate the time between now and the start
        diff = new Date(now) - st;
        diff = Math.floor(diff / 1000 / 60);
        setLenText('dans ' + Math.abs(diff) + ' min');

        // calculate the progression
        var q = Math.abs(now-hb);
        var d = Math.abs(st-hb);
        diff = q / d * 100;
        setBarPercent(diff);
      }
      // if the cours is in progress
      else if (st < new Date(now) && en > new Date(now)) {
        setCoursStarted(true);

        // calculate the time between now and the end
        diff = en - new Date(now);
        diff = Math.floor(diff / 1000 / 60);

        if(diff == 0) {
          diff = 'moins d\'une';
        }

        setLenText(diff + ' min rest.');

        // calculate the progression between the start and the end
        var q = Math.abs(now-st);
        var d = Math.abs(en-st);
        diff = q / d * 100;
        setBarPercent(diff);
      }
      // if the cours has not started yet
      else if (st > new Date(now)) {
        setCoursStarted(false);
        
        // calculate the time between now and the start
        diff = new Date(now) - st;
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

    let currentOrNextClass = null;
    let minTimeDiff = Infinity;

    // find the class that is currently happening or next
    for (let i = 0; i < activeClasses.length; i++) {
      const classInfo = activeClasses[i];
      const classStart = new Date(classInfo.start);
      const classEnd = new Date(classInfo.end);

      // if the class is currently happening
      if (classStart < now && classEnd > now) {
        currentOrNextClass = classInfo;
        setNxid(cours.indexOf(classInfo));
        break;
      }

      // if the class is in the future
      if (classStart > now) {
        const timeDiff = classStart - now;

        // if the class is closer than the current closest class
        if (timeDiff < minTimeDiff) {
          currentOrNextClass = classInfo;
          setNxid(cours.indexOf(classInfo));
          minTimeDiff = timeDiff;
        }
      }
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      updateNext();
      checkCours();
    }, 1000);
  
    return () => clearInterval(interval);
  }, [cours, nxid]);

  useEffect(() => {
    updateNext();
    checkCours();
  }, [cours, nxid]);

  if(!cours || !cours[nxid]) return (
    <PressableScale style={[styles.container, styles.end.container, { backgroundColor: UIColors.element }, style]}
      onPress={() => {
        if(navigation) {
          navigation.navigate('CoursHandler');
        }
      }}
    >
      <Text style={[styles.end.text, {color: UIColors.text}]} numberOfLines={1}>
        Aucun cours aujourd'hui
      </Text>
    </PressableScale>
  );

  if(coursEnded) return (
    <PressableScale style={[styles.container, styles.end.container, { backgroundColor: UIColors.element }, style]}
      onPress={() => {
        if(navigation) {
          navigation.navigate('CoursHandler');
        }
      }}
    >
      <Text style={[styles.end.text, {color: UIColors.text}]} numberOfLines={1}>
        Pas de prochain cours
      </Text>
    </PressableScale>
  );

  return (
    cours && cours[nxid] && !coursEnded &&

    <PressableScale
      style={[
        styles.container,
        { backgroundColor: getSavedCourseColor(cours[nxid].subject.name, cours[nxid].background_color) },
        style
      ]}
      onPress={() => {
        if(navigation) {
          navigation.navigate('Lesson', { event: cours[nxid] });
        }
      }}
    >
      <View style={[styles.time.container]}>
        <Text style={[styles.time.text]}>
          { new Date(cours[nxid].start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
        </Text>
      </View>
      <View style={[styles.data.container]}>
        <View style={[styles.subject.container]}>
          <Text style={[styles.subject.text]} numberOfLines={1}>
            { formatCoursName(cours[nxid].subject.name) }
          </Text>
        </View>

        { showLen && (
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
        )}

        <View style={[styles.details.container]}>
          { cours[nxid].rooms && cours[nxid].rooms.length > 0 && (
            <View style={[styles.details.item]}>
              <MapPin size={20} color={"#ffffff"} style={[styles.details.icon]} />
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
              <UserCircle2 size={20} color={"#ffffff"} style={[styles.details.icon]} />
              <Text style={[styles.details.text]} numberOfLines={1}>
                { cours[nxid].teachers[0] }
              </Text>
            </View>
          )}
        </View>
      </View>
    </PressableScale>
  )
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',

    paddingHorizontal: 16,
    paddingVertical: 12,

    gap: 16,
  },

  time: {
    container: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderCurve: 'continuous',
      backgroundColor: '#ffffff22',
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
      gap: 4,
      flex: 1,
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