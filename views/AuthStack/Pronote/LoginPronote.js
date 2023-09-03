import * as React from 'react';
import { ScrollView, View, StyleSheet, Platform, Alert, TextInput, StatusBar, ActivityIndicator } from 'react-native';

import { useColorScheme } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme, Button, Text, Portal, Switch } from 'react-native-paper';

import { getENTs, getInfo, getToken } from '../../../fetch/AuthStack/LoginFlow';

import { showMessage, hideMessage } from "react-native-flash-message";

import { useState } from 'react';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

import { School, UserCircle, KeyRound } from 'lucide-react-native';
import ListItem from '../../../components/ListItem';

import PapillonButton from '../../../components/PapillonButton';
import GetUIColors from '../../../utils/GetUIColors';

function LoginTextInput({ label, icon, value, onChangeText, secureTextEntry, style }) {
  const theme = useTheme();

  return (
    <View style={[styles.loginTextInput, { borderColor: theme.dark ? '#191919' : '#e5e5e5'}, style]}>
      <>
        {icon}
      </>
      <TextInput
        style={[styles.loginTextInputText, {color: theme.dark ? '#fff' : "#000"}]}
        placeholder={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={theme.dark ? '#ffffff55' : "#00000055"}
      ></TextInput>
    </View>
  )
}

function LoginPronote({ route, navigation }) {
  const theme = useTheme();
  const scheme = useColorScheme();

  const { etab, useDemo } = route.params;
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

  function removeSubdomain(hostname) {
    if (!hostname) return;

    let domain = hostname.split('.');

    if(domain.length > 2) {
      // remove everything except the last two parts
      domain = domain.slice(domain.length - 2, domain.length);

      return domain.join('.');
    }

    return hostname;
  }

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
        const ent = ents.find(ent => removeSubdomain(ent.url) === removeSubdomain(hostname));
        setENTs(ent);

        if(ent.educonnect) {
          setUseEduconnect(ent.educonnect);
        }
        else {
          setUseEduconnect(false);
        }

        if (ent) {
          setIsENTUsed(true);
        }
      });
    });
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [connecting, setConnecting] = useState(false);

  function login() {
    let credentials = {
      username: username,
      password: password,
      url: etab.url.toLowerCase(),
      ent: isENTUsed ? ENTs.py : '',
    };

    

    if(!isENTUsed && ENTs !== undefined && ENTs.py !== undefined) {
      credentials.url += '?login=true';
    }

    if(credentials.username.trim() == '' || credentials.password.trim() == '') {
      showMessage({
        message: "Échec de la connexion",
        description: "Veuillez remplir tous les champs.",
        type: "danger",
        icon: "auto",
        floating: true,
        duration: 5000
      })
      return;
    }
    setConnecting(true)
    getToken(credentials).then((result) => {
      setConnecting(false)
      const token = result.token;

      if(token == false) {
        showMessage({
          message: "Échec de la connexion",
          description: "Veuillez vérifier vos identifiants.",
          type: "danger",
          icon: "auto",
          floating: true,
          duration: 5000
        })
        return;
      }
      else {
        AsyncStorage.setItem('token', token);
        AsyncStorage.setItem('credentials', JSON.stringify(credentials));
        AsyncStorage.setItem('service', "pronote");

        showMessage({
          message: "Connecté avec succès",
          type: "success",
          icon: "auto",
          floating: true
        })

        navigation.popToTop();
      }
    });
  }

  React.useEffect(() => {
    if(useDemo) {
      setUsername('demonstration');
      setPassword('pronotevs');
    }
  }, []);

  const UIColors = GetUIColors();

  return (
    <ScrollView style={[styles.container, {backgroundColor: UIColors.background}]}>
        { Platform.OS === 'ios' ?
          <StatusBar animated barStyle={'light-content'} />
        :
          <StatusBar animated barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor='transparent' />
        }

        <ListItem
          title={"Connexion à l'établissement " + etabName}
          subtitle={"Vous pouvez vous connecter à l’aide de vos identifiants " + (useEduconnect ? "EduConnect" : "Pronote") + "."}
          icon={<School color="#159C5E" />}
          color="#159C5E"
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
                {connecting ? (
                <ListItem
                  title="Connexion..."
                  left={
                    <ActivityIndicator size="small" />
                  }
                  style={[styles.button, {alignContent: 'center', alignItems: 'center'}]}
                />
                //<Text style={{"display": "flex", "alignItems": "center", "justifyContent": "center"}}><ActivityIndicator /> Connexion...</Text>
                ) : (
                <PapillonButton
                  title="Se connecter"
                  color="#159C5E"
                  onPress={() => login()}
                  style={[styles.button]}
                />)}
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
        marginTop: 8,
        flex: 1,
    }
});

export default LoginPronote;