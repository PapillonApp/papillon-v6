import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, StatusBar, ScrollView, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

import { SFSymbol } from 'react-native-sfsymbols';

import GetUIColors from '../utils/GetUIColors';

import { IconsList } from './Settings/IconSelectScreen';
import { getAppIcon } from 'expo-dynamic-app-icon';

import AsyncStorage from '@react-native-async-storage/async-storage';

import packageJson from '../package.json';
import { useAppContext } from '../utils/AppContext';
import type { PapillonUser } from '../fetch/types/user';
import PapillonCloseButton from '../interface/PapillonCloseButton';

function NewSettings({ navigation }: {
  navigation: any // TODO
}) {
  const UIColors = GetUIColors();

  // User data
  const theme = useTheme();
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

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Préférences',
      headerRight: () => (
        <PapillonCloseButton
          onPress={() => navigation.goBack()}
        />
      ),
      headerTransparent: false,
    });
  });

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
      contentInsetAdjustmentBehavior='automatic'
      style={{
        backgroundColor: UIColors.modalBackground,
      }}
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

      <NativeList
        inset
        sideBar
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
            chevron
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
      </NativeList>

      <NativeList
        inset
        sideBar
        style={{
          marginTop: -14,
        }}
      >
        <NativeItem
          leading={
            <View
              style={[
                styles.item.leadingContainer,
                {
                  backgroundColor: '#0065A8',
                }
              ]}
            >
              <SFSymbol
                name="trophy.fill"
                weight="semibold"
                size={16}
                color="#ffffff"
                style={styles.item.symbol}
              />
            </View>
          }
          chevron
          onPress={() => navigation.navigate('TrophiesScreen')}
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
        style={{
          marginTop: -14,
        }}
      >
        {/* <NativeItem
          leading={
            <View
              style={[
                styles.item.leadingContainer,
                {
                  backgroundColor: '#9266CC',
                }
              ]}
            >
              <SFSymbol
                name="paintbrush.fill"
                weight="semibold"
                size={18}
                color="#ffffff"
                style={styles.item.symbol}
              />
            </View>
          }
          chevron
          onPress={() => navigation.navigate('Adjustments')}
        >
          <NativeText heading="h4">
            Ajustements & thèmes
          </NativeText>
          <NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>
            Personnalisation de l'interface, bandeaux et navigation
          </NativeText>
        </NativeItem> */}
        <NativeItem
          leading={
            <View
              style={[
                styles.item.leadingContainer,
                {
                  backgroundColor: '#c73620',
                }
              ]}
            >
              <SFSymbol
                name="bell.fill"
                weight="semibold"
                size={18}
                color="#ffffff"
                style={styles.item.symbol}
              />
            </View>
          }
          chevron
          onPress={() => navigation.navigate('Notifications')}
        >
          <NativeText heading="h4">
            Notifications
          </NativeText>
          <NativeText heading="p" style={{ opacity: 0.6, fontSize: 15 }}>
            Personnalisation des notifications
          </NativeText>
        </NativeItem>
        <NativeItem
          leading={
            <View
              style={[
                styles.item.leadingContainer,
                {
                  backgroundColor: '#565EA3',
                }
              ]}
            >
              <SFSymbol
                name="gear"
                weight="semibold"
                size={18}
                color="#ffffff"
                style={styles.item.symbol}
              />
            </View>
          }
          chevron
          onPress={() => navigation.navigate('Settings')}
        >
          <NativeText heading="h4">
            Réglages
          </NativeText>
          <NativeText heading="p" style={{ opacity: 0.6, fontSize: 15 }}>
            Connexion à votre compte et au serveur
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList
        inset
        sideBar
        style={{
          marginTop: -14,
        }}
      >
        <NativeItem
          leading={
            <View
              style={[
                styles.item.leadingContainer,
                {
                  backgroundColor: '#7a9543',
                }
              ]}
            >
              <SFSymbol
                name="swatchpalette.fill"
                weight="semibold"
                size={16}
                color="#ffffff"
                style={styles.item.symbol}
              />
            </View>
          }
          chevron
          onPress={() => navigation.navigate('CoursColor')}
        >
          <NativeText heading="h4">
            Couleur des matières
          </NativeText>
          <NativeText heading="p" style={{ opacity: 0.6, fontSize: 15 }}>
            Personnalisation des matières
          </NativeText>
        </NativeItem>
        <NativeItem
          leading={currentIcon &&
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
          chevron
          onPress={() => navigation.navigate('IconSelect')}
        >
          <NativeText heading="h4">
            Icône de l'application
          </NativeText>
          <NativeText heading="p" style={{ opacity: 0.6, fontSize: 15 }}>
            Modifier l'icône de l'application
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList
        inset
        sideBar
        style={{
          marginTop: -14,
        }}
      >
        <NativeItem
          leading={
            <View
              style={[
                styles.item.leadingContainer,
                {
                  backgroundColor: '#ebba34',
                }
              ]}
            >
              <SFSymbol
                name="eurosign.circle.fill"
                weight="semibold"
                size={18}
                color="#ffffff"
                style={styles.item.symbol}
              />
            </View>
          }
          chevron
          onPress={() => navigation.navigate('PaymentScreen')}
        >
          <NativeText heading="h4">
            Soutenir Papillon
          </NativeText>
        </NativeItem>
        {devMode ? (
          <NativeItem
            leading={
              <View
                style={[
                  styles.item.leadingContainer,
                  {
                    backgroundColor: '#888888',
                  }
                ]}
              >
                <SFSymbol
                  name="flask"
                  weight="semibold"
                  size={18}
                  color="#ffffff"
                  style={styles.item.symbol}
                />
              </View>
            }
            chevron
            onPress={() => navigation.navigate('DevSettings')}
          >
            <NativeText heading="h4">
              Options de développement
            </NativeText>
            <NativeText heading="p" style={{ opacity: 0.6, fontSize: 15 }}>
              ┬─┬ノ( º _ ºノ)
            </NativeText>
          </NativeItem>
        ) : null}
        <NativeItem
          leading={
            <View
              style={[
                styles.item.leadingContainer,
                {
                  backgroundColor: '#888888',
                }
              ]}
            >
              <SFSymbol
                name="info.circle"
                weight="semibold"
                size={18}
                color="#ffffff"
                style={styles.item.symbol}
              />
            </View>
          }
          chevron
          onPress={() => navigation.navigate('About')}
        >
          <NativeText heading="h4">
            À propos
          </NativeText>
          <NativeText heading="p" style={{ opacity: 0.6, fontSize: 15 }}>
            Papillon version {packageJson.version}
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profile: {
    container: {
      marginVertical: 0,
      paddingVertical: 5,
    },
    pic: {
      width: 42,
      height: 42,
      borderRadius: 50,
      marginVertical: 9,
    },
    textContainer: {
      gap: 2,
    },
  },

  item: {
    leadingContainer: {
      width: 28,
      height: 28,
      borderRadius: 8,
      borderCurve: 'continuous',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    symbol: {
    },
  },

  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },

  iconImage: {
    width: '100%',
    height: '100%',
  },
});

export default NewSettings;
