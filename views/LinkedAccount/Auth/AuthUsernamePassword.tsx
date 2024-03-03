import React from 'react';
import {Image, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import NativeText from '../../../components/NativeText';
import NativeItem from '../../../components/NativeItem';
import {Eye, EyeOff, KeyRound, UserCircle} from 'lucide-react-native';
import NativeList from '../../../components/NativeList';
import {Text, useTheme} from 'react-native-paper';
import getUIColors from '../../../utils/GetUIColors';
import PapillonButton from '../../../components/PapillonButton';

function AuthUsernamePassword({route, navigation}) {
  const theme = useTheme();
  const UIColors = getUIColors();

  const service = route.params;

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [connecting, setConnecting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(true);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Connexion à ' + service.name,
    });
  });
  return (
    <ScrollView>
      <View style={{flex: 1, display: 'flex', alignItems: 'center'}}>

        <Image source={service.logo} style={{height: 100, width: 100, marginVertical: 16}}/>
        <NativeText heading={'h1'}>Connexion à {service.name}</NativeText>
      </View>

      <NativeList inset>
        <NativeItem
          leading={
            <UserCircle
              color={theme.dark ? '#fff' : '#000'}
              style={{opacity: 0.5}}
            />
          }
        >
          <TextInput
            placeholder="Identifiant"
            placeholderTextColor={theme.dark ? '#ffffff55' : '#00000055'}
            style={[styles.nginput, {color: UIColors.text}]}
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
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <Eye color={theme.dark ? '#fff' : '#000'} style={{ opacity: 0.5 }} />
              ):(
                <EyeOff color={theme.dark ? '#fff' : '#000'} style={{ opacity: 0.5 }}/>
              )}
            </TouchableOpacity>
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
      <View
        style={[
          styles.loginForm,
          Platform.OS !== 'ios' && styles.loginFormAndroid,
        ]}
      >
        <View style={[styles.buttons]}>
          <PapillonButton
            color={service.color}
            title="Se connecter"
            style={styles.button}
            onPress={() => {
            }}

            left={void 0}
            light={void 0}
          />
        </View>

        {Platform.OS === 'android' ? <View style={{height: 15}}/> : null}

        <View style={[styles.bottomText]}>
          <Text style={[styles.bottomTextText]}>
            En vous connectant, vous acceptez les{' '}
            <Text style={{fontWeight: 'bold'}}>
              conditions d'utilisation
            </Text>{' '}
            de Papillon.
          </Text>

          <Text style={[styles.bottomTextText]}>
            {service.package.name} version {service.package.version}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loginHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 70,
    paddingHorizontal: 28,
    paddingBottom: 18,
  },
  loginHeaderLogo: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
  },
  loginHeaderText: {
    fontSize: 18,
    fontFamily: 'Papillon-Semibold',
    marginTop: 16,
    textAlign: 'center',
  },
  loginHeaderDescription: {
    fontSize: 15,
    marginTop: 2,
    opacity: 0.5,
    textAlign: 'center',
  },
  loginHeaderError: {
    fontSize: 15,
    marginTop: 10,
    color: '#159C5E',
    fontWeight: 500,
    textDecorationLine: 'underline',
  },

  loginForm: {
    marginTop: -10,
  },
  loginFormAndroid: {
    marginTop: 0,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 13,
  },
  loginGroup: {
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
  loginGroupIcon: {
    opacity: 0.5,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 15,
    gap: 8,
  },
  button: {
    marginTop: 8,
    flex: 1,
  },

  bottomText: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    gap: 4,
  },

  bottomTextText: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.5,
  },

  nginput: {
    fontSize: 16,
    fontFamily: 'Papillon-Medium',
    paddingVertical: 4,
  },
});

export default AuthUsernamePassword;
