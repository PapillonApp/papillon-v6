import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StatusBar, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView, Platform } from 'react-native';

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
      style={[styles.container, {backgroundColor: UIColors.modalBackground}]}
    >
      <StatusBar
        animated
        barStyle={
          Platform.OS === 'ios' ?
            'light-content'
            :
            UIColors.theme == 'light' ?
              'dark-content'
              :
              'light-content'
        }
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
          
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
            <NativeText heading="h4" style={{flex: 1}}>
              Trouver mon collège ou mon lycée
            </NativeText>
            <NativeText heading="h4" style={{paddingHorizontal: 10, paddingVertical: 5, backgroundColor: UIColors.primary + '22', borderRadius: 5, alignSelf: 'flex-start', color: UIColors.primary, overflow: 'hidden', marginRight: -10}}>
                Recommandé
            </NativeText>
          </View>
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
            Utiliser une URL Pronote
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
      </NativeList>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  
});

export default FindEtab;
