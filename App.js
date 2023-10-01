import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import "./utils/IgnoreWarnings";

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, Appbar, useTheme } from 'react-native-paper';

import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import FlashMessage from 'react-native-flash-message';

import { getHeaderTitle } from '@react-navigation/elements';
import { useState } from 'react';
import { Platform, useColorScheme, View } from 'react-native';
import { PressableScale } from 'react-native-pressable-scale';
import {
  Home,
  CalendarRange,
  BookOpen,
  BarChart3,
  UserCircle,
} from 'lucide-react-native';
import useFonts from './hooks/useFonts';

import { BlurView } from 'expo-blur';

import HomeScreen from './views/HomeScreen';
import NewHomeScreen from './views/NewHomeScreen';

import CoursScreen from './views/CoursScreen';
import LessonScreen from './views/Cours/LessonScreen';

import DevoirsScreen from './views/DevoirsScreen';
import HomeworkScreen from './views/Devoirs/HwScreen';

import ChangelogScreen from './views/ChangelogScreen';

import SettingsScreen from './views/SettingsScreen';
import AboutScreen from './views/Settings/AboutScreen';
import ProfileScreen from './views/Settings/ProfileScreen';
import OfficialServer from './views/Settings/OfficialServer';
import AppearanceScreen from './views/Settings/AppearanceScreen';
import SettingsScreen2 from './views/Settings/SettingsScreen';
import IconsScreen from './views/Settings/IconsScreen';
import ChangeServer from './views/Settings/ChangeServer';

import GradesScreen from './views/GradesScreen';
import GradeView from './views/Grades/GradeView';

import WelcomeScreen from './views/AuthStack/WelcomeScreen';

import LoginScreen from './views/AuthStack/LoginScreen';
import LoginUnavailable from './views/AuthStack/LoginUnavailable';

import LoginPronoteSelectEtab from './views/AuthStack/Pronote/LoginPronoteSelectEtab';
import LoginPronote from './views/AuthStack/Pronote/LoginPronote';
import LoginPronoteQR from './views/AuthStack/Pronote/LoginPronoteQRToken';

import NewsScreen from './views/NewsScreen';
import NewsItem from './views/News/NewsItem';

import SchoolLifeScreen from './views/SchoolLifeScreen';

import ConversationsScreen from './views/ConversationsScreen';

import EvaluationsScreen from './views/EvaluationsScreen';
import { AppContextProvider, baseColor } from './utils/AppContext';

import NotificationsScreen from './views/Settings/NotificationsScreen';

import setBackgroundFetch from './fetch/BackgroundFetch';

import { SFSymbol } from "react-native-sfsymbols";

const Tab = createBottomTabNavigator();

// stack
const Stack = createNativeStackNavigator();

function CustomNavigationBar({ navigation, route, options, back }) {
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
      {back ? (
        <Appbar.BackAction color={titleColor} onPress={navigation.goBack} />
      ) : null}
      <Appbar.Content
        title={title}
        titleStyle={{ fontFamily: 'Papillon-Medium' }}
        color={titleColor}
      />

      {options.headerRight ? (
        <View style={{ paddingEnd: 16 }}>
          {options.headerRight ? options.headerRight() : null}
        </View>
      ) : null}
    </Appbar.Header>
  );
}

const headerTitleStyles = {
  headerLargeTitleStyle: {
    fontFamily: 'Papillon-Semibold',
    fontSize: 28,
  },
  headerTitleStyle: {
    fontFamily: 'Papillon-Semibold',
  },
}

function InsetNewsScreen() {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
              animation: 'fade_from_bottom',
              navigationBarColor: '#00000000',
              header: (props) => <CustomNavigationBar {...props} />,
            }
          : {
            ...headerTitleStyles
          }
      }
    >
      <Stack.Screen
        name="News"
        component={NewsScreen}
        options={{
          headerShown: true,
          headerLargeTitle: Platform.OS === 'ios',
          headerTitle: 'Actualités',
        }}
      />
      <Stack.Screen
        name="NewsDetails"
        component={NewsItem}
        options={{
          headerShown: true,
          headerTitle: 'Actualité',
        }}
      />
    </Stack.Navigator>
  );
}

function InsetSchoolLifeScreen() {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
              animation: 'fade_from_bottom',
              navigationBarColor: '#00000000',
              header: (props) => <CustomNavigationBar {...props} />,
            }
          : {
            ...headerTitleStyles
          }
      }
    >
      <Stack.Screen
        name="Schoollife"
        component={SchoolLifeScreen}
        options={{
          headerShown: true,
          headerLargeTitle: Platform.OS === 'ios',
          headerTitle: 'Vie scolaire',
        }}
      />
    </Stack.Navigator>
  );
}

