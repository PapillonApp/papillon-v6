import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import { useState, useEffect } from 'react';
import {
  Server,
  Euro,
  History,
  Check,
  MessageCircle,
} from 'lucide-react-native';
import PapillonIcon from '../../components/PapillonIcon';
import ListItem from '../../components/ListItem';

import getConsts from '../../fetch/consts';
import packageJson from '../../package.json';
import donors from './Donateurs.json';
import team from './Team.json';

import { getInfo } from '../../fetch/AuthStack/LoginFlow';
import GetUIColors from '../../utils/GetUIColors';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

function AboutScreen({ navigation }) {
  const UIColors = GetUIColors();
  const [serverInfo, setServerInfo] = useState({});

  function openUserLink(url) {
    WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'done',
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: UIColors.primary,
    });
  }

  const [dataList] = useState([
    {
      title: 'Version de Papillon',
      subtitle: `${packageJson.version} ${packageJson.canal}`,
      color: '#888888',
      icon: <History size={24} color="#888888" />,
    },
    {
      title: 'Dépendances',
      subtitle: `RN: ${
        packageJson.dependencies['react-native'].split('^')[1]
      }, Expo : ${packageJson.dependencies.expo.split('^')[1]}`,
      color: '#888888',
      icon: <History size={24} color="#888888" />,
    },
  ]);

  useEffect(() => {
    getInfo().then((data) => {
      setServerInfo(data);
    });
  }, []);

  const knownServers = [
    'getpapillon.xyz',
    'just-tryon.tech',
    'tryon-lab.fr',
    'vincelinise.com',
  ];

  // eslint-disable-next-line no-unused-vars
  let knownServer = '';
  const [isKnownServer, setIsKnownServer] = useState(false);
  const [serverTag, setServerTag] = useState('Serveur non vérifié');

  const theme = useTheme();

  function checkKnownServers() {
    return getConsts().then((consts) => {

      for (let i = 0; i < knownServers.length; i++) {
        if (consts.API.includes(knownServers[i])) {
          knownServer = knownServers[i];
          return true;
        }
      }

      knownServer = consts.API.split('/')[2];
      return false;
    });
  }

  checkKnownServers().then((isKnown) => {
    setIsKnownServer(isKnown);

    if (isKnown) {
      setServerTag('Serveur vérifié');
    }
  });

  function openServer() {
    if (isKnownServer) {
      navigation.navigate('OfficialServer', {
        official: true,
        server: serverInfo.server,
      });
    } else {
      navigation.navigate('OfficialServer', {
        official: false,
        server: serverInfo.server,
      });
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === 'ios' ? (
        <StatusBar animated barStyle="light-content" />
      ) : (
        <StatusBar
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
      )}

      <ScrollView
        style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        <NativeList
          inset
          header="Serveur"
        >
          <NativeItem
            leading = {
              <>
                <PapillonIcon
                  icon={<Server size={24} color={isKnownServer ? '#29947A' : '#0065A8'} />}
                  color={isKnownServer ? '#29947A' : '#0065A8'}
                  size={24}
                  small
                />

                {isKnownServer ? (
                  <View
                    style={[styles.certif, { borderColor: UIColors.element }]}
                    sharedTransitionTag="serverCheck"
                  >
                    <Check size={16} color="#ffffff" />
                  </View>
                ) : null}
              </>
            }

            trailing={
              !serverInfo.server || !serverInfo.version ? (
                <ActivityIndicator />
              ) : null
            }

            chevron
            onPress={() => openServer()}
          >
            { serverInfo.server || serverInfo.version ? (
              <>
                <NativeText heading="h4">
                  Serveur {isKnownServer ? 'vérifié' : 'non vérifié'}
                </NativeText>
                <NativeText heading="p2">
                  {serverInfo.server} v{serverInfo.version}
                </NativeText>
              </>
            ) : (
              <>
                <NativeText heading="h4">
                  Connexion au serveur...
                </NativeText>
                <NativeText heading="p2">
                  Détermination de la version...
                </NativeText>
              </>
            )}
          </NativeItem>
        </NativeList>

        <NativeList
          inset
          header="Équipe Papillon"
        >
          {team.team.map((item, index) => (
            <NativeItem
              key={index}
              leading={
                <Image
                  source={{ uri: item.avatar }}
                  style={{ width: 38, height: 38, borderRadius: 12 }}
                />
              }
              chevron
              onPress={() => openUserLink(item.link)}
            >
              <NativeText heading="h4">
                {item.name}
              </NativeText>
              <NativeText heading="p2">
                {item.role}
              </NativeText>
            </NativeItem>
          ))}
        </NativeList>

        <NativeList
          inset
          header={"Donateurs (au " + new Date(donors.lastupdated).toLocaleDateString('fr', { dateStyle: 'medium' }) + ")"}
        >
          {donors.donors.map((item, index) => (
            <NativeItem
              key={index}
              leading={
                <PapillonIcon
                  icon={<Euro size={24} color="#565EA3" />}
                  color="#565EA3"
                  size={24}
                  small
                />
              }
            >
              <NativeText heading="h4">
                {item.name}
              </NativeText>
              <NativeText heading="p2">
                à donné {item.times} fois
              </NativeText>
            </NativeItem>
          ))}
        </NativeList>

        <NativeList 
          inset
          header="Communauté"
        >
          <NativeItem
            leading={
              <PapillonIcon
                icon={<MessageCircle size={24} color="#565EA3" />}
                color="#565EA3"
                size={24}
                small
              />
            }
            chevron
            onPress={() => Linking.openURL('https://discord.getpapillon.xyz/')}
          >
            <NativeText heading="h4">
              Serveur Discord
            </NativeText>
            <NativeText heading="p2">
              Rejoindre le serveur Discord de Papillon
            </NativeText>
          </NativeItem>
        </NativeList>

        <NativeList
          inset
          header="Informations sur l'app"
        >
          {dataList.map((item, index) => (
            <NativeItem
              trailing={
                <NativeText heading="p2">
                  {item.subtitle}
                </NativeText>
              }
              key={index}
              onPress={() => navigation.navigate('Changelog')}
            >
              <NativeText heading="h4">
                {item.title}
              </NativeText>
            </NativeItem>
          ))}
        </NativeList>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    width: '100%',
    gap: 9,
    marginTop: 16,
    marginBottom: 12,
  },
  ListTitle: {
    paddingLeft: 29,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },
  certif: {
    backgroundColor: '#29947A',

    padding: 1,
    borderRadius: 8,
    alignContent: 'center',
    justifyContent: 'center',

    position: 'absolute',
    bottom: -2,
    right: -4,

    borderWidth: 2,
  },
});

export default AboutScreen;
