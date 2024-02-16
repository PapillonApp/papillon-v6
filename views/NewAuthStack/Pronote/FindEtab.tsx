import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { useTheme } from 'react-native-paper';

import { StatusBar, ScrollView, Platform } from 'react-native';
import { MapPin, QrCode, Link2 } from 'lucide-react-native';

import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';

import GetUIColors from '../../../utils/GetUIColors';

const FindEtab = ({ navigation }) => {
  const UIColors = GetUIColors();
  const theme = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Méthodes de connexion',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: UIColors.background,
      },
    });
  }, [UIColors]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior='automatic'
      style={theme.dark ? { backgroundColor: UIColors.background }: {}}
    >
      <StatusBar
        animated
        barStyle={UIColors.dark ? 'light-content' : 'dark-content'}
        backgroundColor={UIColors.background}
      />

      <NativeList
        header="Recommandations Papillon"
        inset
      >
        <NativeItem
          leading={
            <QrCode color={UIColors.primary} />
          }
          onPress={() => navigation.navigate('NewPronoteQR')}
        >
          <NativeText heading="h4">
            Se connecter avec un QR Code
          </NativeText>
          <NativeText heading="p2">
            Connexion instantanée
          </NativeText>
        </NativeItem>
        <NativeItem
          leading={<MapPin color={UIColors.primary} />}
          onPress={() => navigation.navigate('LocateEtab')}
        >
          <NativeText heading="h4" style={{ flex: 1 }}>
            Rechercher votre ville
          </NativeText>
          <NativeText heading="p2">
            À partir d'une recherche
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList
        header="Options avancées"
        inset
      >
        <NativeItem
          leading={
            <Link2 color={UIColors.primary} />
          }
          onPress={() => navigation.navigate('LoginURL')}
        >
          <NativeText heading="h4">
            Utiliser l'URL fournie par l'établissement
          </NativeText>
        </NativeItem>
        
      </NativeList>
    </ScrollView>
  );
};

const styles = {
  instructionsText: {
    fontSize: 16,
    fontFamily: 'Papillon-Medium',
    paddingHorizontal: 16,
    paddingVertical: 6,
    opacity: 0.5,
  },
};

export default FindEtab;
