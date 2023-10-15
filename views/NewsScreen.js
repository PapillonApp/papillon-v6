import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Easing,
  StatusBar,
  RefreshControl,
  Platform,
  ActivityIndicator,
  FlatList,
  Dimensions,
  ScrollView,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, useTheme } from 'react-native-paper';

import { Newspaper, ChefHat, Projector, Users2, AlertTriangle } from 'lucide-react-native';
import { BarChart4, Link, File } from 'lucide-react-native';
import { IndexData } from '../fetch/IndexData';
import ListItem from '../components/ListItem';

import PapillonLoading from '../components/PapillonLoading';

import GetUIColors from '../utils/GetUIColors';
import { PressableScale } from 'react-native-pressable-scale';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

import * as WebBrowser from 'expo-web-browser';

function relativeDate(date) {
  const now = new Date();
  const diff = now - date;

  if (diff < 1000 * 60) {
    return "À l'instant";
  }
  if (diff < 1000 * 60 * 60) {
    return `${Math.floor(diff / (1000 * 60))} minute(s)`;
  }
  if (diff < 1000 * 60 * 60 * 24) {
    return `${Math.floor(diff / (1000 * 60 * 60))} heure(s)`;
  }
  if (diff < 1000 * 60 * 60 * 24 * 7) {
    return `${Math.floor(diff / (1000 * 60 * 60 * 24))} jour(s)`;
  }
  if (diff < 1000 * 60 * 60 * 24 * 30) {
    return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 7))} semaine(s)`;
  }
  if (diff < 1000 * 60 * 60 * 24 * 365) {
    return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 30))} moi(s)`;
  }
  return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 365))} an(s)`;
}

function normalizeText(text) {
  // remove accents and render in lowercase
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function normalizeContent(text) {
  return text
    .replace(/(\r\n|\n|\r)/gm,"")
    .trim();
}

function FullNewsIcon({ title }) {
  const UIColors = GetUIColors();

  return (
    <View>
      { normalizeText(title).includes('menu') ? <ChefHat color={UIColors.primary} size={24} /> :
      normalizeText(title).includes('reunion') ? <Projector color={UIColors.primary} size={24} /> :
      normalizeText(title).includes('association') ? <Users2 color={UIColors.primary} size={24} /> :
      normalizeText(title).includes('important') ? <AlertTriangle color={UIColors.primary} size={24} /> :
      <Newspaper color={UIColors.primary} size={24} />
      }
    </View>
  )
}

function NewsScreen({ navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const openURL = async (url) => {
    await WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'done',
      presentationStyle: 'currentContext',
      controlsColor: UIColors.primary,
    });
  };

  const insets = useSafeAreaInsets();

  const { height } = Dimensions.get("screen");

  const [news, setNews] = useState([]);
  const [finalNews, setFinalNews] = useState([]);
  const [showNews, setShowNews] = useState(true);
  const [currentNewsType, setCurrentNewsType] = useState("Toutes");

  function editNews(n) {
    // invert the news array
    const newNews = n.reverse();

    return newNews;
  }

  const [isHeadLoading, setIsHeadLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    IndexData.getNews().then((n) => {
      setNews(editNews(JSON.parse(n)));
      setFinalNews(editNews(JSON.parse(n)));
      setIsLoading(false);
    });
  }, []);

  const onRefresh = React.useCallback(() => {
    setIsHeadLoading(true);
    IndexData.getNews(true).then((n) => {
      setNews(editNews(JSON.parse(n)));
      setFinalNews(editNews(JSON.parse(n)));
      setIsHeadLoading(false);
    });
  }, []);

  // add search bar in the header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: 'Rechercher une actualité',
        cancelButtonText: 'Annuler',
        onChangeText: (event) => {
          const text = event.nativeEvent.text.trim();

          if (text.length > 2) {
            const newNews = [];

            finalNews.forEach((item) => {
              if (
                normalizeText(item.title).includes(normalizeText(text)) ||
                normalizeText(item.content).includes(normalizeText(text))
              ) {
                newNews.push(item);
              }
            });

            setCurrentNewsType("Toutes");
            setNews(newNews);
          } else {
            setCurrentNewsType("Toutes");
            setNews(finalNews);
          }
        },
      },
    });
  }, [navigation, finalNews, isHeadLoading]);

  const [newsTypes, setNewsTypes] = useState([
    {
      name: "Toutes",
      icon: <Newspaper color={UIColors.primary} size={20} />,
      enabled: true,
    },
    {
      name: "Menus",
      icon: <ChefHat color={UIColors.primary} size={20} />,
      enabled: false,
    },
    {
      name: "Réunions",
      icon: <Projector color={UIColors.primary} size={20} />,
      enabled: false,
    },
  ]);

  useEffect(() => {
    news.forEach((item) => {
      if (normalizeText(item.title).includes(normalizeText("menu"))) {
        newNewsTypes = newsTypes;
        newNewsTypes[1].enabled = true;
        setNewsTypes(newNewsTypes);
      }
      if (normalizeText(item.title).includes(normalizeText("reunion"))) {
        newNewsTypes = newsTypes;
        newNewsTypes[2].enabled = true;
        setNewsTypes(newNewsTypes);
      }
    });
  }, [news]);

  function changeNewsType(type) {
    setCurrentNewsType(type);

    if (type === "Toutes") {
      setNews(finalNews);
    }

    if (type === "Menus") {
      const newNews = [];

      finalNews.forEach((item) => {
        if (normalizeText(item.title).includes(normalizeText("menu"))) {
          newNews.push(item);
        }
      });

      setNews(newNews);
    }

    if (type === "Réunions") {
      const newNews = [];

      finalNews.forEach((item) => {
        if (normalizeText(item.title).includes(normalizeText("reunion"))) {
          newNews.push(item);
        }
      });

      setNews(newNews);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
      contentInsetAdjustmentBehavior='automatic'

      refreshControl={
        <RefreshControl
          refreshing={isHeadLoading}
          onRefresh={onRefresh}
        />
      }
    >
      <StatusBar
        animated
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />

      {isLoading ? (
        <PapillonLoading
          title="Chargement des actualités..."
          subtitle="Obtention des dernières actualités en cours"
        />
      ) : null}

      
      { !isLoading && news.length !== 0 && (
        <View style={{marginBottom: 18}}>
          {news.map((item, index) => (
            <NativeList inset style={{marginBottom: -18}} key={index}>
              <NativeItem
                leading={
                  <View style={{paddingHorizontal:2}}>
                    <FullNewsIcon title={item.title} />
                  </View>
                }
                chevron
                onPress={() => navigation.navigate('NewsDetails', { news: item })}
              >
                <NativeText heading="h4" numberOfLines={1}>
                  {item.title}
                </NativeText>
                <NativeText heading="p2" numberOfLines={1}>
                  {normalizeContent(item.content)}
                </NativeText>

                <NativeText heading="subtitle2" numberOfLines={1} style={{marginTop: 4}}>
                  il y a {relativeDate(new Date(item.date))}
                </NativeText>
              </NativeItem>

              {item.attachments.map((attachment, index) => (
                <NativeItem
                  leading={
                    <View style={{paddingHorizontal:2}}>
                      {attachment.type === 0 ? (
                        <Link size={20} color={theme.dark ? '#ffffff99' : '#00000099'} />
                      ) : (
                        <File size={20} color={theme.dark ? '#ffffff99' : '#00000099'} />
                      )}
                    </View>
                  }
                  chevron
                  onPress={() => openURL(attachment.url)}
                  key={index}
                >
                  <NativeText heading="p2" numberOfLines={1}>
                    {attachment.name}
                  </NativeText>

                </NativeItem>
              ))}
            </NativeList>
          ))}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  newsList: {
  },

  newsItem: {
    marginBottom: 8,
  },

  selectTypes: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 16,
    paddingHorizontal: 16,
  },

  newsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 300,
    gap: 7,
    marginRight: 9,
  },

  newsChipText: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
  },
});

export default NewsScreen;
