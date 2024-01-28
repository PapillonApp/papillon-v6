import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

import {
  Animated,
  View,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
  SectionList,
  ScrollView
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import CheckAnimated from '../interface/CheckAnimated';

import { SFSymbol } from 'react-native-sfsymbols';
import PapillonInsetHeader from '../components/PapillonInsetHeader';

import { PressableScale } from 'react-native-pressable-scale';

import AsyncStorage from '@react-native-async-storage/async-storage';

import PapillonLoading from '../components/PapillonLoading';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import { convert as convertHTML } from 'html-to-text';

import {
  BookOpen,
  File,
  Check,
  Plus,
  ExternalLink
} from 'lucide-react-native';

import { getSavedCourseColor } from '../utils/ColorCoursName';

import GetUIColors from '../utils/GetUIColors';

import { useAppContext } from '../utils/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NativeText from '../components/NativeText';

import * as WebBrowser from 'expo-web-browser';
import type { PapillonHomework } from '../fetch/types/homework';
import { BlurView } from 'expo-blur';

function DevoirsScreen({ navigation }: {
  navigation: any
}) {
  const insets = useSafeAreaInsets();
  const UIColors = GetUIColors();
  const theme = useTheme();

  const [browserOpen, setBrowserOpen] = useState(false);

  const yOffset = new Animated.Value(0);


  const headerOpacity = yOffset.interpolate({
    inputRange: [-75, -60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const scrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: yOffset } } }],
    { useNativeDriver: false }
  );

  const openURL = async (url: string) => {
    if (Platform.OS === 'ios') {
      setBrowserOpen(true);
    }

    await WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'done',
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: UIColors.primary,
    });

    setBrowserOpen(false);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: Platform.OS === 'ios' ? () => (
        <PapillonInsetHeader
          icon={<SFSymbol name="checkmark.rectangle.stack.fill" />}
          title="Devoirs"
          color="#29947A"
        />
      ) : 'Devoirs',
    });
  }, [navigation, UIColors]);

  const loadCustomHomeworks = async () => {
    return; // TODO
    AsyncStorage.getItem('customHomeworks').then((customHomeworks) => {
      let hw = [];
      if (customHomeworks) {
        hw = JSON.parse(customHomeworks);
      }

      let newCustomHomeworks = {};

      for (let i = 0; i < hw.length; i++) {
        const hwPageDate = calcDate(new Date(hw[i].date), 0);
        const usedDate = hwPageDate.toLocaleDateString();

        // if (!newCustomHomeworks[usedDate]) {
        //   newCustomHomeworks[usedDate] = [];
        // }

        // newCustomHomeworks[usedDate].push(hw[i]);
      }

      setCustomHomeworks(newCustomHomeworks);
    });
  };

  const appContext = useAppContext();
  
  type HomeworkItem = { title: string, data: PapillonHomework[] }
  
  const [isFirstLoading, setFirstLoading] = useState(true);
  const [isHeadLoading, setHeadLoading] = useState(false);
  const [homeworks, setHomeworks] = useState<Array<HomeworkItem>>([]);

  const retrieveHomeworkItems = async (date: Date, force = false): Promise<Array<HomeworkItem>> => {
    const homeworks = await appContext.dataProvider?.getHomeworks(date, force);
    if (!homeworks) return [];

    // Sort the results by date.
    homeworks.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    let items: Record<string, PapillonHomework[]> = {};

    for (const homework of homeworks) {
      const key = new Date(homework.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });

      if (!(key in items)) {
        items[key] = [homework];
      } else items[key].push(homework);
    }

    return Object.entries(items).map(([title, data]) => ({ title, data }));
  };

  const onRefresh = React.useCallback(() => {
    setHeadLoading(true);

    (async () => {
      const homeworks = await retrieveHomeworkItems(new Date());
      setHomeworks(homeworks);
      setHeadLoading(false);
    })();
  }, []);

  // Load initial homeworks on first render.
  useEffect(() => {
    (async () => {
      const homeworks = await retrieveHomeworkItems(new Date());
      setHomeworks(homeworks);
      setFirstLoading(false);
    })();
  }, []);

  return (
    <View
      style={{
        backgroundColor: UIColors.backgroundHigh,
        flex: 1,
      }}
    >
      <SectionList
        sections={homeworks}
        getItem={(data, index) => data[index]}
        getItemCount={data => data.length}
        keyExtractor={(item: PapillonHomework) => item.id}
        contentInsetAdjustmentBehavior='automatic'
        initialNumToRender={15}
        refreshing={isHeadLoading}
        refreshControl={
          <RefreshControl
            refreshing={isHeadLoading}
            onRefresh={onRefresh}
            tintColor={Platform.OS === 'android' ? UIColors.primary : ''}
          />
        }
        renderItem={({ item, index }) =>  (
          <Hwitem
            key={index}
            homework={item}
            navigation={navigation}
            openURL={openURL}
          />
        )}
        stickySectionHeadersEnabled={true}
        renderSectionHeader={({ section: { title } }) => (
          <View
            style={{
              marginBottom: -16,
              paddingHorizontal: 15,
              paddingVertical: 16,
            }}
          >
            <View style={{
              backgroundColor: UIColors.text + '22',
              alignSelf: 'flex-start',
              borderRadius: 10,
              borderCurve: 'continuous',
              overflow: 'hidden',
            }}>
              <BlurView
                intensity={50}
                tint={theme.dark ? 'dark' : 'light'}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                }}
              >
                <Text style={{fontSize: 15, fontFamily: 'Papillon-Semibold'}}>
                  {title}
                </Text>
              </BlurView>
            </View>
          </View>
        )}
      />
      {Platform.OS === 'ios' &&  (
        <PressableScale
          style={[styles.addCoursefab, {backgroundColor: UIColors.primary}]}
          weight="light"
          activeScale={0.87}
          onPress={() => {
            navigation.navigate('CreateHomework', {
              date: calendarDate,
            });
          }}
        >
          <Plus color='#ffffff' />
        </PressableScale>
      )}
    </View>
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

