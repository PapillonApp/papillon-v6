import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, BottomNavigation } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

import useFonts from './hooks/useFonts';

import { Appbar } from 'react-native-paper';
import { getHeaderTitle } from '@react-navigation/elements';

import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { useMemo } from 'react';

import { PaperProvider, configureFonts } from 'react-native-paper';

import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Platform, useColorScheme, View } from 'react-native';

import { useCallback, useState } from 'react';

import { Home, CalendarRange, BookOpen, BarChart3, UserCircle } from 'lucide-react-native';

import {
  MD3LightTheme,
  MD3DarkTheme,
} from 'react-native-paper';

import HomeScreen from './views/HomeScreen';
import CoursScreen from './views/CoursScreen';
import SettingsScreen from './views/SettingsScreen';

import LoginScreen from './views/AuthStack/LoginScreen';
import LoginUnavailable from './views/AuthStack/LoginUnavailable';

import LoginPronoteSelectEtab from './views/AuthStack/Pronote/LoginPronoteSelectEtab';
import LoginPronote from './views/AuthStack/Pronote/LoginPronote';

const baseColor = '#29947a';

const Stack = createNativeStackNavigator();

const CustomNavigationBar = ({ navigation, route, options, back }) => {
  const title = getHeaderTitle(options, route.name);

  let titleMode = 'small';
  if (options.headerLargeTitle) {
    titleMode = 'large';
  }

  return (
    <Appbar.Header
      mode={titleMode}
      elevated={options.elevated}
    >
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} titleStyle={{fontFamily: 'Papillon-Medium'}} />
    </Appbar.Header>
  );
}

const WrappedHomeScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Vue d'ensemble"
        component={HomeScreen}
        options={{ 
          headerLargeTitle: true,
          headerLargeTitleStyle: {
            fontFamily: 'Papillon-Semibold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

const WrappedSettings = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Compte"
        component={SettingsScreen}
        options={{ 
          headerLargeTitle: true,
          headerLargeTitleStyle: {
            fontFamily: 'Papillon-Semibold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        header: Platform.OS === 'ios' ? undefined : CustomNavigationBar,
        elevated: false,
        tabBarLabelStyle: {
          fontFamily: 'Papillon-Semibold',
          fontSize: 12.5,
        },
        tabBarBadgeStyle: {
          fontFamily: 'Papillon-Medium',
          fontSize: 13,
        },
        headerTitleStyle: {
          fontFamily: 'Papillon-Semibold',
        },
      }}

      tabBar={Platform.OS !== 'ios' ? ({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          compact={true}
          safeAreaInsets={insets}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
             navigation.navigate(route.name);
            }
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({ focused, color, size: 24 });
            }

            return null;
          }}
          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.title;

            return label;
          }}
        />
      ): undefined}
    >
      <Tab.Screen
        name="Accueil"
        component={WrappedHomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size }) => {
            return <Home color={color} size={size} />;
          },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Cours"
        component={CoursScreen}
        options={{
          tabBarLabel: 'Cours',
          tabBarIcon: ({ color, size }) => {
            return <CalendarRange color={color} size={size} />;
          },
        }}
      />
      <Tab.Screen
        name="Devoirs"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Devoirs',
          tabBarIcon: ({ color, size }) => {
            return <BookOpen color={color} size={size} />;
          },
        }}
      />
      <Tab.Screen
        name="Notes"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Notes',
          tabBarIcon: ({ color, size }) => {
            return <BarChart3 color={color} size={size} />;
          },
        }}
      />
      <Tab.Screen
        name="Paramètres"
        component={WrappedSettings}
        options={{
          tabBarLabel: 'Compte',
          tabBarBadge: 1,
          tabBarIcon: ({ color, size }) => {
            return <UserCircle color={color} size={size} />;
          },
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: Platform.OS === 'ios' ? undefined : CustomNavigationBar,
        headerTitleStyle: {
          fontFamily: 'Papillon-Semibold',
        },
        headerBackTitleStyle: {
          fontFamily: 'Papillon-Semibold',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Connexion',
          headerLargeTitleStyle: {
            color: baseColor,
          },
          headerLargeTitle: true,
          headerLargeTitleStyle: {
            fontFamily: 'Papillon-Semibold',
          },
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

      <Stack.Screen name="LoginPronoteSelectEtab" component={LoginPronoteSelectEtab} options={{title: 'Sélection de l\'établissement', presentation: 'modal'}}/>
      <Stack.Screen name="LoginPronote" component={LoginPronote} options={{title: 'Se connecter', presentation: 'modal'}}/>
    </Stack.Navigator>
  );
};

function App() {
  const [loggedIn, setLoggedIn] = useState(false); 

  // check if the user is logged in or not
  AsyncStorage.getItem('token').then((value) => {
    if (value !== null) {
      // user is logged in
      setLoggedIn(true);
    }
  });

  // while not logged in, check if the user is logged in
  const loggedInInterval = setInterval(() => {
    AsyncStorage.getItem('token').then((value) => {
      if (value !== null) {
        // user is logged in
        setLoggedIn(true);
      }
      else {
        // user is not logged in
        setLoggedIn(false);
      }
    });
  }, 1000);

  const [IsReady, SetIsReady] = useState(false);

  // load fonts
  const LoadFonts = async () => {
    await useFonts();
  };

  // dark mode
  const scheme = useColorScheme();
  const { theme } = useMaterial3Theme({ fallbackSourceColor: baseColor });
  const paperTheme = {
    ...scheme === 'dark' ? MD3DarkTheme : MD3LightTheme,
    version: 3,
    colors: {
      ...scheme === 'dark' ? theme.dark : theme.light,
    }
  };

  const classicTheme = {
    ...scheme === 'dark' ? DarkTheme : DefaultTheme,
    colors: {
      ...scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors,
      primary: baseColor,
    }
  };

  if (!IsReady) {
    // load fonts
    LoadFonts().then(() => {
      SetIsReady(true);
    });

    return null;
  }

  // load fonts
  return (
    <View style={{flex: 1, backgroundColor: scheme === 'dark' ? '#000' : '#fff'}}>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer theme={classicTheme}>
          {loggedIn ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
      </PaperProvider>
    </View>
  );
}

export default App;