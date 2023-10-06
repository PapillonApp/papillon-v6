import * as React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { useFocusEffect } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { ScrollView } from 'react-native-gesture-handler';

import { useState, useEffect, useRef } from 'react';

import { PressableScale } from 'react-native-pressable-scale';

import InfinitePager from 'react-native-infinite-pager';

import DateTimePicker from '@react-native-community/datetimepicker';

import * as WebBrowser from 'expo-web-browser';
import { Calendar, Check, File, Link } from 'lucide-react-native';
import { getSavedCourseColor } from '../utils/ColorCoursName';

import GetUIColors from '../utils/GetUIColors';
import { useAppContext } from '../utils/AppContext';

const calcDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

function DevoirsScreen({ navigation }) {
  const theme = useTheme();
  const pagerRef = useRef(null);

  const [today, setToday] = useState(new Date());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [calendarDate, setCalendarDate] = useState(today);
  const [homeworks, setHomeworks] = useState({});
  const todayRef = useRef(today);
  const hwRef = useRef(homeworks);

  const [browserOpen, setBrowserOpen] = useState(false);

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

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
          console.log('homeworks updated');
          forceRefresh();

          AsyncStorage.setItem('homeworksUpdated', 'false');
        }
      });
    }, [navigation])
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        Platform.OS === 'ios' ? (
          <DateTimePicker
            value={calendarDate}
            locale="fr_FR"
            mode="date"
            display="compact"
            onChange={(event, date) => {
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
        ) : (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginRight: 2,
            }}
            onPress={() => setCalendarModalOpen(true)}
          >
            <Calendar size={20} color={UIColors.text} />
            <Text style={{ fontSize: 15, fontFamily: 'Papillon-Medium' }}>
              {new Date(calendarDate).toLocaleDateString('fr', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
              })}
            </Text>
          </TouchableOpacity>
        ),
    });
  }, [navigation, calendarDate]);

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
        style={[styles.container, { backgroundColor: UIColors.background }]}
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
                <ActivityIndicator size="small" />
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
      {homeworks?.length === 0 ? (
        <Text style={styles.noHomework}>Aucun devoir pour cette date.</Text>
      ) : null}

      <View style={styles.hwList}>
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
    console.log(`change ${homework.date} : ${homework.local_id}`);
    appctx.dataprovider
      .changeHomeworkState(!thisHwChecked, homework.date, homework.local_id)
      .then((result) => {
        console.log(result);

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
          // eslint-disable-next-line no-unused-vars
          const year = date.getFullYear();
          // eslint-disable-next-line no-unused-vars
          const month = date.getMonth() + 1;
          // eslint-disable-next-line no-unused-vars
          const day = date.getDate();
        }
      });
  };

  const UIColors = GetUIColors();

  if (!homework) return;
  return (
    <PressableScale
      style={[
        styles.homeworkItemContainer,
        { backgroundColor: UIColors.elementHigh },
      ]}
      onPress={() => {
        navigation.navigate('Devoir', {
          homework: {
            ...homework,
            done: thisHwChecked,
          },
        });
      }}
    >
      <View style={[styles.homeworkItem]}>
        <View style={[styles.checkboxContainer]}>
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
        </View>
        <View style={[styles.hwItem]}>
          <View style={[styles.hwItemHeader]}>
            <View
              style={[
                styles.hwItemColor,
                {
                  backgroundColor: getSavedCourseColor(
                    homework.subject?.name,
                    homework.background_color
                  ),
                },
              ]}
            />
            <Text
              style={[
                styles.hwItemTitle,
                { color: theme.dark ? '#ffffff' : '#000000' },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {homework.subject?.name.toUpperCase()}
            </Text>
          </View>
          <Text
            style={[
              styles.hwItemDescription,
              { color: theme.dark ? '#ffffff' : '#000000' },
            ]}
          >
            {homework.description}
          </Text>
        </View>
      </View>

      {homework.files?.length > 0 ? (
        <View style={[styles.homeworkFiles]}>
          {homework.files.map((file, index) => (
            <View
              style={[
                styles.homeworkFileContainer,
                { borderColor: theme.dark ? '#ffffff10' : '#00000010' },
              ]}
              key={index}
            >
              <PressableScale
                style={[styles.homeworkFile]}
                weight="light"
                activeScale={0.9}
                onPress={() => openURL(file.url)}
              >
                {file.type === 0 ? (
                  <Link size={20} color={theme.dark ? '#ffffff' : '#000000'} />
                ) : (
                  <File size={20} color={theme.dark ? '#ffffff' : '#000000'} />
                )}

                <View style={[styles.homeworkFileData]}>
                  <Text style={[styles.homeworkFileText]}>{file?.name}</Text>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[styles.homeworkFileUrl]}
                  >
                    {file.url}
                  </Text>
                </View>
              </PressableScale>
            </View>
          ))}
        </View>
      ) : null}
    </PressableScale>
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

  homeworksContainer: {
    flex: 1,
    padding: 12,
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
});

export default DevoirsScreen;