function Hwitem({ homework, openURL, navigation }: {
  homework: PapillonHomework,
  openURL: (url: string) => void
  navigation: any
}) {
  const [thisHwChecked, setThisHwChecked] = useState(homework.done);
  const [thisHwLoading, setThisHwLoading] = useState(false);

  useEffect(() => {
    setThisHwChecked(homework.done);
  }, [homework]);

  const appctx = useAppContext();

  const changeHwState = () => {
    return; // TODO
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

          AsyncStorage.getItem('homeworksCache').then((homeworksCache) => {
            // find the homework
            const cachedHomeworks = JSON.parse(homeworksCache);

            for (let i = 0; i < cachedHomeworks?.length; i++) {
              for (let j = 0; j < cachedHomeworks[i].timetable?.length; j++) {
                if (
                  cachedHomeworks[i].timetable[j].local_id === homework.local_id
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

          // sync with home page
          AsyncStorage.setItem('homeUpdated', 'true');

          // get homework.date as 2023-01-01
          const date = new Date(homework.date);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();

          // if tomorrow, update badge
          let tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);

          let checked = thisHwChecked;

          // if this homework is for tomorrow
          if (new Date(homework.date).getDate() === tomorrow.getDate()) {
            AsyncStorage.getItem('badgesStorage').then((value) => {
              let currentSyncBadges = JSON.parse(value);

              if (currentSyncBadges === null) {
                currentSyncBadges = {
                  homeworks: 0,
                };
              }

              let newBadges = currentSyncBadges;
              newBadges.homeworks = checked ? newBadges.homeworks + 1 : newBadges.homeworks - 1;

              AsyncStorage.setItem('badgesStorage', JSON.stringify(newBadges));
            });
          }
        }
      });
  };

  const UIColors = GetUIColors();

  // animation
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  // animate modal when visible changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  if (!homework) return;
  return (
    <Animated.View
      style={[{
        opacity,
        transform: [
          {
            translateY: translateY.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
          {
            scale: scale.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
        ],
      }]}
    >
      <NativeList
        inset
        style={
          Platform.OS === 'ios' ? {
            marginBottom: -20,
          } : void 0
        }
      >
        <NativeItem
          leading={
            <CheckAnimated
              backgroundColor={void 0}
              checked={thisHwChecked}
              loading={thisHwLoading}
              pressed={() => {
                // TODO
                // setThisHwLoading(true);
                // changeHwState();
              }}
            />
          }
          onPress={() => {
            navigation.navigate('Devoir', { homework: {
              ...homework,
              done: thisHwChecked,
            } });
          }}
        >
          <View style={styles.hwItemHeader}>
            <View
              style={[
                styles.hwItemColor,
                { backgroundColor: getSavedCourseColor(homework.subject.name, homework.background_color) },
              ]}
            />
            <NativeText numberOfLines={1} heading="subtitle1" style={{fontSize: 14, paddingRight: 10}}>
              {homework.subject.name.toUpperCase()}
            </NativeText>
          </View>
          <NativeText>
            {convertHTML(homework.description.replace('\n', ' '), { wordwrap: 130 })}
          </NativeText>
        </NativeItem>

        {homework.attachments.map((file, index) => (
          <NativeItem
            key={index}
            leading={
              file.type === 0 ? (
                <ExternalLink size={20} color={UIColors.text} />
              )
                : (
                  <File size={20} color={UIColors.text} />
                )
            }
            onPress={() => {
              openURL(file.url);
            }}
          >
            <NativeText heading="h4">
              {file.name}
            </NativeText>
            <NativeText heading="p2" numberOfLines={1}>
              {file.url}
            </NativeText>
          </NativeItem>
        ))}
      </NativeList>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewPager: {
    flex: 1,
  },
  pageWrapper: {
    flex: 1,
  },

  calendarModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#00000099',
    paddingHorizontal: 12,
  },

  calendarModalViewContainer: {
    borderRadius: 16,
    borderCurve: 'continuous',
    overflow: 'hidden',

    width: '100%',
  },

  modalCloseButton: {
    width: 40,
    height: 40,

    justifyContent: 'center',
    alignItems: 'center',

    alignSelf: 'flex-end',

    backgroundColor: '#ffffff39',
    borderRadius: 12,
    borderCurve: 'continuous',
    marginTop: -40,
    marginBottom: 10,
  },

  calendarDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    opacity: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderCurve: 'continuous',
  },

  calendarDateText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Papillon-Medium',
  },

  modalTipOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    marginHorizontal: 16,
  },
  modalTipContainer: {
    flex: 1,
    borderRadius: 12,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  modalTip: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#ffffff12',
    borderRadius: 12,
    borderCurve: 'continuous',
    borderColor: '#ffffff12',
    borderWidth: 1,
  },

  modalTipData: {
    flex: 1,
    paddingRight: 16,
  },

  homeworksContainer: {
    flex: 1,
  },

  hwList: {
    gap: 12,
  },

  homeworkItemContainer: {
    borderRadius: 12,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },

  homeworkItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 16,

    flexDirection: 'row',
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

  hwItem: {
    gap: 4,
    flex: 1,
  },

  hwItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  hwItemColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderCurve: 'continuous',
  },

  hwItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Papillon-Semibold',
    opacity: 0.4,
    letterSpacing: 0.7,
  },

  hwItemDescription: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'Papillon-Medium',
  },

  homeworkFileContainer: {
    borderTopWidth: 1,
  },
  homeworkFile: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
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

  noHomework: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 12,
  },

  calendarModalView: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    paddingBottom: 18,

    width: '100%',
    
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },

  addCoursefab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderCurve: 'continuous',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    zIndex: 100,
  },
});

export default DevoirsScreen;