function InsetConversationsScreen() {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
              animation: 'fade_from_bottom',
              navigationBarColor: '#00000000',
              header: (props) => <CustomNavigationBar {...props} />,
            }
          : {
            ...headerTitleStyles
          }
      }
    >
      <Stack.Screen
        name="Conversations"
        component={ConversationsScreen}
        options={{
          headerShown: true,
          headerLargeTitle: Platform.OS === 'ios',
          headerTitle: 'Conversations',
        }}
      />
    </Stack.Navigator>
  );
}

function InsetEvaluationsScreen() {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
              animation: 'fade_from_bottom',
              navigationBarColor: '#00000000',
              header: (props) => <CustomNavigationBar {...props} />,
            }
          : {
            ...headerTitleStyles
          }
      }
    >
      <Stack.Screen
        name="Evaluations"
        component={EvaluationsScreen}
        options={{
          headerShown: true,
          headerLargeTitle: Platform.OS === 'ios',
          headerTitle: 'Compétences',
        }}
      />
    </Stack.Navigator>
  );
}

function WrappedHomeScreen() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
              animation: 'fade_from_bottom',
              navigationBarColor: '#00000000',
              header: (props) => <CustomNavigationBar {...props} />,
            }
          : {
            ...headerTitleStyles
          }
      }
    >
      <Stack.Screen
        name="Vue d'ensemble"
        component={NewHomeScreen}
        options={{
          headerShown: true,
          headerLargeTitle: Platform.OS === 'ios',
          headerBlurEffect: 'systemUltraThinMaterial',
          headerStyle: {
            backgroundColor: theme.dark ? '#00000050' : '#ffffff50',
          },
          headerLargeStyle: {
            backgroundColor: theme.dark ? '#00000000' : '#ffffff90',
          },
        }}
      />

      <Stack.Screen
        name="Changelog"
        component={ChangelogScreen}
        options={{
          headerTitle: 'Quoi de neuf ?',
          presentation: 'modal',
          headerShown: false,
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
        name="Devoir"
        component={HomeworkScreen}
        options={{
          headerShown: true,
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
          headerTintColor: '#ffffff',
        }}
      />
    </Stack.Navigator>
  );
}

function WrappedCoursScreen() {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
              animation: 'fade_from_bottom',
              navigationBarColor: '#00000000',
              header: (props) => <CustomNavigationBar {...props} />,
            }
          : {
            ...headerTitleStyles
          }
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
}

function WrappedDevoirsScreen() {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
              animation: 'fade_from_bottom',
              navigationBarColor: '#00000000',
              header: (props) => <CustomNavigationBar {...props} />,
            }
          : {
            ...headerTitleStyles
          }
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
      <Stack.Screen
        name="Devoir"
        component={HomeworkScreen}
        options={{
          headerShown: true,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

function WrappedGradesScreen() {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
              animation: 'fade_from_bottom',
              navigationBarColor: '#00000000',
              header: (props) => <CustomNavigationBar {...props} />,
            }
          : {
            ...headerTitleStyles
          }
      }
    >
      <Stack.Screen
        name="Notes"
        component={GradesScreen}
        options={
          Platform.OS === 'ios'
            ? {
                headerShown: true,
                headerLargeTitle: false,
              }
            : null
        }
      />
      <Stack.Screen
        name="Grade"
        component={GradeView}
        options={{
          headerShown: true,
          headerLargeTitle: false,
          headerTintColor: '#ffffff',
        }}
      />
    </Stack.Navigator>
  );
}

