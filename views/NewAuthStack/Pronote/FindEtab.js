import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StatusBar, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView } from 'react-native';

import { Text } from 'react-native-paper';

import GetUIColors from '../../../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as Location from 'expo-location';

import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { MapPin, QrCode, Link2, FormInput, Server, ChevronUpSquare, School } from 'lucide-react-native';

const FindEtab = ({ navigation }) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior='automatic'
      style={[styles.container, {backgroundColor: UIColors.background}]}
    >
      <StatusBar
        animated
        barStyle={'light-content'}
      />

      <NativeList
        header="Recherche Papillon"
        inset
      >
        <NativeItem
          leading={
            <MapPin color={UIColors.primary} />
          }
          onPress={() => navigation.navigate('LocateEtab')}
        >
          <NativeText heading="h4">
            Rechercher un établissement
          </NativeText>
          <NativeText heading="p2">
            Trouver un établissement à partir d'une recherche
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList
        header="Options de PRONOTE"
        inset
      >
        <NativeItem
          leading={
            <Link2 color={UIColors.primary} />
          }
          onPress={() => navigation.navigate('LoginURL')}
        >
          <NativeText heading="h4">
            Se connecter avec une URL
          </NativeText>
          <NativeText heading="p2">
            Connectez-vous en indiquant l'URL de votre établissement
          </NativeText>
        </NativeItem>
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
            Connectez-vous en scannant le QR Code de votre espace web
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList
        header="Options avancées"
        inset
      >
        <NativeItem
          leading={
            <Server size={20} color={UIColors.text + '88'} />
          }
          onPress={() => navigation.navigate('changeServer')}
        >
          <NativeText heading="p2">
            Utiliser un serveur personnalisé
          </NativeText>
        </NativeItem>
        <NativeItem
          leading={
            <ChevronUpSquare size={20} color={UIColors.text + '88'} />
          }
          onPress={() => navigation.navigate('LoginPronoteSelectEtab')}
        >
          <NativeText heading="p2">
            Ouvrir l'ancienne interface de connexion
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  )
};

const styles = StyleSheet.create({
  
});

export default FindEtab;