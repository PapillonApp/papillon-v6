import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StatusBar,
  Platform,
  StyleSheet,
} from 'react-native';

import {
  useTheme,
  ActivityIndicator,
  Text,
  Searchbar,
} from 'react-native-paper';
import * as Location from 'expo-location';
import { School, Locate } from 'lucide-react-native';
import ListItem from '../../../components/ListItem';
import PapillonButton from '../../../components/PapillonButton';
import { SkolengoStatic } from '../../../fetch/SkolengoData/SkolengoLoginFlow';
import { useAppContext } from '../../../utils/AppContext';
import { loginSkolengoWorkflow } from '../../../fetch/SkolengoData/SkolengoDatas';

import AlertBottomSheet from '../../../interface/AlertBottomSheet';

interface SchoolItem {
  name: string;
  city: string;
  zipCode: string;
}

const LoginSkolengoSelectSchool: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [EtabList, setEtabList] = useState<SchoolItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [localisationPermissionAlert, setLocalisationPermissionAlert] =
    useState(false);

  const appctx = useAppContext();

  function setResults(schools: SchoolItem[]) {
    setEtabList(schools ?? []);
    setLoading(false);
  }

  async function searchSchool(text: string) {
    setLoading(true);
    setEtabList([]);
    setSearchQuery(text);
    SkolengoStatic.getSchools({
      text: text,
      lat: null,
      lon: null,
    }).then(setResults);
  }

  async function searchSchoolByCoords() {
    const { status } = await Location.requestForegroundPermissionsAsync();
  
    if (status !== 'granted') {
      setLocalisationPermissionAlert(true);
      return;
    }
  
    setLoading(true);
    setEtabList([]);
  
    const location = await Location.getCurrentPositionAsync({});
  
    SkolengoStatic.getSchools({
      lat: location.coords.latitude,
      lon: location.coords.longitude,
      text: '',
    }).then(setResults);
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: 'Entrez le nom d\'un lycée',
        cancelButtonText: 'Annuler',
        hideWhenScrolling: false,
        hideNavigationBar: false,
        onChangeText: (event: any) => searchSchool(event.nativeEvent.text),
      },
    });
  }, [navigation]);

  async function selectEtab(item: SchoolItem) {
    loginSkolengoWorkflow(appctx, navigation, item);
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1 }}>

      <AlertBottomSheet
        visible={localisationPermissionAlert}
        title="Erreur"
        subtitle="Vous devez autoriser l'application à accéder à votre position pour utiliser cette fonctionnalité."
        cancelAction={() => setLocalisationPermissionAlert(false)}
        color='#222647'
        icon={<Locate />}
      />

      {Platform.OS === 'ios' ? (
        <StatusBar animated barStyle="light-content" />
      ) : (
        <StatusBar
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
      )}

      {Platform.OS === 'android' ? (
        <Searchbar
          placeholder="Entrez le nom d'un lycée"
          onChangeText={(evt: string) => searchSchool(evt)}
          style={{ marginHorizontal: 12, marginTop: 12 }} value={''}
        />
      ) : null}

      <PapillonButton
        title="Retour"
        color="#222647"
        onPress={() => navigation.goBack()}
        style={{ marginTop: 14, marginHorizontal: 14 }}
      />

      <ListItem
        title="Utiliser ma position"
        subtitle="Rechercher les établissements à proximité"
        icon={<Locate color="#222647" />}
        color="#222647"
        onPress={() => searchSchoolByCoords()}
        style={{ marginTop: 12 }}
      />

      {EtabList.length > 0 && !loading ? (
        <View>
          <Text>Établissements disponibles</Text>
          {EtabList.map((item, index) => (
            <ListItem
              key={index}
              title={item.name}
              subtitle={`${item.city} (${item.zipCode})`}
              icon={<School color="#222647" />}
              color="#222647"
              onPress={() => selectEtab(item)}
              style={styles.etabItem}
            />
          ))}
        </View>
      ) : null}

      {loading ? (
        <View>
          <ActivityIndicator size={46} animating color="#222647" />
          <Text>Recherche des établissements</Text>
          <Text>Cela peut prendre quelques secondes.</Text>
        </View>
      ) : null}

      {EtabList.length === 0 && searchQuery.trim() !== '' && !loading ? (
        <View>
          <Text>Aucun résultat</Text>
          <Text>
            Rééssayez avec une autre recherche ou utilisez une autre méthode de
            connexion.
          </Text>
        </View>
      ) : null}

      {EtabList.length === 0 && searchQuery.trim() === '' && !loading ? (
        <View>
          <Text>Démarrez une recherche</Text>
          <Text>
            Utilisez la barre de recherche pour rechercher une ville ou un code
            postal.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  etabItem: {
    marginBottom: 5,
  },
});

export default LoginSkolengoSelectSchool;
