import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import FlashMessage from "react-native-flash-message";

import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import Animated from 'react-native-reanimated';

const Tab = createBottomTabNavigator();

import useFonts from './hooks/useFonts';

import { Appbar } from 'react-native-paper';
import { getHeaderTitle } from '@react-navigation/elements';

import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { useMemo } from 'react';

import { PaperProvider, configureFonts } from 'react-native-paper';

import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Platform, useColorScheme, View, Pressable, TouchableNativeFeedback } from 'react-native';

import { useCallback, useState } from 'react';

import { StyleSheet, Text } from 'react-native';

import { PressableScale } from 'react-native-pressable-scale';

import { Home, CalendarRange, BookOpen, BarChart3, UserCircle, CheckCircle, AlertCircle } from 'lucide-react-native';

import {
  MD3LightTheme,
  MD3DarkTheme,
} from 'react-native-paper';

import HomeScreen from './views/HomeScreen';

import CoursScreen from './views/CoursScreen';
import LessonScreen from './views/Cours/LessonScreen';

import DevoirsScreen from './views/DevoirsScreen';

import SettingsScreen from './views/SettingsScreen';
import AboutScreen from './views/Settings/AboutScreen';
import ProfileScreen from './views/Settings/ProfileScreen';
import OfficialServer from './views/Settings/OfficialServer';
import AppearanceScreen from './views/Settings/AppearanceScreen';
import SettingsScreen2 from './views/Settings/SettingsScreen';
import IconsScreen from './views/Settings/IconsScreen';

import GradesScreen from './views/GradesScreen';
import GradeView from './views/Grades/GradeView';

import WelcomeScreen from './views/AuthStack/WelcomeScreen';

import LoginScreen from './views/AuthStack/LoginScreen';
import LoginUnavailable from './views/AuthStack/LoginUnavailable';

import LoginPronoteSelectEtab from './views/AuthStack/Pronote/LoginPronoteSelectEtab';
import LoginPronote from './views/AuthStack/Pronote/LoginPronote';

import NewsScreen from './views/NewsScreen';
import NewsItem from './views/News/NewsItem';

import SchoolLifeScreen from './views/SchoolLifeScreen';

import ConversationsScreen from './views/ConversationsScreen';

import EvaluationsScreen from './views/EvaluationsScreen';

const baseColor = '#29947a';

// stack
const Stack = createNativeStackNavigator();

const CustomNavigationBar = ({ navigation, route, options, back }) => {
  const title = getHeaderTitle(options, route.name);

  let titleMode = 'small';
  if (options.headerLargeTitle) {
    titleMode = 'large';
  }

  let titleColor = options.headerTintColor;
  if (options.mdTitleColor) {
    titleColor = options.mdTitleColor;
  }

  return (
    <Appbar.Header
      mode={titleMode}
      elevated={options.elevated}
      style={{
        ...options.headerStyle,
      }}
    >
      {back ? <Appbar.BackAction color={titleColor} onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} titleStyle={{fontFamily: 'Papillon-Medium'}} color={titleColor} />
      
      {options.headerRight ?
        <View style={{paddingEnd: 16}}>
          {options.headerRight ? options.headerRight() : null}
        </View>
      : null}
    </Appbar.Header>
  );
}

const InsetNewsScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android' ? {
          animation: 'fade_from_bottom',
          navigationBarColor: '#00000000',
          header: (props) => <CustomNavigationBar {...props} />,
        } : null
      }
    >
      <Stack.Screen
        name="News"
        component={NewsScreen}
        options={{ 
          headerShown: true,
          headerLargeTitle: false,
          headerTitle: 'Actualités',
        }}
      />
      <Stack.Screen
        name="NewsDetails"
        component={NewsItem}
        options={{
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  )
};

const InsetSchoolLifeScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android' ? {
          animation: 'fade_from_bottom',
          navigationBarColor: '#00000000',
          header: (props) => <CustomNavigationBar {...props} />,
        } : null
      }
    >
      <Stack.Screen
          name="Schoollife"
          component={SchoolLifeScreen}
          options={{ 
            headerShown: true,
            headerLargeTitle: false,
            headerTitle: 'Vie scolaire',
          }}
        />
    </Stack.Navigator>
  )
};

const InsetConversationsScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android' ? {
          animation: 'fade_from_bottom',
          navigationBarColor: '#00000000',
          header: (props) => <CustomNavigationBar {...props} />,
        } : null
      }
    >
      <Stack.Screen
          name="Conversations"
          component={ConversationsScreen}
          options={{
            headerShown: true,
            headerLargeTitle: false,
            headerTitle: 'Conversations',
          }}
        />
    </Stack.Navigator>
  )
};

const InsetEvaluationsScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android' ? {
          animation: 'fade_from_bottom',
          navigationBarColor: '#00000000',
          header: (props) => <CustomNavigationBar {...props} />,
        } : null
      }
    >
      <Stack.Screen
          name="Evaluations"
          component={EvaluationsScreen}
          options={{
            headerShown: true,
            headerLargeTitle: false,
            headerTitle: 'Compétences',
          }}
        />
    </Stack.Navigator>
  )
};

const WrappedHomeScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android' ? {
          animation: 'fade_from_bottom',
          navigationBarColor: '#00000000',
          header: (props) => <CustomNavigationBar {...props} />,
        } : null
      }
    >
      <Stack.Screen
        name="Vue d'ensemble"
        component={HomeScreen}
        options={{ 
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="InsetNews"
        component={InsetNewsScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="InsetSchoollife"
        component={InsetSchoolLifeScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="InsetConversations"
        component={InsetConversationsScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="InsetEvaluations"
        component={InsetEvaluationsScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="Lesson"
        component={LessonScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ 
          headerTitle: 'Mon profil',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Grade"
        component={GradeView}
        options={{ 
          headerShown: true,
          headerLargeTitle: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

const WrappedCoursScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android' ? {
          animation: 'fade_from_bottom',
          navigationBarColor: '#00000000',
          header: (props) => <CustomNavigationBar {...props} />,
        } : null
      }
    >
      <Stack.Screen
        name="Cours"
        component={CoursScreen}
        options={{ 
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="Lesson"
        component={LessonScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

const WrappedDevoirsScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android' ? {
          animation: 'fade_from_bottom',
          navigationBarColor: '#00000000',
          header: (props) => <CustomNavigationBar {...props} />,
        } : null
      }
    >
      <Stack.Screen
        name="Devoirs"
        component={DevoirsScreen}
        options={{ 
          headerShown: true,
          headerLargeTitle: false,
        }}
      />
    </Stack.Navigator>
  );
};

const WrappedGradesScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android' ? {
          animation: 'fade_from_bottom',
          navigationBarColor: '#00000000',
          header: (props) => <CustomNavigationBar {...props} />,
        } : null
      }
    >
      <Stack.Screen
        name="Notes"
        component={GradesScreen}
        options={
          Platform.OS === 'ios' ? { 
            headerShown: true,
            headerLargeTitle: true,
          } : null
        }
      />
      <Stack.Screen
        name="Grade"
        component={GradeView}
        options={{ 
          headerShown: true,
          headerLargeTitle: false,
        }}
      />
    </Stack.Navigator>
  );
};

const WrappedSettings = () => {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android' ? {
          animation: 'fade_from_bottom',
          navigationBarColor: '#00000000',
          header: (props) => <CustomNavigationBar {...props} />,
        } : null
      }
    >
      <Stack.Screen
        name="Compte"
        component={SettingsScreen}
        options={{ 
          headerLargeTitle: Platform.OS == 'ios' ? true : false,
          headerTitle: 'Compte',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ 
          headerTitle: 'Mon profil',
        }}
      />
      <Stack.Screen
        name="OfficialServer"
        component={OfficialServer}
        options={{ 
          headerTitle: 'Serveur officiel',

          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ 
          headerTitle: 'A propos de Papillon',
        }}
      />
      <Stack.Screen
        name="Appearance"
        component={AppearanceScreen}
        options={{ 
          headerTitle: 'Apparence',
        }}
      />
      <Stack.Screen
        name="Icons"
        component={IconsScreen}
        options={{ 
          headerTitle: 'Icône de l\'application',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen2}
        options={{
          headerTitle: 'Réglages',
        }}
      />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      tabBar={Platform.OS !== 'ios' ? ({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          compact={false}
          shifting={false}
          safeAreaInsets={{
            ...insets,
            right: 12,
            left: 12,
          }}
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
      screenOptions={{
        headerTruncatedBackTitle: 'Retour',
        elevated: false,
        tabBarLabelStyle: {
          fontFamily: 'Papillon-Medium',
          fontSize: 13,
          letterSpacing: 0.2,
        },
        tabBarBadgeStyle: {
          fontFamily: 'Papillon-Medium',
          fontSize: 13,
        },
        headerTitleStyle: {
          fontFamily: 'Papillon-Semibold',
        },
        tabBarShowLabel: Platform.OS === 'android' ? false : true,
        tabBarStyle: {
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 2,
        },
        tabBarButton: (props) => (
            <PressableScale
              {...props}
              activeScale={0.7}
              weight='light'
            >
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                {props.children}
              </View>
            </PressableScale>
        ),
      }}
    >
      <Tab.Screen
        name="AccueilHandler"
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
        name="CoursHandler"
        component={WrappedCoursScreen}
        options={{
          tabBarLabel: 'Cours',
          tabBarIcon: ({ color, size }) => {
            return <CalendarRange color={color} size={size} />;
          },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="DevoirsHandler"
        component={WrappedDevoirsScreen}
        options={{
          tabBarLabel: 'Devoirs',
          tabBarIcon: ({ color, size }) => {
            return <BookOpen color={color} size={size} />;
          },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="NotesHandler"
        component={WrappedGradesScreen}
        options={{
          tabBarLabel: 'Notes',
          tabBarIcon: ({ color, size }) => {
            return <BarChart3 color={color} size={size} />;
          },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="ParamètresHandler"
        component={WrappedSettings}
        options={{
          tabBarLabel: 'Compte',
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
      screenOptions={
        Platform.OS === 'android' ? {
          navigationBarColor: '#00000000',
          header: (props) => <CustomNavigationBar {...props} />,
        } : null
      }
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          title: 'Bienvenue !',
        }}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Connexion',
          headerLargeTitleStyle: {
            color: baseColor,
          },
          headerLargeTitle: Platform.OS == 'iOS' ? true : false,
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

import * as NavigationBar from 'expo-navigation-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App() {
  const [loggedIn, setLoggedIn] = useState(false); 
  const [loggedInLoaded, setLoggedInLoaded] = useState(false);

  // check if the user is logged in or not
  AsyncStorage.getItem('token').then((value) => {
    if (value !== null) {
      // user is logged in
      setLoggedIn(true);
    }
    setLoggedInLoaded(true);
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
      setLoggedInLoaded(true);
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

  // toasts
  const toastConfig = {
    success: ({ ...rest }) => (
      <BaseToast
        {...rest}
        contentContainerStyle={{ 
          paddingHorizontal: 15,
        }}
        style={{
          backgroundColor: scheme === 'dark' ? '#252525' : '#fff',
          width: '90%',
          marginTop: 10,
          borderRadius: 10,
          borderCurve: 'continuous',
          borderLeftWidth: 0,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1.5,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3,
          elevation: 5,

          borderLeftWidth: 3,
          borderLeftColor: baseColor,
        }}
        text1Style={{
          color: scheme === 'dark' ? '#fff' : '#000',
          fontSize: 17,
          fontFamily: 'Papillon-Semibold',
        }}
        text2Style={{
          color: scheme === 'dark' ? '#fff' : '#000',
          fontSize: 15,
        }}
      />
    ),
    error: ({ ...rest }) => (
      <ErrorToast
        {...rest}
        contentContainerStyle={{ 
          paddingHorizontal: 15,
        }}
        style={{
          backgroundColor: scheme === 'dark' ? '#252525' : '#fff',
          width: '90%',
          marginTop: 10,
          borderRadius: 10,
          borderCurve: 'continuous',
          borderLeftWidth: 0,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1.5,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3,
          elevation: 5,

          borderLeftWidth: 3,
          borderLeftColor: "#A84700",
        }}
        text1Style={{
          color: scheme === 'dark' ? '#fff' : '#000',
          fontSize: 17,
          fontFamily: 'Papillon-Semibold',
        }}
        text2Style={{
          color: scheme === 'dark' ? '#fff' : '#000',
          fontSize: 15,
        }}
      />
    ),
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
        <ActionSheetProvider>
          <GestureHandlerRootView style={{flex: 1}}>
            <NavigationContainer theme={classicTheme}>
              { loggedInLoaded ?
                <View style={{flex: 1}}>
                  {loggedIn ? <AppStack /> : <AuthStack />}
                </View>
              : null }
            </NavigationContainer>
          </GestureHandlerRootView>
        </ActionSheetProvider>
      </PaperProvider>
      <Toast config={toastConfig} />
      <FlashMessage position="top" />
    </View>
  );
}

const styles = StyleSheet.create({
  notification: {
    marginTop: 10,

    borderRadius: 10,
    borderCurve: 'continuous',

    paddingHorizontal: 15,
    paddingVertical: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,

    elevation: 5,

    flexDirection: 'row',
    gap: 10,
    alignContent: 'center',
    alignItems: 'center',
  },
  text1: {
    fontFamily: 'Papillon-Medium',
    fontSize: 17,
  }
});

export default App;