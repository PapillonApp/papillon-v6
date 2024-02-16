import React, { useEffect, useState } from 'react';
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

import { BlurView } from 'expo-blur';

import moment from 'moment/moment';
import 'moment/locale/fr';
moment.locale('fr');

import PdfRendererView from 'react-native-pdf-renderer';

import { SFSymbol } from 'react-native-sfsymbols';
import PapillonInsetHeader from '../components/PapillonInsetHeader';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from 'react-native-paper';

import { Newspaper, ChefHat, Projector, Users2, AlertTriangle, X, PieChart, Link, File } from 'lucide-react-native';

import PapillonLoading from '../components/PapillonLoading';

import GetUIColors from '../utils/GetUIColors';
import { useAppContext } from '../utils/AppContext';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

import * as WebBrowser from 'expo-web-browser';
import * as FileSystem from 'expo-file-system';
import { PapillonNews } from '../fetch/types/news';

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
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function normalizeContent(text: string) {
  return text.replace(/(\r\n|\n|\r)/gm, '').trim();
}

function FullNewsIcon({ title, survey }: {
  title?: string
  survey: boolean
}) {
  const normalizedTitle = normalizeText(title);
  const COLOR = '#B42828';

  return (
    <View>
      { survey ? (
        <PieChart color={COLOR} size={24} />
      ) : normalizedTitle.includes('menu') ? (
        <ChefHat color={COLOR} size={24} />
      ) : normalizedTitle.includes('reunion') ? (
        <Projector color={COLOR} size={24} />
      ) : normalizedTitle.includes('association') ? (
        <Users2 color={COLOR} size={24} />
      ) : normalizedTitle.includes('important') ? (
        <AlertTriangle color={COLOR} size={24} />
      ) : (
        <Newspaper color={COLOR} size={24} />
      )}
    </View>
  );
}

