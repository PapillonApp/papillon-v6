import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
  Platform,
} from 'react-native';

import { Text, useTheme } from 'react-native-paper';

import { Newspaper } from 'lucide-react-native';
import { IndexData } from '../fetch/IndexData';
import ListItem from '../components/ListItem';

import GetUIColors from '../utils/GetUIColors';

function relativeDate(date) {
  const now = new Date();
  const diff = now - date;

  if (diff < 1000 * 60) {
    return "À l'instant";
  }
  if (diff < 1000 * 60 * 60) {
    return `${Math.floor(diff / (1000 * 60))} minutes`;
  }
  if (diff < 1000 * 60 * 60 * 24) {
    return `${Math.floor(diff / (1000 * 60 * 60))} heures`;
  }
  if (diff < 1000 * 60 * 60 * 24 * 7) {
    return `${Math.floor(diff / (1000 * 60 * 60 * 24))} jours`;
  }
  if (diff < 1000 * 60 * 60 * 24 * 30) {
    return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 7))} semaines`;
  }
  if (diff < 1000 * 60 * 60 * 24 * 365) {
    return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 30))} mois`;
  }
  return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 365))} ans`;
}

function NewsScreen({ navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [news, setNews] = useState([]);
  let finalNews = [];

  function editNews(n) {
    // invert the news array
    const newNews = n.reverse();

    return newNews;
  }

  const [isHeadLoading, setIsHeadLoading] = useState(false);

  useEffect(() => {
    setIsHeadLoading(true);
    IndexData.getNews().then((n) => {
      setIsHeadLoading(false);
      setNews(editNews(JSON.parse(n)));
      finalNews = editNews(JSON.parse(n));
    });
  }, []);

  const onRefresh = React.useCallback(() => {
    setIsHeadLoading(true);
    IndexData.getNews(true).then((n) => {
      setNews(editNews(JSON.parse(n)));
      finalNews = editNews(JSON.parse(n));
      setIsHeadLoading(false);
    });
  }, []);

  function normalizeText(text) {
    // remove accents and render in lowercase
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

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

            setNews(newNews);
          } else {
            setNews(finalNews);
          }
        },
      },
    });
  }, [navigation]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={isHeadLoading}
          onRefresh={onRefresh}
          progressViewOffset={28}
          colors={[Platform.OS === 'android' ? UIColors.primary : null]}
        />
      }
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

      {news.length > 0 ? (
        <View style={styles.newsList}>
          {news.map((item, index) => {
            let content = item.content.trim();
            if (content.length > 50) {
              content = `${content.substring(0, 50)}...`;
            }

            return (
              <ListItem
                key={index}
                title={item.title}
                subtitle={content}
                icon={<Newspaper color={UIColors.primary} size={24} />}
                color={theme.colors.primary}
                onPress={() =>
                  navigation.navigate('NewsDetails', { news: item })
                }
                right={
                  <Text style={{ fontSize: 13, opacity: 0.5 }}>
                    il y a {relativeDate(new Date(item.date))}
                  </Text>
                }
              />
            );
          })}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  newsList: {
    marginTop: 16,
    marginBottom: 16,
    gap: 10,
  },
});

export default NewsScreen;
