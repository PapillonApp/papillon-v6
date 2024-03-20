import React, { useState } from 'react';

import {
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Locate, MapPin, School, Search, X } from 'lucide-react-native';

import GetUIColors from '../../../utils/GetUIColors';
import useDebounce from '../../../hooks/useDebounce';

import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';
import PapillonLoading from '../../../components/PapillonLoading';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as Location from 'expo-location';
import { School as SkolengoSchool } from 'scolengo-api/types/models/School';
import { useAppContext } from '../../../utils/AppContext';
import { Skolengo } from 'scolengo-api';
import { loginSkolengoWorkflow } from '../../../fetch/Skolengo/SkolengoAuthWorkflow

export const LocateSkolengoEtab = ({
  navigation,
}: {
  navigation: any; // TODO
}) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const [instances, setInstances] = useState<SkolengoSchool[] | null>(null);
  const [searchMethod, setSearchMethod] = useState<'text' | 'geo'>('text');
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
        setInstances(null);
        return;
      }

      try {
        // to make the request to geo-api.
        const data = await Skolengo.searchSchool({
          text: debouncedCurrentSearch,
        });

        setInstances(data);
      } catch {
        // any error to reset states.
        setInstances([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [debouncedCurrentSearch]);

  const LocateMe = async () => {
    setIsLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      if (location.coords.latitude && location.coords.longitude) {
        const data = await Skolengo.searchSchool({
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        });
        setInstances(data);
        setSearchMethod('geo');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const appContext = useAppContext();

  async function selectEtab(item: SkolengoSchool) {
    loginSkolengoWorkflow(appContext, navigation, item);
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
    >
      <StatusBar
        animated
        barStyle={UIColors.dark ? 'light-content' : 'dark-content'}
        backgroundColor={'transparent'}
      />

      <NativeList
        style={[Platform.OS === 'android' ? { marginTop: insets.top } : null]}
      >
        <NativeItem
          leading={<Search color={UIColors.text + '88'} />}
          trailing={
            isLoading ? (
              <ActivityIndicator />
            ) : currentSearch.length > 0 || searchMethod === 'geo' ? (
              <TouchableOpacity
                onPress={() => {
                  setCurrentSearch('');
                  setInstances(null);
                  setSearchMethod('text');
                }}
              >
                <X size={20} color={UIColors.text + '88'} />
              </TouchableOpacity>
            ) : null
          }
        >
          <TextInput
            ref={textInputRef}
            placeholder="Nom de l'établissement ou ville"
            placeholderTextColor={UIColors.text + '88'}
            style={[styles.input, { color: UIColors.text }]}
            value={currentSearch}
            onChangeText={(text) => {
              setCurrentSearch(text);
              setIsLoading(true);
              if (searchMethod === 'geo') setSearchMethod('text');
            }}
          />
        </NativeItem>
      </NativeList>

      {!isLoading && currentSearch.length < 2 ? (
        <NativeList>
          <NativeItem
            leading={<Locate color={UIColors.primary} />}
            onPress={() => {
              LocateMe();
            }}
          >
            <NativeText heading="h4">Me localiser</NativeText>
            <NativeText heading="p2">
              Trouve automatiquement les établissements proches de vous
            </NativeText>
          </NativeItem>
        </NativeList>
      ) : null}

      {!isLoading && currentSearch.length < 2 && searchMethod === 'text' ? (
        <PapillonLoading
          icon={
            <MapPin color={UIColors.text} size={26} style={{ margin: 8 }} />
          }
          title="Rechercher une ville"
          subtitle="Veuillez indiquer le nom d'une ville ou d'un etablissement afin de proceder à la recherche"
        />
      ) : null}

      {isLoading && (
        <PapillonLoading
          title="Recherche en cours"
          subtitle="Veuillez patienter pendant que nous recherchons les établissements."
        />
      )}

      {!isLoading && instances?.length === 0 && (
        <PapillonLoading
          icon={
            <School color={UIColors.text} size={26} style={{ margin: 8 }} />
          }
          title="Aucun établissement trouvé"
          subtitle={
            'Aucun établissement n\'a été trouvé correspondant à votre recherche ou proche de chez vous.'
          }
        />
      )}

      {!isLoading && instances && instances.length > 0 && (
        <NativeList
          style={{
            marginTop: Platform.OS === 'ios' ? -14 : 0,
          }}
        >
          {instances.map((instance) => {
            return (
              <NativeItem
                key={instance.id}
                leading={<School color={UIColors.primary} />}
                onPress={() => selectEtab(instance)}
              >
                <NativeText heading="h4">{instance.name}</NativeText>
                <NativeText heading="p2">
                  {`${instance.zipCode} ${instance.city}${
                    instance.distance
                      ? `\n(à ${Math.round(instance.distance * 10) / 10} km)`
                      : ''
                  }`}
                </NativeText>
              </NativeItem>
            );
          })}
        </NativeList>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Papillon-Medium',
  },
});

export default LocateSkolengoEtab;
