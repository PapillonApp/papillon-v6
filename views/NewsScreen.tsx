import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  StatusBar,
  RefreshControl,
  Platform,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';

import type { PapillonNews } from '../fetch/types/news';

import { BlurView } from 'expo-blur';

import moment from 'moment/moment';
import 'moment/locale/fr';
moment.locale('fr');

import PdfRendererView from 'react-native-pdf-renderer';

import { SFSymbol } from 'react-native-sfsymbols';
import PapillonInsetHeader from '../components/PapillonInsetHeader';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useTheme } from 'react-native-paper';

import {
  Newspaper,
  ChefHat,
  Projector,
  X,
  PieChart,
  Palette,
  ShieldCheck,
  PenLine,
  Tent,
  Dumbbell,
  Users,
  UserCheck2,
  LucideIcon,
} from 'lucide-react-native';

import PapillonLoading from '../components/PapillonLoading';

import GetUIColors from '../utils/GetUIColors';
import { useAppContext } from '../utils/AppContext';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';


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

function relativeDate(date: Date) {
  return moment(date).fromNow();
}

function normalizeText(text?: string) {
  if (!text) return '';

  // remove accents and render in lowercase
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

const ICONS_CATEGORIES: Array<{
  name: string
  icon: LucideIcon
}> = [
  {
    name: 'administration',
    icon: ShieldCheck,
  },
  {
    name: 'arts',
    icon: Palette,
  },
  {
    name: 'autorisation de sortie',
    icon: PenLine,
  },
  {
    name: 'sorties',
    icon: Tent,
  },
  {
    name: 'sports',
    icon: Dumbbell,
  },
  {
    name: 'stage',
    icon: Users,
  },
  {
    name: 'vie scolaire',
    icon: UserCheck2,
  }
];

const FullNewsIcon = ({ isSurvey, category }: {
  isSurvey: boolean;
  category?: string;
}) => {
  const normalizedCategory = normalizeText(category);
  const COLOR = '#B42828';

  let CategoryIcon: LucideIcon;
  if (isSurvey) CategoryIcon = PieChart;
  else {
    const category = ICONS_CATEGORIES.find((item) => item.name === normalizedCategory);
    if (category) CategoryIcon = category.icon;
    else CategoryIcon = Newspaper;
  }

  return (
    <View>
      <CategoryIcon color={COLOR} size={24} />
    </View>
  );
};

const trimHtml = (html: string) => html 
  // remove &nbsp;
  .replace(/&nbsp;/g, ' ')
  // remove html tags
  .replace(/<[^>]*>/g, '')
  // remove multiple spaces
  .replace(/\s{2,}/g, ' ')
  // remove line breaks
  .replace(/\n{1,}/g, '');

function NewsScreen ({ navigation }: {
  navigation: any; // TODO
}) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const insets = useSafeAreaInsets();

  const [news, setNews] = useState<PapillonNews[]>([]);
  const [finalNews, setFinalNews] = useState<PapillonNews[]>([]);
  const [currentNewsType, setCurrentNewsType] = useState('Toutes');

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

      setNews(editedNews);
      setFinalNews(editedNews);
      setIsHeadLoading(false);
    })();
  }, [appContext.dataProvider]);

  // add search bar in the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: Platform.OS === 'ios' ? ' ' : 'Actualités',
      headerLeft: () => Platform.OS === 'ios' && (
        <PapillonInsetHeader
          icon={<SFSymbol name="newspaper.fill" />}
          title="Actualités"
          color="#B42828"
        />
      ),
      headerTransparent: Platform.OS === 'ios' ? true : false,
      headerStyle:
        Platform.OS === 'android'
          ? {
            backgroundColor: UIColors.background,
            elevation: 0,
          }
          : undefined,
      headerBackground:
        Platform.OS === 'ios'
          ? () => (
            <Animated.View
              style={[
                {
                  flex: 1,
                  backgroundColor: UIColors.element + '00',
                  opacity: headerOpacity,
                  borderBottomColor: theme.dark
                    ? UIColors.text + '22'
                    : UIColors.text + '55',
                  borderBottomWidth: 0.5,
                },
              ]}
            >
              <BlurView
                tint={theme.dark ? 'dark' : 'light'}
                intensity={120}
                style={{
                  flex: 1,
                }}
              />
            </Animated.View>
          )
          : undefined,
      headerSearchBarOptions: {
        placeholder: 'Rechercher une actualité',
        cancelButtonText: 'Annuler',
        tintColor: '#B42828',
        onChangeText: (event: any) => {
          const text = event.nativeEvent.text.trim();

          if (text.length > 2) {
            const newNews: PapillonNews[] = [];

            finalNews.forEach((item) => {
              const content = item.is === 'information' ? item.content : `Sondage de ${item.questions.length} questions.`;

              if (
                normalizeText(item.title).includes(normalizeText(text)) ||
                normalizeText(content).includes(normalizeText(text))
              ) {
                newNews.push(item);
              }
            });

            setCurrentNewsType('Toutes');
            setNews(newNews);
          } else {
            setCurrentNewsType('Toutes');
            setNews(finalNews);
          }
        },
      },
    });
  }, [navigation, finalNews, isHeadLoading, UIColors]);

  const [newsTypes, setNewsTypes] = useState([
    {
      name: 'Toutes',
      icon: <Newspaper color={'#B42828'} size={20} />,
      enabled: true,
    },
    {
      name: 'Menus',
      icon: <ChefHat color={'#B42828'} size={20} />,
      enabled: false,
    },
    {
      name: 'Réunions',
      icon: <Projector color={'#B42828'} size={20} />,
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalURL] = useState('');

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: UIColors.backgroundHigh }]}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={isHeadLoading}
            onRefresh={onRefresh}
            colors={[Platform.OS === 'android' ? UIColors.primary : '']}
          />
        }
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <StatusBar
          animated
          barStyle={
            isModalOpen
              ? 'light-content'
              : theme.dark
                ? 'light-content'
                : 'dark-content'
          }
          backgroundColor="transparent"
        />

        <Modal
          animationType="slide"
          presentationStyle="pageSheet"
          visible={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
        >
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: theme.dark ? '#000000' : '#ffffff',
            }}
          >
            <TouchableOpacity
              style={[
                styles.pdfClose,
                Platform.OS === 'android' ? { top: insets.top } : null,
              ]}
              onPress={() => setIsModalOpen(false)}
            >
              <X color="#ffffff" />
            </TouchableOpacity>

            <PdfRendererView style={{ flex: 1 }} source={modalURL} />
          </SafeAreaView>
        </Modal>

        {Platform.OS !== 'ios' ? <View style={{ height: 16 }} /> : null}

        <NativeList inset>
          {!isLoading && news.length !== 0 ? (
            news.map((item, index) => (
              <View key={index}>
                <NativeItem
                  leading={
                    <View style={{ paddingHorizontal: 2 }}>
                      <FullNewsIcon
                        isSurvey={item.is === 'survey'}
                        category={item.category}
                      />
                    </View>
                  }
                  onPress={() => {
                    navigation.navigate('NewsDetails', { news: item });
                  }}
                >
                  <View style={[{ gap: 2 }]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 7,
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
                          }}
                        />
                      )}

                      <NativeText heading="h4" numberOfLines={1}>
                        {item.title}
                      </NativeText>
                    </View>

                    <NativeText heading="p2" numberOfLines={2}>
                      {item.is === 'information' ? trimHtml(item.content) : `${item.questions.length} question(s)`}
                    </NativeText>

                    <NativeText
                      heading="subtitle2"
                      numberOfLines={1}
                      style={{ marginTop: 4 }}
                    >
                      {relativeDate(new Date(item.date))}
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
              </View>
            ))
          ) : !isLoading && news.length === 0 ? (
            <PapillonLoading
              icon={<Newspaper color={UIColors.text} />}
              title="Aucune actualité"
              subtitle="Aucune actualité n'a été trouvée"
            />
          ) : (
            <PapillonLoading
              title="Chargement des actualités..."
              subtitle="Obtention des dernières actualités en cours"
            />
          )}
        </NativeList>
      </ScrollView>
    </>
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

  pdfClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 300,
    backgroundColor: '#00000099',
    zIndex: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  pj: {
    marginTop: 4,

    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
});

export default NewsScreen;
