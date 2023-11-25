import React, { useState, useEffect } from 'react';
import { View, StatusBar, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';

import { Text } from 'react-native-paper';

import GetUIColors from '../../../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as Location from 'expo-location';

import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';

import { MapPin, Search, X } from 'lucide-react-native';
import PapillonLoading from '../../../components/PapillonLoading';

const LocateEtab = ({ navigation }) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(false);

  const [results, setResults] = useState([]);
  const [currentSearch, setCurrentSearch] = useState('');

  function searchCity(text) {
    setCurrentSearch(text);
    if (text.length > 2) {
      setIsLoading(true);
      fetch(`https://geo.api.gouv.fr/communes?nom=${text}&fields=departement&boost=population&limit=6`)
        .then(response => response.json())
        .then(data => {
          setResults(data);
          setIsLoading(false);
        })
        .catch(error => {
        });
    }
    else {
      setResults([]);
    }
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
            <Search color={UIColors.text + '88'} />
          }
          trailing={
            isLoading ? 
              <ActivityIndicator /> : 
              currentSearch.length > 0 ?
                <TouchableOpacity
                  onPress={() => {
                    setCurrentSearch('');
                    setResults([]);
                  }}
                >
                  <X size={20} color={UIColors.text + '88'} />
                </TouchableOpacity> : null
          }
        >
          <TextInput 
            placeholder="Indiquer la ville de votre établissement"
            placeholderTextColor={UIColors.text + '88'}
            style={[styles.input, {color: UIColors.text}]}
            value={currentSearch}
            onChangeText={text => {
              searchCity(text);
            }}
            autoFocus={true}
          />
        </NativeItem>
      </NativeList>

      {!isLoading && currentSearch.length < 2 ? (
        <PapillonLoading
          icon={
            <Search color={UIColors.text} size={26} style={{margin:8}} />
          }
          title="Rechercher une ville"
          subtitle="Veuillez indiquer le nom d'une ville afin d'y rechercher un établissement"
        />
      ) : null}

      {results.length == 0 && !isLoading && currentSearch.length > 2 ? (
        <PapillonLoading
          icon={
            <Search color={UIColors.text} size={26} style={{margin:8}} />
          }
          title="Aucun résultat"
          subtitle="Le nom de la ville fourni n'a retourné aucun résultat"
        />
      ) : null}

      {results.length > 0 ? (
        <NativeList
          inset
          style={
            Platform.OS === 'ios' && {marginTop: -14}
          }
        >
          {results.map((result, index) => {
            return (
              <NativeItem
                key={index}
                leading={
                  <MapPin color={UIColors.primary} />
                }
                onPress={() => {
                  navigation.navigate('LocateEtabList', {
                    location: result,
                  });
                }}
              >
                <NativeText heading="h4">
                  {result.nom}
                </NativeText>
                <NativeText heading="p2">
                  {result.departement.nom} ({result.departement.code})
                </NativeText>
              </NativeItem>
            )
          })}
        </NativeList>
      ) : null}
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
  },
});

export default LocateEtab;