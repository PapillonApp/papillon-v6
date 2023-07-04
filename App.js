import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Appbar } from 'react-native-paper';
import { getHeaderTitle } from '@react-navigation/elements';

import { PaperProvider, configureFonts } from 'react-native-paper';

import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';

import {
  MD3LightTheme,
  MD3DarkTheme,
} from 'react-native-paper';

import HomeScreen from './views/HomeScreen';

import LoginScreen from './views/AuthStack/LoginScreen';
import LoginUnavailable from './views/AuthStack/LoginUnavailable';
import LoginPronote from './views/AuthStack/LoginPronote';

const Stack = createNativeStackNavigator();

const CustomNavigationBar = ({ navigation, route, options, back }) => {
  const title = getHeaderTitle(options, route.name);

  const isModal = React.useMemo(
    () =>
      options.presentation === 'modal',
    [options.presentation]
  );

  return (
    <Appbar.Header
      mode="small"
      statusBarHeight={isModal ? 0 : undefined}
      elevated={isModal ? true : false}
    >
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <CustomNavigationBar {...props} />,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Bienvenue sur Papillon',
        }}
      />

      <Stack.Screen
        name="LoginUnavailable"
        component={LoginUnavailable}
        options={{
          title: 'Service indisponible',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="LoginPronote"
        component={LoginPronote}
        options={{
          title: 'Connexion via Pronote',
        }}
      />
    </Stack.Navigator>
  );
};

function App() {
  let loggedIn = false;

  // check if the user is logged in or not
  AsyncStorage.getItem('token').then((value) => {
    if (value !== null) {
      // user is logged in
      loggedIn = true;
    }
  });

  // dark mode
  const scheme = useColorScheme();

  const theme = {
    ...scheme === 'dark' ? MD3DarkTheme : MD3LightTheme
  };

  // load fonts
  return (
    <PaperProvider>
      <NavigationContainer theme={theme}>
        {loggedIn ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;