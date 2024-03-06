import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { Platform, Text, ActivityIndicator, View } from 'react-native';
import { AppContextProvider } from './utils/AppContext';
import * as appContext from './utils/AppContext';
import { IndexDataInstance } from './fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import AppStack from './stacks/AppStack';
import AuthStack from './stacks/AuthStack';
import LoadingScreen from './stacks/LoadingScreen';
import NetworkLoggerScreen from './views/Settings/NetworkLogger'; // Direct import

import loadFonts from './utils/Fonts';

import { startNetworkLogging } from 'react-native-network-logger';
startNetworkLogging();

function App() {
  const [dataProvider] = useState(new IndexDataInstance()); // Use state directly for initialization
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prepare = async () => {
      await loadFonts();

      const serviceName = await AsyncStorage.getItem('service');

      if (!serviceName) {
        setLoading(false);
        return;
      }

      if (serviceName === 'pronote') {
        setLoggedIn(true);
        await dataProvider.init(serviceName);
      } else if (serviceName === 'skolengo') {
        await dataProvider.init(serviceName);
        setLoggedIn(Boolean(dataProvider.pronoteInstance || dataProvider.skolengoInstance || dataProvider.isNetworkFailing));
      }

      setLoading(false);
    };

    prepare();
  }, []);

  const ctxValue = useMemo(() => ({
    loggedIn,
    setLoggedIn,
    dataProvider,
  }), [loggedIn, dataProvider]);

  appContext.setContextValues(ctxValue);

  const AltScreens = [
    {
      name: 'NetworkLoggerScreen',
      component: NetworkLoggerScreen, // Direct component reference
      options: {
        presentation: 'modal',
        headerTitle: 'Historique réseau',
      },
    },
  ];

  return (
    <AppContextProvider state={ctxValue}>
      <Stack.Navigator>
        {loading ? (
          <Stack.Screen
            name="Loading"
            component={LoadingScreen}
            options={{ headerShown: false }}
          />
        ) : loggedIn ? (
          <Stack.Screen
            name="AppStack"
            component={AppStack}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="AuthStack"
            component={AuthStack}
            options={{ headerShown: false }}
          />
        )}
        {AltScreens.map((screen, index) => (
          <Stack.Screen key={index} {...screen} /> // Destructure and use spread operator
        ))}
      </Stack.Navigator>
    </AppContextProvider>
  );
}

export default App;
