import React, { useEffect, useState, useMemo } from 'react';
import { View } from 'react-native';
import { AppContextProvider } from './utils/AppContext';
import * as appContext from './utils/AppContext';
import { IndexDataInstance } from './fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import loadFonts from './utils/Fonts';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import AppStack from './stacks/AppStack';
import AuthStack from './stacks/AuthStack';
import LoadingScreen from './stacks/LoadingScreen';
import { startNetworkLogging } from 'react-native-network-logger';
import FlashMessage from 'react-native-flash-message';
startNetworkLogging();
const provider = new IndexDataInstance();

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const dataProvider = useMemo(() => provider, [provider]); // Use memo for dataProvider

  useEffect(() => {
    const prepare = async () => {
      try {
        await loadFonts();

        const serviceName = await AsyncStorage.getItem('service');

        if (!serviceName) {
          setLoading(false);
          return;
        }

        if (serviceName === 'pronote') {
          setLoggedIn(true);
          await provider.init(serviceName);
        } else if (serviceName === 'skolengo') {
          await provider.init(serviceName);
          setLoggedIn(Boolean(provider.pronoteInstance || provider.skolengoInstance || provider.isNetworkFailing));
        } else if (serviceName === 'ecoledirecte') {
          await provider.init(serviceName);
          setLoggedIn(true);
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    prepare();
  }, []);

  const ctxValue = useMemo(() => ({
    loggedIn,
    setLoggedIn,
    dataProvider,
  }), [loggedIn, dataProvider]); // Use memo for ctxValue

  appContext.setContextValues(ctxValue);

  const AltScreens = [
    {
      name: 'NetworkLoggerScreen',
      component: require('./views/Settings/NetworkLogger').default,
      options: {
        presentation: 'modal',
        headerTitle: 'Historique réseau',
      },
    },
    {
      name: 'ConsentScreen',
      component: require('./views/NewAuthStack/ConsentScreen').default,
      options: {
        presentation: 'modal',
        headerTitle: 'Termes & conditions',
        headerBackVisible: false,
      },
    },
    {
      name: 'ConsentScreenWithoutAcceptation',
      component: require('./views/ConsentScreenWithoutAcceptation').default,
      options: {
        presentation: 'modal',
        headerTitle: 'Termes & conditions',
        headerBackVisible: false,
      },
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <AppContextProvider state={ctxValue}>
        <Stack.Navigator>
          {loading ? (
            <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
          ) : loggedIn ? (
            <Stack.Screen name="AppStack" component={AppStack} options={{ headerShown: false, animation: 'fade', animationDuration: 150 }} />
          ) : (
            <Stack.Screen name="AuthStack" component={AuthStack} options={{ headerShown: false }} />
          )}
          {AltScreens.map((screen, index) => (
            <Stack.Screen key={index} name={screen.name} component={screen.component} options={screen.options} />
          ))}
        </Stack.Navigator>
      </AppContextProvider>
      <FlashMessage position="top" />
    </View>
  );
}

export default App;
