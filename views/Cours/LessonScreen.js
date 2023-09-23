import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContextMenuView } from 'react-native-ios-context-menu';

import { AnimatedScrollView } from '@kanelloc/react-native-animated-header-scroll-view';

import * as Notifications from 'expo-notifications';

import {
  X,
  DoorOpen,
  User2,
  Clock4,
  Info,
  Calendar,
  Hourglass,
  Clock8,
  Users,
} from 'lucide-react-native';

import { useState, useEffect } from 'react';

import * as Clipboard from 'expo-clipboard';
import formatCoursName from '../../utils/FormatCoursName';
import ListItem from '../../components/ListItem';
import getClosestColor from '../../utils/ColorCoursName';
import { getClosestCourseColor } from '../../utils/ColorCoursName';
import GetUIColors from '../../utils/GetUIColors';
import getClosestGradeEmoji from '../../utils/EmojiCoursName';

/* async function getDefaultCalendarSource() {
	const defaultCalendar = await Calendar.getDefaultCalendarAsync();
	return defaultCalendar.source;
} */

function LessonScreen({ route, navigation }) {
  const theme = useTheme();
  const lesson = route.params.event;
  const UIColors = GetUIColors();

  const insets = useSafeAreaInsets();

  console.log(lesson);

  // calculate length of lesson
  const start = new Date(lesson.start);
  const end = new Date(lesson.end);

  const length = Math.floor((end - start) / 60000);
  const lengthString = `${Math.floor(length / 60)}h${
    length % 60 < 10 ? '0' : ''
  }${length % 60}`;

  // date (jeudi 1 janvier 1970)
  const dateCours = new Date(lesson.start).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // start time (hh:mm)
  const startStr = new Date(lesson.start).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // end time (hh:mm)
  const endStr = new Date(lesson.end).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // format cours name
  /* const coursName = formatCoursName(lesson.subject.name); */

  // main color
  const mainColor = theme.dark ? '#ffffff' : '#444444';

  const [isNotified, setIsNotified] = useState(false);

  function changeIsNotified(val) {
    setIsNotified(val);

    let time = new Date(lesson.start);
    time.setMinutes(time.getMinutes() - 5);

    if (time < new Date()) {
      setTimeout(() => {
        setIsNotified(false);
      }, 200);
      return;
    }

    if (val) {
      Notifications.scheduleNotificationAsync({
        identifier: lesson.subject.name + new Date(lesson.start).getTime(),
        content: {
          title: `${getClosestGradeEmoji(lesson.subject.name)} ${lesson.subject.name} - Ça commence dans 5 minutes`,
          body: `Le cours est en salle ${lesson.rooms[0]} avec ${lesson.teachers[0]}.`,
          sound: 'papillon_ding.wav',
        },
        trigger: {
          channelId: 'coursReminder',
          date: new Date(time),
        },
      });
    }
    else {
      Notifications.cancelScheduledNotificationAsync(lesson.subject.name + new Date(lesson.start).getTime());
    }
  }

  useEffect(() => {
    Notifications.getAllScheduledNotificationsAsync().then((value) => {
      for (const notification of value) {
        if (notification.identifier === lesson.subject.name + new Date(lesson.start).getTime()) {
          setIsNotified(true);
          break;
        }
      }
    });
  }, []);

  return (
    <>
      <AnimatedScrollView
        style={{ flex: 1, backgroundColor: UIColors.background }}
        headerMaxHeight={150}
        topBarElevation={12}
        topBarHeight={Platform.OS == 'android' ? insets.top + 56 : 56}
        HeaderComponent={
          <View style={[styles.coursNameHeaderView, {backgroundColor: getClosestCourseColor(lesson.subject.name)}]}>
            <View style={styles.coursDataHeader}>
              <Text style={styles.coursNameHeader}>
                {formatCoursName(lesson.subject.name)}
              </Text>

              <View style={[styles.coursNameEmoji]}>
                <Text style={[styles.coursNameEmojiText]}>
                  {getClosestGradeEmoji(lesson.subject.name)}
                </Text>
              </View>
            </View>
          </View>
        }
        HeaderNavbarComponent={
          <View>
          </View>
        }
        TopNavBarComponent={
          <View style={[styles.coursNameView, {backgroundColor: getClosestCourseColor(lesson.subject.name)}, Platform.OS == 'android' ? {paddingTop: insets.top} : null]}>
            <Text style={[styles.coursNameHeaderText]}>
              {formatCoursName(lesson.subject.name)}
            </Text>
          </View>
        }
      >
        <StatusBar
          animated
          barStyle="light-content"
          backgroundColor={getClosestCourseColor(lesson.subject.name)}
        />

        <View style={styles.optionsList}>
          <Text style={styles.ListTitle}>A propos</Text>

          { lesson.rooms.length > 0 ? (
            <ListItem
              title="Salle de cours"
              subtitle={lesson.rooms.join(', ')}
              color={mainColor}
              left={<DoorOpen size={24} color={mainColor} />}
              width
            />
          ) : null }
          { lesson.teachers.length > 0 ? (
            <ListItem
              title={"Professeur" + (lesson.teachers.length > 1 ? "s" : "")}
              subtitle={lesson.teachers.join(', ')}
              color={mainColor}
              left={<User2 size={24} color={mainColor} />}
              width
            />
          ) : null }
          { lesson.group_names.length > 0 ? (
            <ListItem
              title={"Groupe" + (lesson.group_names.length > 1 ? "s" : "")}
              subtitle={lesson.group_names.join(', ')}
              color={mainColor}
              left={<Users size={24} color={mainColor} />}
              width
            />
          ) : null }
          {lesson.status !== null ? (
            <ListItem
              title="Statut du cours"
              subtitle={lesson.status}
              color={!lesson.is_cancelled ? mainColor : '#B42828'}
              left={
                <Info
                  size={24}
                  color={!lesson.is_cancelled ? mainColor : '#ffffff'}
                />
              }
              fill={!!lesson.is_cancelled}
              width
            />
          ) : null}
        </View>

        <View style={styles.optionsList}>
          <Text style={styles.ListTitle}>Horaires</Text>

          <ListItem
            title="Durée du cours"
            subtitle={lengthString}
            color={mainColor}
            left={<Hourglass size={24} color={mainColor} />}
            width
          />

          <ContextMenuView
            menuConfig={{
              menuTitle: '',
              menuItems: [
                {
                  actionKey: 'copy',
                  actionTitle: 'Copier',
                  icon: {
                    type: 'IMAGE_SYSTEM',
                    imageValue: {
                      systemName: 'doc.on.doc',
                    },
                  },
                },
              ],
            }}
            onPressMenuItem={({ nativeEvent }) => {
              if (nativeEvent.actionKey === 'copy') {
                Clipboard.setString(dateCours);
              }
            }}
            previewConfig={{
              previewType: 'RECT',
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
            }}
          >
            <ListItem
              title="Date du cours"
              subtitle={dateCours}
              color={mainColor}
              left={<Calendar size={24} color={mainColor} />}
              width
            />
          </ContextMenuView>

          <View style={{ flexDirection: 'row', gap: 9 }}>
            <ListItem
              title="Début"
              subtitle={startStr}
              color={mainColor}
              left={<Clock8 size={24} color={mainColor} />}
              style={{ flex: 1, marginHorizontal: 0 }}
            />
            <ListItem
              title="Fin"
              subtitle={endStr}
              color={mainColor}
              left={<Clock4 size={24} color={mainColor} />}
              style={{ flex: 1, marginHorizontal: 0 }}
            />
          </View>
        </View>

        { new Date(lesson.start) > new Date() ? (
          <View style={styles.optionsList}>
            <Text style={styles.ListTitle}>Options (cours à venir)</Text>

            <ListItem
              title="Me notifier 5 minutes avant"
              subtitle="Envoie une notification 5 minutes avant le début du cours"
              style={{ flex: 1, marginHorizontal: 0 }}
              right={
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Switch
                    value={isNotified}
                    onValueChange={(val) => changeIsNotified(val)}
                  />
                </View>
              }
            />
          </View>
        ) : null }

        <View style={{ height: 20 }} />
      </AnimatedScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    gap: 9,
    marginTop: 16,
    marginHorizontal: 14,
  },
  ListTitle: {
    paddingLeft: 19,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },
  coursNameView: {
    height: 170,
  },
  coursName: {
    position: 'absolute',
    bottom: 18,
    left: 20,
  },
  coursNameText: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Papillon-Semibold',
    marginBottom: 3,
  },
  coursDateText: {
    fontSize: 15,
    color: '#ffffff99',
  },

  coursNameHeaderView: {
    flex: 1,
    width: '100%',
  },

  coursDataHeader: {
    position: 'absolute',
    bottom: 18,
    left: 20,
    marginHorizontal: 40,
    marginRight: 80,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 40,
  },

  coursNameHeader: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Papillon-Semibold',
    flex: 1,
  },

  coursNameEmoji: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: '#ffffff22',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ffffff44',
    borderWidth: 1,
  },
  coursNameEmojiText: {
    fontSize: 28,
    marginLeft: 2,
  },

  coursNameView: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  coursNameHeaderText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
    textAlign: 'center',
  },
});

export default LessonScreen;
