import * as React from 'react';
import { ScrollView, View, StyleSheet, Platform, Alert } from 'react-native';

import { useColorScheme } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme, TextInput, Button, Text, Portal, Switch } from 'react-native-paper';

import { getENTs, getInfo, getToken } from '../../../fetch/AuthStack/LoginFlow';

import { useState } from 'react';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

function LoginPronote({ route, navigation }) {
  const theme = useTheme();
  const scheme = useColorScheme();

  const { etab } = route.params;

  const [isENTUsed, setIsENTUsed] = React.useState(false);
  const onToggleSwitch = () => setIsENTUsed(!isENTUsed);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Se connecter à ' + etab.nomEtab,
    });
  }, [navigation]);

  let CAS = null;
  const [ENTs, setENTs] = useState([]);

  React.useEffect(() => {
    getENTs(etab.url).then((result) => {
      CAS = result.CAS;
      navigation.setOptions({
        headerTitle: 'Se connecter à ' + result.nomEtab,
      });

      const hostname = CAS.casURL.split('/')[2];

      getInfo().then((result) => {
        const ents = result.ent_list;
        
        // find ent in ents where url = hostname
        const ent = ents.find(ent => ent.url === hostname);
        setENTs(ent);
      });
    });
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function login() {
    let credentials = {
      username: username,
      password: password,
      url: etab.url.toLowerCase() + 'eleve.html',
      ent: isENTUsed ? ENTs.py : '',
    };

    if(!isENTUsed) {
      credentials.url += '?login=true';
    }

    if(credentials.username.trim() == '' || credentials.password.trim() == '') {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    getToken(credentials).then((result) => {
      const token = result.token;

      if(token == false) {
        Alert.alert('Erreur', 'Identifiant ou mot de passe incorrect.');
        return;
      }
      else {
        AsyncStorage.setItem('token', token);
        AsyncStorage.setItem('credentials', JSON.stringify(credentials));

        navigation.popToTop();
      }
    });
  }

  return (
    <ScrollView style={[styles.container, { }]}>

        <View style={[styles.loginForm]}>
            <TextInput
                label="Identifiant"
                mode="outlined"
                style={[styles.input]}
                outlineColor='transparent'
                left={<TextInput.Icon icon="account-outline" />}
                onChangeText={text => setUsername(text)}
            />

            <TextInput
                label="Mot de passe"
                mode="outlined"
                style={[styles.input]}
                outlineColor='transparent'
                left={<TextInput.Icon icon="lock-outline" />}
                secureTextEntry={true}
                onChangeText={text => setPassword(text)}
            />

            {ENTs !== undefined && ENTs.length != 0 ? (
              <View style={[styles.switchGroup]}>
                <View style={{width: '80%'}}>
                  <Text style={{opacity:0.5}}>Se connecter avec l'ENT</Text>
                  <Text style={{fontSize:16, fontWeight: 500, maxWidth: '100%'}}>{ENTs.name}</Text>
                </View>
                <Switch value={isENTUsed} onValueChange={onToggleSwitch} />
              </View>
            ) : null}

            <View style={[styles.buttons]}>
                <Button
                icon="help-circle-outline"
                mode="contained-tonal"
                style={[styles.button]}>
                    Besoin d'aide ?
                </Button>

                <Button
                icon="login"
                mode="contained"
                onPress={() => login()}
                style={[styles.button]}>
                    Se connecter
                </Button>
            </View>
        </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
    loginForm: {
        marginTop: 10,
    },
    switchGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 18,
      marginVertical: 14,
    },
    input: {
        marginHorizontal: 14,
        marginBottom: 8,

        shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,

    elevation: 2,
    zIndex: 9999,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: 14,
        gap: 8,
    },
    button: {
        flex: 1,
        marginTop: 8,
    }
});

export default LoginPronote;