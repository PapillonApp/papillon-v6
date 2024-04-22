import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';

import {
  Animated,
  View,
  StyleSheet,
  StatusBar,
  Platform,
  RefreshControl,
  SectionList,
  ActivityIndicator,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import CheckAnimated from '../interface/CheckAnimated';

import { SFSymbol } from 'react-native-sfsymbols';
import PapillonInsetHeader from '../components/PapillonInsetHeader';

import { PressableScale } from 'react-native-pressable-scale';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import { convert as convertHTML } from 'html-to-text';

import {
  File,
  Plus,
  ExternalLink,
  FileUp
} from 'lucide-react-native';

import { getSavedCourseColor } from '../utils/cours/ColorCoursName';

import GetUIColors from '../utils/GetUIColors';

import { useAppContext } from '../utils/AppContext';
import NativeText from '../components/NativeText';

import {PronoteApiHomeworkReturnType } from 'pawnote';

import * as WebBrowser from 'expo-web-browser';
import type { PapillonHomework } from '../fetch/types/homework';
import { BlurView } from 'expo-blur';

// Atoms
import { atom, useAtom } from 'jotai';
import { homeworksAtom } from '../atoms/homeworks';

import AsyncStorage from '@react-native-async-storage/async-storage';

const dateFromAtom = atom(new Date());
const homeworksUntilDateAtom = atom((get) => {
  const date = get(dateFromAtom);
  date.setHours(0, 0, 0, 0);
  const dateTimestamp = date.getTime();

  const homeworks = get(homeworksAtom);
  if (homeworks === null) return null;

  return homeworks.filter((homework) => {
    const homeworkDate = new Date(homework.date);
    homeworkDate.setHours(0, 0, 0, 0);
  
    return homeworkDate.getTime() >= dateTimestamp;
  });
});

function DevoirsScreen({ navigation }: {
  navigation: any
}) {
  const UIColors = GetUIColors();
  const theme = useTheme();

  const [urlOpened, setUrlOpened] = useState<boolean>(false);

  const openURL = async (url: string) => {
    setUrlOpened(true);
    await WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'done',
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: UIColors.primary,
    });
    setUrlOpened(false);
  };

  const [loading, setLoading] = useState(false);
  const [isHeadLoading, setHeadLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Travail à faire',
      headerRight: () => (loading &&
        <ActivityIndicator
          style={{marginRight: 16}}
        />
      ),
    });
  }, [navigation, UIColors, loading]);

  const appContext = useAppContext();
  
  type HomeworkItem = { title: string, data: PapillonHomework[] }
  
  const [fromDate, setFromDate] = useAtom(dateFromAtom);
  const [totalHomeworks, setTotalHomeworks] = useAtom(homeworksAtom);
  const [groupedHomeworks] = useAtom<HomeworkItem[] | null>(
    useMemo(
      () => atom((get) => {
        let homeworks = get(homeworksUntilDateAtom);
        if (homeworks === null) return null;

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
      }),
      []
    )
  );

  const fetchHomeworks = async (date: Date, force = false): Promise<void> => {
    setFromDate(date);
    if (totalHomeworks === null || force) {
      appContext.dataProvider?.getHomeworks(force).then((hws) => {
        const homeworks = hws ?? [];
        setTotalHomeworks(homeworks ?? []);
        setLoading(false);
        setHeadLoading(false);
      });
    }
  };

  const onRefresh = React.useCallback(() => {
    setHeadLoading(true);

    (async () => {
      await fetchHomeworks(new Date(), true);
    })();
  }, []);

  // Load initial homeworks on first render.
  useEffect(() => {
    (async () => {
      // setLoading(true);
      await fetchHomeworks(new Date());
    })();
  }, []);

  return (
    <View
      style={{
        backgroundColor: UIColors.backgroundHigh,
        flex: 1,
      }}
    >
      {(urlOpened && Platform.OS === 'ios') ? (
        <StatusBar animated barStyle='light-content'/>
      ) : (
        <StatusBar
          animated
          translucent
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={'transparent'}
        />
      )}

      {groupedHomeworks !== null ? (
        <>
          <SectionList
            sections={groupedHomeworks}
            getItem={(data, index) => data[index]}
            getItemCount={data => data.length}
            keyExtractor={(item: PapillonHomework) => item.localID}
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
            stickySectionHeadersEnabled={Platform.OS === 'ios'}
            renderSectionFooter={() => (
              <View style={{height: 5}} />
            )}
            renderSectionHeader={({ section: { title } }) => (
              Platform.OS === 'ios' ? (
                <View
                  style={{
                    marginBottom: -16,
                    paddingHorizontal: 15,
                    paddingVertical: 16,
                  }}
                >
                  <View style={{
                    backgroundColor: UIColors.text + '20',
                    alignSelf: 'flex-start',
                    borderRadius: 10,
                    borderCurve: 'continuous',
                    overflow: 'hidden',
                  }}>
                    <BlurView
                      intensity={50}
                      tint={theme.dark ? 'dark' : 'light'}
                      style={{
                        paddingHorizontal: 15,
                        paddingVertical: 7,
                      }}
                    >
                      <Text style={{fontSize: 15, fontFamily: 'Papillon-Semibold'}}>
                        {title}
                      </Text>
                    </BlurView>
                  </View>
                </View>
              ) : (
                <View style={{
                  paddingHorizontal: 15,
                  paddingVertical: 16,
                }}>
                  <Text style={{fontSize: 14, fontWeight: 'bold', letterSpacing: 0.7, textTransform: 'uppercase', opacity: 0.6}}>
                    {title}
                  </Text>
                </View>
              )
            )}
            ListFooterComponent={() => (
              <View style={{
                height: Platform.OS === 'ios' ? 20 + 65 : 16
              }} />
            )}
          />
  
          {Platform.OS === 'ios' &&  (
            <PressableScale
              style={[styles.addCoursefab, {backgroundColor: UIColors.primary}]}
              weight="light"
              activeScale={0.87}
              onPress={() => {
                navigation.navigate('CreateHomework');
              }}
            >
              <Plus color='#ffffff' />
            </PressableScale>
          )}
        </>
      ) : (
        <NativeText heading="h4" style={styles.noHomework}>
          Chargement des devoirs...
        </NativeText>
      )}
    </View>
  );
}

function Hwitem({ homework, openURL, navigation }: {
  homework: PapillonHomework,
  openURL: (url: string) => void
  navigation: any
}) {
  const [checkStateLoading, setCheckStateLoading] = useState(false);

  const appContext = useAppContext();

  const handleStateChange = async () => {
    setCheckStateLoading(true);
    
    await appContext.dataProvider?.changeHomeworkState(homework, !homework.done);
    setCheckStateLoading(false);
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
        style={
          Platform.OS === 'ios' ? {
            marginBottom: -20,
          } : void 0
        }
        inset={Platform.OS === 'ios'}
      >
        <NativeItem
          leading={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CheckAnimated
                backgroundColor={void 0}
                checked={homework.done && !checkStateLoading}
                loading={checkStateLoading}
                pressed={handleStateChange}
              />
            </View>
          }
          trailing={
            homework.return && homework.return.type == PronoteApiHomeworkReturnType.FILE_UPLOAD && (
              <FileUp size={20} color="grey" />
            )
          }
          onPress={() => {
            navigation.navigate('Devoir', { homeworkLocalID: homework.localID });
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
            <View>
          </View>
          </View>
          <View>
            <NativeText>
              {convertHTML(homework.description.replace('\n', ' '), { wordwrap: 130 })}
            </NativeText>
          </View>
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
