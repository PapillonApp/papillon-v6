import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { PressableScale } from 'react-native-pressable-scale';

import { Check, Link, File, Trash } from 'lucide-react-native';

import * as WebBrowser from 'expo-web-browser';
import ParsedText from 'react-native-parsed-text';

import { useTheme } from 'react-native-paper';

import GetUIColors from '../../utils/GetUIColors';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import formatCoursName from '../../utils/FormatCoursName';
import { useAppContext } from '../../utils/AppContext';

import AlertBottomSheet from '../../interface/AlertBottomSheet';
import CheckAnimated from '../../interface/CheckAnimated';

function HomeworkScreen({ route, navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const { homework } = route.params;
  const [thisHwChecked, setThisHwChecked] = React.useState(homework.done);
  const [thisHwLoading, setThisHwLoading] = React.useState(false);

  const [deleteCustomHomeworkAlert, setDeleteCustomHomeworkAlert] = React.useState(false);

  console.log(homework);

  const openURL = async (url) => {
    await WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'done',
      presentationStyle: 'pageSheet',
      controlsColor: UIColors.primary,
    });
  };

  const appctx = useAppContext();

  const deleteCustomHomework = () => {
    AsyncStorage.getItem('customHomeworks').then((customHomeworks) => {
      let hw = [];
      if (customHomeworks) {
        hw = JSON.parse(customHomeworks);
      }

      // find the homework
      for (let i = 0; i < hw.length; i++) {
        if (hw[i].local_id === homework.local_id) {
          hw.splice(i, 1);
        }
      }

      AsyncStorage.setItem('customHomeworks', JSON.stringify(hw));
      navigation.goBack();
    });
  };

  // add delete button in header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        homework.custom &&
        <TouchableOpacity
          style={[styles.deleteHw]}
          onPress={() => {
            setDeleteCustomHomeworkAlert(true);
          }}
        >
          <Trash size={20} color={'#eb4034'} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const changeHwState = () => {
    // if custom : true
    if (homework.custom) {
      AsyncStorage.getItem('customHomeworks').then((customHomeworks) => {
        let hw = [];
        if (customHomeworks) {
          hw = JSON.parse(customHomeworks);
        }

        // find the homework
        for (let i = 0; i < hw.length; i++) {
          if (hw[i].local_id === homework.local_id) {
            hw[i].done = !thisHwChecked;
          }
        }

        setThisHwChecked(!thisHwChecked);
        AsyncStorage.setItem('customHomeworks', JSON.stringify(hw));

        setTimeout(() => {
          setThisHwLoading(false);
        }, 100);
      });

      return;
    }

    appctx.dataprovider
      .changeHomeworkState(!thisHwChecked, homework.date, homework.local_id)
      .then((result) => {

        if (result.status === 'not found') {
          setTimeout(() => {
            setThisHwChecked(homework.done);
          }, 100);
        } else if (result.status === 'ok') {
          setThisHwChecked(!thisHwChecked);
          setThisHwLoading(false);

          if (appctx.dataprovider.service === 'Pronote') {
            AsyncStorage.getItem('homeworksCache').then((homeworksCache) => {
              // find the homework
              const cachedHomeworks = JSON.parse(homeworksCache);

              for (let i = 0; i < cachedHomeworks.length; i++) {
                for (let j = 0; j < cachedHomeworks[i].timetable.length; j++) {
                  if (
                    cachedHomeworks[i].timetable[j].local_id ===
                    homework.local_id
                  ) {
                    cachedHomeworks[i].timetable[j].done =
                      !cachedHomeworks[i].timetable[j].done;
                  }
                }
              }

              AsyncStorage.setItem(
                'homeworksCache',
                JSON.stringify(cachedHomeworks)
              );
            });
          }
        }

        // sync with devoirs page
        AsyncStorage.getItem('homeworksUpdate').then((homeworksUpdate) => {
          let updates = [];
          if (homeworksUpdate) {
            updates = JSON.parse(homeworksUpdate);
          }

          // if the homework is already in the list, remove it
          for (let i = 0; i < updates.length; i++) {
            if (updates[i].local_id === homework.local_id) {
              updates.splice(i, 1);
            }
          }

          updates.push({
            date: homework.date,
            local_id: homework.local_id,
            done: !thisHwChecked,
          });

          AsyncStorage.setItem('homeworksUpdate', JSON.stringify(updates));
        });
      });
  };

  // add checkbox in header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Devoir en ' + formatCoursName(homework.subject.name),
    });
  }, [navigation, homework]);

  const handleUrlPress = (url, matchIndex) => {
    openURL(url);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
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

      <View style={{ height: 6 }} />

      <NativeList header="Contenu du devoir" inset>
        <NativeItem>
          <ParsedText
            style={[styles.hwContentText, {color: UIColors.text}]}
            selectable={true}
            parse={
              [
                {
                  type: 'url',
                  style: [styles.url, {color: UIColors.primary}],
                  onPress: handleUrlPress
                },
                {
                  type: 'email',
                  style: [styles.url, {color: UIColors.primary}],
                },
              ]
            }
          >
            {homework.description}
          </ParsedText>
        </NativeItem>
      </NativeList>

      <View style={{ height: 6 }} />

      <NativeList inset header="Statut du devoir">
        <NativeItem
          leading={
            <CheckAnimated
              checked={thisHwChecked}
              loading={thisHwLoading}
              pressed={() => {
                setThisHwLoading(true);
                changeHwState();
              }}
            />
          }
          onPress={() => {
            setThisHwLoading(true);
            changeHwState();
          }}
        >
          <NativeText heading="b">
            Marquer comme fait
          </NativeText>
        </NativeItem>
        <NativeItem
          trailing={
            <NativeText heading="p2">
              {new Date(homework.date).toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' })}
            </NativeText>
          }
        >
          <NativeText numberOfLines={1}>
            A rendre pour le
          </NativeText>
        </NativeItem>
      </NativeList>

      <View style={{ height: 6 }} />

      { homework.files.length > 0 ? (
        <NativeList inset header="Fichiers">
          {homework.files.map((file, index) => {
            let fileIcon = <Link size={24} color={UIColors.text} />;
            if (file.type === 1) {
              fileIcon = <File size={24} color={UIColors.text} />;
            }

            return (
              <NativeItem
                key={index}
                onPress={() => {
                  openURL(file.url);
                }}
                leading={fileIcon}
              >
                <View style={{marginRight: 80, paddingLeft: 6}}>
                  <NativeText heading="h4">
                    {file.name}
                  </NativeText>
                  <NativeText numberOfLines={1}>
                    {file.url}
                  </NativeText>
                </View>
              </NativeItem>
            );

          })}
        </NativeList>
      ) : null }

      <AlertBottomSheet
        visible={deleteCustomHomeworkAlert}
        title="Supprimer le devoir"
        subtitle="Êtes-vous sûr de vouloir supprimer ce devoir ?"
        primaryButton='Supprimer'
        primaryAction={() => {deleteCustomHomework(); setDeleteCustomHomeworkAlert(false);}}
        cancelButton='Annuler'
        cancelAction={() => setDeleteCustomHomeworkAlert(false)}
        color='#D81313'
        icon={<Trash size={24} />}
      />

    </ScrollView>
  );
}

function HwCheckbox({ checked, theme, pressed, UIColors, loading }) {
  return !loading ? (
    <PressableScale
      style={[
        styles.checkContainer,
        { borderColor: theme.dark ? '#333333' : '#c5c5c5' },
        checked ? styles.checkChecked : null,
        checked
          ? { backgroundColor: UIColors.primary, borderColor: UIColors.primary }
          : null,
      ]}
      weight="light"
      activeScale={0.7}
      onPress={() => {
        pressed();
      }}
    >
      {checked ? <Check size={20} color="#ffffff" /> : null}
    </PressableScale>
  ) : (
    <ActivityIndicator size={26} />
  );
}

const styles = StyleSheet.create({
  optionsList: {
    marginTop: 16,
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
    paddingRight: 16,
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

  url: {
    textDecorationLine: 'underline',
  },

  deleteHw: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#eb403422',
    borderRadius: 12,
    borderCurve: 'continuous',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginRight: -2,
    gap: 4,
  },
});

export default HomeworkScreen;
