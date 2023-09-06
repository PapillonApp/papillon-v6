import * as React from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { Settings, User2, Palette, Info, Sparkles } from 'lucide-react-native';

import packageJson from '../package.json';

import ListItem from '../components/ListItem';
import PapillonIcon from '../components/PapillonIcon';

import GetUIColors from '../utils/GetUIColors';

function SettingsScreen({ navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
    >
      <StatusBar
        animated
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />

      <View style={styles.optionsList}>
        <Text style={styles.ListTitle}>Mon profil</Text>

        <ListItem
          title="Mon profil"
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
          onPress={() => navigation.navigate('Profile', { isModal: false })}
        />
      </View>

      <View style={styles.optionsList}>
        <Text style={styles.ListTitle}>Options de l'application</Text>

        <ListItem
          title="Réglages"
          subtitle="Paramètres de l’application et des comptes"
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
          title="Apparence & fonctionnalités"
          subtitle="Personnaliser et modifier l’apparence de l’application"
          color="#A84700"
          left={
            <PapillonIcon
              icon={<Sparkles size={24} color="#fff" />}
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
          title="A propos de Papillon"
          subtitle={`Papillon version ${packageJson.version} ${packageJson.canal}`}
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
    paddingBottom: 2,
  },
  ListTitle: {
    paddingLeft: 29,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },
});

export default SettingsScreen;
