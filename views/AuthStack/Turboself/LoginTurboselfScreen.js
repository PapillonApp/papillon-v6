import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Eye, KeyRound, UserCircle, EyeOff} from 'lucide-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';
import PapillonButton from '../../../components/PapillonButton';
import GetUIColors from '../../../utils/GetUIColors';

const Turboself = require('papillon-turboself-core');

const ts = new Turboself();

function LoginTurboselfScreen({ navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  function login() {
    setLoading(true);
    
    if (username.trim() === '' || password.trim() === '') {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }
    try {
      ts.login(username, password).then((res) => {
        if (res.error) {
          Alert.alert('Erreur', 'Identifiants ou mot de passe incorrects');
          setLoading(false);
        } else {
          AsyncStorage.getItem('linkedAccount').then((result) => {
            let res = { restaurant: {} };
            if (result != null) {
              res = JSON.parse(result);
            }
            res.restaurant.id = 0;
            res.restaurant.username = username;
            res.restaurant.password = password;
            console.log(res);
            AsyncStorage.setItem('linkedAccount', JSON.stringify(res));
            navigation.goBack();
          });
        }
      });
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de se connecter à Turboself');
      setLoading(false);
    }
  }

  const styles = StyleSheet.create({
    nginput: {
      fontSize: 16,
      fontFamily: 'Papillon-Medium',
      paddingVertical: 4,
    },
  });
  return (
    <ScrollView>
      <View
        style={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          source={require('../../../assets/logo_turboself.png')}
          style={{
            height: 100,
            width: 100,
            borderRadius: 500,
            marginBottom: 20,
          }}
        />
        <NativeText heading="h4" style={{ opacity: 0.6 }}>
          Connexion à
        </NativeText>
        <NativeText heading="h1">Turboself</NativeText>
      </View>
      <NativeList inset>
        <NativeItem
          leading={
            <UserCircle
              color={theme.dark ? '#fff' : '#000'}
              style={{ opacity: 0.5 }}
            />
          }
        >
          <TextInput
            placeholder="Identifiant"
            placeholderTextColor={theme.dark ? '#ffffff55' : '#00000055'}
            style={[styles.nginput, { color: UIColors.text }]}
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
        </NativeItem>
        <NativeItem
          leading={
            <KeyRound
              color={theme.dark ? '#fff' : '#000'}
              style={{ opacity: 0.5 }}
            />
          }
          trailing={
            showPassword ? (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Eye
                  color={theme.dark ? '#fff' : '#000'}
                  style={{ opacity: 0.5 }}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <EyeOff
                  color={theme.dark ? '#fff' : '#000'}
                  style={{ opacity: 0.5 }}
                />
              </TouchableOpacity>
            )
          }
        >
          <TextInput
            placeholder="Mot de passe"
            placeholderTextColor={theme.dark ? '#ffffff55' : '#00000055'}
            style={[styles.nginput, { color: UIColors.text }]}
            value={password}
            secureTextEntry={showPassword}
            onChangeText={(text) => setPassword(text)}
          />
        </NativeItem>
      </NativeList>
      {loading ? (
        <ActivityIndicator style={{ marginVertical: 16 }} />
      ) : (
        <PapillonButton
          title="Connexion"
          color="#B42828"
          style={{ marginHorizontal: 16 }}
          onPress={() => login()}
        />
      )}
    </ScrollView>
  );
}

export default LoginTurboselfScreen;
