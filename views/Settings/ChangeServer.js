import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  TextInput,
  Button,
} from 'react-native';

import { Text, useTheme } from 'react-native-paper';
import GetUIColors from '../../utils/GetUIColors';

import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import { Server } from 'lucide-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

function ChangeServer() {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [textInputValue, setTextInputValue] = React.useState('');
  const [currentServer, setCurrentServer] = React.useState();

  useEffect(() => {
    AsyncStorage.getItem('custom_server').then((server) => {
      if(server) {
        server = JSON.parse(server);

        if(server.custom) {
          setTextInputValue(server.url)
          setCurrentServer(server.url)
        }
        else {
          setCurrentServer(server.url)
        }
      }
      else {
        setCurrentServer('https://api.getpapillon.xyz');
      }
    });
  }, []);

  const defaultServerslist = [
    {
      title: "Papillon-API (automatique)",
      url: "https://api.getpapillon.xyz",
      pretty_url: "api.getpapillon.xyz",
      custom: false,
    },
  ]

  const officialServerslist = [
    {
      title: "Papillon-NODE-API-01",
      url: "https://api-01.getpapillon.xyz",
      pretty_url: "api-01.getpapillon.xyz",
      custom: false,
    },
    {
      title: "Papillon-NODE-API-02",
      url: "https://api-02.getpapillon.xyz",
      pretty_url: "api-02.getpapillon.xyz",
      custom: false,
    },
    {
      title: "Papillon-NODE-API-03",
      url: "https://api-03.getpapillon.xyz",
      pretty_url: "api-03.getpapillon.xyz",
      custom: false,
    },
    {
      title: "Papillon-NODE-API-04",
      url: "https://api-04.getpapillon.xyz",
      pretty_url: "api-04.getpapillon.xyz",
      custom: false,
    },
  ]

  function applyServer(server) {
    AsyncStorage.setItem('custom_server', JSON.stringify(server));

    setTextInputValue('');
    setCurrentServer(server.url);
  }

  function isValidURL(string) {
    if(string.startsWith('https://')) {
      return true
    }
    if(string.startsWith('http://')) {
      return true
    }

    return false
  };  

  function confirmURLCustom() {
    if(!isValidURL(textInputValue.trim())) {
      Alert.alert(
        'URL invalide',
        'Entrez une URL valide accessible depuis votre appareil',
        [
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );

      return;
    }

    let server = {
      title: textInputValue,
      url: textInputValue,
      pretty_url: textInputValue.replace("https://", "").replace("http://", ""),
      custom: true,
    }

    setCurrentServer(server.url);

    AsyncStorage.setItem('custom_server', JSON.stringify(server));

    Alert.alert(
      'Serveur personnalisé enregistré',
      'Papillon se connecte maintenant à '+server.pretty_url,
      [
        {
          text: 'OK',
          style: 'cancel',
        },
      ]
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
      contentInsetAdjustmentBehavior="automatic"
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

      <View style={{ gap: 9, marginTop: 16 }}>
        <Text style={styles.ListTitle}>Serveurs de base</Text>

        {defaultServerslist.map((item, index) => (
          <ListItem
            key={index}
            title={item.title}
            subtitle={item.pretty_url}
            center
            left={
              <PapillonIcon
                icon={<Server size={24} color={UIColors.primary} />}
                color={UIColors.primary}
                size={24}
                small
              />
            }
            style={[currentServer == item.url ? styles.current : styles.urlchoice]}
            onPress={() => applyServer(item)}
          />
        ))}
      </View>

      <View style={{ gap: 9, marginTop: 16 }}>
        <Text style={styles.ListTitle}>Serveurs Papillon (sélection manuelle)</Text>

        {officialServerslist.map((item, index) => (
          <ListItem
            key={index}
            title={item.title}
            subtitle={item.pretty_url}
            center
            left={
              <PapillonIcon
                icon={<Server size={24} color={UIColors.primary} />}
                color={UIColors.primary}
                size={24}
                small
              />
            }
            style={[currentServer == item.url ? styles.current : styles.urlchoice]}
            onPress={() => applyServer(item)}
          />
        ))}
      </View>

      <View style={{ gap: 9, marginTop: 16 }}>
        <Text style={styles.ListTitle}>Personnalisé</Text>

        <View style={styles.urlinput}>
          <TextInput
            placeholder="https://192.168.1.32:8000"
            style={[styles.urltext, {backgroundColor: UIColors.element, color: UIColors.text}]}
            onChangeText={text => setTextInputValue(text)}
            value={textInputValue}
          />

          <Button title="Confirmer" color={UIColors.primary} onPress={confirmURLCustom} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ListTitle: {
    paddingLeft: 29,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },

  urlinput: {
    marginHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  urltext: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 17,
    borderRadius: 12,
    flex: 1,
  },

  urlchoice: {
    borderColor: "#29947A00",
    borderWidth: 2,
  },
  current: {
    borderColor: "#29947A",
    borderWidth: 2,
    backgroundColor: "#29947A20",
  }
});

export default ChangeServer;
