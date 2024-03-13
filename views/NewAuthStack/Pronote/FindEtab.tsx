import React, { useLayoutEffect } from 'react';

import { View, StatusBar, StyleSheet, ScrollView } from 'react-native';
import { MapPin, QrCode, Link2 } from 'lucide-react-native';

import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';

import GetUIColors from '../../../utils/GetUIColors';

const FindEtab = ({ navigation }: {
  navigation: any // TODO
}) => {
  const UIColors = GetUIColors();

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
      style={{ backgroundColor: UIColors.background }}
    >
      <StatusBar
        animated
        barStyle={UIColors.dark ? 'light-content' : 'dark-content'}
        backgroundColor={'transparent'}
      />

      <NativeList
        header="Recommandations Papillon"
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
          <View style={[styles.recommended, {backgroundColor: UIColors.primary}]}>
            <NativeText style={{ color: '#ffffff' }}>
              Le plus rapide
            </NativeText>
          </View>
          <NativeText heading="h4" style={{ flex: 1 }}>
            Me localiser ou rechercher une ville
          </NativeText>
          <NativeText heading="p2">
            Trouver les établissements à proximité
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList
        header="Options avancées"
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

const styles = StyleSheet.create({
  instructionsText: {
    fontSize: 16,
    fontFamily: 'Papillon-Medium',
    paddingHorizontal: 16,
    paddingVertical: 6,
    opacity: 0.5,
  },

  recommended: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderCurve: 'continuous',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
});

export default FindEtab;
