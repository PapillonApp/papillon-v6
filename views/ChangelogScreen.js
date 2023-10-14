/* eslint-disable global-require */
import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
  Image,
} from 'react-native';

import { Calendar, BarChart3, Palette, Bug } from 'lucide-react-native';

import { Text, useTheme } from 'react-native-paper';
import packageJson from '../package.json';
import ListItem from '../components/ListItem';
import GetUIColors from '../utils/GetUIColors';

function ChangelogScreen() {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const features = [
    {
      title: "Améliorations de l'interface iOS",
      subtitle: "Des légers changements d'interface sont apparus.",
      icon: <Palette size={24} color={UIColors.text} />,
    },
  ];

  const fixes = [
    {
      title: 'Cours annulés / changements de salle',
      subtitle:
        "Les changements de salle n'apparaîteront VRAIMENT plus comme des cours annulés.",
      icon: <Bug size={24} color={UIColors.text} />,
    },
    {
      title: 'Langue du calendrier',
      subtitle:
        'Les dates apparaîssent maintenant dans la bonne langue sous iOS.',
      icon: <Calendar size={24} color={UIColors.text} />,
    },
    {
      title: 'Affichage des notes',
      subtitle:
        'Les notes ne se divisent et ne se modifient plus à leur ouverture.',
      icon: <BarChart3 size={24} color={UIColors.text} />,
    },
  ];

  // Easter egg (allez voir :))
  function monTelephoneAunTresTresTresGrosProbleme() {
    Linking.openURL('https://www.youtube.com/watch?v=U8R2NgcRBc0');
  }

  return (
    <View style={{ flex: 1, backgroundColor: UIColors.background }}>
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
            style={[
              styles.headerLogo,
              Platform.OS === 'android' ? { borderRadius: 200 } : null,
            ]}
          />
          <Text style={styles.headerTitleTitle}>
            Quoi de neuf dans Papillon ?
          </Text>
          <Text style={styles.headerTitleText}>
            Papillon à été mis à jour à la version {packageJson.version}.
            Découvrons ensemble, pas-à-pas, toutes les nouvelles fonctionnalités
            !
          </Text>
        </View>

        <View style={styles.optionsList}>
          <Text style={[styles.ListTitle, { color: '#ffffff' }]}>
            Nouveautés
          </Text>

          {features.map((feature, index) => (
            <ListItem
              key={index}
              title={feature.title}
              subtitle={feature.subtitle}
              icon={feature.icon}
              color={UIColors.element}
              center
              width
              style={{ backgroundColor: `${UIColors.element}99` }}
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
              style={{ backgroundColor: `${UIColors.element}99` }}
            />
          ))}
        </View>

        <View style={styles.optionsList}>
          <Text style={[styles.ListTitle]}>Le mot de l'équipe</Text>

          <View
            style={[
              styles.devTextContainer,
              { backgroundColor: `${UIColors.element}99` },
            ]}
          >
            <Text style={[styles.devText]}>
              Malgré les bugs et difficultés, on travaille d'arrache pied pour
              faire de Papillon la meilleure app de vie scolaire {'<3'} Restez à
              l'affut, des trucs cools arrivent vite ^^
            </Text>

            {theme.dark ? (
              <Image
                source={require('../assets/vincentimes_signature.png')}
                style={[styles.signature]}
              />
            ) : (
              <Image
                source={require('../assets/vincentimes_signature_light.png')}
                style={[styles.signature]}
              />
            )}
          </View>
        </View>

        <View style={{ height: 20 }} />
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

  headerImageContainer: {
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
