import React from 'react';
import { View, StatusBar, StyleSheet, TouchableOpacity, Platform, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { School, Search, X } from 'lucide-react-native';

import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';
import PapillonLoading from '../../../components/PapillonLoading';

import GetUIColors from '../../../utils/GetUIColors';

import type { GeographicMunicipality } from '../../../fetch/geolocation/geo-gouv';
import { findPronoteInstances, defaultPawnoteFetcher, type PronoteInstance } from 'pawnote';

const LocateEtabList = ({ route, navigation }) => {
  const UIColors = GetUIColors();
  const location: GeographicMunicipality = route.params.location;

  const [isInstancesLoading, setInstancesLoading] = React.useState(false);
  const [instances, setInstances] = React.useState<PronoteInstance[] | null>(null);

  const openInstance = (instance: PronoteInstance) => {
    const school = {
      nomEtab: instance.name,
      url: instance.url,
    };

    navigation.navigate('NGPronoteLogin', { etab: school });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: location.properties.name,
      headerRight: () => (
        isInstancesLoading ? (
          <ActivityIndicator />
        ) : null
      )
    });
  }, [isInstancesLoading]);

  React.useEffect(() => {
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

  const [currentSearch, setCurrentSearch] = React.useState('');
  const textInputRef = React.createRef<TextInput | null>();

  const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const filteredInstances = currentSearch.length > 2
    ? instances.filter((instance) => normalize(instance.name).includes(normalize(currentSearch)))
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

      {!isInstancesLoading && instances?.length > 0 && (
        <NativeList inset>
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

      {!isInstancesLoading && instances?.length > 0 && filteredInstances.length === 0 && (
        <PapillonLoading 
          icon={<School color={UIColors.text} size={26} style={{ margin: 8 }} />}
          title="Aucun résultat"
          subtitle={`Aucun établissement n'a été trouvé pour la recherche "${currentSearch}".`}
        />
      )}

      {!isInstancesLoading && instances?.length > 0 && filteredInstances.length > 0 && (
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
                <NativeText heading="subtitle2">
                  À {(instance.distance / 1000).toFixed(2)}km de la localisation donnée.
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
