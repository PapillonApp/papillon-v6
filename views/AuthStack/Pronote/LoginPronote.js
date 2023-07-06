import * as React from 'react';
import { ScrollView, View, StyleSheet, Platform, Alert, TextInput } from 'react-native';

import { useColorScheme } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme, Button, Text, Portal, Switch } from 'react-native-paper';

import { getENTs, getInfo, getToken } from '../../../fetch/AuthStack/LoginFlow';

import { useState } from 'react';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

import { School, UserCircle, KeyRound } from 'lucide-react-native';
import ListItem from '../../../components/ListItem';

function LoginTextInput({ label, icon, value, onChangeText, secureTextEntry, style }) {
  const theme = useTheme();

  return (
    <View style={[styles.loginTextInput, { borderColor: theme.dark ? '#191919' : '#e5e5e5'}, style]}>
      <>
        {icon}
      </>
      <TextInput
        style={[styles.loginTextInputText]}
        placeholder={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      ></TextInput>
    </View>
  )
}

function LoginPronote({ route, navigation }) {
  const theme = useTheme();
  const scheme = useColorScheme();

  const { etab } = route.params;
  const [etabName, setEtabName] = useState(etab.nomEtab);

  const [useEduconnect, setUseEduconnect] = React.useState(false);

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

      setEtabName(result.nomEtab);

      const hostname = CAS.casURL.split('/')[2];

      getInfo().then((result) => {
        const ents = result.ent_list;
        
        // find ent in ents where url = hostname
        const ent = ents.find(ent => ent.url === hostname);
        setENTs(ent);

        setUseEduconnect(ent.educonnect);
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

        <ListItem
          title={"Connexion à l'établissement " + etabName}
          subtitle={"Vous pouvez vous connecter à l’aide de vos identifiants " + (useEduconnect ? "EduConnect" : "Pronote") + "."}
          icon={<School color="#29947A" />}
          color="#29947A"
          style={{ marginTop: 14 }}
          isLarge={true}
        />

        <View style={[styles.loginForm]}>

            <View style={[styles.loginGroup, { backgroundColor: theme.dark ? '#111' : '#fff', borderColor: theme.colors.outline, borderColor: theme.dark ? '#191919' : '#e5e5e5'}]}>
              <LoginTextInput
                label="Identifiant"
                icon={<UserCircle style={styles.loginGroupIcon} color={theme.dark ? '#fff' : "#000"} />}
                value={username}
                onChangeText={text => setUsername(text)}
                style={{borderBottomWidth: 1}}
              />
              <LoginTextInput
                label="Mot de passe"
                icon={<KeyRound style={styles.loginGroupIcon} color={theme.dark ? '#fff' : "#000"} />}
                value={password}
                secureTextEntry={true}
                onChangeText={text => setPassword(text)}
              />
              {ENTs !== undefined && ENTs.length != 0 ? (
                <View style={[styles.switchGroup, style={borderTopWidth: 1, borderColor: theme.dark ? '#191919' : '#e5e5e5'}]}>
                  <View style={{width: '80%'}}>
                    <Text style={{opacity:0.5}}>Se connecter avec l'ENT</Text>
                    <Text style={{fontSize:16, fontWeight: 500, maxWidth: '100%'}}>{ENTs.name}</Text>
                  </View>
                  <Switch value={isENTUsed} onValueChange={onToggleSwitch} />
                </View>
              ) : null}
            </View>

            <View style={[styles.buttons]}>
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
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: 13,
    },
    loginGroup : {
      marginHorizontal: 14,
      marginVertical: 14,
      borderRadius: 12,
      borderCurve: 'continuous',
      borderWidth: 1,
      overflow: 'hidden',
    },
    loginTextInput: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      gap: 16,
    },
    loginTextInputText: {
      fontSize: 15,
      flex: 1,
    },
    loginGroupIcon : {
      opacity: 0.5,
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
        fontSize: 16,
    }
});

export default LoginPronote;