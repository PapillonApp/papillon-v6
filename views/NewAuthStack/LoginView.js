import React, { useState, useEffect } from 'react';
import { View, StatusBar, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView, Dimensions } from 'react-native';

import { PressableScale } from 'react-native-pressable-scale';

import { Text } from 'react-native-paper';

import GetUIColors from '../../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import packageJson from '../../package.json';
import { LinearGradient } from 'expo-linear-gradient';

import * as WebBrowser from 'expo-web-browser';

const LoginView = ({ navigation }) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const dimensions = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  }

  const openURL = async (url) => {
    await WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'close',
      presentationStyle: 'currentContext',
      controlsColor: UIColors.primary,
    });
  }

  return (
    <LinearGradient
      style={[styles.container, {backgroundColor: UIColors.element}]}
      colors={[UIColors.theme == 'dark' ? '#1A3A2F' : '#CDEBE1', UIColors.element]}
      locations={[0, 0.5]}
    >
      <StatusBar
        animated
        barStyle={UIColors.theme == 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={'transparent'}
      />

      { dimensions.width < 500 && (
        <Image
          source={require('../../assets/welcome_ailes.png')}
          style={styles.aile}
        />
      )}

      <View style={[styles.loginButtons, {bottom: insets.bottom}]}>
        <View style={styles.head}>
          <Image 
            source={
              UIColors.theme == 'light' ?
                require('../../assets/logotype_gray.png')
              :
                require('../../assets/logotype_gray_dark.png')
            }
            style={styles.logotype}
          />
          <Text style={styles.headText}>
            L'app de vie scolaire préférée de ton app de vie scolaire préférée
          </Text>
        </View>

        <PressableScale
          style={[styles.loginBtn, styles.loginBtnPronote]}
          weight='light'
          activeScale={0.95}
          onPress={() => {
            navigation.navigate('PronoteFindEtab')
          }}
        >
          <Image
            source={require('../../assets/logo_modern_pronote.png')}
            style={styles.loginBtnIcon}
          />
          <Text style={[styles.loginBtnText, styles.loginBtnTextPronote]}>Continuer avec Pronote</Text>
        </PressableScale>
        

        <PressableScale
          style={[styles.loginBtn, styles.loginBtnED]}
          weight='light'
          activeScale={0.95}
          onPress={() => {
            navigation.navigate('LoginEcoleDirecte')
          }}
        >
          <Image
            source={require('../../assets/logo_modern_ed.png')}
            style={styles.loginBtnIcon}
          />
          <Text style={[styles.loginBtnText, styles.loginBtnTextPronote]}>Continuer avec EcoleDirecte</Text>
        </PressableScale>


        <TouchableOpacity
          style={[styles.loginBtn, styles.loginBtnOther]}
          activeOpacity={0.5}
          onPress={() => {
            navigation.navigate('LoginSkolengoSelectSchool')
          }}
        >
          <Image
            source={require('../../assets/logo_modern_skolengo.png')}
            style={styles.loginBtnIcon}
          />
          <Text style={[styles.loginBtnText, styles.loginBtnOtherText]}>Se connecter via Skolengo</Text>
        </TouchableOpacity>

        <Text style={styles.condText} onPress={() => openURL('https://docs.getpapillon.xyz/documents/privacy-policy/')}>
          Papillon ver. {packageJson.version} {packageJson.canal} - crée avec {'<3'} par la team{'\n'}
          En continuant, vous acceptez notre politique de confidentialité.
        </Text>
      </View>
      
    </LinearGradient>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  aile: {
    position: 'absolute',
    right: 0,

    objectFit: 'contain',

    width: '80%',
    height: '70%',
  },

  loginButtons: {
    width: '90%',
    marginLeft: '5%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    
    position: 'absolute',
    bottom: 0,
    paddingBottom: 20,
  },

  loginBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  loginBtnIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },

  loginBtnText: {
    fontSize: 16,
    fontFamily: 'Papillon-Medium',
  },

  loginBtnPronote: {
    backgroundColor: '#12835F',
    marginTop: 25,

    elevation: 3,
  },
  loginBtnTextPronote: {
    color: '#FFFFFF',
  },

  loginBtnED: {
    backgroundColor: '#0062A6',
  },

  loginBtnOther: {
    backgroundColor: '#FFFFFF00',
  },
  loginBtnOtherText: {
    opacity: 0.6,
  },

  condText: {
    fontSize: 12,
    fontFamily: 'Papillon-Medium',
    textAlign: 'center',
    marginTop: 25,
    opacity: 0.2,
  },

  head: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  logotype: {
    height: 32,
    resizeMode: 'contain',
  },

  headText: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    textAlign: 'center',
    opacity: 0.7,
  },
});


export default LoginView;