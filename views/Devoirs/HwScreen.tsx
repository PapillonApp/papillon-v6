import React, { useLayoutEffect, useState } from 'react';

import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Link, File, Trash } from 'lucide-react-native';

import * as WebBrowser from 'expo-web-browser';
import ParsedText from 'react-native-parsed-text';

import { Button as PaperButton, useTheme } from 'react-native-paper';
import { convert as convertHTML } from 'html-to-text';

import GetUIColors from '../../utils/GetUIColors';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import formatCoursName from '../../utils/FormatCoursName';
import { useAppContext } from '../../utils/AppContext';

import AlertBottomSheet from '../../interface/AlertBottomSheet';
import CheckAnimated from '../../interface/CheckAnimated';
import type { PapillonHomework } from '../../fetch/types/homework';
import { PronoteApiHomeworkDifficulty, PronoteApiHomeworkReturnType } from 'pawnote';
import { useAtom } from 'jotai';
import { homeworksAtom } from '../../atoms/homeworks';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

function HomeworkScreen({ route, navigation }: {
  navigation: any
  route: {
    params: {
      homeworkLocalID: string,
    }
  }
}) {
  const theme = useTheme();
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const { homeworkLocalID } = route.params;
  const [homeworks] = useAtom(homeworksAtom);
  const homework = homeworks!.find((hw) => hw.localID === homeworkLocalID) as PapillonHomework;

  const [homeworkStateLoading, setHomeworkStateLoading] = useState(false);
  const [homeworkRefreshLoading, setHomeworkRefreshLoading] = useState(false);

  const [deleteCustomHomeworkAlert, setDeleteCustomHomeworkAlert] = useState(false);

  const openURL = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'done',
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: UIColors.primary,
    });
  };

  const appContext = useAppContext();

  // TODO
  const deleteCustomHomework = () => {
    AsyncStorage.getItem('customHomeworks').then((customHomeworks) => {
      let hw = [];
      if (customHomeworks) {
        hw = JSON.parse(customHomeworks);
      }

      // find the homework
      for (let i = 0; i < hw.length; i++) {
        if (hw[i].localID === homework.localID) {
          hw.splice(i, 1);
        }
      }

      AsyncStorage.setItem('customHomeworks', JSON.stringify(hw));
      navigation.goBack();
    });
  };

  // add delete button in header
  useLayoutEffect(() => {
    navigation.setOptions({
      // TODO
      // headerRight: () => (
      //   homework.custom &&
      //   <TouchableOpacity
      //     style={[styles.deleteHw]}
      //     onPress={() => {
      //       setDeleteCustomHomeworkAlert(true);
      //     }}
      //   >
      //     <Trash size={20} color={'#eb4034'} />
      //   </TouchableOpacity>
      // ),
    });
  }, [navigation]);

  const changeHwState = async () => {
    // TODO: if custom : true
    // if (homework.custom) {
    //   AsyncStorage.getItem('customHomeworks').then((customHomeworks) => {
    //     let hw = [];
    //     if (customHomeworks) {
    //       hw = JSON.parse(customHomeworks);
    //     }

    //     // find the homework
    //     for (let i = 0; i < hw.length; i++) {
    //       if (hw[i].local_id === homework.local_id) {
    //         hw[i].done = !thisHwChecked;
    //       }
    //     }

    //     setThisHwChecked(!thisHwChecked);
    //     AsyncStorage.setItem('customHomeworks', JSON.stringify(hw));

    //     setTimeout(() => {
    //       setHomeworkStateLoading(false);
    //     }, 100);
    //   });

    //   return;
    // }

    await appContext.dataProvider?.changeHomeworkState(homework, !homework.done);
    setHomeworkStateLoading(false);
  };

  const onRefresh = async () => {
    console.log('should refresh hw', homework!.localID);
  };

  // add checkbox in header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Devoir en ' + formatCoursName(homework!.subject.name),
    });
  }, [navigation, homework]);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={homeworkRefreshLoading}
          onRefresh={onRefresh}
          tintColor={Platform.OS === 'android' ? UIColors.primary : ''}
        />
      }
      contentContainerStyle={{ display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'space-between'}}
      style={{ backgroundColor: UIColors.modalBackground }}
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

      <View>
        <View style={{ height: 6 }} />

        <NativeList header="Description" inset>
          <NativeItem>
            <ParsedText
              style={[styles.hwContentText, {color: UIColors.text}]}
              selectable={true}
              parse={
                [
                  {
                    type: 'url',
                    style: [styles.url, {color: UIColors.primary}],
                    onPress: (url) => openURL(url),
                  },
                  {
                    type: 'email',
                    style: [styles.url, {color: UIColors.primary}],
                  },
                ]
              }
            >
              {convertHTML(homework.description)}
            </ParsedText>
          </NativeItem>
          {homework.difficulty !== PronoteApiHomeworkDifficulty.NONE && (
            <NativeItem trailing={
              <NativeText heading="p2">
                {homework.difficulty === PronoteApiHomeworkDifficulty.EASY ? 'Facile' : 
                  homework.difficulty === PronoteApiHomeworkDifficulty.MEDIUM ? 'Moyen' : 'Difficile'}
              </NativeText>
            }>
              <NativeText numberOfLines={1}>
                Difficulté
              </NativeText>
            </NativeItem>
          )}
          {typeof homework.lengthInMinutes !== 'undefined' && homework.lengthInMinutes > 0 && (
            <NativeItem trailing={
              <NativeText heading="p2">
                {homework.lengthInMinutes.toString()} minute{homework.lengthInMinutes > 1 ? 's' : ''}
              </NativeText>
            }>
              <NativeText numberOfLines={1}>
                Temps estimé
              </NativeText>
            </NativeItem>
          )}
        </NativeList>

        <View style={{ height: 6 }} />

        <NativeList header="Statut" inset>
          {homework.return && homework.return.type === PronoteApiHomeworkReturnType.FILE_UPLOAD ? (
            <NativeItem>
              <PaperButton
                onPress={() => {
                  console.log('upload !');
                }}
              >
                Déposer ma copie
              </PaperButton>
            </NativeItem>
          ) : (
            <NativeItem
              leading={
                <CheckAnimated
                  backgroundColor={void 0}
                  checked={homework.done && !homeworkStateLoading}
                  loading={homeworkStateLoading}
                  pressed={() => {
                    setHomeworkStateLoading(true);
                    changeHwState();
                  }}
                />
              }
              onPress={() => {
                setHomeworkStateLoading(true);
                changeHwState();
              }}
            >
              <NativeText heading="b">
                Marquer comme fait
              </NativeText>
            </NativeItem>
          )}

          <NativeItem
            trailing={
              <NativeText heading="p2">
                {new Date(homework.date).toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' })}
              </NativeText>
            }
          >
            <NativeText numberOfLines={1}>
              À rendre pour le
            </NativeText>
          </NativeItem>

          {homework.return && homework.return.type === PronoteApiHomeworkReturnType.PAPER && (
            <NativeItem>
              <NativeText numberOfLines={1} heading="b">
                À rendre au format papier
              </NativeText>
            </NativeItem>
          )}
        </NativeList>

        {homework.themes.length > 0 && (
          <>
            <View style={{ height: 6 }} />

            <NativeList header="Thèmes" inset>
              {homework.themes.map((themeName, index) => (
                <NativeItem key={index}>
                  <NativeText heading="p">
                    {themeName}
                  </NativeText>
                </NativeItem>
              ))}
            </NativeList>
          </>
        )}

        {homework.attachments.length > 0 && (
          <>
            <View style={{ height: 6 }} />

            <NativeList header="Fichiers" inset>
              {homework.attachments.map((file, index) => {
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
          </>
        )}
      </View>

      <View style={{ display: 'flex', alignItems: 'center', paddingBottom: insets.bottom + 2 }}>
        <NativeText heading="p2" style={{ fontSize: 12, opacity: .35 }}>
          Dernière mise à jour du cache : {new Date(homework.cacheDateTimestamp).toLocaleString('fr-FR')}
        </NativeText>
      </View>

      <AlertBottomSheet
        visible={deleteCustomHomeworkAlert}
        title="Supprimer le devoir"
        subtitle="Êtes-vous sûr de vouloir supprimer ce devoir ?"
        primaryButton='Supprimer'
        // @ts-expect-error : AlertBottomSheet issue
        primaryAction={() => {
          deleteCustomHomework();
          setDeleteCustomHomeworkAlert(false);
        }}
        cancelButton='Annuler'
        cancelAction={() => setDeleteCustomHomeworkAlert(false)}
        color='#D81313'
        icon={<Trash size={24} />}
      />

    </ScrollView>
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
    fontWeight: '400',
    fontFamily: 'Papillon-Semibold',
  },
  homeworkFileUrl: {
    fontSize: 15,
    fontWeight: '400',
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
