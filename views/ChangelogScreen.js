import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
  Image,
} from 'react-native';

import ListItem from '../components/ListItem';

import packageJson from '../package.json';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Haptics from 'expo-haptics';

import { PressableScale } from 'react-native-pressable-scale';

import { Book, CopyMinus, Gauge, Globe2, Newspaper, Palette } from 'lucide-react-native';

import { Text, useTheme } from 'react-native-paper';
import GetUIColors from '../utils/GetUIColors';

function ChangelogScreen({ navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const features = [
    {
      title: 'Nouvel onglet Actualités',
      subtitle: 'L\'onglet actualités à été étoffé avec une interface plus intuitive.',
      icon: <Newspaper size={24} color={UIColors.text} />,
    },
    {
      title: 'Vue en détail des devoirs',
      subtitle: 'Les devoirs sont maintenant affichés en détail, avec les informations de l\'enseignant, la matière, la date de rendu, etc.',
      icon: <Book size={24} color={UIColors.text} />,
    },
    {
      title: 'Nouvelles couleurs des cours',
      subtitle: 'Vos cours sont maintenant colorés en fonction de leur matière.',
      icon: <Palette size={24} color={UIColors.text} />,
    },
  ]

  const fixes = [
    {
      title: 'Cours annulés / changements de salle',
      subtitle: 'Les changements de salle n\'apparaîteront plus comme des cours annulés.',
      icon: <CopyMinus size={24} color={UIColors.text} />,
    },
    Platform.OS === 'ios' ? {
      title: 'Navigateur web interne',
      subtitle: 'Tous les liens sont maintenant ouverts dans un navigateur web interne, plus rapide et plus sécurisé.',
      icon: <Globe2 size={24} color={UIColors.text} />,
    } : {
      title: 'Performances sous Android',
      subtitle: 'Les performances sous Android ont été améliorées.',
      icon: <Gauge size={24} color={UIColors.text} />,
    },

  ]

  return (
    <View style={{flex: 1, backgroundColor: UIColors.background}}>
      <Image
          source={require('../assets/bkg_gradient.png')}
          style={styles.headerImage}
        />
      <ScrollView
        style={[styles.container]}
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

        <View style={styles.headerChangelogTitle}>
          <Image
            source={require('../assets/cutted_appicon.png')}
            style={[styles.headerLogo, Platform.OS == 'android' ? {borderRadius: 200} : null]}
          />
          <Text style={styles.headerTitleTitle}>
            Quoi de neuf dans Papillon ?
          </Text>
          <Text style={styles.headerTitleText}>
            Papillon à été mis à jour à la version {packageJson.version}.
            Découvrons ensemble, pas-à-pas, toutes les nouvelles fonctionnalités !
          </Text>
        </View>

        <View style={styles.optionsList}>
          <Text style={[styles.ListTitle, {color: '#ffffff'}]}>Nouveautés</Text>

          {features.map((feature, index) => (
            <ListItem
              key={index}
              title={feature.title}
              subtitle={feature.subtitle}
              icon={feature.icon}
              color={UIColors.element}
              center
              width
              style={{ backgroundColor: UIColors.element + '99' }}
            />
          ))}
        </View>

        <View style={styles.optionsList}>
          <Text style={[styles.ListTitle]}>Bugs réparés</Text>

          {fixes.map((feature, index) => (
            <ListItem
              key={index}
              title={feature.title}
              subtitle={feature.subtitle}
              icon={feature.icon}
              color={UIColors.element}
              center
              width
              style={{ backgroundColor: UIColors.element + '99' }}
            />
          ))}
        </View>

        <View style={styles.optionsList}>
          <Text style={[styles.ListTitle]}>Le mot de l'équipe</Text>

          <View style={[styles.devTextContainer, {backgroundColor: UIColors.element + '99'}]}>
            <Text style={[styles.devText]}>
              Merci beaucoup d'être si nombreux à utiliser Papillon !
              J'ai hate de voir comment va continuer ce projet avec vous cette année ^^
              Cette mise à jour de rentrée est importante pour toute l'équipe et on espère qu'elle va vous plaîre !
            </Text>

            { theme.dark ? 
              <Image
                source={require('../assets/vincentimes_signature.png')}
                style={[styles.signature]}
              />
            :
              <Image
                source={require('../assets/vincentimes_signature_light.png')}
                style={[styles.signature]}
              />
            }
          </View>
        </View>

        <View style={{ height: 20 }}></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    gap: 9,
    marginTop: 16,
    marginHorizontal: 14,
  },
  ListTitle: {
    paddingLeft: 12,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },

  headerImage: {
    width: '100%',
    height: 600,
    
    position: 'absolute',
    top: 0,
    left: 0,
  },

  headerChangelogTitle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,

    paddingHorizontal: 26,

    paddingTop: 54,
    paddingBottom: 22,
  },

  headerLogo: {
    width: 64,
    height: 64,
  },

  headerTitleTitle: {
    fontSize: 22,
    fontFamily: 'Papillon-Semibold',
    textAlign: 'center',
    color: '#FFFFFF',
    marginTop: 16,
  },
  headerTitleText: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    textAlign: 'center',
    color: '#FFFFFF',
    opacity: 0.6,
    marginTop: 8,
  },

  devTextContainer: {
    padding: 12,
    borderRadius: 12,
  },
  devText: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.6,
  },

  signature: {
    width: 104,
    height: 42,
    opacity: 0.6,
    marginTop: 12,
  },
});

export default ChangelogScreen;
