import * as React from 'react';
import { ScrollView, View, StatusBar, Platform, Alert, Modal, Keyboard } from 'react-native';
import { StyleSheet } from 'react-native';
import { useTheme, ActivityIndicator, List, Text, Avatar, Searchbar, Dialog, TextInput, Portal, Button as PaperButton } from 'react-native-paper';
import { useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Fade from 'react-native-fade';

import { Button as RNButton } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getENTs } from '../../../fetch/AuthStack/LoginFlow';

import * as Location from 'expo-location';

import PapillonIcon from '../../../components/PapillonIcon';

import { BarCodeScanner } from 'expo-barcode-scanner';

import { School, Map, Backpack, Locate, Link, QrCode, Clock3 } from 'lucide-react-native';
import ListItem from '../../../components/ListItem';

import { useColorScheme } from 'react-native';

import { getCoordsFromPostal, getPronoteEtabsFromCoords } from '../../../fetch/AuthStack/SearchEtabs';
import { PressableScale } from 'react-native-pressable-scale';
import { set } from 'react-native-reanimated';
import GetUIColors from '../../../utils/GetUIColors';

function LoginPronoteSelectEtab({ navigation }) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const UIColors = GetUIColors();

  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [EtabList, setEtabList] = useState([]);
  const [loading, setLoading] = useState(false);

  function androidSearchEtabs(event) {
    searchEtabs(event);
  }

  function useDemo() {
    Alert.alert(
      'Utiliser le compte démo',
      'Voulez-vous vraiment utiliser le compte démo ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Se connecter',
          isPreferred: true,
          onPress: () => {
            let url = 'https://demo.index-education.net/pronote/eleve.html';
            getENTs(url).then((result) => {
              let etab = {
                nomEtab: result.nomEtab,
                url: url,
              }

              navigation.navigate('LoginPronote', { etab: etab, useDemo: true });
            });
          },
        }
      ],
    );
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

  async function locateEtabs() {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Erreur', 'Vous devez autoriser l\'application à accéder à votre position pour utiliser cette fonctionnalité.');
      return;
    }

    setLoading(true);

    let location = await Location.getCurrentPositionAsync({});
    let lat = location.coords.latitude;
    let lon = location.coords.longitude;

    getPronoteEtabsFromCoords(lat, lon).then((result) => {
      // limit to 25 results
      result = result.slice(0, 25);

      setEtabList(result);
      setLoading(false);
    });
  }

  const [isSearchingUrlAndroid, setIsSearchingUrlAndroid] = useState(false);
  const [urlAndroid, setUrlAndroid] = useState('');

  async function searchURL(item) {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'URL de connexion',
        'Entrez l\'URL de connexion à Pronote de votre établissement',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Valider',
            isPreferred: true,
            onPress: (url) => {
              getENTs(url).then((result) => {
                let etab = {
                  nomEtab: result.nomEtab,
                  url: url,
                }

                navigation.navigate('LoginPronote', { etab: etab });
              });
            },
          },
        ],
        'plain-text',
      );
    }
    else {
      setIsSearchingUrlAndroid(true);
    }
  }

  React.useLayoutEffect(() => {
    if (Platform.OS == 'ios') {
      navigation.setOptions({
        headerSearchBarOptions: {
          placeholder: 'Entrez un code postal ou une ville',
          cancelButtonText: 'Annuler',
          hideWhenScrolling: false,
          hideNavigationBar: false,
          onChangeText: event => searchEtabs(event.nativeEvent.text),
        },
      });
    }
  }, [navigation]);

  function selectEtab(item) {
    navigation.navigate('LoginPronote', { etab: item });
  }

  const [oldLoginEtab, setOldLoginEtab] = useState(null);

  React.useEffect(() => {
    AsyncStorage.getItem('old_login').then((result) => {
      if(result != null) {
        let url = JSON.parse(result).url;
        getENTs(url).then((result) => {
          let etab = {
            nomEtab: result.nomEtab,
            url: url,
          }
  
          setOldLoginEtab(etab);
        });
      }
    });
  }, [oldLoginEtab]);

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrEtabDetected, setQrEtabDetected] = useState(false);

  async function scanQR() {
    const { status } = await BarCodeScanner.requestPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Erreur', 'Vous devez autoriser l\'application à accéder à votre caméra pour utiliser cette fonctionnalité.');
      return;
    }

    setQrModalVisible(true);
  }

  function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  }

  const [currentEtabName, setCurrentEtabName] = useState('');
  const [currentEtabURL, setCurrentEtabURL] = useState('');

  function qrScanned(event) {
    let url = JSON.parse(event.data).url;

    getENTs(url).then((result) => {
      let etab = {
        nomEtab: result.nomEtab,
        url: url,
      }

      setCurrentEtabName(result.nomEtab);
      setCurrentEtabURL(url);
      
      setTimeout(() => {
        setQrEtabDetected(true);
      }, 300);
    });
  }

  function closeModal() {
    setQrModalVisible(false);
    setCurrentEtabName('');
    setCurrentEtabURL('');
    setQrEtabDetected(false);
  }

  function openEtab() {
    closeModal();
    navigation.navigate('LoginPronote', { etab: {
      nomEtab: currentEtabName,
      url: currentEtabURL,
    } });
  }

  const [bottom, setBottom] = React.useState(0)

  React.useEffect(() => {
    function onKeyboardChange(e) {
      setBottom(e.endCoordinates.height / 2)
    }

    if (Platform.OS === "ios") {
      const subscription = Keyboard.addListener("keyboardWillChangeFrame", onKeyboardChange)
      return () => subscription.remove()
    }

    const subscriptions = [
      Keyboard.addListener("keyboardDidHide", onKeyboardChange),
      Keyboard.addListener("keyboardDidShow", onKeyboardChange),
    ]
    return () => subscriptions.forEach((subscription) => subscription.remove())
  }, [])

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: UIColors.background }}>
      { Platform.OS === 'ios' ?
        <StatusBar animated barStyle={'light-content'} />
      :
        <StatusBar animated barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor='transparent' />
      }


        <Portal>
          <Dialog style={{ bottom }} visible={isSearchingUrlAndroid} onDismiss={() => setIsSearchingUrlAndroid(false)}>
            <Dialog.Title>URL de connexion</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Entrez l'URL de connexion à Pronote de votre établissement"
                value={urlAndroid}
                onChangeText={text => setUrlAndroid(text)}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <PaperButton onPress={() => setIsSearchingUrlAndroid(false)}>Annuler</PaperButton>
              <PaperButton onPress={() => {
                getENTs(urlAndroid).then((result) => {
                  let etab = {
                    nomEtab: result.nomEtab,
                    url: urlAndroid,
                  }

                  navigation.navigate('LoginPronote', { etab: etab });
                  setIsSearchingUrlAndroid(false);
                });
              }}>Se connecter</PaperButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={qrModalVisible}
        presentationStyle="pageSheet"
        onRequestClose={() => {
          closeModal();
        }}
        style={{margin: 0, backgroundColor: UIColors.background}}
      >
        <View style={[styles.qrModal, {paddingBottom: insets.bottom + 6, backgroundColor: UIColors.background}]}>
          <Text style={[styles.qrModalTitle]} >Scanner un QR Code</Text>
          <Text style={[styles.qrModalText]} >Scannez le QR Code de votre établissement pour vous connecter.</Text>

          <View style={[styles.qrModalScannerContainer]} >
            { qrModalVisible ? (
            <BarCodeScanner
              onBarCodeScanned={(event) => {
                qrScanned(event);
              }}
              style={[styles.qrModalScanner]}
            />
            ) : null }
            
            <Fade visible={qrEtabDetected} direction="up" duration={200}>
              <PressableScale style={[styles.detectedEtab, {backgroundColor: UIColors.element}]} onPress={() => openEtab()}>
                <School color="#159C5E" />
                <View style={[styles.detectedEtabData]}>
                  <Text style={[styles.detectedEtabText]}>{currentEtabName}</Text>
                  <Text style={[styles.detectedEtabDescription]}>{currentEtabURL}</Text>
                </View>
              </PressableScale>
            </Fade>
          </View>
        </View>
      </Modal>

      {Platform.OS === 'android' ? (
        <Searchbar
          placeholder="Entrez un code postal ou une ville"
          onChangeText={androidSearchEtabs}
          style={{ marginHorizontal: 12, marginTop: 12 }}
        />
      ) : null}

      {oldLoginEtab ? (
        <ListItem
          title="Se connecter avec l'établissement utilisé précédemment"
          subtitle={oldLoginEtab.nomEtab}
          icon={<Clock3 color="#159C5E" />}
          color="#159C5E"
          onPress={() => selectEtab(oldLoginEtab)}
          style={{marginTop: 12}}
        />
      ) : null}

      { searchQuery.trim() == "" ? (
      <>
        <ListItem
          title="Utiliser ma position"
          subtitle="Rechercher les établissements à proximité"
          icon={<Locate color="#159C5E" />}
          color="#159C5E"
          onPress={() => locateEtabs()}
          style={{marginTop: 12}}
        />

        <ListItem
          title="Utiliser une URL Pronote"
          subtitle="Entrez l'URL de votre établissement"
          icon={<Link color="#159C5E" />}
          color="#159C5E"
          onPress={() => searchURL()}
          onLongPress={() => useDemo()}
          style={{marginTop: 8}}
        />

        <ListItem
          title="Scanner un QR Code"
          subtitle="Scannez le QR Code de votre établissement"
          icon={<QrCode color="#159C5E" />}
          color="#159C5E"
          onPress={() => scanQR()}
          style={{marginTop: 8}}
        />
      </>
      ) : null}
        
      {EtabList.length > 0 && !loading ? (
        <List.Section style={styles.etabItemList}>
          <List.Subheader>Établissements disponibles</List.Subheader>

          {EtabList.map((item, index) => (
            <ListItem
              key={index}
              title={item.nomEtab}
              subtitle={item.url}
              icon={<School color="#159C5E" />}
              color="#159C5E"
              onPress={() => selectEtab(item)}
              style={styles.etabItem}
            />
          ))}
        </List.Section>
      ) : null}

      {loading && searchQuery.trim() != "" ? (
        <View style={{alignItems: 'center', marginTop:30}}>
          <ActivityIndicator size={46} animating={true} color="#159C5E" style={{marginBottom:20}} />
          <Text variant="titleLarge" style={{fontWeight:500, marginBottom: 4, fontFamily: 'Papillon-Semibold'}} >Recherche des établissements</Text>
          <Text style={{opacity:0.6, marginBottom:50}} >Cela peut prendre quelques secondes.</Text>
        </View>
      ) : null}

      {EtabList.length == 0 && searchQuery.trim() != "" && !loading ? (
        <View style={{alignItems: 'center', marginTop:30}}>
          <PapillonIcon
            icon={<Backpack color="#fff" size={28}/>}
            color="#159C5E"
            style={{marginBottom:14}}
            fill={true}
            small={true}
          />

          <Text variant="titleLarge" style={{fontWeight:500, marginBottom: 4, fontFamily: 'Papillon-Semibold'}} >Aucun résultat</Text>
          <Text style={{opacity:0.6, marginBottom:50, textAlign: 'center', marginHorizontal:30}} >Rééssayez avec une autre recherche ou utilisez une autre méthode de connexion.</Text>
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
  },

  qrModalText: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 24,
    textAlign: 'center',
    marginHorizontal: 30,
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
    borderRadius: 8,
  },

  detectedEtab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
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
  },
  detectedEtabDescription: {
    fontSize: 15,
    opacity: 0.6,
  },
});

export default LoginPronoteSelectEtab;