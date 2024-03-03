import React, { createRef, useRef, useState, useEffect } from 'react';
import { View, Alert, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import GetUIColors from '../../../utils/GetUIColors';

import { WebView } from 'react-native-webview';

import { authenticateToken, getPronoteInstanceInformation, defaultPawnoteFetcher, type PronoteInstanceInformation, PronoteApiAccountId } from 'pawnote';

const NGPronoteWebviewLogin = ({ route, navigation }: {
  navigation: any; // TODO
  route: {
    params: {
      instanceURL: string
    }
  }
}) => {
  const instanceURL = route.params.instanceURL;
  const UIColors = GetUIColors();

  const infoMobileURL = instanceURL.split('/pronote/')[0] + '/pronote/InfoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4';

  const [fetchDone, setFetchDone] = useState(false);
  const [infoInfo, setInfoInfo] = useState<PronoteInstanceInformation | null>(null);

  let webViewRef = createRef<WebView>();

  const uuid = '0D264427-EEFC-4810-A9E9-346942A862A4';

  const INJECT_PRONOTE: string = `
  (function(){try{
                        var lJetonCas = "", lJson = JSON.parse(document.body.innerText);
                        lJetonCas = !!lJson && !!lJson.CAS && lJson.CAS.jetonCAS;
                        document.cookie = "appliMobile=;expires=" + new Date(0).toUTCString();
                        if(!!lJetonCas) {
                        document.cookie = "validationAppliMobile="+lJetonCas+";expires=" + new Date(new Date().getTime() + (5*60*1000)).toUTCString();
                        document.cookie = "uuidAppliMobile=${uuid};expires=" + new Date(new Date().getTime() + (5*60*1000)).toUTCString();
                        document.cookie = "ielang=1036;expires=" + new Date(new Date().getTime() + (365*24*60*60*1000)).toUTCString();
                        window.ReactNativeWebView.postMessage('nextStep:1');
                        return true;
                        } else return false;
                        } catch(e){return false;}})();
  `;

  const INJECT_LOGIN = `
    (function(){
      if (window && window.loginState) {
        window.ReactNativeWebView.postMessage('loginstate:' + JSON.stringify(window.loginState));
      }
      return window && window.loginState ? JSON.stringify(window.loginState) : '';
    })();
  `;

  let injected = 0;

  let url = infoMobileURL;

  const onNavigationStateChange = async (navigationState: WebViewNavigation) => {
    url = navigationState.url;
    console.log('[NGPWVL] Redirected to :', url);
    
    if (injected < 2) {
      console.log('[NGPWVL] Injecting pronote...');
      await webViewRef.current.injectJavaScript(INJECT_PRONOTE);
      injected += 1;
    }
  };

  useEffect(() => {
    let interval = setInterval(async () => {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(INJECT_LOGIN);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [loggedPronote, setLoggedPronote] = useState(null);

  const onMessage = (event: any) => {
    const { data } = event.nativeEvent;

    if (data.trim() == 'nextStep:1') {
      console.log('[NGPWVL] Next step...');
      webViewRef.current.injectJavaScript(`
        window.location.assign("${instanceURL}?fd=1");
      `);
    }

    if (data.startsWith('loginstate:')) {
      const json = JSON.parse(data.split('loginstate:')[1]);
      console.log(json)
      setLoggedPronote(json);
    }
  };

  useEffect(() => {
    async function fetchInfo(loggedPronote) {
      console.log(loggedPronote);
    }

    if (loggedPronote && loggedPronote.status == 0) {
      fetchInfo(loggedPronote);
    }
  }, [loggedPronote]);

  return (
    <View style={[{
      flex: 1,
      backgroundColor: UIColors.modalBackground
    }]}>
      <WebView
        ref={webViewRef}
        source={{ uri: infoMobileURL }}
        onNavigationStateChange={onNavigationStateChange}
        onMessage={onMessage}
        incognito={false}
        userAgent='Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0'
      />
    </View>
  )
};

export default NGPronoteWebviewLogin;