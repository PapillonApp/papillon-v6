import * as React from 'react';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { Plus, Trash } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import Services from './services.json';

function LinkedAccountScreen({ navigation }) {
  const [accounts, setAccounts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  function getAccounts() {
    setLoading(true);
    AsyncStorage.getItem('linkedAccount').then((result) => {
      let res = { restaurant: {} };
      if (result != null) {
        res = JSON.parse(result);
      }
      setAccounts(res);
    });
  }

  function getServicesName(id) {
    let res = 'Services inconu';
    Services.restaurant.forEach((service) => {
      if (service.id === id) {
        res = service.name;
      }
    });
    return res;
  }

  function deleteRestaurant() {
    Alert.alert(
      'Supprimer le compte',
      'Voulez-vous vraiment supprimer ce compte ?',
      [
        {
          text: 'Annuler',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          onPress: () => {
            AsyncStorage.getItem('linkedAccount').then((result) => {
              const res = JSON.parse(result || { restaurant: {} });
              res.restaurant = {};
              setAccounts(res);
              AsyncStorage.setItem('linkedAccount', JSON.stringify(res));
            });
          },
          style: 'destructive',
        },
      ]
    );
  }

  React.useLayoutEffect(() => {
    getAccounts();
    setLoading(false);
  }, []);

  return (
    <ScrollView>
      {JSON.stringify(accounts.restaurant) === '{}' ? null : (
        <NativeList inset header="Service de restauration">
          <NativeItem
            trailing={
              <TouchableOpacity onPress={() => deleteRestaurant()}>
                <Trash color="#2A937A" />
              </TouchableOpacity>
            }
          >
            <NativeText heading="h4">
              {getServicesName(accounts.restaurant?.id)}
            </NativeText>
            <NativeText heading="p2">
              {accounts.restaurant?.username}
            </NativeText>
          </NativeItem>
        </NativeList>
      )}

      <NativeList inset>
        {loading ? <ActivityIndicator /> : null}
        <NativeItem
          leading={<Plus size={20} color="#2A937A" />}
          onPress={() => navigation.navigate('AddLinkedAccount')}
        >
          <NativeText heading="p" style={{ color: '#2A937A' }}>
            Ajouter un compte
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
}

export default LinkedAccountScreen;
