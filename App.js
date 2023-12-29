import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import './utils/IgnoreWarnings';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, Appbar, useTheme, PaperProvider, Text } from 'react-native-paper';

import FlashMessage from 'react-native-flash-message';

import SyncStorage from 'sync-storage';

import { getHeaderTitle } from '@react-navigation/elements';
import { useState, useMemo, useEffect } from 'react';
import { Platform, StyleSheet, useColorScheme, View, PermissionsAndroid, Alert, Linking, TouchableOpacity, TouchableHighlight, Pressable } from 'react-native';
import { PressableScale } from 'react-native-pressable-scale';
import { SFSymbol } from 'react-native-sfsymbols';

import { useCallback } from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as ExpoLinking from 'expo-linking';

import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

import {
  Home,
  CalendarRange,
  BookOpen,
  BarChart3,
  UserCircle,
  Newspaper,
  ChevronLeft,
} from 'lucide-react-native';
import useFonts from './hooks/useFonts';

import { BlurView } from 'expo-blur';

import HomeScreen from './views/HomeScreen';

import CoursScreen from './views/CoursScreen';
import LessonScreen from './views/Cours/LessonScreen';

import DevoirsScreen from './views/DevoirsScreen';
import HomeworkScreen from './views/Devoirs/HwScreen';
import CreateHomeworkScreen from './views/Devoirs/CreateHomeworkScreen';

import ChangelogScreen from './views/ChangelogScreen';

import SettingsScreen from './views/SettingsScreen';
import AboutScreen from './views/Settings/AboutScreen';
import ProfileScreen from './views/Settings/ProfileScreen';
import OfficialServer from './views/Settings/OfficialServer';
import AppearanceScreen from './views/Settings/AppearanceScreen';
import SettingsScreen2 from './views/Settings/SettingsScreen';
import IconsScreen from './views/Settings/IconsScreen';
import ChangeServer from './views/Settings/ChangeServer';
import CoursColor from './views/Settings/CoursColor';
import AdjustmentsScreen from './views/Settings/AdjustmentsScreen';
import HeaderSelectScreen from './views/Settings/HeaderSelectScreen';
import PaymentScreen from './views/Settings/PaymentScreen';

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
import MessagesScreen from './views/Conversations/MessagesScreen';
import NewConversation from './views/Conversations/NewConversation';

import EvaluationsScreen from './views/EvaluationsScreen';
import { AppContextProvider, baseColor } from './utils/AppContext';

import NotificationsScreen from './views/Settings/NotificationsScreen';

import LoginView from './views/NewAuthStack/LoginView';
import FindEtab from './views/NewAuthStack/Pronote/FindEtab';
import LocateEtab from './views/NewAuthStack/Pronote/LocateEtab';

import PdfViewer from './views/Modals/PdfViewer';

import setBackgroundFetch from './fetch/BackgroundFetch';

import LoginEcoleDirecte from './views/AuthStack/EcoleDirecte/LoginEcoleDirecte';

import { LoginSkolengoSelectSchool } from './views/AuthStack/Skolengo/LoginSkolengoSelectSchool';
import { IndexDataInstance } from './fetch/IndexDataInstance';
import GetUIColors from './utils/GetUIColors';
import { showMessage } from 'react-native-flash-message';

import LocateEtabList from './views/NewAuthStack/Pronote/LocateEtabList';
import LoginURL from './views/NewAuthStack/Pronote/LoginURL';
import NewPronoteQR from './views/NewAuthStack/Pronote/NewPronoteQR';
import NGPronoteLogin from './views/NewAuthStack/Pronote/NGPronoteLogin';
import GradesSimulatorMenu from './views/Grades/GradesSimulatorMenu';
import GradesSimulatorAdd from './views/Grades/GradesSimulatorAdd';
import * as notifs from './components/Notifications'
notifs.init()
const Tab = createBottomTabNavigator();
import * as Sentry from '@sentry/react-native';

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

Sentry.init({
  dsn: 'http://4f5fa3f4dc364796bbdac55029146458@sentry.getpapillon.xyz/3',
  enableInExpoDevelopment: true,
});

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
  headerBackTitleStyle: {
    fontFamily: 'Papillon-Medium',
  },
};

const commonScreenOptions = Platform.select({
  android: {
    animation: 'fade_from_bottom',
    navigationBarColor: '#00000000',
    header: (props) => <CustomNavigationBar {...props} />,
  },
  ios: {
    ...headerTitleStyles,
  },
});

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
              ...headerTitleStyles,
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
              ...headerTitleStyles,
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
              ...headerTitleStyles,
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

