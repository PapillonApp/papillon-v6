import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StatusBar, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';

import { Text } from 'react-native-paper';

import { getENTs } from '../../../fetch/AuthStack/LoginFlow';

import GetUIColors from '../../../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';

import { School } from 'lucide-react-native';
import PapillonLoading from '../../../components/PapillonLoading';

const LocateEtabList = ({ route, navigation }) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const location = route.params.location;
  const [isLoading, setIsLoading] = useState(false);

  const [isEtabLoading, setIsEtabLoading] = useState(false);

  const [results, setResults] = useState(null);
  const [finalResults, setFinalResults] = useState([]);

  function openEtab(etab) {
    let ident = etab.identifiant_de_l_etablissement.toLowerCase();
    let domain = 'index-education.net';

    const bretagneToutatice = ['022', '029', '035', '056'];
    if (bretagneToutatice.includes(ident.substring(0, 3))) {
      domain = 'pronote.toutatice.fr';
    }

    let finalURL = `https://${ident}.${domain}/pronote/eleve.html`;

    setIsEtabLoading(true);
    getENTs(finalURL).then((result) => {
      setIsEtabLoading(false);

      const etab = {
        nomEtab: result.nomEtab,
        url: finalURL,
      };

      navigation.navigate('NGPronoteLogin', { etab });
    }).catch((error) => {
      setIsEtabLoading(false);
      Alert.alert(
        'Méthode de connexion indisponible',
        'Impossible de trouver l\'adresse PRONOTE de cet établissement.',
        [
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    });
  }

  // change the header title
  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: location.nom,
      headerRight: () => (
        isEtabLoading ? (
          <ActivityIndicator />
        ) : null
      )
    });
  }, [isLoading, isEtabLoading]);

  useEffect(() => {
    if(results !== null) {
      return;
    }

    setIsLoading(true);
    fetch(`https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records?limit=20&refine=code_commune%3A%22${location.code}%22&where=type_etablissement%3A%22Lyc%C3%A9e%22%20OR%20%22Coll%C3%A8ge%22`)
      .then(response => response.json())
      .then(data => {
        setIsLoading(false);
        setResults(data);
        setFinalResults(data);
      })
      .catch(error => {
      });
  });

  // add a native search bar
  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: 'Rechercher un établissement',
        onChangeText: (data) => {
          const text = data.nativeEvent.text;
          if (text.length > 2) {
            setResults({
              results: finalResults.results.filter((result) => {
                return result.nom_etablissement.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ""));
              })
            });
          }
          else {
            setResults(finalResults);
          }
        },
        cancelButtonText: 'Annuler',
        hideWhenScrolling: false,
      },
    });
  }, [results]);

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

      {isLoading && (
        <PapillonLoading 
          title="Recherche en cours"
          subtitle="Veuillez patienter pendant que nous recherchons les établissements"
        />
      )}

      {!isLoading && results !== null && results.results.length == 0 && (
        <PapillonLoading 
          icon={
            <School color={UIColors.text} size={26} style={{margin:8}} />
          }
          title="Aucun établissement trouvé"
          subtitle={`Aucun établissement n'a été trouvé dans la ville de ${location.nom} (${location.departement.nom})`}
        />
      )}

      <View style={{padding: 8}}/>

      {!isLoading && results !== null && results.results.length > 0 ? (
        <NativeList
          inset
          style={{marginTop: -14}}
        >
          {results.results.map((result, index) => {
            return (
              <NativeItem
                key={index}
                leading={
                  <School color={UIColors.primary} />
                }
                onPress={() => {
                  openEtab(result);
                }}
              >
                <View 
                  style={[
                    result.statut_public_prive === 'Privé' ? {opacity: 0.5} : null,
                  ]}
                />
                <NativeText heading="h4">
                  {result.nom_etablissement}
                </NativeText>
                <NativeText heading="subtitle2">
                  {result.type_etablissement} {result.statut_public_prive.toLowerCase()} {result.nombre_d_eleves ? '(' + result.nombre_d_eleves + ' élèves)' : ''}
                </NativeText>

                <NativeText heading="subtitle1">
                  {result.adresse_1}
                </NativeText>
              </NativeItem>
            )
          })}
        </NativeList>
      ) : null}

      <View style={{padding: 8}}/>

    </ScrollView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});

export default LocateEtabList;