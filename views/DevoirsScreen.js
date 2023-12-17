import * as React from 'react';
import {
  Animated,
  Pressable,
  Modal,
  View,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { SFSymbol } from 'react-native-sfsymbols';
import PapillonInsetHeader from '../components/PapillonInsetHeader';

import { CalendarFill, Calendar as CalendarPapillonIcon } from '../interface/icons/PapillonIcons';

import { useFocusEffect } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { ScrollView } from 'react-native-gesture-handler';

import { useState, useEffect, useRef } from 'react';

import { PressableScale } from 'react-native-pressable-scale';

import InfinitePager from 'react-native-infinite-pager';

import DateTimePicker from '@react-native-community/datetimepicker';

import FormatCoursName from '../utils/FormatCoursName';

import PapillonLoading from '../components/PapillonLoading';

import * as WebBrowser from 'expo-web-browser';
import { Calendar, Check, File, AlertCircle, Link, BookOpen } from 'lucide-react-native';
import getClosestColor from '../utils/ColorCoursName';
import { getClosestCourseColor, getSavedCourseColor } from '../utils/ColorCoursName';

import { X } from 'lucide-react-native';

import GetUIColors from '../utils/GetUIColors';
import { useAppContext } from '../utils/AppContext';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const calcDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

function DevoirsScreen({ navigation }) {
  const theme = useTheme();
  const pagerRef = useRef(null);
  const insets = useSafeAreaInsets();

  const [today, setToday] = useState(new Date());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [calendarDate, setCalendarDate] = useState(today);
  const [homeworks, setHomeworks] = useState({});
  const todayRef = useRef(today);
  const hwRef = useRef(homeworks);

  const [browserOpen, setBrowserOpen] = useState(false);

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  // animate calendar modal
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  // animate modal when visible changes
  useEffect(() => {
    if (calendarModalOpen) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [calendarModalOpen]);

  const openURL = async (url) => {
    if (Platform.OS === 'ios') {
      setBrowserOpen(true);
    }

    await WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'done',
      presentationStyle: 'pageSheet',
      controlsColor: UIColors.primary,
    });

    setBrowserOpen(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem('homeworksUpdated').then((value) => {
        if (value === 'true') {
          forceRefresh();

          AsyncStorage.setItem('homeworksUpdated', 'false');
        }
      });
    }, [navigation])
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: Platform.OS === 'ios' ? () => (
        <PapillonInsetHeader
          icon={<SFSymbol name="checkmark.rectangle.stack.fill" />}
          title="Devoirs"
          color="#29947A"
        />
      ) : 'Devoirs',
      headerShadowVisible: Platform.OS !== 'ios',
      headerTransparent: Platform.OS === 'ios',
      headerRight: () =>
        <TouchableOpacity
          style={[
            styles.calendarDateContainer,
            {
              backgroundColor: "#29947A" + "20",
            }
          ]}
          onPress={() => setCalendarModalOpen(true)}
        >
          <CalendarPapillonIcon stroke={"#29947A"} />
          <Text style={[styles.calendarDateText, {color: "#29947A"}]}>
            {new Date(calendarDate).toLocaleDateString('fr', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
            })}
          </Text>
        </TouchableOpacity>
      ,
    });
  }, [navigation, calendarDate, UIColors]);

  const appctx = useAppContext();

  const updateHomeworksForDate = async (dateOffset, setDate) => {
    const newDate = calcDate(setDate, dateOffset);
    if (!hwRef.current[newDate.toLocaleDateString()]) {
      const result = await appctx.dataprovider.getHomeworks(newDate);
      setHomeworks((prevHomeworks) => ({
        ...prevHomeworks,
        [newDate.toLocaleDateString()]: result,
      }));
    }
  };

  const handlePageChange = (page) => {
    const newDate = calcDate(calendarDate, page);
    setCurrentIndex(page);
    setCalendarDate(newDate);

    for (let i = -1; i <= 1; i++) {
      updateHomeworksForDate(i, newDate);
    }
  };

  const forceRefresh = async () => {
    const newDate = calcDate(calendarDate, 0);
    const result = await appctx.dataprovider.getHomeworks(newDate, true);

    const oldHws = homeworks;
    oldHws[newDate.toLocaleDateString()] = result;

    setHomeworks({});
    setTimeout(() => {
      setHomeworks(oldHws);
    }, 200);
  };

  useEffect(() => {
    todayRef.current = today;
    hwRef.current = homeworks;
  }, [today, homeworks]);

  useEffect(() => {
    for (let i = -2; i <= 2; i++) {
      updateHomeworksForDate(i);
    }
  }, []);

  const UIColors = GetUIColors();

  return (
    <>
      {browserOpen ? (
        <StatusBar barStyle="light-content" animated />
      ) : (
        <StatusBar
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
      )}

      <View
        contentInsetAdjustmentBehavior="automatic"
        style={[styles.container, { backgroundColor: UIColors.backgroundHigh, paddingTop: Platform.OS === 'ios' ? insets.top + 44 : 0 }]}
      >
        {Platform.OS === 'android' && calendarModalOpen ? (
          <DateTimePicker
            value={calendarDate}
            locale="fr-FR"
            mode="date"
            display="calendar"
            onChange={(event, date) => {
              if (event.type === 'dismissed') {
                setCalendarModalOpen(false);
                return;
              }

              setCalendarModalOpen(false);

              setCalendarDate(date);
              setToday(date);
              pagerRef.current.setPage(0);
              if (currentIndex === 0) {
                setCurrentIndex(1);
                setTimeout(() => {
                  setCurrentIndex(0);
                }, 10);
              }
            }}
          />
        ) : null}

      {Platform.OS === 'ios' && calendarModalOpen ? (
        <Modal
          transparent={true}
          animationType='fade'
        >
          <Animated.View
            style={[
              styles.calendarModalContainer,
              {paddingBottom: insets.bottom + 6},
              {
                opacity
              },
            ]}
          >
            <Animated.View
              style={[
                {opacity}
              ]}
            >
              <Pressable style={{flex: 1, width:'100%'}} onPress={() => setCalendarModalOpen(false)} />
            </Animated.View>

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setCalendarModalOpen(false)}>
                <X size={24} color={"#ffffff"} style={styles.modalCloseIcon}/>
            </TouchableOpacity>

            <Animated.View 
              style={[
                styles.calendarModalView,
                {backgroundColor: UIColors.element},
                {
                  opacity,
                  transform: [
                    {
                      translateY: translateY.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0],
                      }),
                    },
                    {
                      scale: scale.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <DateTimePicker
                value={calendarDate}
                locale="fr-FR"
                mode="date"
                display="inline"
                onChange={(event, date) => {
                  if (event.type === 'dismissed') {
                    setCalendarModalOpen(false);
                    return;
                  }

                  setCalendarModalOpen(false);

                  setCalendarDate(date);
                  setToday(date);
                  pagerRef.current.setPage(0);
                  if (currentIndex === 0) {
                    setCurrentIndex(1);
                    setTimeout(() => {
                      setCurrentIndex(0);
                    }, 10);
                  }
                }}
              />
            </Animated.View>
          </Animated.View>
        </Modal>
      ) : null}

        <InfinitePager
          style={[styles.viewPager]}
          pageWrapperStyle={[styles.pageWrapper]}
          onPageChange={handlePageChange}
          ref={pagerRef}
          pageBuffer={4}
          renderPage={({ index }) =>
            homeworks[calcDate(today, index).toLocaleDateString()] ? (
              <Hwpage
                homeworks={
                  homeworks[calcDate(today, index).toLocaleDateString()] || []
                }
                navigation={navigation}
                theme={theme}
                forceRefresh={forceRefresh}
                openURL={openURL}
                UIColors={UIColors}
              />
            ) : (
              <View style={[styles.homeworksContainer]}>
                <PapillonLoading
                  title="Chargement des devoirs..."
                  subtitle="Obtention des derniers devoirs en cours"
                  style={{ marginTop: 32 }}
                />
              </View>
            )
          }
        />
      </View>
    </>
  );
}

