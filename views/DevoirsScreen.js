import * as React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Platform, Pressable, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import * as SystemUI from 'expo-system-ui';

import {getHomeworks, changeHomeworkState} from '../fetch/PronoteData/PronoteHomeworks';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {useState, useEffect, useRef} from 'react';

import { PressableScale, NativePressableScale } from 'react-native-pressable-scale';

import InfinitePager from 'react-native-infinite-pager'

import DateTimePicker from '@react-native-community/datetimepicker';

import formatCoursName from '../utils/FormatCoursName';
import getClosestColor from '../utils/ColorCoursName';

import UnstableItem from '../components/UnstableItem';

import * as WebBrowser from 'expo-web-browser';

import { Check, File, Link } from 'lucide-react-native';

const openURL = (url) => {
  WebBrowser.openBrowserAsync(url, {
    dismissButtonStyle: 'done',
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    controlsColor: '#29947A',
  });
};

const calcDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function DevoirsScreen({ navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // global date
  const [today, setToday] = useState(new Date());
  const [currentIndex, setCurrentIndex] = useState(0);

  // calendar date
  const [calendarDate, setCalendarDate] = useState(new Date());

  // homeworks 
  const [homeworks, setHomeworks] = useState({});

  const pagerRef = useRef(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <UnstableItem text="Instable" />
      ),
      headerRight: () => (
        Platform.OS === 'ios' ? (
          <DateTimePicker 
            value={calendarDate}
            locale='fr-FR'
            mode='date'
            display='compact'
            onChange={(event, date) => {
              setCalendarDate(date);
              setToday(date);

              pagerRef.current.setPage(0);

              if(currentIndex == 0) {
                setCurrentIndex(1);
                setTimeout(() => {
                  setCurrentIndex(0);
                }, 10);
              }
            }}
          />
        ) : null
      ),
    });
  }, [navigation, calendarDate, today, pagerRef]);

  const todayRef = useRef(today);
  const hwRef = useRef(homeworks);

  const handlePageChange = (page) => {
    const newDate = calcDate(todayRef.current, page);
    setCurrentIndex(page);
    setCalendarDate(newDate);

    if(!homeworks[calcDate(newDate, -2).toLocaleDateString()]) {
      getHomeworks(calcDate(newDate, -2)).then((result) => {
        setHomeworks((homeworks) => {
          homeworks[calcDate(newDate, -2).toLocaleDateString()] = result;
          return homeworks;
        });
      });
    }

    if(!homeworks[calcDate(newDate, -1).toLocaleDateString()]) {
      getHomeworks(calcDate(newDate, -1)).then((result) => {
        setHomeworks((homeworks) => {
          homeworks[calcDate(newDate, -1).toLocaleDateString()] = result;
          return homeworks;
        });
      });
    }

    if(!homeworks[calcDate(newDate, 0).toLocaleDateString()]) {
      getHomeworks(calcDate(newDate, 0)).then((result) => {
        setHomeworks((homeworks) => {
          homeworks[calcDate(newDate, 0).toLocaleDateString()] = result;
          return homeworks;
        });
      });
    }

    if(!homeworks[calcDate(newDate, 1).toLocaleDateString()]) {
      getHomeworks(calcDate(newDate, 1)).then((result) => {
        setHomeworks((homeworks) => {
          homeworks[calcDate(newDate, 1).toLocaleDateString()] = result;
          return homeworks;
        });
      });
    }

    if(!homeworks[calcDate(newDate, 2).toLocaleDateString()]) {
      getHomeworks(calcDate(newDate, 2)).then((result) => {
        setHomeworks((cours) => {
          homeworks[calcDate(newDate, 2).toLocaleDateString()] = result;
          return homeworks;
        });
      });
    }
  };

  const forceRefresh = () => {
    const newDate = calcDate(todayRef.current, 0);

    return getHomeworks(calcDate(newDate, 0)).then((result) => {
      setHomeworks((homeworks) => {
        homeworks[calcDate(newDate, 0).toLocaleDateString()] = result;
        return homeworks;
      });
    });
  }
    

  useEffect(() => {
    todayRef.current = today;
    hwRef.current = homeworks;
  }, [today]);

  return (
    <>
      <View contentInsetAdjustmentBehavior="automatic" style={[styles.container, {backgroundColor: theme.dark ? "#000000" : "#f2f2f7"}]}>
        <InfinitePager
          style={[styles.viewPager]}
          pageWrapperStyle={[styles.pageWrapper]}
          onPageChange={handlePageChange}
          ref={pagerRef}
          pageBuffer={4}
          renderPage={
            ({ index }) => (
              <>
                { homeworks[calcDate(today, index).toLocaleDateString()] ?
                  <Hwpage homeworks={homeworks[calcDate(today, index).toLocaleDateString()] || []} navigation={navigation} theme={theme} forceRefresh={forceRefresh} />
                : 
                  <View style={[styles.homeworksContainer]}>
                    <ActivityIndicator size="small" />
                  </View>
                }
              </>
            )
          }
        />
      </View>
    </>
  );
}

