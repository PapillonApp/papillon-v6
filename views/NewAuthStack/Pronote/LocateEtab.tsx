import React from 'react';
import {
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Locate, MapPin, Search, X } from 'lucide-react-native';

import GetUIColors from '../../../utils/GetUIColors';
import useDebounce from '../../../hooks/useDebounce';

import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';
import PapillonLoading from '../../../components/PapillonLoading';
import { getGeographicMunicipalities, type GeographicMunicipality } from '../../../fetch/geolocation/geo-gouv';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as Location from 'expo-location';

const LocateEtab = ({ navigation }: {
  navigation: any // TODO
}) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const [results, setResults] = React.useState<GeographicMunicipality[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentSearch, setCurrentSearch] = React.useState('');
  const [isLocalisation, setIsLocalisation] = React.useState(false);
  const [locateState, setLocateState] = React.useState('En attente de la permission...');
  const [locatePermIssue, setLocatePermIssue] = React.useState(false);
  const debouncedCurrentSearch = useDebounce(currentSearch, 175);

  const textInputRef = React.useRef<TextInput>(null);

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
    const fetchData = async () => {
      if (debouncedCurrentSearch.length <= 2) {
        setIsLoading(false);
        setResults([]);
        return;
      }
  
      try {
        setIsLoading(true);
        const data = await getGeographicMunicipalities(debouncedCurrentSearch);
        setResults(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [debouncedCurrentSearch]);

  const LocateMe = async () => {
    setIsLoading(true);
    setIsLocalisation(true);
    console.log('[1/6] Début localisation');
    try {
      console.log('[2/6] Demande de permissions envoyée');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('[3/6] Statut permissions:', status);
      if (status !== 'granted') {
        setIsLoading(false);
        setIsLocalisation(false);
        setLocatePermIssue(true);
        setLocateState('Permission de localisation refusée');
        return;
      }
      setLocateState('Localisation en cours...');
      console.log('[4/6] Localisation en cours');
      const location = await Location.getCurrentPositionAsync({});
      console.log('[5/6] Localisation terminée, traitement');
      console.log('[6/6] Latitude & longitude présents ?', location.coords.latitude + ' , ' + location.coords.longitude);
      if (location.coords.latitude && location.coords.longitude) {
        navigation.navigate('LocateEtabList', {
          location: {
            properties: {
              name: 'votre position',
              score: 0,
              postcode: '',
              population: 0,
              context: '',
            },
            geometry: {
              coordinates: [location.coords.longitude, location.coords.latitude]
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to locate', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior='automatic'
      style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
    >
      <StatusBar
        animated
        barStyle={UIColors.dark ? 'light-content' : 'dark-content'}
        backgroundColor={'transparent'}
      />

      <NativeList
        inset
        style={Platform.OS === 'android' ? { marginTop: insets.top } : undefined}
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
            placeholder="Ville de l'établissement"
            placeholderTextColor={UIColors.text + '88'}
            style={[styles.input, { color: UIColors.text }]}
            value={currentSearch}
            onChangeText={(text) => {
              setCurrentSearch(text);
            }}
          />
        </NativeItem>
      </NativeList>

      { isLoading && isLocalisation ? (
        <PapillonLoading
          title={locateState}
        />
      ): null}

      { !isLoading && locatePermIssue && currentSearch.length < 2 ? (
        <PapillonLoading 
          icon={<Locate color={'red'} size={26} style={{ margin: 8 }} />}
          title="Permission de localisation refusée"
          subtitle="Vous avez refusé la permission de localisation. Pour réessayez, sélectionnez à nouveau l'option. Vous devrez peut-être autoriser manuellement l'autorisation."
        />
      ): null}

      { !isLoading && currentSearch.length < 2 ? (
        <NativeList inset>
          <NativeItem
            leading={
              <Locate color={UIColors.primary} />
            }
            onPress={() => {
              LocateMe();
            }}
          >
            <NativeText heading="h4">
              Me localiser
            </NativeText>
            <NativeText heading="p2">
              Trouve automatiquement les établissements proches de vous
            </NativeText>
          </NativeItem>
        </NativeList>
      ) : null}

      {!isLoading && currentSearch.length < 2 ? (
        <PapillonLoading
          icon={<MapPin color={UIColors.text} size={26} style={{ margin: 8 }} />}
          title="Rechercher une ville"
          subtitle="Veuillez indiquer le nom d'une ville afin d'y rechercher un établissement"
        />
      ) : null}

      {results.length === 0 && !isLoading && currentSearch.length > 2 ? (
        <PapillonLoading
          icon={<Search color={UIColors.text} size={26} style={{ margin: 8 }} />}
          title="Aucun résultat"
          subtitle="Le nom de la ville fourni n'a retourné aucun résultat"
        />
      ) : null}

      {results.length > 0 ? (
        <NativeList
          inset
          style={Platform.OS === 'ios' ? { marginTop: -14 } : undefined}
        >
          {results.map((municipality, index) => (
            <NativeItem
              key={index}
              leading={
                <MapPin color={UIColors.primary} />
              }
              onPress={() => {
                navigation.navigate('LocateEtabList', {
                  location: municipality
                });
              }}
            >
              <NativeText heading="h4">
                {municipality.properties.name}
              </NativeText>
              <NativeText heading="p2">
                {municipality.properties.context}
              </NativeText>
            </NativeItem>
          ))}
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
