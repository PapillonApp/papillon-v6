import * as React from 'react';
import { View, Image, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';

import { useEffect, useState } from 'react';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

import { SFSymbol } from "react-native-sfsymbols";

import GetUIColors from '../utils/GetUIColors';

import { Cell, Section, TableView } from 'react-native-tableview-simple';
import PapillonInsetHeader from '../components/PapillonInsetHeader';

import packageJson from '../package.json';
import { useAppContext } from '../utils/AppContext';

function NewSettings({navigation}) {
  const UIColors = GetUIColors();

  // User data
  const [userData, setUserData] = useState({});
  const [profilePicture, setProfilePicture] = useState('');

  const appctx = useAppContext();

  useEffect(() => {
    appctx.dataprovider.getUser(false).then((result) => {
      setUserData(result);
      setProfilePicture(result.profile_picture);
    });
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Préférences',
      headerStyle: {
        backgroundColor: UIColors.modalBackground,
      },
      headerShadowVisible: false,
    });
  });

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
        { userData && userData.name ? (
          <NativeItem
            style={
              styles.profile.container
            }
            leading={
              profilePicture  ?
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
              <NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>
                Personnaliser le profil Papillon
              </NativeText>
            </View>
          </NativeItem>
        ) : null }
      </NativeList>

      <NativeList
        inset
        sideBar
      >
        <NativeItem
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
            Ajustements
          </NativeText>
          <NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>
            Personnalisation de l'interface
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
          <NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>
            Comptes et serveurs
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList
        inset
        sideBar
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
            Gestion des matières
          </NativeText>
          <NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>
            Personnaliser les matières
          </NativeText>
        </NativeItem>
        <NativeItem
          leading={
            <View
              style={[
                styles.item.leadingContainer,
                {
                  backgroundColor: '#A84700',
                }
              ]}
            >
              <SFSymbol
                name="sparkles"
                weight="semibold"
                size={18}
                color="#ffffff"
                style={styles.item.symbol}
              />
            </View>
          }
          chevron
          onPress={() => navigation.navigate('Icons')}
        >
          <NativeText heading="h4">
            Icône de l'application
          </NativeText>
          <NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>
            Modifier l'icône de l'application
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList
        inset
        sideBar
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
          A propos
          </NativeText>
          <NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>
            Papillon version {packageJson.version} {packageJson.canal}
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
      width: 48,
      height: 48,
      borderRadius: 50,
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
});

export default NewSettings;