const Hwpage = ({ homeworks, navigation, theme, forceRefresh }) => {
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
      refreshControl={
        <RefreshControl refreshing={isHeadLoading} onRefresh={onRefresh} />
      }
    >
      { homeworks.length == 0 ? (
        <Text style={styles.noHomework}>Aucun devoir pour cette date.</Text>
      ) : null }

      <View style={styles.hwList}>
        { homeworks.map((homework, index) => (
          <Hwitem homework={homework} navigation={navigation} theme={theme} key={index} />
        )) }
      </View>
    </ScrollView>
  );
};

const HwCheckbox = ({ checked, theme, pressed }) => {
  return (
    <PressableScale style={[styles.checkContainer, {borderColor: theme.dark ? "#333333" : "#c5c5c5"}, checked ? styles.checkChecked : null]} weight="light" activeScale={0.7} onPress={pressed}>
      { checked ? (
        <Check size={20} color="#ffffff" />
      ) : null }
    </PressableScale>
  );
};

const Hwitem = ({ homework, navigation, theme }) => {
  const [thisHwChecked, setThisHwChecked] = useState(homework.done);

  const changeHwState = () => {
    console.log('change ' + homework.date + ' : ' + homework.id);
    changeHomeworkState(homework.date, homework.id).then((result) => {
      console.log(result);

      if (result.status == "not found") {
        setTimeout(() => {
          setThisHwChecked(homework.done);
        }, 100);
      }
    });
  };

  return (
    <PressableScale style={[styles.homeworkItemContainer, {backgroundColor: theme.dark ? "#191919" : "#ffffff"}]} >
      <View style={[styles.homeworkItem]}>
        <View style={[styles.checkboxContainer]}>
          <HwCheckbox checked={thisHwChecked} theme={theme} pressed={() => {
            setThisHwChecked(!thisHwChecked);
            changeHwState();
          }} />
        </View>
        <View style={[styles.hwItem]}>
          <View style={[styles.hwItemHeader]}>
            <View style={[styles.hwItemColor, {backgroundColor: getClosestColor(homework.background_color)}]}></View>
            <Text style={[styles.hwItemTitle, {color: theme.dark ? "#ffffff" : "#000000"}]}>{homework.subject.name}</Text>
          </View>
          <Text style={[styles.hwItemDescription, {color: theme.dark ? "#ffffff" : "#000000"}]}>{homework.description}</Text>
        </View>
      </View>

      { homework.files.length > 0 ? (
        <View style={[styles.homeworkFiles]}>
          { homework.files.map((file, index) => (
            <View style={[styles.homeworkFileContainer, {borderColor: theme.dark ? '#ffffff10' : '#00000010'}]} key={index}>
              <PressableScale style={[styles.homeworkFile]} weight="light" activeScale={0.9} onPress={() => openURL(file.url)}>
                { file.type == 0 ? (
                  <Link size={20} color={theme.dark ? "#ffffff" : "#000000"} />
                ) : (
                  <File size={20} color={theme.dark ? "#ffffff" : "#000000"} />
                ) }

                <View style={[styles.homeworkFileData]}>
                  <Text style={[styles.homeworkFileText]}>{file.name}</Text>
                  <Text numberOfLines={1} ellipsizeMode='tail' style={[styles.homeworkFileUrl]}>{file.url}</Text>
                </View>
              </PressableScale>
            </View>
          )) }
        </View>
      ) : null }
    </PressableScale>
  );
};

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

  checkboxContainer: {
    
  },
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