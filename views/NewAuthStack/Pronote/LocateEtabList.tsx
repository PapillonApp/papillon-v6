import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { School, Search, X } from 'lucide-react-native';

import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';
import PapillonLoading from '../../../components/PapillonLoading';

import GetUIColors from '../../../utils/GetUIColors';

import type { GeographicMunicipality } from '../../../fetch/geolocation/geo-gouv';
import { findPronoteInstances, defaultPawnoteFetcher, type PronoteInstance } from 'pawnote';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LocateEtabList = ({ route, navigation }: {
  navigation: any;
  route: {
    params: {
      location: GeographicMunicipality;
    };
  };
}) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();
  const location = route.params.location;

  const [isInstancesLoading, setInstancesLoading] = useState(false);
  const [instances, setInstances] = useState<PronoteInstance[] | null>(null);

  const textInputRef = useRef<TextInput>(null);

  const openInstance = async (instance: PronoteInstance) => {
    console.log(instance);
    let instanceURL = instance.url;

    try {
      const response = await fetch(instanceURL);
      if (!response.ok) {
        instanceURL = instanceURL.replace('index-education.net', 'pronote.toutatice.fr');
      }
    } catch (error) {
      instanceURL = instanceURL.replace('index-education.net', 'pronote.toutatice.fr');
      console.error(error);
    }

    navigation.navigate('NGPronoteWebviewLogin', { instanceURL });
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        isInstancesLoading ? (
          <ActivityIndicator />
        ) : null
      )
    });
  }, [isInstancesLoading]);

  useEffect(() => {
    const { coordinates } = location.geometry;
    const [longitude, latitude] = coordinates; // Utilisation correcte des noms de variables

    const fetchInstances = async () => {
      try {
        setInstancesLoading(true);
        const instances = await findPronoteInstances(defaultPawnoteFetcher, { longitude, latitude });

        if (instances.length === 0) {
          setInstances(null);
          console.log('[LocateEtabList] Aucune instance trouvée');
        } else {
          setInstances(instances);
        }
      } catch (error) {
        console.error('Erreur lors de la recherche des instances:', error);
        setInstances(null);
      } finally {
        setInstancesLoading(false);
      }
    };

    fetchInstances();
  }, [location]);

  const [currentSearch, setCurrentSearch] = useState('');

  const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const filteredInstances = currentSearch.length > 2
    ? (instances ?? []).filter((instance) => normalize(instance.name).includes(normalize(currentSearch)))
    : instances;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior='automatic'
      style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
    >
      <StatusBar
        animated
        barStyle={
          UIColors.dark ?
            'light-content'
            :
            'dark-content'
        }
      />

      {isInstancesLoading && (
        <PapillonLoading 
          title="Recherche en cours"
          subtitle="Veuillez patienter pendant que nous recherchons les établissements."
        />
      )}

      {!isInstancesLoading && instances?.length && (
        <NativeList
          inset
          style={Platform.OS === 'android' ? { marginTop: insets.top } : undefined}
        >
          <NativeItem
            leading={<Search color={UIColors.text + '88'} />}
            trailing={ 
              currentSearch.length > 0
                ? (
                  <TouchableOpacity onPress={() => setCurrentSearch('')}>
                    <X size={20} color={UIColors.text + '88'} />
                  </TouchableOpacity>
                ) : null
            }
          >
            <TextInput 
              ref={textInputRef}
              placeholder="Rechercher"
              placeholderTextColor={UIColors.text + '88'}
              style={[styles.input, { color: UIColors.text }]}
              value={currentSearch}
              onChangeText={setCurrentSearch}
            />
          </NativeItem>
        </NativeList>
      )}

      {!isInstancesLoading && instances === null && (
        <PapillonLoading 
          icon={<School color={UIColors.text} size={26} style={{ margin: 8 }} />}
          title="Aucun établissement trouvé"
          subtitle={location.properties.name === 'votre position' ? 'Aucun établissement n\'a été trouvé à proximité de votre position.' : `Aucun établissement n'a été trouvé à proximité de ${location.properties.name} (${location.properties.postcode}).`}
        />
      )}

      {!isInstancesLoading && instances?.length && filteredInstances?.length === 0 && (
        <PapillonLoading 
          icon={<School color={UIColors.text} size={26} style={{ margin: 8 }} />}
          title="Aucun résultat"
          subtitle={`Aucun établissement n'a été trouvé pour la recherche "${currentSearch}".`}
        />
      )}

      {!isInstancesLoading && instances?.length && filteredInstances?.length && (
        <NativeList
          inset
          style={{
            marginTop: Platform.OS === 'ios' ? -14 : 0
          }}
        >
          {filteredInstances.map((instance) => (
            <NativeItem
              key={instance.url}
              leading={<School color={UIColors.primary} />}
              onPress={() => openInstance(instance)}
            >
              <NativeText heading="h4">
                {instance.name}
              </NativeText>
              <NativeText heading="p2">
                à {(instance.distance / 1000).toFixed(2)} km de {location.properties.name}
              </NativeText>
            </NativeItem>
          ))}
        </NativeList>
      )}

      <View style={{ padding: 8 }}/>
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

export default LocateEtabList;
