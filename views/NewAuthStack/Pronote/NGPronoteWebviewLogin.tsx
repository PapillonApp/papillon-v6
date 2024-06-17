import React, { createRef, useRef, useState } from 'react';
import { Alert, Animated, View, TouchableOpacity, Platform, Modal, Text, ActivityIndicator, StatusBar, Touchable } from 'react-native';
import GetUIColors from '../../../utils/GetUIColors';

import PapillonCloseButton from '../../../interface/PapillonCloseButton';

import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStoragePronoteKeys } from '../../../fetch/PronoteData/connector';
import { useAppContext } from '../../../utils/AppContext';
import { PronoteApiAccountId } from 'pawnote';

import { ArrowRightToLine, KeyRound } from 'lucide-react-native';

// Stolen from Pawnote
// TODO: Export this function in Pawnote, to reuse it here.
const cleanPronoteUrl = (url: string): string => {
  let pronote_url = new URL(url);
  // Clean any unwanted data from URL.
  pronote_url = new URL(`${pronote_url.protocol}//${pronote_url.host}${pronote_url.pathname}`);

  // Clear the last path if we're not main selection menu.
  const paths = pronote_url.pathname.split('/');
  if (paths[paths.length - 1].includes('.html')) {
    paths.pop();
  }

  // Rebuild URL with cleaned paths.
  pronote_url.pathname = paths.join('/');
  pronote_url.pathname = pronote_url.pathname.toLowerCase();

  // Return rebuilt URL without trailing slash.
  return pronote_url.href.endsWith('/')
    ? pronote_url.href.slice(0, -1)
    : pronote_url.href;
};


