import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  Platform,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { ContextMenuButton } from 'react-native-ios-context-menu';

import { SFSymbol } from 'react-native-sfsymbols';
import PapillonInsetHeader from '../../components/PapillonInsetHeader';

import { Text, useTheme } from 'react-native-paper';

import RenderHtml from 'react-native-render-html';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import * as WebBrowser from 'expo-web-browser';
import * as Clipboard from 'expo-clipboard';

import { PieChart, Link, File, X, DownloadCloud, MoreHorizontal, MoreVertical } from 'lucide-react-native';
import { PressableScale } from 'react-native-pressable-scale';
import ListItem from '../../components/ListItem';
import GetUIColors from '../../utils/GetUIColors';
import { useAppContext } from '../../utils/AppContext';

import PdfRendererView from 'react-native-pdf-renderer';
import * as FileSystem from 'expo-file-system';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function NewsItem({ route, navigation }) {
  const [news, setNews] = useState(route.params.news);
  const theme = useTheme();
  const UIColors = GetUIColors();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ modalURL , setModalURL ] = useState('');

  const appctx = useAppContext();

  const [isRead, setIsRead] = useState(news.read);
  const [readChanged, setReadChanged] = useState(false);

  const alertSondage = () => {
    Alert.alert(
      'Sondage',
      'Impossible de répondre au sondage depuis l\'application Papillon pour le moment.',
      [
        { text: "OK", onPress: () => {} },
      ],
      { cancelable: true }
    );
  }

  const loadNews = async (id) => {
    if (!id) return;
    if (appctx.dataprovider.service === 'Skolengo') {
      const newNews = await appctx.dataprovider.getUniqueNews(id, false);
      setNews(newNews);
    }
  };

  // add mark as read/not read button in the header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTintColor: Platform.OS === 'ios' && '#B42828',
      headerBackTitleVisible: false,
      headerTitle: Platform.OS === 'ios' ? () => (
        <PapillonInsetHeader
          title={news.title}
          color="#B42828"
          inset
        />
      ) : news.title,
      headerRight: () => (
          <ContextMenuButton
            isMenuPrimaryAction={true}
            menuConfig={{
              menuTitle: 'Actions',
              menuItems: [
                  {
                    actionKey  : 'read',
                    actionTitle: 'Marquer comme lu',
                    icon: {
                      type: 'IMAGE_SYSTEM',
                      imageValue: {
                        systemName: 'flag',
                      },
                    },
                    menuState: isRead ? 'on' : 'off',
                  },
                  {
                    actionKey  : 'copy',
                    actionTitle: 'Copier le contenu',
                    icon: {
                      type: 'IMAGE_SYSTEM',
                      imageValue: {
                        systemName: 'doc.on.doc',
                      },
                    },
                  }
              ],
            }}
            onPressMenuItem={async ({nativeEvent}) => {
              if (nativeEvent.actionKey === 'read') {
                markNewsAsRead(news.local_id).then((e) => {
                  setIsRead(e.current_state);
                  setReadChanged(true);
                });
              }
              else if (nativeEvent.actionKey === 'copy') {
                await Clipboard.setStringAsync(news.html_content[0].texte.V);
              }
            }}
        >
          <TouchableOpacity>
            <MoreHorizontal size={24} color={'#B42828'} />
          </TouchableOpacity>
        </ContextMenuButton>
      ),
    });
  }, [navigation, isRead, readChanged]);

  function markNewsAsRead(id) {
    return appctx.dataprovider.changeNewsState(id).then((result) => {
      return result;
    });
  }

  React.useEffect(() => {
    setNews(route.params.news);
    loadNews(route.params.news.id);

    if (!route.params.news.read && !readChanged) {
      markNewsAsRead(route.params.news.local_id).then((e) => {
        setIsRead(e.current_state);
        setReadChanged(true);
      });
    }
  }, [route.params.news, isRead, readChanged]);

  const openURL = async (url) => {
    await WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'done',
      presentationStyle: 'currentContext',
      controlsColor: '#B42828',
    });
  };

  function genFirstName(name) {
    const names = name.split(' ');

    if (names?.at(0)?.at(0) === 'M') {
      // remove it
      names.shift();
    }

    if (names.length >= 1) {
      return `${names?.at(0)?.at(0)}${names?.at(1)?.at(0)}`;
    }

    return names?.at(0)?.at(0);
  }

  function trimHtml(html) {
    // remove &nbsp;
    html = html.replace('&nbsp;', '');

    // remove empty <p> tags even if they have attributes
    html = html.replace(/<p[^>]*>\s*<\/p>/g, '');
    // remove empty <div> tags even if they have attributes
    html = html.replace(/<div[^>]*>\s*<\/div>/g, '');

    return html;
  }

  const source = {
    html: trimHtml(news.html_content[0].texte.V),
  };

  const defaultTextProps = {
    selectable: true,
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
      contentInsetAdjustmentBehavior="automatic"
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
              style={styles.pdfCloseIcon}
            />
          </TouchableOpacity>

          <PdfRendererView
            style={{ flex: 1, backgroundColor: UIColors.background }}
            source={modalURL}
          />
        </SafeAreaView>
      </Modal>

      {news.survey ? (
        <NativeList inset>
          <NativeItem
            leading={
              <PieChart size={20} color={theme.dark ? '#ffffff' : '#000000'} />
            }
          >
            <NativeText heading="h4">
              Cette actualité contient un sondage
            </NativeText>
            <NativeText heading="p2">
              Impossible de répondre au sondage depuis l'application Papillon pour le moment.
            </NativeText>

            <NativeText heading="subtitle2" style={{marginTop: 8}}>
              Vous pouvez cependant prévisualiser les questions et les réponses possibles ci-dessous.
            </NativeText>
          </NativeItem>
        </NativeList>
      ) : null}

      <View style={styles.newsTextContainer}>
        {source.html ? (
          <RenderHtml
            contentWidth={width}
            defaultTextProps={defaultTextProps}
            source={source}
            baseStyle={theme.dark ? styles.baseStyleDark : styles.baseStyle}
          />
        ) : null}
      </View>

      {news.attachments.length > 0 ? (
        <NativeList inset header="Pièces jointes">
          {news.attachments.map((file, index) => (
            <PapillonAttachment key={index} file={file} index={index} theme={theme} UIColors={UIColors} setModalURL={setModalURL} setIsModalOpen={setIsModalOpen} openURL={openURL} />
          ))}
        </NativeList>
      ) : null}

      {news.author ? (
        <NativeList inset header="Auteur">
          <NativeItem
            leading={
              <View
                style={[
                  styles.userPfp,
                  { backgroundColor: `${'#B42828'}22`, marginVertical: Platform.OS == 'ios' ? 10 : 0 },
                ]}
              >
                <Text
                  style={[styles.userPfpText, { color: '#B42828' }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {genFirstName(news.author)}
                </Text>
              </View>
            }
          >
            <NativeText heading="h3">
              {news.author}
            </NativeText>
          </NativeItem>
          <NativeItem
            leading={
              <NativeText heading="p2">
                Publié le
              </NativeText>
            }
          >
            <NativeText heading="p" style={{textAlign: 'right'}}>
              {`${new Date(news.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}`}
            </NativeText>
          </NativeItem>
          <NativeItem
            leading={
              <NativeText heading="p2">
                Catégorie
              </NativeText>
            }
          >
            <NativeText heading="p" style={{textAlign: 'right'}}>
              {news.category}
            </NativeText>
          </NativeItem>
        </NativeList>
      ) : null}

      {news.survey ? (
        news.html_content.map((survey, index) => (
          <NativeList key={index} inset header={survey.L}>
            <NativeItem>
              <NativeText heading="p">
                {survey.texte.V.replace( /(<([^>]+)>)/ig, '').replace(/\&nbsp;/g, '').trim()}
              </NativeText>
            </NativeItem>

            {survey.listeChoix.V?.map((answer, index) => (
              <NativeItem key={index} onPress={() => {alertSondage()}}>
                <NativeText heading="p2">
                  {answer.L}
                </NativeText>
              </NativeItem>
            ))}
          </NativeList>
        ))
      ) : null}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function PapillonAttachment({file, index, theme, UIColors, setModalURL, setIsModalOpen, openURL}) {
  const attachment = file;

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

  function redownloadFile() {
    FileSystem.downloadAsync(attachment.url, FileSystem.documentDirectory + formattedAttachmentName + '.' + formattedFileExtension).then((e) => {
      setDownloaded(true);
      setFileURL(FileSystem.documentDirectory + formattedAttachmentName + '.' + formattedFileExtension);
      setSavedLocally(true);
    });
  }

  return (
    <NativeItem
      key={index}
      onPress={downloaded ? () => {
        if (formattedFileExtension === "pdf") {
          setModalURL(fileURL);
          setIsModalOpen(true);
        }
        else {
          openURL(fileURL);
        }
      } : null}
      leading={ 
        file.type === 0 ? (
          <Link size={20} color={theme.dark ? '#ffffff' : '#000000'} />
        ) : (
          <File size={20} color={theme.dark ? '#ffffff' : '#000000'} />
        )
      }
      trailing={ savedLocally ? (
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Pièce jointe téléchargée hors-ligne',
              'Cette pièce jointe a été téléchargée pour une consultation hors-ligne. Vous pouvez consulter la pièce jointe originale si celle ci ne fonctionne pas.',
              [
                { text: "Gérer le téléchargement", onPress: () => {
                  Alert.alert(
                    'Gérer le téléchargement',
                    'Que voulez-vous faire ?',
                    [
                      { text: "Supprimer le téléchargement", onPress: () => {
                        FileSystem.deleteAsync(fileURL).then(() => {
                          setDownloaded(false);
                          setSavedLocally(false);
                        });
                      }, style: 'destructive' },
                      { text: "Re-télécharger la pièce jointe", onPress: () => {
                        FileSystem.deleteAsync(fileURL).then(() => {
                          setDownloaded(false);
                          setSavedLocally(false);
                          redownloadFile();
                        });
                      } },
                      { text: "Annuler", onPress: () => {} },
                    ],
                    { cancelable: true }
                  );
                } },
                { text: "Consulter l'originale", onPress: () => openURL(attachment.url) },
                { text: "OK", onPress: () => {} },
              ],
              { cancelable: true }
            );
          }}
        >
          <DownloadCloud
            size={22}
            color={UIColors.text}
            style={{ opacity: 0.7, margin:5 }}
          />
        </TouchableOpacity>
      ) : null }
    >

                <View style={[styles.homeworkFileData]}>
                  <Text style={[styles.homeworkFileText]}>{file.name}</Text>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[styles.homeworkFileUrl]}
                  >
                    {file.url}
                  </Text>
                </View>
            </NativeItem>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  newsTextContainer: {
    margin: 14,
  },

  baseStyle: {
    fontSize: 16,
  },
  baseStyleDark: {
    fontSize: 16,
    color: '#ffffff',
  },

  newsHeader: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  newsHeaderAndroid: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 0,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'Papillon-Semibold',
  },
  newsDate: {
    fontSize: 13,
    opacity: 0.5,
  },

  homeworkFiles: {
    margin: 14,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    gap: 9,
  },

  homeworkFileContainer: {
    borderTopWidth: 0,
  },
  homeworkFile: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
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

  userPfp: {
    width: 40,
    height: 40,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userPfpText: {
    fontSize: 19,
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
  }
});

export default NewsItem;
