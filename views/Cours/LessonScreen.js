import * as React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import GetUIColors from '../../utils/GetUIColors';
import PapillonInsetHeader from '../../components/PapillonInsetHeader';
import getClosestGradeEmoji from '../../utils/EmojiCoursName';
import formatCoursName from '../../utils/FormatCoursName';
import { getSavedCourseColor } from '../../utils/ColorCoursName';

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
  Palette,
  Bell,
  ClipboardList,
  BookOpen,
  File as FileLucide,
  Library,
  TextSelect,
} from 'lucide-react-native';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

function lz(num) {
  return num < 10 ? `0${num}` : num;
}

import * as WebBrowser from 'expo-web-browser';

function LessonScreen({ route, navigation }) {
  const theme = useTheme();
  const lesson = route.params.event;
  const UIColors = GetUIColors();

  console.log(lesson);

  function openURL(url) {
    WebBrowser.openBrowserAsync(url, {
      presentationStyle: 'formSheet',
      controlsColor: UIColors.primary,
    });
  }

  // main color
  const mainColor = theme.dark ? '#ffffff' : '#444444';

  const color = getSavedCourseColor(lesson.subject.name, lesson.background_color);

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

  // change header component
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View
          style={{
            flexDirection: 'column',
            alignItems: Platform.OS === 'ios' ? 'center' : 'flex-start',
            maxWidth: '92%',
          }}
        >
          <Text numberOfLines={1} style={{fontFamily: 'Papillon-Semibold', fontSize: 17}}>
            {formatCoursName(lesson.subject.name)}
          </Text>
          <Text numberOfLines={1} style={{fontFamily: 'Papillon-Medium', fontSize: 15, opacity:0.5}}>
            {'salle ' + lesson.rooms.join(', ') + ' - '}
            {lesson.status?.toLowerCase() || lengthString + ' de cours'}
          </Text>
        </View>
      ),
    });
  }, [navigation, theme, lesson.subject.name, UIColors]);

  return (
    <ScrollView style={[styles.container, {backgroundColor: UIColors.modalBackground}]}>

      { Platform.OS === 'ios' ? (
        <StatusBar animated barStyle="light-content" backgroundColor={UIColors.modalBackground} />
      ) : (
        <StatusBar animated barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor={UIColors.modalBackground + '00'} translucent />
      )}
      
      <NativeList
        inset
        header="A propos"
      >
        <NativeItem
          leading={<DoorOpen size={24} color={mainColor} />}
        >
          <NativeText heading="p2">
                Salle{lesson.rooms.length > 1 ? 's' : ''} de cours
          </NativeText>
          <NativeText heading="h4">
            {lesson.rooms.join(', ') || 'Non spécifié'}
          </NativeText>
        </NativeItem>
        <NativeItem
          leading={<User2 size={24} color={mainColor} />}
        >
          <NativeText heading="p2">
                Professeur{lesson.teachers.length > 1 ? 's' : ''}
          </NativeText>
          <NativeText heading="h4">
            {lesson.teachers.join(', ') || 'Non spécifié'}
          </NativeText>
        </NativeItem>
        { lesson.group_names && lesson.group_names.length > 0 ? (
          <NativeItem
            leading={<Users size={24} color={mainColor} />}
          >
            <NativeText heading="p2">
                  Groupe{lesson.group_names.length > 1 ? 's' : ''}
            </NativeText>
            <NativeText heading="h4">
              {lesson.group_names.join(', ') || 'Non spécifié'}
            </NativeText>
          </NativeItem>
        ) : <View style={{marginTop: -0.5}} /> }
      </NativeList>

      { lesson.status ? (
        <NativeList inset header="Statut">
          <NativeItem
            leading={<Info size={24} color={mainColor} />}
          >
            <NativeText heading="p2">
                  Statut du cours
            </NativeText>
            <NativeText heading="h4">
              {lesson.status}
            </NativeText>
          </NativeItem>
          { lesson.memo ? (
            <NativeItem
              leading={<TextSelect size={24} color={mainColor} />}
            >
              <NativeText heading="p2">
                  Commentaire
              </NativeText>
              <NativeText heading="h4">
                {lesson.memo}
              </NativeText>
            </NativeItem>
          ) : <View style={{marginTop: -0.5}} /> }
        </NativeList>
      ) : null }

      <NativeList
        inset
        header="Horaires"
      >
        <NativeItem
          leading={<Hourglass size={24} color={mainColor} />}
        >
          <NativeText heading="p2">
              Durée du cours
          </NativeText>
          <NativeText heading="h4">
            {lengthString}
          </NativeText>
        </NativeItem>
        <NativeItem
          leading={<Calendar size={24} color={mainColor} />}
        >
          <NativeText heading="p2">
              Date du cours
          </NativeText>
          <NativeText heading="h4">
            {dateCours}
          </NativeText>
        </NativeItem>
        <NativeItem
          leading={<Clock8 size={24} color={mainColor} />}
        >
          <NativeText heading="p2">
              Début du cours
          </NativeText>
          <NativeText heading="h4">
            {startStr}
          </NativeText>
        </NativeItem>
        <NativeItem
          leading={<Clock4 size={24} color={mainColor} />}
        >
          <NativeText heading="p2">
              Fin du cours
          </NativeText>
          <NativeText heading="h4">
            {endStr}
          </NativeText>
        </NativeItem>
      </NativeList>

      { lesson.content && lesson.content.description ? (
        <NativeList
          inset
          header="Contenu du cours"
        >
          <NativeItem
            leading={<BookOpen size={24} color={mainColor} />}
          >
            <NativeText heading="p2">
                Titre
            </NativeText>
            <NativeText heading="h4">
              {lesson.content.title || 'Non spécifié'}
            </NativeText>
          </NativeItem>
          <NativeItem
            leading={<ClipboardList size={24} color={mainColor} />}
          >
            <NativeText heading="p2">
                Description
            </NativeText>
            <NativeText heading="h4">
              {lesson.content.description || 'Non spécifié'}
            </NativeText>
          </NativeItem>
        </NativeList>
      ) : <View /> }

      { lesson.content && lesson.content.files && lesson.content.files.length > 0 ? (
        <NativeList
          inset
          header="Fichiers"
        >
          { lesson.content.files.map((file, index) => (
            <NativeItem
              key={index}
              leading={<FileLucide size={24} color={mainColor} />}
              onPress={() => {
                if (file.url.startsWith('http')) {
                  openURL(file.url);
                }
                else {
                  Alert.alert(
                    'Impossible d\'ouvrir le fichier',
                    'Le fichier n\'est pas disponible en ligne.',
                    [
                      {
                        text: 'OK',
                        style: 'cancel',
                      },
                    ],
                    { cancelable: true }
                  );
                }
              }}
              chevron
            >
              <NativeText heading="h4" numberOfLines={1}>
                {file.name}
              </NativeText>
              <NativeText heading="p2" numberOfLines={1}>
                {file.url}
              </NativeText>
            </NativeItem>
          )) }
        </NativeList>
      ) : <View /> }

      <View style={{height: 20}} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  headerEmojiContainer: {
    width: 36,
    height: 36,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -14,
    marginRight: -14,
  },
  headerEmoji: {
    fontSize: 22,
  },
});

export default LessonScreen;
