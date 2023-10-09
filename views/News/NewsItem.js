import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  Platform,
} from 'react-native';

import { Text, useTheme } from 'react-native-paper';

import RenderHtml from 'react-native-render-html';

import * as WebBrowser from 'expo-web-browser';

import { BarChart4, Link, File } from 'lucide-react-native';
import { PressableScale } from 'react-native-pressable-scale';
import ListItem from '../../components/ListItem';
import GetUIColors from '../../utils/GetUIColors';

function NewsItem({ route, navigation }) {
  const { news } = route.params;
  const theme = useTheme();
  const UIColors = GetUIColors();
  const { width } = useWindowDimensions();

  const openURL = async (url) => {
    await WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'done',
      presentationStyle: 'currentContext',
      controlsColor: UIColors.primary,
    });
  };

  function genFirstName(name) {
    const names = name.split(' ');

    if (names[0][0] == 'M') {
      // remove it
      names.shift();
    }

    if (names.length >= 1) {
      return names[0][0] + names[1][0];
    }

    return names[0][0];
  }

  // change the header of the screen
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: news.title,
      headerBackTitle: 'Retour',
    });
  }, [navigation, news]);

  function trimHtml(html) {
    // remove &nbsp;
    html = html.replace('&nbsp;','');

    // remove empty <p> tags even if they have attributes
    html = html.replace(/<p[^>]*>\s*<\/p>/g, '');
    // remove empty <div> tags even if they have attributes
    html = html.replace(/<div[^>]*>\s*<\/div>/g, '');

    return html
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
      contentInsetAdjustmentBehavior='automatic'
    >
      <StatusBar
        animated
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />

      {news.survey ? (
        <ListItem
          title="Cette actualité contient un sondage"
          subtitle="Vous ne pouvez pas répondre au sondage depuis l'application Papillon."
          icon={<BarChart4 color="#B42828" size={24} />}
          color="#B42828"
          onPress={() => {}}
          style={{ marginTop: 14 }}
        />
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

      { news.author ? (
        <ListItem
          left={(
            <View
              style={[styles.userPfp, {backgroundColor: UIColors.primary + '22'}]}
            >
              <Text
                style={[styles.userPfpText, {color: UIColors.primary}]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {genFirstName(news.author)}
              </Text>
            </View>
          )}
          center
          title={news.author}
          subtitle={`${new Date(news.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })} - ${news.category}`}
          style={{ marginBottom: 9 }}
        />
      ) : null}

      {news.attachments.length > 0 ? (
        <View
          style={[
            styles.homeworkFiles,
          ]}
        >
          {news.attachments.map((file, index) => (
            <View
              style={[
                styles.homeworkFileContainer,
              ]}
              key={index}
            >
              <PressableScale
                style={[styles.homeworkFile, { backgroundColor: UIColors.element }]}
                weight="light"
                activeScale={0.9}
                onPress={() => openURL(file.url)}
              >
                {file.type === 0 ? (
                  <Link size={20} color={theme.dark ? '#ffffff' : '#000000'} />
                ) : (
                  <File size={20} color={theme.dark ? '#ffffff' : '#000000'} />
                )}

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
              </PressableScale>
            </View>
          ))}
        </View>
      ) : null}

      <View style={{height: 20}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  newsTextContainer: {
    margin: 14,
  },

  baseStyle: {
    fontSize: 15,
  },
  baseStyleDark: {
    fontSize: 15,
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
});

export default NewsItem;
