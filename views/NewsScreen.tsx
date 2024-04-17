import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Animated as AnimatedRN,
  StatusBar,
  RefreshControl,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import type { PapillonNews } from '../fetch/types/news';

import { BlurView } from 'expo-blur';

import moment from 'moment/moment';
import 'moment/locale/fr';
moment.locale('fr');

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useTheme } from 'react-native-paper';

import {
  MailOpen,
  Bell,
  Newspaper,
} from 'lucide-react-native';

import PapillonLoading from '../components/PapillonLoading';

import GetUIColors from '../utils/GetUIColors';
import { useAppContext } from '../utils/AppContext';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

import Reanimated, { Layout, Easing, ZoomIn, ZoomOut, FadeIn, FadeOut } from 'react-native-reanimated';

const yOffset = new AnimatedRN.Value(0);

const headerOpacity = yOffset.interpolate({
  inputRange: [-40, 0],
  outputRange: [0, 1],
  extrapolate: 'clamp',
});

const scrollHandler = AnimatedRN.event(
  [{ nativeEvent: { contentOffset: { y: yOffset } } }],
  { useNativeDriver: false }
);

function relativeDate(date: Date) {
  return moment(date).fromNow();
}

const trimHtml = (html: string) => html
  // remove &nbsp;
  .replace(/&nbsp;/g, ' ')
  // remove html tags
  .replace(/<[^>]*>/g, '')
  // remove multiple spaces
  .replace(/\s{2,}/g, ' ')
  // remove line breaks
  .replace(/\n{1,}/g, '');

import AsyncStorage from '@react-native-async-storage/async-storage';

