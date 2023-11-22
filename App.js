import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import './utils/IgnoreWarnings';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, Appbar, useTheme, PaperProvider } from 'react-native-paper';

import FlashMessage from 'react-native-flash-message';

import { getHeaderTitle } from '@react-navigation/elements';
import { useState, useMemo, useEffect } from 'react';
import { Platform, useColorScheme, View, PermissionsAndroid, Alert, Linking } from 'react-native';
import { PressableScale } from 'react-native-pressable-scale';
import { SFSymbol } from 'react-native-sfsymbols';

import {
  Home,
  CalendarRange,
  BookOpen,
  BarChart3,
  UserCircle,
  Newspaper,
} from 'lucide-react-native';
import useFonts from './hooks/useFonts';

import { BlurView } from 'expo-blur';

import HomeScreen from './views/HomeScreen';

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
import CoursColor from './views/Settings/CoursColor';

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

import EvaluationsScreen from './views/EvaluationsScreen';
import { AppContextProvider, baseColor } from './utils/AppContext';

import NotificationsScreen from './views/Settings/NotificationsScreen';

import setBackgroundFetch from './fetch/BackgroundFetch';

import { LoginSkolengoSelectSchool } from './views/AuthStack/Skolengo/LoginSkolengoSelectSchool';
import { IndexDataInstance } from './fetch/IndexDataInstance';
import GetUIColors from './utils/GetUIColors';
import { showMessage } from 'react-native-flash-message';
import notifee, {AndroidImportance, AuthorizationStatus} from '@notifee/react-native';
/*notifee.getChannels().then(channels => {
  channels.forEach(ch => {
    notifee.deleteChannel(ch.id)
  })
})
notifee.getChannelGroups().then(groups => {
  groups.forEach(g => {
    notifee.deleteChannelGroup(g.id)
  })
})*/
async function initNotifs() {
  notifee.getChannels().then(channels => {
    if(channels.length === 0) checkNotifPerm(registerNotifs)
  })
}
async function registerNotifs() {
  await notifee.createChannelGroups([
  {
    name: "Nouvelles données disponibles",
    description: "Notifications en arrière-plan",
    id: "newdata-group"
  },
  {
    name:"Rappels",
    description: "Notifications de rappels",
    id:"remind-group"
  },
  {
    name: "Notifications silencieuses",
    description: "Notifications en arrière-plan",
    id: "silent-group"
  }])
  notifee.createChannels([{
    id:"silent",
    groupId: "silent-group",
    name: "Données en arrière-plan",
    description: "Notifie quand l'application récupère les données en arrière-plan",
    importance: AndroidImportance.LOW
  },
  {
    name: "Rappels de devoirs",
    id:"works-remind",
    groupId: "remind-group",
    description: "Notifications de rappels de devoirs",
    importance: AndroidImportance.HIGH
  },
  {
    name: "Rappels de cours",
    id: "course-remind",
    groupId: "remind-group",
    description: "Notifications de rappels de cours (configurable dans l'application)",
    importance: AndroidImportance.HIGH
  },
  {
    name: "Nouvelles actualités",
    id: "new-news",
    groupId: "newdata-group",
    description: "Indique quand une nouvelle actualité est disponible",
    importance: AndroidImportance.HIGH
  },])
}
async function checkNotifPerm(next = function(){}) {
  if(Platform.OS === "android") {
    PermissionsAndroid.check("android.permission.POST_NOTIFICATIONS").then((granted) => {
      if(granted) {
        console.log("notif permission ok")
        next()
      }
      else askNotifPerm()
    })
  }
}
async function askNotifPerm() {
  if(Platform.OS === "android") {
    PermissionsAndroid.request("android.permission.POST_NOTIFICATIONS").then((result) => {
      console.log("permission request,", result)
      if(result === "granted") {
        showMessage({
          message: 'Notifications activées',
          type: 'success',
          icon: 'auto',
          floating: true,
        });
      }
      else {
        result !== "never_ask_again" ? Alert.alert(
          'Notifications',
          'Vous avez refusé les notifications. Si vous les refusez, vous ne pourrez pas reçevoir de rappel de devoirs, des cours ou de nouvelles actualités, etc. Souhaitez-vous continuer ?',
          [
            {
              text: 'Continuer',
              style: 'cancel',
              onPress: () => {
                showMessage({
                  message: 'Notifications désactivées',
                  type: 'danger',
                  icon: 'auto',
                  floating: true,
                });
              }
            },
            {
              text:"Autoriser",
              onPress: () => {
                askNotifPerm()
              }
            }
          ]
        ) : Alert.alert(
          'Notifications',
          'Vous avez refusé les notifications. Si vous les refusez, vous ne pourrez pas reçevoir de rappel de devoirs, des cours ou de nouvelles actualités, etc. Pour les autoriser, veuillez vous rendre dans les paramètres de votre téléphone.',
          [
            {
              text: 'Continuer',
              style: 'cancel',
              onPress: () => {
                showMessage({
                  message: 'Notifications désactivées',
                  type: 'danger',
                  icon: 'auto',
                  floating: true,
                });
              }
            },
            {
              text: 'Ouvrir les paramètres',
              style: 'cancel',
              onPress: () => {
                Linking.openSettings()
              }
            },
          ]
        )
      }
    })
  }
  else if(Platform.OS === "ios") {
    const settings = await notifee.requestPermission({sound: true, badge: true, alert: true, inAppNotificationSettings: true, announcement: true});

    if(settings.authorizationStatus === AuthorizationStatus.DENIED) {
      Alert.alert(
        'Notifications',
        'Vous avez refusé les notifications. Vous ne pourrez pas reçevoir de rappel de devoirs, des cours ou de nouvelles actualités, etc. Pour les autoriser, veuillez vous rendre dans les paramètres de votre appareil.',
        [
          {
            text: 'Ouvrir les paramètres',
            onPress: () => {
              Linking.openSettings()
            }
          },
          {
            text: 'Continuer',
            style: 'cancel',
            onPress: () => {
              showMessage({
                message: 'Notifications désactivées',
                type: 'danger',
                icon: 'auto',
                floating: true,
              });
            }
          },
        ]
      )
    }

  }
}
initNotifs()
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
              header: (props) => <CustomNavigationBar {...props} />,
            }
          : {
              ...headerTitleStyles,
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
              header: (props) => <CustomNavigationBar {...props} />,
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
        name="InsetSchoollife"
        component={SchoolLifeScreen}
        options={{
          headerTitle: 'Vie scolaire',
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
              header: (props) => <CustomNavigationBar {...props} />,
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
    </Stack.Navigator>
  );
}

function AppStack() {

  const theme = useTheme();

  const [badges, setBadges] = useState({});

  const loadBadges = async () => {
    try {
      const value = await AsyncStorage.getItem('badgesStorage');
      if (value !== null) {
        const parsedBadges = JSON.parse(value);
        setBadges(parsedBadges);
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(loadBadges, 2400);

    return () => clearInterval(interval);
  }, []);

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
        tabBarBadgeStyle: {
          backgroundColor: "#B42828",
          color: '#fff',
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
          tabBarIcon: ({ color, size, focused }) =>
            Platform.OS === 'ios' ? (
              focused ? (
                <SFSymbol name="house.fill" color={color} size={size - 2} />
              ) : (
                <SFSymbol name="house" color={color} size={size - 2} />
              )
            ) : (
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
          tabBarBadge: badges.courses > 0 ? badges.courses : null,
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
          tabBarBadge: badges.homeworks > 0 ? badges.homeworks : null,
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
          tabBarBadge: badges.grades > 0 ? badges.grades : null,
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
        name="NewsHandler"
        component={WrappedNewsScreen}
        options={{
          tabBarLabel: 'Actualités',
          tabBarBadge: badges.news > 0 ? badges.news : null,
          tabBarIcon: ({ color, size, focused }) => (
            Platform.OS === 'ios' ?
              focused ?
                <SFSymbol name="newspaper.fill" color={color} size={size-2} />
              :
                <SFSymbol name="newspaper" color={color} size={size-2} />
            :
              <Newspaper color={color} size={size} />
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
            }
          : {
              ...headerTitleStyles,
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
          headerTitle: 'Changer de serveur',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="LoginSkolengoSelectSchool"
        component={LoginSkolengoSelectSchool}
        options={{
          title: 'Se connecter à Skolengo',
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

  useEffect(() => {
    // Load fonts and check if the user is logged in
    const loadApp = async () => {
      await useFonts();
      const value = await AsyncStorage.getItem('token');
      if (value !== null) {
        setLoggedIn(true);
      }
      setIsReady(true);
    };

    loadApp();

    setBackgroundFetch();
  }, []);

  const [dataprovider, setDataprovider] = React.useState(null);	

  React.useEffect(() => {	
    AsyncStorage.getItem('service').then((value) => {	
      const provider = new IndexDataInstance(value || null);	
      setDataprovider(provider);	
    });	
  }, []);	

  const ctxValue = React.useMemo(	
    () => ({	
      loggedIn,	
      setLoggedIn,	
      dataprovider,	
    }),	
    [loggedIn, dataprovider]	
  );

  return (
    <View style={{ flex: 1, backgroundColor: scheme === 'dark' ? '#000' : '#fff' }}>
      <PaperProvider>
        <AppContextProvider state={ctxValue}>
          <View style={{ flex: 1 }}>
            {loggedIn ? <AppStack /> : <AuthStack />}
          </View>
        </AppContextProvider>
      </PaperProvider>
      <FlashMessage position="top" />
    </View>
  );
}

export default App;