function NewsScreen({ navigation }: {
  navigation: any // TODO
}) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const openURL = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'done',
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.CURRENT_CONTEXT,
      controlsColor: '#B42828',
    });
  };

  const insets = useSafeAreaInsets();

  const [news, setNews] = useState<PapillonNews[]>([]);
  const [finalNews, setFinalNews] = useState<PapillonNews[]>([]);
  const [showNews, setShowNews] = useState(true);
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
  const onRefresh = React.useCallback(() => {
    (async () => {
      if (!appContext.dataProvider) return;
      setIsHeadLoading(true);
      
      const news = await appContext.dataProvider.getNews(true);
      const editedNews = editNews(news);

      setNews(editedNews);
      setFinalNews(editedNews);
      setIsHeadLoading(false);
    })();
  }, []);

  // add search bar in the header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: Platform.OS === 'ios' ? () => (
        <PapillonInsetHeader
          icon={<SFSymbol name="newspaper.fill" />}
          title="Actualités"
          color="#B42828"
        />
      ) : 'Actualités',
      headerTransparent: Platform.OS === 'ios' ? true : false,
      headerStyle: Platform.OS === 'android' ? {
        backgroundColor: UIColors.background,
        elevation: 0,
      } : undefined,
      headerBackground: Platform.OS === 'ios' ? () => (
        <Animated.View 
          style={[
            {
              flex: 1,
              backgroundColor: UIColors.element + '00',
              opacity: headerOpacity,
              borderBottomColor: theme.dark ? UIColors.text + '22' : UIColors.text + '55',
              borderBottomWidth: 0.5,
            }
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
      ) : undefined,
      headerSearchBarOptions: {
        placeholder: 'Rechercher une actualité',
        cancelButtonText: 'Annuler',
        tintColor: '#B42828',
        onChangeText: (event: any) => {
          const text = event.nativeEvent.text.trim();
    
          if (text.length > 2) {
            const newNews: PapillonNews[] = [];
    
            finalNews.forEach((item) => {
              if (
                normalizeText(item.title).includes(normalizeText(text)) ||
                normalizeText(item.content).includes(normalizeText(text))
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
  const [ modalURL , setModalURL ] = useState('');

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: UIColors.backgroundHigh }]}
        contentInsetAdjustmentBehavior='automatic'

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
            isModalOpen ? 'light-content' :
              theme.dark ? 'light-content' : 'dark-content'
          }
          backgroundColor="transparent"
        />

        <Modal
          animationType="slide"
          presentationStyle='pageSheet'
          visible={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: theme.dark ? '#000000' : '#ffffff' }}>
            <TouchableOpacity style={[styles.pdfClose, Platform.OS === 'android' ? { top: insets.top } : null]}
              onPress={() => setIsModalOpen(false)}
            >
              <X
                color='#ffffff'
              />
            </TouchableOpacity>

            <PdfRendererView
              style={{ flex: 1 }}
              source={modalURL}
            />
          </SafeAreaView>
        </Modal>

        { Platform.OS !== 'ios' ? (
          <View style={{height: 16}} />
        ) : null }

        <NativeList>
          {!isLoading && news.length !== 0 ? (
            (news.map((item, index) => {
              return (
                <View key={index}>
                  <NativeItem
                    leading={
                      <View style={{ paddingHorizontal: 2 }}>
                        <FullNewsIcon title={item.title} survey={item.survey} />
                      </View>
                    }
                    onPress={() => {
                      navigation.navigate('NewsDetails', { news: item });
                    }}
                  >
                    <View
                      style={[
                        { gap: 2 },
                      ]}
                    >
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
                        {normalizeContent(item.content)}
                      </NativeText>

                      <NativeText heading="subtitle2" numberOfLines={1} style={{ marginTop: 4 }}>
                        {relativeDate(new Date(item.date))}
                      </NativeText>

                      { item.attachments.length !== 0 ? (
                        <NativeText heading="subtitle2" numberOfLines={1} style={{ ...styles.pj, backgroundColor: UIColors.text + '22'}}>
                      contient {item.attachments.length} pièce(s) jointe(s)
                        </NativeText>
                      ) : null }
                    </View>
                  </NativeItem>
                </View>
              );
            }))
          ): !isLoading && news.length === 0 ? (
            <PapillonLoading
              icon={<Newspaper color={UIColors.text} />}
              title="Aucune actualité"
              subtitle="Aucune actualité n'a été trouvée"
            />
          ): <PapillonLoading
            title="Chargement des actualités..."
            subtitle="Obtention des dernières actualités en cours"
          />
          }
        </NativeList>

      </ScrollView>
    </>
  );
}

function PapillonAttachment({ attachment, index, theme, openURL, setIsModalOpen, setModalURL }) {
  const [downloaded, setDownloaded] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);

  const formattedAttachmentName = attachment.name.replace(/ /g, '_');
  const formattedFileExtension = attachment.url.split('.').pop().split(/#|\?/)[0];

  const [fileURL, setFileURL] = useState(attachment.url);

  useEffect(() => {
    if (formattedFileExtension == 'pdf') {
      FileSystem.getInfoAsync(FileSystem.documentDirectory + formattedAttachmentName + '.' + formattedFileExtension).then((e) => {
        if (e.exists) {
          setDownloaded(true);
          setFileURL(FileSystem.documentDirectory + formattedAttachmentName + '.' + formattedFileExtension);
          setSavedLocally(true);
        }
        else {
          FileSystem.downloadAsync(attachment.url, FileSystem.documentDirectory + formattedAttachmentName + '.' + formattedFileExtension).then((e) => {
            setDownloaded(true);
            setFileURL(FileSystem.documentDirectory + formattedAttachmentName + '.' + formattedFileExtension);
            setSavedLocally(true);
          });
        }
      });
    }
    else {
      setDownloaded(true);
    }
  }, []);

  return (
    <NativeItem
      leading={
        <View style={{ paddingHorizontal: 3.5 }}>
          {attachment.type === 0 ? (
            <Link size={20} color={theme.dark ? '#ffffff99' : '#00000099'} />
          ) : (
            <File size={20} color={theme.dark ? '#ffffff99' : '#00000099'} />
          )}
        </View>
      }
      chevron={true}
      onPress={() => {
        if (formattedFileExtension === 'pdf') {
          setModalURL(fileURL);
          setIsModalOpen(true);
        }
        else {
          openURL(fileURL);
        }
      }}
    >
      <NativeText heading="p2" numberOfLines={1}>
        {attachment.name}
      </NativeText>
    </NativeItem>
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
  }
});

export default NewsScreen;
