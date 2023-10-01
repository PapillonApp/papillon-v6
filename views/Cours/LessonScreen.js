import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  Switch,
  Image,
  Modal,
  Button,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import ColorPicker, { Panel1, Swatches, Preview, OpacitySlider, HueSlider } from 'reanimated-color-picker';

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
import { forceSavedCourseColor, getSavedCourseColor } from '../../utils/ColorCoursName';
import GetUIColors from '../../utils/GetUIColors';
import getClosestGradeEmoji from '../../utils/EmojiCoursName';

import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { IndexData } from '../../fetch/IndexData';

/* async function getDefaultCalendarSource() {
	const defaultCalendar = await Calendar.getDefaultCalendarAsync();
	return defaultCalendar.source;
} */

function lz(num) {
  return num < 10 ? '0' + num : num;
}

const blurPics = [
  require(`../../assets/blur_01.png`),
  require(`../../assets/blur_02.png`),
  require(`../../assets/blur_03.png`),
  require(`../../assets/blur_04.png`),
  require(`../../assets/blur_05.png`),
  require(`../../assets/blur_06.png`),
  require(`../../assets/blur_07.png`)
]

const blurPic1 = blurPics[Math.floor(Math.random() * 7) + 1];
const blurPic2 = blurPics[Math.floor(Math.random() * 7) + 1];

