import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { View, StatusBar, StyleSheet, TouchableOpacity, Platform, TextInput, ScrollView, ActivityIndicator } from 'react-native';
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
  navigation: any // TODO
  route: {
    params: {
      location: GeographicMunicipality
    }
  }
}) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();
  const location = route.params.location;

  const [isInstancesLoading, setInstancesLoading] = useState(false);
  const [instances, setInstances] = useState<PronoteInstance[] | null>(null);

  const openInstance = async (instance: PronoteInstance) => {
    console.log(instance);
    let instanceURL = instance.url;

    // check if instance is up
    await fetch(instanceURL)
      .then((response) => {
        if (response.status === 200) {
          console.log('instance is up');
        } else {
          console.log('instance is down');
          instanceURL = instanceURL.replace('index-education.net', 'pronote.toutatice.fr');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        instanceURL = instanceURL.replace('index-education.net', 'pronote.toutatice.fr');
      });

    navigation.navigate('NGPronoteWebviewLogin', { instanceURL: instanceURL });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: location.properties.name,
      headerRight: () => (
        isInstancesLoading ? (
          <ActivityIndicator />
        ) : null
      )
    });
  }, [isInstancesLoading]);

  useEffect(() => {
    const [longitude, latitude] = location.geometry.coordinates;
    (async () => {
      try {
        setInstancesLoading(true);
        const instances = await findPronoteInstances(defaultPawnoteFetcher, {
          longitude, latitude
        });
  
        setInstances(instances);
      }
      catch {
        setInstances(null);
      }
      finally {
        setInstancesLoading(false);
      }
    })();
  }, [location]);

  const [currentSearch, setCurrentSearch] = useState('');
  const textInputRef = createRef<TextInput | null>();

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
          Platform.OS === 'ios'
            ? 'light-content'
            : UIColors.theme === 'light'
              ? 'dark-content'
              : 'light-content'
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
          style={[Platform.OS === 'android' ? { marginTop: insets.top } : null]}
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

      {!isInstancesLoading && instances?.length === 0 && (
        <PapillonLoading 
          icon={<School color={UIColors.text} size={26} style={{ margin: 8 }} />}
          title="Aucun établissement trouvé"
          subtitle={`Aucun établissement n'a été trouvé dans la ville de ${location.properties.name} (${location.properties.postcode}).`}
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
          {filteredInstances.map((instance) => {
            return (
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
            );
          })}
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
