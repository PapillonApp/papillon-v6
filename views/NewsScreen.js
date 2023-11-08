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
  Linking,
  Modal,
  Button,
  TouchableOpacity,
} from 'react-native';

import PdfRendererView from 'react-native-pdf-renderer';

import { ContextMenuView } from 'react-native-ios-context-menu';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, useTheme } from 'react-native-paper';

import { Newspaper, ChefHat, Projector, Users2, AlertTriangle, X, DownloadCloud } from 'lucide-react-native';
import { BarChart4, Link, File } from 'lucide-react-native';
import ListItem from '../components/ListItem';

import PapillonLoading from '../components/PapillonLoading';

import GetUIColors from '../utils/GetUIColors';
import { useAppContext } from '../utils/AppContext';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

import * as WebBrowser from 'expo-web-browser';
import * as FileSystem from 'expo-file-system';

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
    ?.normalize('NFD')
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

  const openURL = async (url) => {
    await WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'done',
      presentationStyle: 'currentContext',
      controlsColor: UIColors.primary,
    });
  };

  const insets = useSafeAreaInsets();

  const { height } = Dimensions.get('screen');

  const [news, setNews] = useState([]);
  const [finalNews, setFinalNews] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [showNews, setShowNews] = useState(true);
  const [currentNewsType, setCurrentNewsType] = useState("Toutes");

  function editNews(n) {
    let newNews = n;

    // sort news by date
    newNews.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    return newNews;
  }

  const [isHeadLoading, setIsHeadLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const appctx = useAppContext();

  useEffect(() => {
    appctx.dataprovider.getNews().then((n) => {
      setNews(editNews(n));
      setFinalNews(editNews(n));
      setIsLoading(false);
    });
  }, []);

  const onRefresh = React.useCallback(() => {
    setIsHeadLoading(true);
    appctx.dataprovider.getNews(true).then((n) => {
      setNews(editNews(n));
      setFinalNews(editNews(n));
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ modalURL , setModalURL ] = useState('');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.element }]}
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
        barStyle={
          ! isModalOpen ?
          theme.dark ? 'light-content' : 'dark-content'
          : 'light-content'
        }
        backgroundColor="transparent"
      />

      {isLoading ? (
        <PapillonLoading
          title="Chargement des actualités..."
          subtitle="Obtention des dernières actualités en cours"
        />
      ) : null}

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
              style={styles.pdfCloseIcon}
            />
          </TouchableOpacity>

          <PdfRendererView
            style={{ flex: 1 }}
            source={modalURL}
          />
        </SafeAreaView>
      </Modal>

      <NativeList style={{marginTop: Platform.OS === 'ios' ? -16 : 0}}>
      {!isLoading && news.length !== 0 && (
          (news.map((item, index) => {
            return (
              <View key={index}>
                <NativeItem
                  leading={
                    <View style={{ paddingHorizontal: 2 }}>
                      <FullNewsIcon title={item.title} />
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
                      {!item.read ? (
                        <View
                          style={{
                            backgroundColor: UIColors.primary,
                            borderRadius: 300,
                            padding: 4,
                            marginRight: 2,
                            width: 9,
                            height: 9,
                          }}
                        />
                      ) : null}

                      <NativeText heading="h4" numberOfLines={1}>
                        {item.title}
                      </NativeText>
                    </View>

                    <NativeText heading="p2" numberOfLines={2}>
                      {normalizeContent(item.content)}
                    </NativeText>

                    <NativeText heading="subtitle2" numberOfLines={1} style={{ marginTop: 4 }}>
                      il y a {relativeDate(new Date(item.date))}
                    </NativeText>

                    { item.attachments.length !== 0 ? (
                    <NativeText heading="subtitle2" numberOfLines={1} style={[styles.pj, {backgroundColor: UIColors.text + '22'}]}>
                      contient {item.attachments.length} pièce(s) jointe(s)
                    </NativeText>
                    ) : null }
                  </View>
                </NativeItem>
              </View>
            );
          }))
      )}
      </NativeList>

    </ScrollView>
  );
}

function PapillonAttachment({ attachment, index, theme, openURL, setIsModalOpen, setModalURL }) {
  const [downloaded, setDownloaded] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);

  const formattedAttachmentName = attachment.name.replace(/ /g, '_');
  const formattedFileExtension = attachment.url.split('.').pop().split(/\#|\?/)[0];

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
          if (formattedFileExtension === "pdf") {
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
  )
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
