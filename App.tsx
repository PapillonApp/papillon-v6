import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { Platform, ActivityIndicator, View } from 'react-native';
import { AppContextProvider } from './utils/AppContext';
import * as appContext from './utils/AppContext';
import { IndexDataInstance } from './fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import loadFonts from './utils/Fonts';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import AppStack from './stacks/AppStack';
import AuthStack from './stacks/AuthStack';

import { startNetworkLogging } from 'react-native-network-logger';
startNetworkLogging();

const provider = new IndexDataInstance();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size={'large'} />
    </View>
  );
}

function App() {
  const [dataProvider, setDataProvider] = useState(provider);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prepare = async () => {
      await loadFonts();

      const serviceName = await AsyncStorage.getItem('service');

      if(serviceName === null || serviceName === 'undefined') {
        setLoading(false);
        return;
      }

      if(serviceName === 'pronote') {
        setLoggedIn(true);
        await provider.init(serviceName);
        setLoading(false);
      }

      if (serviceName === 'skolengo') {
        await provider.init(serviceName);
        setLoggedIn(Boolean(provider.pronoteInstance || provider.skolengoInstance || provider.isNetworkFailing));
        setLoading(false);
      }
    };

    prepare();
  }, []);

  const ctxValue = useMemo(() => ({
    loggedIn,
    setLoggedIn,
    dataProvider,
    setDataProvider
  }), [loggedIn, dataProvider]);

  appContext.setContextValues(ctxValue);

  const AltScreens = [
    {
      name: 'NetworkLoggerScreen',
      component: require('./views/Settings/NetworkLogger').default,
      options: {
        presentation: 'modal',
        headerTitle: 'Historique réseau',
      }
    }
  ];

  return (
    <View style={{ flex: 1 }}>
      <AppContextProvider state={ctxValue}>
        <View style={{ flex: 1 }}>
          <Stack.Navigator>
            {loading ? (
              <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
            ) :
              loggedIn ? (
                <Stack.Screen name="AppStack" component={AppStack} options={{ headerShown: false }} />
              ) : (
                <Stack.Screen name="AuthStack" component={AuthStack} options={{ headerShown: false }} />
              )
            }

            {
              AltScreens.map((screen, index) => (
                <Stack.Screen key={index} name={screen.name} component={screen.component} options={screen.options} />
              ))
            }
          </Stack.Navigator>
        </View>
      </AppContextProvider>
    </View>
  );
}

export default App;
