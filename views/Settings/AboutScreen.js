import * as React from 'react';
import { View, ScrollView, StatusBar, StyleSheet, Image, Platform } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';

import * as WebBrowser from 'expo-web-browser';

import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import consts from '../../fetch/consts.json';
import packageJson from '../../package.json';
import donors from './Donateurs.json';
import team from './Team.json';

console.log(donors);

import { useState, useEffect } from 'react';

import { Server, Euro, User, Wrench, History, Bug, Check } from 'lucide-react-native';

import { getInfo } from '../../fetch/AuthStack/LoginFlow';

function AboutScreen({ navigation }) {
  const theme = useTheme();
  const [serverInfo, setServerInfo] = useState({});

  function openUserLink(url) {
    WebBrowser.openBrowserAsync(url);
  }

  const [dataList, setDataList] = useState([
    {
      title: 'Version de Papillon',
      subtitle: packageJson.version,
      color: '#888',
      icon: <History size={24} color="#888" />
    },
    {
      title: 'Canal de distribution',
      subtitle: packageJson.canal,
      color: '#888',
      icon: <Bug size={24} color="#888" />
    }
  ]);

  useEffect(() => {
    getInfo().then((data) => {
      setServerInfo(data);
    });
  }, []);

  return (
    <View style={{flex: 1}}>
      {Platform.OS === 'ios' ? (
        <StatusBar animated backgroundColor="#000" barStyle={'light-content'} />
      ) : null}
      <ScrollView contentInsetAdjustmentBehavior="automatic">

        <View style={[styles.optionsList]}>
          <Text style={styles.ListTitle}>Serveur</Text>

          <ListItem
            title="Serveur"
            subtitle={serverInfo.server + " v" + serverInfo.version}
            color="#29947A"
            left={
              <>
                <PapillonIcon
                  icon={<Server size={24} color="#29947A" />}
                  color="#29947A"
                  size={24}
                  small
                />

                { consts.API.endsWith("getpapillon.xyz") ?
                <View style={[styles.certif, {borderColor: theme.dark ? '#111' : '#fff'}]}>
                  <Check size={16} color="#ffffff" />
                </View>
                : null }
              </>
            }
          />
        </View>

        <View style={styles.optionsList}>
          <Text style={styles.ListTitle}>Team Papillon</Text>

          {team.team.map((item, index) => {
            return(
              <ListItem
                key={index}
                title={item.name}
                subtitle={item.role}
                color="#565EA3"
                left={
                  <Image
                    source={{uri: item.avatar}}
                    style={{width: 38, height: 38, borderRadius: 12}}
                  />
                }
                onPress={() => openUserLink(item.link)}
              />
            )
          })}
        </View>

        <View style={styles.optionsList}>
          <Text style={styles.ListTitle}>Donateurs (mis à jour le {new Date(donors.lastupdated).toLocaleDateString('fr')})</Text>

          {donors.donors.map((item, index) => {
            return(
              <ListItem
                key={index}
                title={item.name}
                subtitle={item.name + " à donné " + item.times + " fois"}
                color="#565EA3"
                left={
                  <PapillonIcon
                    icon={<Euro size={24} color="#565EA3" />}
                    color="#565EA3"
                    size={24}
                    small
                  />
                }
              />
            )
          })}
        </View>

        <View style={styles.optionsList}>
          <Text style={styles.ListTitle}>Informations sur l'app</Text>
          {dataList.map((item, index) => {
            return (
              <ListItem
                key={index}
                title={item.title}
                subtitle={item.subtitle}
                color={item.color}
                left={
                  <PapillonIcon
                    icon={item.icon}
                    color={item.color}
                    size={24}
                    small
                  />
                }
              />
            )
          })}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    width: '100%',
    gap: 9,
    marginTop: 21,
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
  }
});

export default AboutScreen;