const makeUUID = (): string => {
  let dt = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (c) => {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
};

const NGPronoteWebviewLogin = ({ route, navigation }: {
  navigation: any; // TODO
  route: {
    params: {
      instanceURL: string
    }
  }
}) => {
  const instanceURL = cleanPronoteUrl(route.params.instanceURL);
  const appContext = useAppContext();
  const UIColors = GetUIColors();

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [showWebView, setShowWebView] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const [currentURL, setCurrentURL] = useState('');

  const animatedLoading = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedLoading, {
      toValue: loadProgress,
      duration: 100,
      useNativeDriver: false
    }).start();
  }, [loadProgress]);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false
        })
      ])
    ).start();
  }, []);

  let webViewRef = createRef<WebView>();
  let currentLoginStateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const infoMobileURL = instanceURL + '/InfoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4';
  const [deviceUUID] = useState(makeUUID());

  React.useEffect(() => {
    fetch(infoMobileURL)
      .then(response => response.json()
        .then(data => {
          if (data.CAS.actif === false) {
            navigation.goBack();
            navigation.navigate('NGPronoteLogin', {
              instanceURL: instanceURL
            });
          }
        })
        .catch(() => {
          navigation.goBack()
          Alert.alert("URL invalide", "Cet URL ne semble pas diriger vers une instance Pronote.\nVeuillez la vérifier et recommencer.")
        })
      )
  }, []);

  // PapillonCloseButton in header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginRight: 0,
          gap: 10
        }}>
          { loading ? (
            <ActivityIndicator />
          ) : null }

          <TouchableOpacity
            style={{
              opacity: 0.4
            }}
            onPress={() => {
              Alert.alert(
                'Souhaitez-vous vous connecter sans ENT ?',
                'La connexion sans ENT requiert des codes PRONOTE et non vos codes ENT ou EduConnect.',
                [
                  {
                    text: 'Annuler',
                    style: 'cancel'
                  },
                  {
                    text: 'Se connecter',
                    style: 'destructive',
                    onPress: () => {
                      navigation.navigate('NGPronoteLogin', {
                        instanceURL: instanceURL
                      });
                    }
                  }
                ]
              );
            }}
          >
            <KeyRound size={24} color={UIColors.text} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, loading]);

  const PRONOTE_COOKIE_EXPIRED = new Date(0).toUTCString();
  const PRONOTE_COOKIE_VALIDATION_EXPIRES = new Date(new Date().getTime() + (5 * 60 * 1000)).toUTCString();
  const PRONOTE_COOKIE_LANGUAGE_EXPIRES = new Date(new Date().getTime() + (365 * 24 * 60 * 60 * 1000)).toUTCString();
  const INJECT_PRONOTE_JSON = `
    (function () {
      try {
        const json = JSON.parse(document.body.innerText);
        const lJetonCas = !!json && !!json.CAS && json.CAS.jetonCAS;
        
        document.cookie = "appliMobile=; expires=${PRONOTE_COOKIE_EXPIRED}"

        if (!!lJetonCas) {
          document.cookie = "validationAppliMobile=" + lJetonCas + "; expires=${PRONOTE_COOKIE_VALIDATION_EXPIRES}";
          document.cookie = "uuidAppliMobile=${deviceUUID}; expires=${PRONOTE_COOKIE_VALIDATION_EXPIRES}";
          // 1036 = French
          document.cookie = "ielang=1036; expires=${PRONOTE_COOKIE_LANGUAGE_EXPIRES}";
        }

        window.location.assign("${instanceURL}/mobile.eleve.html?fd=1");
      }
      catch {
        // TODO: Handle error
      }
    })();
  `.trim();

  /**
   * Creates the hook inside the webview when logging in.
   * Also hides the "Download PRONOTE app" button.
   */
  const INJECT_PRONOTE_INITIAL_LOGIN_HOOK = `
    (function () {
      window.hookAccesDepuisAppli = function() {
        this.passerEnModeValidationAppliMobile('', '${deviceUUID}');
      };
      
      return '';
    })();
  `.trim();

  const INJECT_PRONOTE_CURRENT_LOGIN_STATE = `
    (function () {
      setInterval(function() {
        const state = window && window.loginState ? window.loginState : false;
        if(!state) return;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'pronote.loginState',
          data: state
        }));
      }, 2000);
    })();
  `.trim();

  return (
    <View style={[{
      flex: 1,
      backgroundColor: UIColors.modalBackground
    }]}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          zIndex: 100,
          backgroundColor: UIColors.primary,
          width: animatedLoading.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%']
          }),
          shadowColor: UIColors.primary,
          shadowOpacity: 1,
          shadowRadius: 2,
          shadowOffset: {
            width: 0,
            height: 0
          },
          overflow: 'hidden',
          opacity: animatedLoading.interpolate({
            inputRange: [0, 0.99, 1],
            outputRange: [1, 1, 0]
          })
        }}
      >
        <Animated.View
          style={{
            width: '50%',
            height: '100%',
            borderRadius: 5,
            backgroundColor: '#ffffff22',
            position: 'absolute',
            top: 0,
            left: pulseAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ['-50%', '100%']
            }),
          }}
        />
      </Animated.View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={loggingIn}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }}>
          <ActivityIndicator color={'#ffffff'} />
          <Text style={{
            color: '#ffffff',
            marginTop: 10,
            fontFamily: 'Papillon-Medium',
            fontSize: 16,
          }}>
            Connexion en cours...
          </Text>
        </View>
      </Modal>
      <WebView
        ref={webViewRef}
        source={{ uri: infoMobileURL }}

        style={{
          opacity: showWebView ? 1 : 0,
        }}

        setSupportMultipleWindows={false}

        onMessage={async ({ nativeEvent }) => {
          const message = JSON.parse(nativeEvent.data);

          if (message.type === 'pronote.loginState') {
            if (!message.data) return;
            if (message.data.status !== 0) return;
            setLoggingIn(true);
            if (currentLoginStateIntervalRef.current) clearInterval(currentLoginStateIntervalRef.current);

            await AsyncStorage.multiSet([
              [AsyncStoragePronoteKeys.NEXT_TIME_TOKEN, message.data.mdp],
              [AsyncStoragePronoteKeys.ACCOUNT_TYPE_ID, PronoteApiAccountId.Student.toString()],
              [AsyncStoragePronoteKeys.INSTANCE_URL, instanceURL],
              [AsyncStoragePronoteKeys.USERNAME, message.data.login],
              [AsyncStoragePronoteKeys.DEVICE_UUID, deviceUUID],
            ]);
      
            await appContext.dataProvider?.init('pronote');
            await AsyncStorage.setItem('service', 'pronote');

            setLoading(false);
      
            navigation.popToTop();
            appContext.setLoggedIn(true);
          }
        }}

        onError={(e) => {
          console.error('Pronote webview error', e);
        }}

        onLoadProgress={({ nativeEvent }) => {
          setLoadProgress(nativeEvent.progress);
        }}

        onLoadStart={(e) => {
          const { url } = e.nativeEvent;
          setCurrentURL(url);

          setLoading(true);
        }}

        onLoadEnd={(e) => {
          const { url } = e.nativeEvent;

          if (url.includes('InfoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4')) {
            webViewRef.current?.injectJavaScript(INJECT_PRONOTE_JSON);
          }
          else {
            setLoading(false);
            setShowWebView(true);
            if (url.includes('mobile.eleve.html')) {
              webViewRef.current?.injectJavaScript(INJECT_PRONOTE_INITIAL_LOGIN_HOOK);
              webViewRef.current?.injectJavaScript(INJECT_PRONOTE_CURRENT_LOGIN_STATE);
              
              /* if (currentLoginStateIntervalRef.current) clearInterval(currentLoginStateIntervalRef.current); */
              /*currentLoginStateIntervalRef.current = setInterval(() => {
                webViewRef.current?.injectJavaScript(INJECT_PRONOTE_CURRENT_LOGIN_STATE);
              }, 250);*/
            }
          }
        }}

        incognito={true} // prevent to keep cookies on webview load
        userAgent='Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36'
      />
    </View>
  );
};

export default NGPronoteWebviewLogin;