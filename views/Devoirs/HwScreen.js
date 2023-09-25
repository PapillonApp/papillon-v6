import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';

import formatCoursName from '../../utils/FormatCoursName';

import ListItem from '../../components/ListItem';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Haptics from 'expo-haptics';

import { PressableScale } from 'react-native-pressable-scale';

import { Check, Link, File, Calendar, List } from 'lucide-react-native';

import * as WebBrowser from 'expo-web-browser';

import { Text, useTheme } from 'react-native-paper';
import GetUIColors from '../../utils/GetUIColors';

import { IndexData } from '../../fetch/IndexData';
import { openURL } from 'expo-linking';

function HomeworkScreen({ route, navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const { homework } = route.params;

  const [thisHwChecked, setThisHwChecked] = React.useState(homework.done);

  const openURL = async (url) => {
    await WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'done',
      presentationStyle: 'pageSheet',
      controlsColor: UIColors.primary,
    });
  };

  useEffect(() => {
    
  }, []);

  const changeHwState = () => {
    console.log(`change ${homework.date} : ${homework.local_id}`);
    IndexData.changeHomeworkState(homework.date, homework.local_id).then((result) => {
      console.log(result);

      if (result.status === 'not found') {
        setTimeout(() => {
          setThisHwChecked(homework.done);
        }, 100);
        return;
      }

      AsyncStorage.getItem('homeworksCache').then((homeworksCache) => {
        // find the homework
        let cachedHomeworks = JSON.parse(homeworksCache);

        for (let i = 0; i < cachedHomeworks.length; i++) {
          for (let j = 0; j < cachedHomeworks[i].timetable.length; j++) {
            if (cachedHomeworks[i].timetable[j].local_id === homework.local_id) {
              cachedHomeworks[i].timetable[j].done = !cachedHomeworks[i].timetable[j].done;
            }
          }
        }
        
        AsyncStorage.setItem(
          'homeworksCache',
          JSON.stringify(cachedHomeworks)
        );
      });

      // sync with home page
      AsyncStorage.setItem('homeUpdated', 'true');
      // sync with devoirs page
      AsyncStorage.setItem('homeworksUpdated', 'true');
    });
  };

  // add checkbox in header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Devoir en " + formatCoursName(homework.subject.name),
      headerLargeTitle: Platform.OS === 'ios' ? true : false,
    });
  }, [navigation, homework]);

  console.log(homework);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
      contentInsetAdjustmentBehavior="automatic"
    >
      {Platform.OS === 'ios' ? (
        <StatusBar animated barStyle="light-content" />
      ) : (
        <StatusBar
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
      )}

      <View style={styles.optionsList}>
        <Text style={styles.ListTitle}>Description</Text>
        <View style={[styles.hwContent, {backgroundColor: UIColors.element}]}>
          <Text style={styles.hwContentText}>{homework.description}</Text>
        </View>  
        <ListItem
          left={
            <HwCheckbox
              checked={thisHwChecked}
              theme={theme}
              pressed={() => {
                setThisHwChecked(!thisHwChecked);
                changeHwState();
              }}
            />
          }
          title="Marquer comme fait"
          width
          center
          onPress={() => {
            setThisHwChecked(!thisHwChecked);
            changeHwState();
          }}
        />  
      </View>

      <View style={styles.optionsList}>
        <Text style={styles.ListTitle}>Informations</Text>

        <ListItem
          icon={
            <Calendar size={24} color={UIColors.text} />
          }
          title="Donné pour le"
          subtitle={new Date(homework.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          width
          center
        />
      </View>

      {homework.files.length > 0 ? (
        <View style={styles.optionsList}>
          <Text style={styles.ListTitle}>Fichiers</Text>
          {homework.files.map((file, index) => (
            <ListItem
              key={index}
              title={file.name}
              subtitle={file.url}
              trimSubtitle={true}
              icon={(
                file.type === 0 ? (
                  <Link size={24} color={theme.dark ? '#ffffff' : '#000000'} />
                ) : (
                  <File size={24} color={theme.dark ? '#ffffff' : '#000000'} />
                )
              )}
              onPress={() => openURL(file.url)}
              width
              center
            />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

function HwCheckbox({ checked, theme, pressed }) {
  return (
    <PressableScale
      style={[
        styles.checkContainer,
        { borderColor: theme.dark ? '#333333' : '#c5c5c5' },
        checked ? styles.checkChecked : null,
      ]}
      weight="light"
      activeScale={0.7}
      onPress={() => {
        Haptics.notificationAsync('success')
        pressed()
      }}
    >
      {checked ? <Check size={20} color="#ffffff" /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    gap: 9,
    marginTop: 16,
    marginHorizontal: 14,
  },
  ListTitle: {
    paddingLeft: 12,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },

  checkboxContainer: {},
  checkContainer: {
    width: 26,
    height: 26,
    borderRadius: 16,
    borderCurve: 'continuous',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
  },
  checkChecked: {
    backgroundColor: '#159C5E',
    borderColor: '#159C5E',
  },

  hwContent: {
    padding: 12,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  hwContentText: {
    fontSize: 16,
  },

  homeworkFile: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderCurve: 'continuous',
  },

  homeworkFileData: {
    gap: 2,
    flex: 1,
  },

  homeworkFileText: {
    fontSize: 17,
    fontWeight: 400,
    fontFamily: 'Papillon-Semibold',
  },
  homeworkFileUrl: {
    fontSize: 15,
    fontWeight: 400,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },
});

export default HomeworkScreen;
