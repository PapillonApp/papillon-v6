import React, { useCallback, useMemo, useState, useEffect } from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { useColorScheme, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IndexDataInstance } from './fetch';

import loadFonts from './utils/Fonts';

import { AppContextProvider } from './utils/AppContext';

import LoginView from './views/NewAuthStack/LoginView';
import SelectService from './views/NewAuthStack/SelectService';
import FindEtab from './views/NewAuthStack/Pronote/FindEtab';
import LocateEtab from './views/NewAuthStack/Pronote/LocateEtab';
import LocateEtabList from './views/NewAuthStack/Pronote/LocateEtabList';
import LoginURL from './views/NewAuthStack/Pronote/LoginURL';
import ScanPronoteQR from './views/NewAuthStack/Pronote/NewPronoteQR';
import NGPronoteLogin from './views/NewAuthStack/Pronote/NGPronoteLogin';
import InputPronoteQRPin from './views/NewAuthStack/Pronote/LoginPronoteQRToken';
import { LoginSkolengoSelectSchool } from './views/NewAuthStack/Skolengo/LoginSkolengoSelectSchool';

const headerTitleStyles = {
  headerLargeTitleStyle: {
    fontFamily: 'Papillon-Semibold',
    fontSize: 28,
  },
  headerTitleStyle: {
    fontFamily: 'Papillon-Semibold',
  },
  headerBackTitleStyle: {
    fontFamily: 'Papillon-Medium',
  },
};

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={
        {
          ...headerTitleStyles,
          headerBackTitleVisible: true,
        }
      }
    >
      <Stack.Screen
        name="NewLogin"
        component={LoginView}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="SelectService"
        component={SelectService}
        options={{
        }}
      />

      <Stack.Screen
        name="FindEtab"
        component={FindEtab}
        options={{
          headerTitle: 'Connexion via PRONOTE',
        }}
      />
      <Stack.Screen
        name="LocateEtab"
        component={LocateEtab}
        options={{
          headerTitle: 'Ville de l\'établissement',
          headerBackTitle: 'Retour',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="LocateEtabList"
        component={LocateEtabList}
        options={{
          headerTitle: 'Établissements',
          headerBackTitle: 'Ville',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="LoginURL"
        component={LoginURL}
        options={{
          headerTitle: 'Utiliser une URL',
          headerBackTitle: 'Connexion',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="NewPronoteQR"
        component={ScanPronoteQR}
        options={{
          headerTitle: 'Scanner un QR-Code',
          headerBackTitle: 'Retour',
          headerTransparent: true,
          headerTintColor: '#ffffff',
        }}
      />
      <Stack.Screen
        name="LoginPronoteQR"
        component={InputPronoteQRPin}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="NGPronoteLogin"
        component={NGPronoteLogin}
        options={{
          headerTitle: 'Se connecter',
          headerTransparent: true,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="LoginSkolengoSelectSchool"
        component={LoginSkolengoSelectSchool}
        options={{
          title: 'Se connecter via Skolengo',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

import {
  Home as PapillonIconsHome,
  HomeFill as PapillonIconsHomeFill,
  Calendar as PapillonIconsCalendar,
  CalendarFill as PapillonIconsCalendarFill,
  Book as PapillonIconsBook,
  Stats as PapillonIconsStats,
  News as PapillonIconsNews,
  NewsFill as PapillonIconsNewsFill,
} from './interface/icons/PapillonIcons';

import HomeScreen from './views/HomeScreen';
import CoursScreen from './views/CoursScreen';
import DevoirsScreen from './views/DevoirsScreen';
import GradesScreen from './views/GradesScreenNew';
import NewsScreen from './views/NewsScreen';

import GetUIColors from './utils/GetUIColors';

function AppTabs() {
  const UIColors = GetUIColors();

  const [settings, setSettings] = useState({ hideTabBarTitle: false });

  return (
    <Tab.Navigator
      screenOptions={{
        headerTruncatedBackTitle: 'Retour',
        elevated: false,
        tabBarLabelStyle: {
          fontFamily: 'Papillon-Medium',
          fontSize: 12.5,
          letterSpacing: 0.2,

          margin: 0,
          padding: 0,

          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        },
        headerTitleStyle: {
          fontFamily: 'Papillon-Semibold',
        },
        tabBarShowLabel: settings?.hideTabBarTitle ? false : true,
        tabBarActiveTintColor:
          !settings?.hideTabBarTitle ? UIColors.primary :
            UIColors.dark ? '#ffffff' : '#000000',
        tabBarInactiveTintColor: 
          settings?.hideTabBarTitle ?
            UIColors.dark ? '#ffffff' : '#000000' :
            UIColors.dark ? '#ffffff77' : '#00000077',
        tabBarStyle: {
          paddingHorizontal: 8,
          backgroundColor: UIColors.background,
          borderTopWidth: UIColors.dark ? 0 : 0.5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size, focused }) =>
            !focused ? (
              <PapillonIconsHome stroke={color} width={size+2} height={size+2} />
            ) : (
              <PapillonIconsHomeFill fill={color} stroke={color} width={size+2} height={size+2} />
            ),
        }}
      />
      <Tab.Screen
        name="Cours"
        component={CoursScreen}
        options={{
          tabBarLabel: 'Cours',
          tabBarIcon: ({ color, size, focused }) => (
            !focused ? (
              <PapillonIconsCalendar stroke={color} width={size+2} height={size+2} />
            ) : (
              <PapillonIconsCalendarFill fill={color} stroke={color} width={size+2} height={size+2} />
            )
          ),
        }}
      />
      <Tab.Screen
        name="Devoirs"
        component={DevoirsScreen}
        options={{
          tabBarLabel: 'Devoirs',
          tabBarIcon: ({ color, size }) => (
            <PapillonIconsBook stroke={color} width={size+2} height={size+2} />
          ),
        }}
      />
      <Tab.Screen
        name="Notes"
        component={GradesScreen}
        options={{
          tabBarLabel: 'Notes',
          tabBarIcon: ({ color, size }) => (
            <PapillonIconsStats stroke={color} width={size+2} height={size+2} />
          ),
        }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{
          tabBarLabel: 'Actualités',
          tabBarIcon: ({ color, size, focused }) => (
            !focused ? (
              <PapillonIconsNews fill={color} stroke={color} width={size+2} height={size+2} />
            ) : (
              <PapillonIconsNewsFill fill={color} stroke={color} width={size+2} height={size+2} />
            )
          ),
        }}
      />
    </Tab.Navigator>
  );
}

import SettingsScreen from './views/SettingsScreen';

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={
        {
          ...headerTitleStyles,
          headerBackTitleVisible: true,
        }
      }
    >
      <Stack.Screen
        name="Tabs"
        component={AppTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="InsetSettings"
        component={SettingsScreen}
        options={{
          headerTitle: 'Préférences',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

function App() {
  const scheme = useColorScheme();
  
  const [appIsReady, setAppIsReady] = React.useState(false);
  const [dataProvider, setDataProvider] = React.useState<IndexDataInstance | null>(null);	
  const [loggedIn, setLoggedIn] = React.useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts.
        await loadFonts();

        const serviceName = await AsyncStorage.getItem('service');
        const provider = new IndexDataInstance();	
        setDataProvider(provider);

        if (serviceName === 'pronote' || serviceName === 'skolengo') {
          await provider.init(serviceName);
          console.log('app.prepare:', provider.initialized, provider.initializing);
          // We consider we have some data in cache, so let's try to run...
          if (provider.isNetworkFailing) {
            console.warn('app.prepare: network failing, sign in with cache only.');
            setLoggedIn(true);
          }
          // When it's not failing, just read from provider.
          else setLoggedIn(Boolean(provider.pronoteInstance || provider.skolengoInstance));
        }

      } catch (error) {
        console.error('app.prepare:', error);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const ctxValue = React.useMemo(() => ({	
    loggedIn,	
    setLoggedIn,	
    dataProvider,
    setDataProvider
  }),	[loggedIn, dataProvider]);

  return appIsReady ? (
    <View style={{
      flex: 1,
      backgroundColor: scheme === 'dark' ? '#000' : '#f2f2f7',
    }}>
      <PaperProvider>
        <AppContextProvider state={ctxValue}>
          <View style={{ flex: 1 }}>
            {loggedIn ? <AppStack /> : <AuthStack />}
          </View>
        </AppContextProvider>
      </PaperProvider>
    </View>
  ) : null;
}

export default App;