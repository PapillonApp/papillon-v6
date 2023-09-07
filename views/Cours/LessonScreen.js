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

import { ContextMenuView } from 'react-native-ios-context-menu';

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
          body: `Ouvre l'app Papillon pour voir les détails du cours.`,
          sound: true,
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
      <CoursHeader cours={lesson} navigation={navigation} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: UIColors.background }}
      >
        <StatusBar
          animated
          barStyle="light-content"
          backgroundColor={getClosestColor(lesson.background_color)}
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
      </ScrollView>
    </>
  );
}

function CoursHeader({ cours, navigation }) {
  return (
    <View
      style={[
        styles.coursHeader,
        { backgroundColor: getClosestColor(cours.background_color) },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.coursHeaderClose,
          { top: Platform.OS === 'android' ? 36 : 20 },
        ]}
        onPress={() => navigation.goBack()}
      >
        <X size={22} color="#ffffff" />
      </TouchableOpacity>

      <Text style={styles.coursNameHeader}>
        {formatCoursName(cours.subject.name)}
      </Text>
    </View>
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

  coursHeader: {
    height: 150,
    width: '100%',
  },
  coursNameHeader: {
    position: 'absolute',
    bottom: 18,
    left: 20,
    color: '#fff',

    fontSize: 24,
    fontFamily: 'Papillon-Semibold',
    
    width: '80%',
  },

  coursHeaderClose: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    padding: 6,
    borderRadius: 120,
    backgroundColor: '#ffffff33',
    opacity: 0.8,
  },
});

export default LessonScreen;
