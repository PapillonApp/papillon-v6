import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Text, Image, StatusBar } from 'react-native';

import GetUIColors from '../utils/GetUIColors';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

import packageJson from '../package.json';
import { useAppContext } from '../utils/AppContext';
import type { PapillonUser } from '../fetch/types/user';

import {
  Bell,
  Settings,
  Trophy,
  PaintBucket,
  Sparkles,
  Euro,
  Info,
  FlaskConical,
} from 'lucide-react-native';

import { IconsList } from './Settings/IconSelectScreen';
import { getAppIcon } from 'expo-dynamic-app-icon';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const UIColors = GetUIColors();

  // User data
  const [userData, setUserData] = useState<PapillonUser | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | undefined>('');
  const [devMode, setDevMode] = React.useState(false);
  const appContext = useAppContext();

  useEffect(() => {
    (async () => {
      if (!appContext.dataProvider) return;
      const user = await appContext.dataProvider.getUser();

      setUserData(user);
      setProfilePicture(user.profile_picture);
    })();
  }, [appContext.dataProvider]);

  // icon
  const [currentIcon, setCurrentIcon] = useState<string | null>(null);

  // on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setCurrentIcon(getAppIcon() || 'classic');

      AsyncStorage.getItem("devMode").then((v) => {
        if (v) setDevMode(true);
      });
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView
      style={{
        backgroundColor: UIColors.background,
      }}
    >
      <StatusBar translucent backgroundColor={UIColors.background} barStyle={UIColors.dark ? 'light-content' : 'dark-content'} />

      <NativeList
        inset
        sideBar
        style={[
          styles.list
        ]}
      >
        {userData && userData.name ? (
          <NativeItem
            style={[
              styles.profile.container,
            ]}
            leading={
              profilePicture ?
                <Image
                  style={styles.profile.pic}
                  source={{
                    uri: profilePicture,
                  }}
                />
                : null
            }
            onPress={() => navigation.navigate('Profile', { isModal: false })}
          >
            <View style={styles.profile.textContainer}>
              <NativeText heading="h3">
                {userData.name}
              </NativeText>
              <NativeText heading="p" style={{ opacity: 0.6, fontSize: 15 }}>
                Personnaliser le profil Papillon
              </NativeText>
            </View>
          </NativeItem>
        ) : null}

        <NativeItem
          onPress={() => navigation.navigate('TrophiesScreen')}
          leading={
            <Trophy size={24} color={UIColors.primary} />
          }
        >
          <NativeText heading="h4">
            Trophées
          </NativeText>
          <NativeText heading="p2">
            Votre progression sur Papillon
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList
        inset
        sideBar
        style={[
          styles.list
        ]}
      >
        <NativeItem
          onPress={() => navigation.navigate('Notifications')}
          leading={
            <Bell size={24} color={UIColors.primary} />
          }
        >
          <NativeText heading="h4">
            Notifications
          </NativeText>
          <NativeText heading="p2">
            Gérer vos alertes et notifications
          </NativeText>
        </NativeItem>
        <NativeItem
          onPress={() => navigation.navigate('Settings')}
          leading={
            <Settings size={24} color={UIColors.primary} />
          }
        >
          <NativeText heading="h4">
            Réglages
          </NativeText>
          <NativeText heading="p2">
            Personnaliser le comportement de l'application
          </NativeText>
        </NativeItem>
        <NativeItem
          onPress={() => navigation.navigate('CoursColor')}
          leading={
            <PaintBucket size={24} color={UIColors.primary} />
          }
        >
          <NativeText heading="h4">
            Couleur des matières
          </NativeText>
          <NativeText heading="p2">
            Personnaliser les couleurs des matières
          </NativeText>
        </NativeItem>
        <NativeItem
          onPress={() => navigation.navigate('IconSelect')}
          leading={
            <View
              style={[
                styles.iconContainer
              ]}
            >
              <Image
                source={IconsList.find((icon) => icon.name === currentIcon)?.icon}
                style={styles.iconImage}
              />
            </View>
          }
        >
          <NativeText heading="h4">
            Icône de l'application
          </NativeText>
          <NativeText heading="p2">
            Choisir une icône pour Papillon
          </NativeText>
        </NativeItem>
        {devMode ? <NativeItem
          onPress={() => navigation.navigate('DevSettings')}
          leading={
            <FlaskConical size={24} color={UIColors.primary} />
          }
        >
          <NativeText heading="h4">
            Options de développement
          </NativeText>
          <NativeText heading="p2">
            ┬─┬ノ( º _ ºノ)
          </NativeText>
        </NativeItem> : null}
      </NativeList>

      <NativeList
        inset
        sideBar
        style={[
          styles.list
        ]}
      >
        <NativeItem
          onPress={() => navigation.navigate('PaymentScreen')}
          leading={
            <Euro size={24} color={UIColors.primary} />
          }
        >
          <NativeText heading="h4">
            Soutenir Papillon
          </NativeText>
        </NativeItem>
        <NativeItem
          onPress={() => navigation.navigate('About')}
          leading={
            <Info size={24} color={UIColors.primary} />
          }
        >
          <NativeText heading="h4">
            À propos
          </NativeText>
          <NativeText heading="p2">
            Papillon version {packageJson.version}
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  profile: {
    container: {
      marginVertical: 0,
      paddingVertical: 0,
    },
    pic: {
      width: 42,
      height: 42,
      borderRadius: 50,
      marginVertical: 2,
    },
    textContainer: {
      gap: 2,
    },
  },

  list: {
    marginTop: 6,
    marginBottom: 10,
  },

  iconContainer: {
    width: 30,
    height: 30,
    margin: -3,
    borderRadius: 300,
    overflow: 'hidden',
  },

  iconImage: {
    width: '100%',
    height: '100%',
  },
});

export default SettingsScreen;