import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StatusBar, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';

import { Text } from 'react-native-paper';

import { getENTs } from '../../../fetch/AuthStack/LoginFlow';

import GetUIColors from '../../../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';

import { Bird, Link2, School, Search } from 'lucide-react-native';
import PapillonLoading from '../../../components/PapillonLoading';

const LoginURL = ({ route, navigation }) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const [currentURL, setCurrentURL] = useState('');

  function login() {
    const url = currentURL;

    if (url == '' || !url.startsWith('http')) {
      Alert.alert(
        'Erreur',
        'Veuillez entrer une URL Pronote',
        [
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
      return;
    }

    getENTs(url).then((result) => {
      const etab = {
        nomEtab: result.nomEtab,
        url,
      };

      navigation.navigate('NGPronoteLogin', {
        etab,
        useDemo: false,
      });
    });
  }

  function useDemo() {
    Alert.alert(
      'Utiliser le compte démo',
      'Voulez-vous vraiment utiliser le compte démo ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Se connecter',
          isPreferred: true,
          onPress: () => {
            const url = 'https://demo.index-education.net/pronote/eleve.html';
            getENTs(url).then((result) => {
              const etab = {
                nomEtab: result.nomEtab,
                url,
              };

              navigation.navigate('NGPronoteLogin', {
                etab,
                useDemo: true,
              });
            });
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior='automatic'
      style={[styles.container, {backgroundColor: UIColors.background}]}
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
        inset
      >
        <NativeItem
          leading={
            <Link2 color={UIColors.text + '88'} />
          }
        >
          <TextInput 
            placeholder="Entrer une URL Pronote"
            placeholderTextColor={UIColors.text + '88'}
            style={[styles.input, {color: UIColors.text}]}
            value={currentURL}
            onChangeText={text => {
              setCurrentURL(text);
            }}
          />
        </NativeItem>
        <NativeItem
          onPress={() => login()}
        >
          <NativeText heading="h4" style={{color: UIColors.primary}}>
            Se connecter
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList
        inset
      >
        <NativeItem
          leading={
            <Bird color={UIColors.text + '88'} />
          }
          onPress={() => useDemo()}
        >
          <NativeText heading="h4" style={{color: UIColors.text + '88'}}>
            Utiliser le compte démo
          </NativeText>
        </NativeItem>
      </NativeList>

    </ScrollView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  input: {
    fontSize: 16,
    fontFamily: 'Papillon-Medium',
    paddingVertical: 4,
  },
});

export default LoginURL;