function Hwpage({
  homeworks,
  navigation,
  theme,
  forceRefresh,
  openURL,
  UIColors,
}) {
  const [isHeadLoading, setIsHeadLoading] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsHeadLoading(true);

    forceRefresh().then(() => {
      setIsHeadLoading(false);
    });
  }, []);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.homeworksContainer]}
      nestedScrollEnabled
      refreshControl={
        <RefreshControl
          refreshing={isHeadLoading}
          onRefresh={onRefresh}
          colors={[Platform.OS === 'android' ? UIColors.primary : null]}
        />
      }
    >
      {homeworks.length === 0 ? (
        <PapillonLoading
          icon={<BookOpen size={26} color={UIColors.text} />}
          title="Aucun devoir"
          subtitle="Aucun devoir n'est disponible pour cette date"
          style={{ marginTop: 48 }}
        />
      ) : null}

      <View>
        {homeworks.map((homework, index) => (
          <Hwitem
            homework={homework}
            navigation={navigation}
            theme={theme}
            key={index}
            openURL={openURL}
          />
        ))}
      </View>

      <View style={{ height: 24 }} />
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

function Hwitem({ homework, theme, openURL, navigation }) {
  const [thisHwChecked, setThisHwChecked] = useState(homework.done);
  const [thisHwLoading, setThisHwLoading] = useState(false);

  useEffect(() => {
    setThisHwChecked(homework.done);
  }, [homework]);

  const appctx = useAppContext();

  const changeHwState = () => {
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

  if (!homework) return;
  return (
    <NativeList
      inset
      style={
        Platform.OS === 'ios' && {
        marginBottom: -20,
      }}
    >
      <NativeItem
        leading={
          <HwCheckbox
              checked={thisHwChecked}
              theme={theme}
              UIColors={UIColors}
              loading={thisHwLoading}
              pressed={() => {
                setThisHwLoading(true);
                changeHwState();
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
        <View style={[styles.hwItemHeader]}>
          <View
            style={[
              styles.hwItemColor,
              { backgroundColor: getSavedCourseColor(homework.subject.name, homework.background_color) },
            ]}
          />
          <NativeText heading="subtitle1" style={{fontSize: 14}}>
            {homework.subject.name.toUpperCase()}
          </NativeText>
        </View>
        <NativeText>
          {homework.description}
        </NativeText>
      </NativeItem>

      {homework.files.map((file, index) => (
        <NativeItem
          key={index}
          leading={
            <File size={20} color={UIColors.text} style={{marginHorizontal: 3}} />
          }
          onPress={() => {
            openURL(file.url);
          }}
          chevron
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
  )
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
    fontWeight: 600,
    fontFamily: 'Papillon-Semibold',
    opacity: 0.4,
    letterSpacing: 0.7,
  },

  hwItemDescription: {
    fontSize: 17,
    fontWeight: 400,
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
    fontWeight: 400,
    fontFamily: 'Papillon-Semibold',
  },
  homeworkFileUrl: {
    fontSize: 15,
    fontWeight: 400,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },

  noHomework: {
    fontSize: 17,
    fontWeight: 400,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 12,
  },

  calendarModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#00000099',
    paddingHorizontal: 12,
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
    fontWeight: 500,
    fontFamily: 'Papillon-Medium',
  },
});

export default DevoirsScreen;
