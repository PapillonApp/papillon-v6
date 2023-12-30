import * as React from 'react';
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
  List,
  Text,
  Searchbar,
} from 'react-native-paper';
import { useState } from 'react';
import * as Location from 'expo-location';
import { School, Map, Backpack, Locate } from 'lucide-react-native';
import PapillonIcon from '../../../components/PapillonIcon';
import ListItem from '../../../components/ListItem';
import PapillonButton from '../../../components/PapillonButton';
import { SkolengoStatic } from '../../../fetch/SkolengoData/SkolengoLoginFlow';
import { useAppContext } from '../../../utils/AppContext';
import { loginSkolengoWorkflow } from '../../../fetch/SkolengoData/SkolengoDatas';

import AlertBottomSheet from '../../../interface/AlertBottomSheet';

function LoginSkolengoSelectSchool({ navigation }) {
  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState('');

  /** @type {[import('scolengo-api/types/models/School').School[], import('react').Dispatch<import('react').SetStateAction<import('scolengo-api/types/models/School').School[]>>]} */
  const [EtabList, setEtabList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localisationPermissionAlert, setLocalisationPermissionAlert] = useState(false);

  const appctx = useAppContext();

  function setResults(schools) {
    setEtabList(schools ?? []);
    setLoading(false);
  }

  function searchSchool(text) {
    setLoading(true);
    setEtabList([]);
    setSearchQuery(text);
    SkolengoStatic.getSchools({
      text,
    })
      .then(setResults)
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
    }).then(setResults);
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTintColor: "#222647",
      headerSearchBarOptions: {
        placeholder: "Entrez le nom d'un lycée",
        cancelButtonText: 'Annuler',
        hideWhenScrolling: false,
        hideNavigationBar: false,
        onChangeText: (event) => searchSchool(event.nativeEvent.text),
      },
    });
  }, [navigation]);

  async function selectEtab(item) {
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
          onChangeText={(evt) => searchSchool(evt)}
          style={{ marginHorizontal: 12, marginTop: 12 }}
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
        <List.Section style={styles.etabItemList}>
          <List.Subheader>Établissements disponibles</List.Subheader>

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
        </List.Section>
      ) : null}

      {loading ? (
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <ActivityIndicator
            size={46}
            animating
            color="#222647"
            style={{ marginBottom: 20 }}
          />
          <Text
            variant="titleLarge"
            style={{
              fontWeight: 500,
              marginBottom: 4,
              fontFamily: 'Papillon-Semibold',
            }}
          >
            Recherche des établissements
          </Text>
          <Text style={{ opacity: 0.6, marginBottom: 50 }}>
            Cela peut prendre quelques secondes.
          </Text>
        </View>
      ) : null}

      {EtabList.length === 0 && searchQuery.trim() !== '' && !loading ? (
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <PapillonIcon
            icon={<Backpack color="#fff" size={28} />}
            color="#222647"
            style={{ marginBottom: 14 }}
            fill
            small
          />

          <Text
            variant="titleLarge"
            style={{
              fontWeight: 500,
              marginBottom: 4,
              fontFamily: 'Papillon-Semibold',
            }}
          >
            Aucun résultat
          </Text>
          <Text
            style={{
              opacity: 0.6,
              marginBottom: 50,
              textAlign: 'center',
              marginHorizontal: 30,
            }}
          >
            Rééssayez avec une autre recherche ou utilisez une autre méthode de
            connexion.
          </Text>
        </View>
      ) : null}

      {EtabList.length === 0 && searchQuery.trim() === '' && !loading ? (
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <PapillonIcon
            icon={<Map color="#fff" size={28} />}
            color="#222647"
            style={{ marginBottom: 14 }}
            fill
          />

          <Text
            variant="titleLarge"
            style={{
              fontWeight: 500,
              marginBottom: 4,
              fontFamily: 'Papillon-Semibold',
            }}
          >
            Démarrez une recherche
          </Text>
          <Text
            style={{
              opacity: 0.6,
              marginBottom: 50,
              textAlign: 'center',
              marginHorizontal: 30,
            }}
          >
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
  etabItemList: {},

  qrModal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  qrModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 24,
    color: '#000',
  },

  qrModalText: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 24,
    textAlign: 'center',
    marginHorizontal: 30,
    color: '#000',
  },

  qrBtn: {
    width: '95%',
  },

  qrModalScannerContainer: {
    width: '95%',
    flex: 1,
    marginBottom: 12,

    borderRadius: 8,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },

  qrModalScanner: {
    flex: 1,
  },

  detectedEtab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderCurve: 'continuous',
    overflow: 'hidden',
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    gap: 16,
  },

  detectedEtabData: {
    flex: 1,
  },

  detectedEtabText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
  },
  detectedEtabDescription: {
    fontSize: 15,
    opacity: 0.6,
    color: '#000',
  },
});

export { LoginSkolengoSelectSchool };
