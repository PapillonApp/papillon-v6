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
  Dimensions,
  ScrollView,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, useTheme } from 'react-native-paper';

import {
  Newspaper,
  ChefHat,
  Projector,
  Users2,
  AlertTriangle,
} from 'lucide-react-native';
import { PressableScale } from 'react-native-pressable-scale';
import ListItem from '../components/ListItem';

import PapillonLoading from '../components/PapillonLoading';

import GetUIColors from '../utils/GetUIColors';
import { useAppContext } from '../utils/AppContext';

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
  return text.replace(/(\r\n|\n|\r)/gm, '').trim();
}

function FullNewsIcon({ title }) {
  const UIColors = GetUIColors();

  return (
    <View>
      {normalizeText(title).includes('menu') ? (
        <ChefHat color={UIColors.primary} size={24} />
      ) : normalizeText(title).includes('reunion') ? (
        <Projector color={UIColors.primary} size={24} />
      ) : normalizeText(title).includes('association') ? (
        <Users2 color={UIColors.primary} size={24} />
      ) : normalizeText(title).includes('important') ? (
        <AlertTriangle color={UIColors.primary} size={24} />
      ) : (
        <Newspaper color={UIColors.primary} size={24} />
      )}
    </View>
  );
}

function NewsScreen({ navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const insets = useSafeAreaInsets();

  const { height } = Dimensions.get('screen');

  const [news, setNews] = useState([]);
  const [finalNews, setFinalNews] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [showNews, setShowNews] = useState(true);

  function editNews(n) {
    // invert the news array
    const newNews = n.reverse();

    return newNews;
  }

  const [isHeadLoading, setIsHeadLoading] = useState(false);

  const appctx = useAppContext();

  useEffect(() => {
    setIsHeadLoading(true);
    appctx.dataprovider.getNews().then((n) => {
      setIsHeadLoading(false);
      setNews(editNews(JSON.parse(n)));
      setFinalNews(editNews(JSON.parse(n)));
    });
  }, []);

  const onRefresh = React.useCallback(() => {
    setIsHeadLoading(true);
    appctx.dataprovider.getNews(true).then((n) => {
      setNews(editNews(JSON.parse(n)));
      setFinalNews(editNews(JSON.parse(n)));
      setIsHeadLoading(false);
    });
  }, []);

  // add search bar in the header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (isHeadLoading ? <ActivityIndicator /> : null),
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
  }, [navigation, finalNews, isHeadLoading]);

  const [currentNewsType, setCurrentNewsType] = useState('Toutes');
  const [newsTypes, setNewsTypes] = useState([
    {
      name: 'Toutes',
      icon: <Newspaper color={UIColors.primary} size={20} />,
      enabled: true,
    },
    {
      name: 'Menus',
      icon: <ChefHat color={UIColors.primary} size={20} />,
      enabled: false,
    },
    {
      name: 'Réunions',
      icon: <Projector color={UIColors.primary} size={20} />,
      enabled: false,
    },
  ]);

  useEffect(() => {
    news.forEach((item) => {
      if (normalizeText(item.title).includes(normalizeText('menu'))) {
        const newNewsTypes = newsTypes;
        newNewsTypes[1].enabled = true;
        setNewsTypes(newNewsTypes);
      }
      if (normalizeText(item.title).includes(normalizeText('reunion'))) {
        const newNewsTypes = newsTypes;
        newNewsTypes[2].enabled = true;
        setNewsTypes(newNewsTypes);
      }
    });
  }, [news]);

  function changeNewsType(type) {
    setCurrentNewsType(type);

    if (type === 'Toutes') {
      setNews(finalNews);
    }

    if (type === 'Menus') {
      const newNews = [];

      finalNews.forEach((item) => {
        if (normalizeText(item.title).includes(normalizeText('menu'))) {
          newNews.push(item);
        }
      });

      setNews(newNews);
    }

    if (type === 'Réunions') {
      const newNews = [];

      finalNews.forEach((item) => {
        if (normalizeText(item.title).includes(normalizeText('reunion'))) {
          newNews.push(item);
        }
      });

      setNews(newNews);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: UIColors.background }]}>
      {Platform.OS === 'ios' ? (
        <StatusBar animated barStyle="light-content" />
      ) : (
        <StatusBar
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
      )}

      {isHeadLoading ? (
        <PapillonLoading
          title="Chargement des actualités..."
          subtitle="Obtention des dernières actualités en cours"
          style={[{ marginTop: insets.top + 120 }]}
        />
      ) : null}

      {!isHeadLoading ? (
        <Animated.FlatList
          contentInsetAdjustmentBehavior="automatic"
          style={[styles.newsList]}
          contentContainerStyle={{
            paddingBottom: insets.bottom,
          }}
          data={news}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={[styles.selectTypes]}>
                {newsTypes.map((item, index) =>
                  item.enabled ? (
                    <NewsChip
                      key={index}
                      title={item.name}
                      enabled={currentNewsType === item.name}
                      icon={item.icon}
                      onPress={() => {
                        changeNewsType(item.name);
                      }}
                    />
                  ) : null
                )}
                <View style={{ width: 18 }} />
              </View>
            </ScrollView>
          }
          refreshControl={
            <RefreshControl
              refreshing={isHeadLoading}
              onRefresh={onRefresh}
              colors={[UIColors.primary]}
              tintColor={UIColors.primary}
            />
          }
          renderItem={({ item, index }) =>
            showNews ? (
              <NewsItem
                item={item}
                navigation={navigation}
                UIColors={UIColors}
                height={height}
                index={index}
              />
            ) : null
          }
        />
      ) : null}
    </View>
  );
}

// eslint-disable-next-line no-unused-vars
function NewsItem({ item, navigation, UIColors, height, index }) {
  let content = item.content.trim();
  if (content.length > 50) {
    content = `${content.substring(0, 50)}...`;
  }

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.elastic(1),
      useNativeDriver: true,
      delay: index * 50,
    }).start();
  });

  return (
    <Animated.View
      style={[
        {
          // Bind opacity to animated value
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}
    >
      <ListItem
        title={item.title}
        subtitle={normalizeContent(content)}
        icon={<FullNewsIcon title={item.title} />}
        color={UIColors.primary}
        onPress={() => navigation.navigate('NewsDetails', { news: item })}
        right={
          <Text style={{ fontSize: 13, opacity: 0.5 }}>
            il y a {relativeDate(new Date(item.date))}
          </Text>
        }
        style={styles.newsItem}
      />
    </Animated.View>
  );
}

function NewsChip({ title, enabled, onPress, icon }) {
  const UIColors = GetUIColors();

  return (
    <PressableScale
      style={[
        styles.newsChip,
        enabled ? styles.newsChipEnabled : null,
        {
          backgroundColor: enabled ? `${UIColors.primary}22` : UIColors.element,
        },
      ]}
      onPress={onPress}
      activeScale={0.92}
      weight="medium"
    >
      {icon}
      <Text
        style={[
          styles.newsChipText,
          enabled ? styles.newsChipTextEnabled : null,
          { color: enabled ? UIColors.primary : UIColors.text },
        ]}
      >
        {title}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  newsList: {},

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
