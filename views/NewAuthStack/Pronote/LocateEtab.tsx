import React from 'react';

import { StatusBar, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { MapPin, Search, X } from 'lucide-react-native';

import GetUIColors from '../../../utils/GetUIColors';
import useDebounce from '../../../hooks/useDebounce';

import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';
import PapillonLoading from '../../../components/PapillonLoading';


const GEO_API_URL = 'https://geo.api.gouv.fr/communes?fields=departement&boost=population&limit=6';

const LocateEtab = ({ navigation }) => {
  const UIColors = GetUIColors();

  const [results, setResults] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentSearch, setCurrentSearch] = React.useState('');
  const debouncedCurrentSearch = useDebounce(currentSearch, 175);

  const textInputRef = React.createRef<TextInput>();

  // Focus on input when screen transition is done
  // and and when it's the first time its opened.
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', () => {
      textInputRef.current?.focus();
    });
    
    return unsubscribe;
  }, [navigation]);

  // When the user stops typing (detected by debounce)
  // we send a request to a geo-api.
  React.useEffect(() => {
    (async () => {
      if (debouncedCurrentSearch.length <= 2) {
        setIsLoading(false);
        setResults([]);
        return;
      }
  
      const uri = new URL(GEO_API_URL);
      uri.searchParams.set('nom', debouncedCurrentSearch);
      
      try { // to make the request to geo-api.
        const response = await fetch(uri.toString());
        const data = await response.json();
  
        setResults(data);
      }
      catch { // any error to reset states.
        setResults([]);
      }
      finally {
        setIsLoading(false);
      }
    })();
  }, [debouncedCurrentSearch]);

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
            ref={textInputRef}
            placeholder="Indiquer le nom d'une ville"
            placeholderTextColor={UIColors.text + '88'}
            style={[styles.input, { color: UIColors.text }]}
            value={currentSearch}
            onChangeText={(text) => {
              setCurrentSearch(text);
              setIsLoading(true);
            }}
          />
        </NativeItem>
      </NativeList>

      {!isLoading && currentSearch.length < 2 ? (
        <PapillonLoading
          icon={<Search color={UIColors.text} size={26} style={{ margin: 8 }} />}
          title="Rechercher une ville"
          subtitle="Veuillez indiquer le nom d'une ville afin d'y rechercher un établissement"
        />
      ) : null}

      {results.length == 0 && !isLoading && currentSearch.length > 2 ? (
        <PapillonLoading
          icon={<Search color={UIColors.text} size={26} style={{ margin: 8 }} />}
          title="Aucun résultat"
          subtitle="Le nom de la ville fourni n'a retourné aucun résultat"
        />
      ) : null}

      {results.length > 0 ? (
        <NativeList
          inset
          style={
            Platform.OS === 'ios' && { marginTop: -14 }
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
            );
          })}
        </NativeList>
      ) : null}
    </ScrollView>
  );
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