function LessonScreen({ route, navigation }) {
  const theme = useTheme();
  const lesson = route.params.event;
  const UIColors = GetUIColors();

  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState(null);

  const [blurPic1, setBlurPic1] = useState(null);
  const [blurPic2, setBlurPic2] = useState(null);

  React.useLayoutEffect(() => {
    setBlurPic1(blurPics[Math.floor(Math.random() * 6) + 1]);
    setBlurPic2(blurPics[Math.floor(Math.random() * 6) + 1]);
  }, []);

  useEffect(() => {
    IndexData.getUser(false).then((data) => {
      setUserData(data);
    });
  }, []);

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

  const [countdown, setCountdown] = useState(
    Math.floor((new Date(lesson.start) - new Date()) / 1000)
  );
  const [countdownString, setCountdownString] = useState(null);

  useEffect(() => {
    if (countdown > 0) {
      const interval = setInterval(() => {
        setCountdown(countdown - 1);

        const hours = Math.floor(countdown / 3600);
        const minutes = Math.floor((countdown % 3600) / 60);
        const seconds = countdown % 60;

        // a venir
        if (hours > 0 && hours < 25) {
          setCountdownString(
            `dans ${lz(hours)}h ${lz(minutes)}m ${lz(seconds)}s`
          );
        }
        else if (hours >= 25 && hours < 48) {
          setCountdownString(
            `dans ${Math.floor(hours / 24)} jour(s) ${lz(hours % 24)} heure(s)`
          );
        }
        else if (hours >= 48) {
          setCountdownString(
            `dans ${Math.floor(hours / 24)} jours`
          );
        }
        else {
          setCountdownString(
            `dans ${lz(minutes)}m ${lz(seconds)}s`
          );
        }

      }, 1000);

      return () => clearInterval(interval);
    }
    else {
      const interval = setInterval(() => {
        setCountdown(countdown - 1);

        const hours = Math.floor(countdown / 3600);
        const minutes = Math.floor((countdown % 3600) / 60);
        const seconds = countdown % 60;

        // a venir

        if (hours < -1 && hours > -48) {
          setCountdownString(
            `il y a ${lz(-hours)} heures`
          );
        }
        else if (hours <= -48) {
          setCountdownString(
            `il y a ${Math.floor(-hours / 24)} jours`
          );
        }
        else {
          setCountdownString(
            `il y a ${lz(-minutes)} minutes`
          );
        }

      }, 1000);

      return () => clearInterval(interval);
    }
  }, [countdown]);

  const [colorModalVisible, setColorModalVisible] = useState(false);

  function changeCourseColor() {
    setColorModalVisible(true);
  }

  const [color, setColor] = useState(getSavedCourseColor(lesson.subject.name, lesson.background_color));

  const onSelectColor = ({ hex }) => {
    forceSavedCourseColor(lesson.subject.name, hex);
    setColor(hex);
  };

  return (
    <>
      <AnimatedScrollView
        style={{ flex: 1, backgroundColor: UIColors.background }}
        headerMaxHeight={160}
        topBarElevation={12}
        topBarHeight={Platform.OS == 'android' ? insets.top + 56 : 56}
        HeaderComponent={
          <View style={[styles.coursNameHeaderView, {backgroundColor: getSavedCourseColor(lesson.subject.name, lesson.background_color)}]}>
            <View style={styles.coursDataHeader}>
              <Text style={styles.coursNameHeader}>
                {formatCoursName(lesson.subject.name)}
              </Text>

              <SkeletonPlaceholder
                borderRadius={4}
                backgroundColor={'#ffffff55'}
                highlightColor={'#ffffff'}
                speed={1000}
                enabled={!countdownString}
              >
                { countdownString ?
                  <Text style={styles.coursTimeHeader}>
                    {countdownString}
                  </Text>
                :
                  <Text style={styles.coursTimeHeaderPlaceholder}>
                    dans ...
                  </Text>
                }
              </SkeletonPlaceholder>

              { userData ?
                <View style={styles.coursGroupHeader}>
                  { userData.profile_picture ?
                    <View style={styles.coursGroupHeaderPics}>
                      <Image style={[styles.coursGroupHeaderPic, {borderColor: color}]} source={blurPic1} />
                      <Image style={[styles.coursGroupHeaderPic, {borderColor: color}]} source={blurPic2} />

                      <Image style={[styles.coursGroupHeaderPic, {borderColor: color}]} source={{ uri: userData.profile_picture }} />
                    </View>
                  : null }
                  { lesson.group_names.length > 0 ? (
                    <Text style={styles.coursGroupHeaderText}>
                      avec le groupe {lesson.group_names.join(', ')}
                    </Text>
                  ) : (
                    <Text style={styles.coursGroupHeaderText}>
                      avec la classe {userData.class}
                    </Text>
                  )}
                </View>
              : null }
            </View>
          </View>
        }
        HeaderNavbarComponent={
          <View style={[{flex: 1, width: '100%'}]}>
            <TouchableOpacity
              style={[styles.closeItem, Platform.OS == 'android' ? {marginTop: insets.top + 10} : null]}
              onPress={() => navigation.goBack()}
            >
              <X size={24} color={'#ffffff'} />
            </TouchableOpacity>
          </View>
        }
        TopNavBarComponent={
          <View style={[styles.coursNameView, {backgroundColor: color}, Platform.OS == 'android' ? {paddingTop: insets.top} : null]}>
            <Text style={[styles.coursNameHeaderText]}>
              {formatCoursName(lesson.subject.name)}
            </Text>

            <SkeletonPlaceholder
                borderRadius={4}
                backgroundColor={'#ffffff55'}
                highlightColor={'#ffffff'}
                speed={1000}
                enabled={!countdownString}
            >
            { countdownString ?
                <Text style={styles.coursTimeHeaderTop}>
                  {countdownString}
                </Text>
              :
                ( Math.floor((new Date(lesson.start) - new Date()) / 1000) > 0 ?
                  <Text style={styles.coursTimeHeaderTop}>
                    dans ...
                  </Text>
                :
                  <Text style={styles.coursTimeHeaderTop}>
                    il y a ...
                  </Text>
                )
              }
              </SkeletonPlaceholder>
          </View>
        }
      >
        <StatusBar
          animated
          barStyle="light-content"
          backgroundColor={color}
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

        <View style={styles.optionsList}>
          <Text style={styles.ListTitle}>Options</Text>

          { new Date(lesson.start) > new Date() ? (
            <ListItem
              title="Me notifier 5 min. avant"
              subtitle="Vous serez notifié 5 minutes avant le début du cours."
              style={{ flex: 1, marginHorizontal: 0 }}
              center
              right={
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Switch
                    value={isNotified}
                    onValueChange={(val) => changeIsNotified(val)}
                  />
                </View>
              }
            />
          ) : null }

          <ListItem
            title="Changer la couleur de la matière"
            style={{ flex: 1, marginHorizontal: 0 }}
            onPress={() => changeCourseColor()}
            center
            chevron
          />
        </View>
        

        <View style={{ height: 78 }} />
      </AnimatedScrollView>

      <Modal visible={colorModalVisible} animationType='fade' presentationStyle='overFullScreen' transparent={true} >
        <View style={{ flex: 1, backgroundColor: "#00000099", alignItems: 'center', justifyContent: 'center' }} >
          <View style={{backgroundColor: UIColors.background, padding: 20, borderRadius: 12, borderCurve: 'continuous'}}>
            <ColorPicker style={{ width: '70%', gap: 20 }} value={color} onComplete={onSelectColor}>
              <Preview />
              <Panel1 />
              <HueSlider />
              <Swatches />
            </ColorPicker>

            <Button color={color} title='Enregistrer' onPress={() => setColorModalVisible(false)} />
          </View>
        </View>
      </Modal>
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
    gap: 4,
  },

  coursNameHeader: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Papillon-Semibold',
    flex: 1,
  },
  coursTimeHeader: {
    color: '#ffffff99',
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    alignSelf: 'flex-start',
    minWidth: 150,
  },
  coursTimeHeaderPlaceholder: {
    color: '#ffffff99',
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    alignSelf: 'flex-start',
    minWidth: 150,
    marginTop: 1.5,
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
  coursTimeHeaderTop: {
    color: '#ffffff99',
    fontSize: 14,
    fontFamily: 'Papillon-Medium',
    textAlign: 'center',
    alignSelf: 'center',
    minWidth: 150,
  },

  closeItem: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 6,
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#ffffff22',
    borderRadius: 50,

    opacity: 0.7,
  },

  coursGroupHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  coursGroupHeaderPics: {
    display: 'flex',
    flexDirection: 'row-reverse',
    alignSelf: 'flex-start',
    gap: -15,
  },
  coursGroupHeaderPic: {
    width: 26,
    height: 26,
    borderRadius: 50,
    backgroundColor: '#ffffff22',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ffffff44',
    borderWidth: 1.5,
  },
  coursGroupHeaderText: {
    color: '#ffffff99',
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
  },
});

export default LessonScreen;