function InsetSettings() {
  const UIColors = GetUIColors();
  
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
              animation: 'fade_from_bottom',
              navigationBarColor: '#00000000',
            }
          : {
              ...headerTitleStyles,
              modalStatus: true,
            }
      }
    >
      <Stack.Screen
        name="Compte"
        component={SettingsScreen}
        options={
          Platform.OS === 'ios' ?
            {
              headerTitle: 'Préférences',
              headerLargeTitle: false,
            }
          :
            {
              headerTitle: 'Compte',
            }
        }
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: 'Mon profil',
          headerBackTitle: 'Préférences',
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
        name="CoursColor"
        component={CoursColor}
        options={{
          headerTitle: 'Couleur des matières',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="Adjustments"
        component={AdjustmentsScreen}
        options={{
          headerTitle: 'Ajustements',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="HeaderSelect"
        component={HeaderSelectScreen}
        options={{
          headerTitle: 'Bandeau',
        }}
      />
      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
        options={{
          headerTitle: 'Soutenir Papillon',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerTitle: 'A propos de Papillon',
          headerBackTitle: 'Préférences',
        }}
      />
      <Stack.Screen
        name="Appearance"
        component={AppearanceScreen}
        options={{
          headerTitle: 'Fonctionnalités',
          headerBackTitle: 'Préférences',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerTitle: 'Notifications',
          headerBackTitle: 'Retour',
          headerBackTitle: 'Préférences',
        }}
      />
      <Stack.Screen
        name="Icons"
        component={IconsScreen}
        options={{
          headerTitle: "Icône de l'application",
          presentation: 'modal',
          modalStatus: Platform.OS === 'ios',
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
          headerBackTitle: 'Préférences',
        }}
      />

      <Stack.Screen
        name="Changelog"
        component={ChangelogScreen}
        options={{
          headerTitle: 'Quoi de neuf ?',
          presentation: 'modal',
          headerShown: false,
          headerBackTitle: 'Préférences',
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
            }
          : {
              ...headerTitleStyles,
            }
      }
    >
      <Stack.Screen
        name="Vue d'ensemble"
        component={HomeScreen}
        options={{
          headerShown: true,
          headerLargeTitle: Platform.OS === 'ios',
          header: undefined,
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
        name="InsetSchoollife"
        component={SchoolLifeScreen}
        options={{
          headerTitle: 'Vie scolaire',
        }}
      />
      <Stack.Screen
        name="InsetEvaluations"
        component={EvaluationsScreen}
        options={{
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="InsetConversations"
        component={ConversationsScreen}
        options={{
          headerBackTitle: 'Accueil',
          headerTitle: 'Conversations',
          headerLargeTitle: false,
          headerSearchBarOptions: {
            placeholder: 'Rechercher une conversation',
            cancelButtonText: 'Annuler',
          },
        }}
      />
      <Stack.Screen
        name="InsetConversationsItem"
        component={MessagesScreen}
        options={{
          headerBackTitle: 'Retour',
          headerTitle: 'Conversation',
        }}
      />
      <Stack.Screen
        name="InsetNewConversation"
        component={NewConversation}
        options={{
          headerTitle: 'Nouvelle conversation',
          presentation: 'modal',
          modalStatus: Platform.OS === 'ios',
        }}
      />

      <Stack.Screen
        name="InsetSettings"
        component={InsetSettings}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="Lesson"
        component={LessonScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Devoir"
        component={HomeworkScreen}
        options={{
          headerShown: true,
          presentation: 'modal',
          modalStatus: Platform.OS === 'ios',
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
            }
          : {
              ...headerTitleStyles,
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
            }
          : {
              ...headerTitleStyles,
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
          modalStatus: Platform.OS === 'ios',
        }}
      />
      <Stack.Screen
        name="CreateHomework"
        component={CreateHomeworkScreen}
        options={{
          headerShown: true,
          presentation: 'modal',
          modalStatus: Platform.OS === 'ios',
        }}
      />
    </Stack.Navigator>
  );
}

function ModalGradesSimulator() {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
              navigationBarColor: '#00000000',
              animation: 'fade_from_bottom',
            }
          : {
              ...headerTitleStyles,
              modalStatus: true,
            }
      }
    >
      <Stack.Screen
        name="GradesSimulatorMenu"
        component={GradesSimulatorMenu}
        options={{
          presentation: 'modal',
          headerTitle: 'Simulateur de notes',
          modalStatus: Platform.OS === 'ios',
        }}
      />
      <Stack.Screen
        name="GradesSimulatorAdd"
        component={GradesSimulatorAdd}
        options={{
          presentation: 'modal',
          headerTitle: 'Nouvelle note',
          modalStatus: Platform.OS === 'ios',
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
            }
          : {
              ...headerTitleStyles,
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
                headerTitle: 'Notes',
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
          headerBackTitle: 'Notes',
          mdTitleColor: '#ffffff',
          headerTintColor: '#ffffff',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="ModalGradesSimulator"
        component={ModalGradesSimulator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

function WrappedNewsScreen() {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
              animation: 'fade_from_bottom',
              navigationBarColor: '#00000000',
            }
          : {
              ...headerTitleStyles,
            }
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
          headerTitle: 'Actualité',
        }}
      />
      <Stack.Screen
        name="PdfViewer"
        component={PdfViewer}
        options={{
          headerShown: true,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  headerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    fontFamily: 'Papillon-Semibold',
    fontSize: 17,
    width: '100%',
    textAlign: 'center',
  },

  headerSide: {
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 20,
  },

  hsL: {
    alignItems: 'flex-start',
    paddingRight: 0,
  },
  hsR: {
    alignItems: 'flex-end',
    paddingLeft: 0,
    paddingRight: 26,
  },

  headerSideButton: {
    width: 38,
    height: 38,
    borderRadius: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

function Header(props) {
  const scheme = useColorScheme();
  const UIColors = GetUIColors(props.options.headerForceDarkContent && 'dark');

  const insets = useSafeAreaInsets();

  let isModal = false;

  if(props.options.presentation === 'modal') {
    isModal = true;
  }
  if(props.options.modalStatus === true) {
    isModal = true;
  }
  else if(props.options.modalStatus === false) {
    isModal = false;
  }

  const title = props.options.headerTitle !== undefined ? props.options.headerTitle : props.route.name;

  const translucent = props.options.headerTransparent !== undefined ? props.options.headerTransparent : false;

  let finalInsets = insets.top;
  if (isModal) {
    finalInsets = 4;
  }

  let showBack = props.back !== undefined;
  if (props.options.headerBackVisible === false) {
    showBack = false;
  }

  return (
    <View
      style={[
        {
          paddingTop: finalInsets,
          height: 56 + finalInsets,
          backgroundColor: !translucent ? 
            isModal ?
              UIColors.modalBackground
            : UIColors.background
          : UIColors.background + '00',
        },
        styles.header,
      ]}
    >
      <View style={[styles.headerSide, styles.hsL]}>
        { props.options.headerLeft ? props.options.headerLeft() : showBack ?
          <TouchableOpacity
            onPress={() => props.navigation.goBack()}
            style={[styles.headerSideButton, {backgroundColor: UIColors.text + '18'}]}
          >
            <ChevronLeft size={28} color={UIColors.text + 'e5'} />
          </TouchableOpacity>
        : null }
      </View>
      <View style={styles.headerContent}>
        <Text style={[styles.headerText, {color: UIColors.text}]} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>
      <View style={[styles.headerSide, styles.hsR]}>
        {props.options.headerRight ? props.options.headerRight() : null}
      </View>
    </View>
  );
}

function ModalPronoteLogin() {
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
              navigationBarColor: '#00000000',
              header: (props) => <Header {...props} />,
              animation: 'fade_from_bottom',
            }
          : {
              ...headerTitleStyles,
              header: (props) => <Header {...props} />,
              modalStatus: true,
            }
      }
    >
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
        }}
      />
      <Stack.Screen
        name="LocateEtabList"
        component={LocateEtabList}
        options={{
          headerTitle: 'Établissements',
          headerBackTitle: 'Ville',
        }}
      />
      <Stack.Screen
        name="LoginURL"
        component={LoginURL}
        options={{
          headerTitle: 'Utiliser une URL',
          headerBackTitle: 'Connexion',
        }}
      />
      <Stack.Screen
        name="NewPronoteQR"
        component={NewPronoteQR}
        options={{
          headerTitle: 'Scanner un QR-Code',
          headerBackTitle: 'Retour',
          headerTransparent: true,
          headerForceDarkContent: true,
        }}
      />
      <Stack.Screen
        name="NGPronoteLogin"
        component={NGPronoteLogin}
        options={{
          headerTitle: 'Se connecter',
          headerTransparent: true,
        }}
      />
    </Stack.Navigator>
  );
}

function AppStack() {
  const theme = useTheme();
  const UIColors = GetUIColors();

  let settings = SyncStorage.get('adjustments');

  // if hideTabBarTitle doesn't exist, set it to false
  if (settings === undefined) {
    settings = {
      hideTabBarTitle: false,
    };
  }

  const tabBar = useMemo(() => {
    if (Platform.OS !== 'ios') {
      return ({ navigation, state, descriptors, insets }) => (
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

            if (!event.defaultPrevented) {
              navigation.navigate(route.name);
            } else {
              preventDefault();
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
      );
    }
    return undefined;
  }, []);

  
  return (
    <Tab.Navigator
      tabBar={tabBar}
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
        tabBarActiveTintColor: theme.dark ? '#ffffff' : '#000000',
        tabBarInactiveTintColor: theme.dark ? '#ffffff' : '#000000',
        tabBarStyle: {
          paddingHorizontal: 8,
          backgroundColor: UIColors.background,
          borderTopWidth: UIColors.dark ? 0 : 0.5,
        },
        tabBarButton: (props) => {
          return (
            <PressableScale
              {...props}
              activeScale={settings?.hideTabBarTitle ? 1.2 : 0.9}
              weight='light'
              style={[
                {
                  ...props.style,
                  flex: 1,
                  opacity: props.accessibilityState.selected ? 1 : 0.5,
                },
              ]}
            />
          );
        }
      }}
    >
      <Tab.Screen
        name="AccueilHandler"
        component={WrappedHomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size, focused }) =>
            !focused ? (
              <PapillonIconsHome stroke={color} width={size+2} height={size+2} />
            ) : (
              <PapillonIconsHomeFill fill={color} stroke={color} width={size+2} height={size+2} />
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
            !focused ? (
              <PapillonIconsCalendar stroke={color} width={size+2} height={size+2} />
            ) : (
              <PapillonIconsCalendarFill fill={color} stroke={color} width={size+2} height={size+2} />
            )
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
            !focused ? (
              <PapillonIconsBook stroke={color} width={size+2} height={size+2} />
            ) : (
              <PapillonIconsBook stroke={color} width={size+2} height={size+2} />
            )
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
            !focused ? (
              <PapillonIconsStats stroke={color} width={size+2} height={size+2} />
            ) : (
              <PapillonIconsStats stroke={color} width={size+2} height={size+2} />
            )
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="NewsHandler"
        component={WrappedNewsScreen}
        options={{
          tabBarLabel: 'Actualités',
          tabBarIcon: ({ color, size, focused }) => (
            !focused ? (
              <PapillonIconsNews fill={color} stroke={color} width={size+2} height={size+2} />
            ) : (
              <PapillonIconsNewsFill fill={color} stroke={color} width={size+2} height={size+2} />
            )
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  const screenOptions = Platform.select({
    android: {
      navigationBarColor: '#00000000',
      header: (props) => <CustomNavigationBar {...props} />,
    },
    ios: {
      ...headerTitleStyles,
    },
  });

  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
              navigationBarColor: '#00000000',
              header: (props) => <CustomNavigationBar {...props} />,
              animation: 'fade_from_bottom',
            }
          : {
              ...headerTitleStyles,
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
        name="PronoteFindEtab"
        component={ModalPronoteLogin}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />

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
          headerTitle: 'Changer de serveur',
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

      <Stack.Screen
        name="LoginEcoleDirecte"
        component={LoginEcoleDirecte}
        options={{
          title: 'Se connecter à EcoleDirecte',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="LoginPronoteSelectEtab"
        component={LoginPronoteSelectEtab}
        options={{
          title: 'Se connecter à Pronote',
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
  const [isReady, setIsReady] = useState(false);

  const scheme = useColorScheme();

  const [dataprovider, setDataprovider] = React.useState(null);	

  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await useFonts();

        const value = await AsyncStorage.getItem('token');
        if (value !== null) {
          setLoggedIn(true);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  React.useEffect(() => {	
    AsyncStorage.getItem('service').then((value) => {	
      const provider = new IndexDataInstance(value || null);	
      setDataprovider(provider);	
    });	
  }, [appIsReady]);	

  const ctxValue = React.useMemo(	
    () => ({	
      loggedIn,	
      setLoggedIn,	
      dataprovider,	
    }),	
    [loggedIn, dataprovider]	
  );

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: scheme === 'dark' ? '#000' : '#f2f2f7' }}>
      <PaperProvider>
        <AppContextProvider state={ctxValue}>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            {loggedIn ? <AppStack /> : <AuthStack />}
          </View>
        </AppContextProvider>
      </PaperProvider>
      <FlashMessage position="top" />
    </View>
  );
}

export default App;