function WrappedSettings() {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
              animation: 'fade_from_bottom',
              navigationBarColor: '#00000000',
              header: (props) => <CustomNavigationBar {...props} />,
            }
          : {
            ...headerTitleStyles
          }
      }
    >
      <Stack.Screen
        name="Compte"
        component={SettingsScreen}
        options={{
          headerLargeTitle: Platform.OS === 'ios',
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
          headerTitle: 'Fonctionnalités',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerTitle: 'Notifications',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="Icons"
        component={IconsScreen}
        options={{
          headerTitle: "Icône de l'application",
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="changeServer"
        component={ChangeServer}
        options={{
          headerTitle: "Changer de serveur",
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

      <Stack.Screen
        name="Changelog"
        component={ChangelogScreen}
        options={{
          headerTitle: 'Quoi de neuf ?',
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

function AppStack() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      tabBar={
        Platform.OS !== 'ios'
          ? ({ navigation, state, descriptors, insets }) => (
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
            )
          : undefined
      }
      screenOptions={{
        headerTruncatedBackTitle: 'Retour',
        elevated: false,
        tabBarLabelStyle: {
          fontFamily: 'Papillon-Medium',
          fontSize: 12.5,
          letterSpacing: 0.2,
          marginTop: 1,
        },
        headerTitleStyle: {
          fontFamily: 'Papillon-Semibold',
        },
        tabBarShowLabel: Platform.OS !== 'android',
        tabBarStyle: {
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 2,
        },
        tabBarButton: (props) => (
          <PressableScale {...props} activeScale={0.85} weight="heavy">
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
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
          tabBarIcon: ({ color, size, focused }) => (
            Platform.OS === 'ios' ?
              focused ?
                <SFSymbol name="house.fill"  color={color} size={size-2} />
              :
                <SFSymbol name="house" color={color} size={size-2} />
            :
              <Home color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="CoursHandler"
        component={WrappedCoursScreen}
        options={{
          tabBarLabel: 'Cours',
          tabBarIcon: ({ color, size, focused }) => (
            Platform.OS === 'ios' ?
              focused ?
                <SFSymbol name="calendar" weight='semibold' color={color} size={size-2} />
              :
                <SFSymbol name="calendar" color={color} size={size-2} />
            :
              <CalendarRange color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="DevoirsHandler"
        component={WrappedDevoirsScreen}
        options={{
          tabBarLabel: 'Devoirs',
          tabBarIcon: ({ color, size, focused }) => (
            Platform.OS === 'ios' ?
              focused ?
                <SFSymbol name="book.fill" color={color} size={size-2} />
              :
                <SFSymbol name="book" color={color} size={size-2} />
            :
              <BookOpen color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="NotesHandler"
        component={WrappedGradesScreen}
        options={{
          tabBarLabel: 'Notes',
          tabBarIcon: ({ color, size, focused }) => (
            Platform.OS === 'ios' ?
              focused ?
                <SFSymbol name="chart.pie.fill" color={color} size={size-2} />
              :
                <SFSymbol name="chart.pie" color={color} size={size-2} />
            :
              <BarChart3 color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="ParamètresHandler"
        component={WrappedSettings}
        options={{
          tabBarLabel: 'Compte',
          tabBarIcon: ({ color, size, focused }) => (
            Platform.OS === 'ios' ?
              focused ?
                <SFSymbol name="person.crop.circle.fill" color={color} size={size-2} />
              :
                <SFSymbol name="person.crop.circle" color={color} size={size-2} />
            :
              <UserCircle color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
              navigationBarColor: '#00000000',
              header: (props) => <CustomNavigationBar {...props} />,
            }
          : {
            ...headerTitleStyles
          }
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
          headerLargeTitle: Platform.OS === 'ios',
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
        name="changeServer"
        component={ChangeServer}
        options={{
          headerTitle: "Changer de serveur",
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="LoginPronoteSelectEtab"
        component={LoginPronoteSelectEtab}
        options={{
          title: "Se connecter à Pronote",
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="LoginPronote"
        component={LoginPronote}
        options={{ 
          title: 'Se connecter',
          presentation: 'modal',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="LoginPronoteQR"
        component={LoginPronoteQR}
        options={{ title: 'Validation du code QR', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

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

  const [IsReady, SetIsReady] = useState(false);

  // load fonts
  const LoadFonts = async () => {
    await useFonts();
  };

  // dark mode
  const scheme = useColorScheme();

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
          shadowColor: '#000',
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
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1.5,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3,
          elevation: 5,
          borderLeftWidth: 3,
          borderLeftColor: '#A84700',
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

  React.useEffect(() => {
    // functions
    if (loggedIn) {
      setBackgroundFetch();
    }
  }, [loggedIn]);

  if (!IsReady) {
    // load fonts
    LoadFonts().then(() => {
      SetIsReady(true);
    });

    return null;
  }

  // load fonts
  return (
    <View
      style={{ flex: 1, backgroundColor: scheme === 'dark' ? '#000' : '#fff' }}
    >
      <AppContextProvider state={{ loggedIn, setLoggedIn }}>
        {loggedInLoaded ? (
          <View style={{ flex: 1 }}>
            {loggedIn ? <AppStack /> : <AuthStack />}
          </View>
        ) : null}
      </AppContextProvider>
      <Toast config={toastConfig} />
      <FlashMessage position="top" />
    </View>
  );
}

export default App;
