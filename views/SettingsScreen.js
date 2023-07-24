import * as React from 'react';
import { View, ScrollView, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';

import PapillonHeader from '../components/PapillonHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import packageJson from '../package.json';

import ListItem from '../components/ListItem';
import PapillonIcon from '../components/PapillonIcon';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Settings, User2, Palette, Info } from 'lucide-react-native';

import {refreshToken, expireToken} from '../fetch/AuthStack/LoginFlow';

function SettingsScreen({ navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const logout = () => {
    AsyncStorage.removeItem('token');
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>
        <View style={styles.optionsList}>
          <Text style={styles.ListTitle}>Mon profil</Text>

          <ListItem
            title="Profil"
            subtitle="Configurez votre compte Papillon, votre pseudonyme, votre photo de profil..."
            color="#29947A"
            left={
              <PapillonIcon
                icon={<User2 size={24} color="#fff" />}
                color="#29947A"
                size={24}
                fill
                small
              />
            }
            onPress={() => navigation.navigate('Profile')}
          />
        </View>

        <View style={styles.optionsList}>
          <Text style={styles.ListTitle}>Options de l'application</Text>

          <ListItem
            title="Réglages"
            subtitle="Paramètres de l’application et modification de son comportement"
            color="#565EA3"
            left={
              <PapillonIcon
                icon={<Settings size={24} color="#fff" />}
                color="#565EA3"
                size={24}
                fill
                small
              />
            }
            onPress={() => navigation.navigate('Settings')}
          />

          <ListItem
            title="Apparence"
            subtitle="Personnaliser et modifier l’apparence de l’application"
            color="#A84700"
            left={
              <PapillonIcon
                icon={<Palette size={24} color="#fff" />}
                color="#A84700"
                size={24}
                fill
                small
              />
            }
            onPress={() => navigation.navigate('Appearance')}
          />
        </View>

        <View style={styles.optionsList}>
          <Text style={styles.ListTitle}>A propos</Text>

          <ListItem
            title="A propos"
            subtitle={"Papillon version " + packageJson.version}
            color="#888888"
            left={
              <PapillonIcon
                icon={<Info size={24} color="#fff" />}
                color="#888888"
                size={24}
                fill
                small
              />
            }
            onPress={() => navigation.navigate('About')}
          />
        </View>

    </ScrollView>
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
  }
});

export default SettingsScreen;