function NewsScreen({ navigation }: {
  navigation: any; // TODO
}) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const insets = useSafeAreaInsets();

  const [news, setNews] = useState<PapillonNews[]>([]);
  const [finalNews, setFinalNews] = useState<PapillonNews[]>([]);

  const [unreadOnly, setUnreadOnly] = useState(true);

  function editNews(n: PapillonNews[]): PapillonNews[] {
    let newNews = [...n];

    // for each news, if no title, set title to "Sans titre"
    newNews.forEach((item) => {
      if (item.title === null || typeof item.title === 'undefined') {
        item.title = 'Sans titre';
      }
    });

    // sort news by date
    newNews.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return newNews;
  }

  const [isHeadLoading, setIsHeadLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const appContext = useAppContext();

  // Get the data from cache if available on first load.
  useEffect(() => {
    (async () => {
      if (!appContext.dataProvider) return;
      const news = await appContext.dataProvider.getNews(false);
      const editedNews = editNews(news);

      setNews(editedNews);
      setFinalNews(editedNews);
      setIsLoading(false);
    })();
  }, [appContext.dataProvider]);

  // Get the data but with a force refresh.
  const onRefresh = useCallback(() => {
    (async () => {
      if (!appContext.dataProvider) return;
      setIsHeadLoading(true);

      const news = await appContext.dataProvider.getNews(true);
      const editedNews = editNews(news);

      setNews([]);
      setFinalNews([]);

      setNews(editedNews);
      setFinalNews(editedNews);
      setIsHeadLoading(false);
    })();
  }, [appContext.dataProvider]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // change header title
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Actualités',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setUnreadOnly(!unreadOnly);
          }}
          style={{
            marginRight: 16,
            backgroundColor: '#B4282822',
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderCurve: 'continuous',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
          }}
        >
          {unreadOnly ? (
            <Bell size={20} color="#B42828" />
          ) : (
            <MailOpen size={20} color="#B42828" />
          )}
          <NativeText
            style={{
              color: '#B42828',
              fontSize: 16,
              fontFamily: 'Papillon-Medium',
            }}
          >
            {unreadOnly ? 'Non lues' : 'Toutes'}
          </NativeText>
        </TouchableOpacity>
      ),
      headerShadowVisible: false,
      headerTransparent: Platform.OS === 'ios' ? true : false,
      headerStyle: Platform.OS === 'android' ? {
        backgroundColor: UIColors.background,
        elevation: 0,
      } : undefined,
    });
  }, [navigation, UIColors, headerOpacity, setUnreadOnly, unreadOnly]);

  return (
    <>
      {Platform.OS === 'ios' && (
        <AnimatedRN.View
          style={
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 44 + insets.top,
              width: '100%',
              zIndex: 999,
              backgroundColor: UIColors.element + '00',
              opacity: headerOpacity,
              borderBottomColor: UIColors.dark ? UIColors.text + '22' : UIColors.text + '55',
              borderBottomWidth: 0.5,
            }
          }
        >
          <BlurView
            tint={UIColors.dark ? 'dark' : 'light'}
            intensity={80}
            style={{
              flex: 1,
              zIndex: 999,
            }}
          />
        </AnimatedRN.View>
      )}

      <ScrollView
        style={{ backgroundColor: UIColors.backgroundHigh, flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={isHeadLoading}
            onRefresh={onRefresh}
            colors={[Platform.OS === 'android' ? UIColors.primary : '']}
            progressViewOffset={insets.top + 50}
          />
        }
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <StatusBar
          animated
          translucent
          barStyle={
            isModalOpen
              ? 'light-content'
              : theme.dark
                ? 'light-content'
                : 'dark-content'
          }
          backgroundColor="transparent"
        />

        {Platform.OS === 'ios' && (
          <View style={{ height: insets.top }} />
        )}

        {!isLoading && unreadOnly && news.filter((item) => !item.read).length === 0 && (
          <Reanimated.View
            entering={ZoomIn.duration(200).easing(Easing.out(Easing.bezierFn(0.5, 0, 1, 0)))}
            exiting={FadeOut.duration(200)}
            style={{
              marginTop: -10,
            }}
          >
            <NativeList
              inset
            >
              <NativeItem>
                <PapillonLoading
                  icon={<MailOpen size={26} color={'#B42828'} />}
                  title="Vous avez tout lu !"
                  subtitle="Vous êtes à jour sur toutes les actualités"
                  style={{ marginVertical: 10 }}
                />
              </NativeItem>

            </NativeList>
          </Reanimated.View>
        )}

        <Reanimated.View
          style={[
            styles.newsList,
          ]}
          layout={Layout.duration(250).easing(Easing.out(Easing.bezierFn(1, 0, 0.5, 1)))}
        >
          {!isLoading && news.length !== 0 && (
            news.map((item, index) => (
              !unreadOnly || !item.read || (unreadOnly && news.filter((item) => !item.read).length === 0) ? (
                <Reanimated.View
                  key={item.id}
                  style={[
                    {
                      overflow: 'hidden',
                      borderRadius: 10,
                      borderCurve: 'continuous',
                      marginBottom: 8,
                    },
                  ]}
                  layout={Layout.duration(250).easing(Easing.out(Easing.bezierFn(1, 0, 0.5, 1)))}
                  entering={ZoomIn.duration(250).easing(Easing.out(Easing.bezierFn(0.5, 0, 1, 0)))}
                  exiting={FadeOut.duration(200)}
                >
                  <NativeItem
                    onPress={() => {
                      navigation.navigate('NewsDetails', { news: item });
                    }}
                  >
                    <View style={[{ gap: 4, marginLeft: 14 }]}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 7,
                          marginLeft: !item.read ? -18 : 0,
                        }}
                      >
                        {!item.read && (
                          <View
                            style={{
                              backgroundColor: '#B42828',
                              borderRadius: 300,
                              padding: 4,
                              marginRight: 2,
                              width: 9,
                              height: 9,
                              marginTop: 4.5,
                            }}
                          />
                        )}

                        <NativeText
                          heading="h4"
                          numberOfLines={2}
                          style={{ flex: 1, marginRight: 8 }}
                        >
                          {item.title}
                        </NativeText>

                        <NativeText
                          heading="p2"
                          numberOfLines={1}
                          style={{
                            fontSize: 15,
                          }}
                        >
                          {relativeDate(new Date(item.date))}
                        </NativeText>
                      </View>

                      <NativeText
                        heading="p"
                        numberOfLines={1}
                        style={{
                        }}
                      >
                        {item.author}
                      </NativeText>

                      <NativeText heading="p2" numberOfLines={2}>
                        {item.is === 'information' ? trimHtml(item.content) : `${item.questions.length} question(s)`}
                      </NativeText>

                      {(item.is === 'information' && item.attachments.length !== 0) && (
                        <NativeText
                          heading="subtitle2"
                          numberOfLines={1}
                          style={{
                            ...styles.pj,
                            backgroundColor: UIColors.text + '22',
                          }}
                        >
                          contient {item.attachments.length} pièce(s) jointe(s)
                        </NativeText>
                      )}
                    </View>
                  </NativeItem>
                </Reanimated.View>
              ) : (
                <View />
              )
            ))
          )}

          {!isLoading && news.length === 0 && (
            <PapillonLoading
              icon={<Newspaper size={26} color={UIColors.text} />}
              title="Aucune actualité"
              subtitle="Aucune actualité n'a été trouvée"
            />
          )}

          {isLoading && (
            <PapillonLoading
              title="Chargement des actualités..."
              subtitle="Obtention des dernières actualités en cours"
            />
          )}
        </Reanimated.View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  pj: {
    marginTop: 4,

    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },

  newsList: {
    marginHorizontal: 16,
  }
});

export default NewsScreen;
