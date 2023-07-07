import * as React from 'react';
import { ScrollView, View, StatusBar, Platform } from 'react-native';
import { StyleSheet } from 'react-native';
import { useTheme, ActivityIndicator, List, Text, Avatar, Searchbar } from 'react-native-paper';
import { useState } from 'react';

import PapillonIcon from '../../../components/PapillonIcon';

import { School, Map, Backpack } from 'lucide-react-native';
import ListItem from '../../../components/ListItem';

import { useColorScheme } from 'react-native';

import { getCoordsFromPostal, getPronoteEtabsFromCoords } from '../../../fetch/AuthStack/SearchEtabs';

function LoginPronoteSelectEtab({ navigation }) {
  const theme = useTheme();
  const scheme = useColorScheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [EtabList, setEtabList] = useState([]);
  const [loading, setLoading] = useState(false);

  function androidSearchEtabs(event) {
    searchEtabs(event);
  }

  function searchEtabs(text) {
    setEtabList([]);
    setSearchQuery('');
    setLoading(true);

    // set searchQuery to text
    setSearchQuery(text);

    // if text is empty, return
    if(text.trim() == "") {
      setEtabList([]);
      return
    }

    // get coords from postal
    getCoordsFromPostal(text).then((result) => {
      if(result[1] != undefined) {
        result = result[0];
      }

      let ville = result;

      if(ville.length == 0) {
        setEtabList([]);
        setLoading(false);
        return;
      }

      getPronoteEtabsFromCoords(ville.lat, ville.lon).then((result) => {
        // limit to 25 results
        result = result.slice(0, 25);

        setEtabList(result);
        setLoading(false);
      });
    });
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: 'Entrez un code postal ou une ville',
        cancelButtonText: 'Annuler',
        hideWhenScrolling: false,
        hideNavigationBar: false,
        onChangeText: event => searchEtabs(event.nativeEvent.text),
      },
    });
  }, [navigation]);

  function selectEtab(item) {
    console.log(item);
    navigation.navigate('LoginPronote', { etab: item });
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1 }}>

      {Platform.OS === 'android' ? (
        <Searchbar
          placeholder="Entrez un code postal ou une ville"
          onChangeText={androidSearchEtabs}
          style={{ marginHorizontal: 12, marginTop: 12 }}
        />
      ) : null}
        
      {EtabList.length > 0 ? (
        <List.Section style={styles.etabItemList}>
          <List.Subheader>Établissements disponibles</List.Subheader>

          {EtabList.map((item, index) => (
            <ListItem
              key={index}
              title={item.nomEtab}
              subtitle={item.url}
              icon={<School color="#29947A" />}
              color="#29947A"
              onPress={() => selectEtab(item)}
              style={styles.etabItem}
            />
          ))}
        </List.Section>
      ) : null}

      {EtabList.length == 0 && searchQuery.trim() != "" && loading ? (
        <View style={{alignItems: 'center', marginTop:50}}>
          <ActivityIndicator size={46} animating={true} color="#29947a" style={{marginBottom:20}} />
          <Text variant="titleLarge" style={{fontWeight:500, marginBottom: 4, fontFamily: 'Papillon-Semibold'}} >Recherche des établissements</Text>
          <Text style={{opacity:0.6, marginBottom:50}} >Cela peut prendre quelques secondes.</Text>
        </View>
      ) : null}

      {EtabList.length == 0 && searchQuery.trim() != "" && !loading ? (
        <View style={{alignItems: 'center', marginTop:50}}>
          <PapillonIcon
            icon={<Backpack color="#fff" size={28}/>}
            color="#29947A"
            style={{marginBottom:14}}
            fill={true}
            small={true}
          />

          <Text variant="titleLarge" style={{fontWeight:500, marginBottom: 4, fontFamily: 'Papillon-Semibold'}} >Aucun résultat</Text>
          <Text style={{opacity:0.6, marginBottom:50, textAlign: 'center', marginHorizontal:30}} >Rééssayez avec une autre recherche ou utilisez une autre méthode de connexion.</Text>
        </View>
      ) : null}

      {EtabList.length == 0 && searchQuery.trim() == "" ? (
        <View style={{alignItems: 'center', marginTop:50}}>
          <PapillonIcon
            icon={<Map color="#fff" size={28}/>}
            color="#29947A"
            style={{marginBottom:14}}
            fill={true}
          />

          <Text variant="titleLarge" style={{fontWeight:500, marginBottom: 4, fontFamily: 'Papillon-Semibold'}} >Démarrez une recherche</Text>
          <Text style={{opacity:0.6, marginBottom:50, textAlign: 'center', marginHorizontal:30}} >Utilisez la barre de recherche pour rechercher une ville ou un code postal.</Text>
        </View>
      ) : null}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  etabItem: {
    marginBottom: 5,
  },
  etabItemList: {
    
  },
});

export default LoginPronoteSelectEtab;