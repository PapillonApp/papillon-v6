import React from 'react';
import { View, Platform } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

import { headerTitleStyles } from './AppStack';
import GetUIColors from '../utils/GetUIColors';

import SettingsScreen from '../views/SettingsScreen';
import AboutScreen from '../views/Settings/AboutScreen';
import DonorsScreen from '../views/Settings/DonorsScreen';
import ProfileScreen from '../views/Settings/ProfileScreen';
import AppearanceScreen from '../views/Settings/AppearanceScreen';
import SettingsScreen2 from '../views/Settings/SettingsScreen';
import IconsScreen from '../views/Settings/IconsScreen';
import CoursColor from '../views/Settings/CoursColor';
import AdjustmentsScreen from '../views/Settings/AdjustmentsScreen';
import HeaderSelectScreen from '../views/Settings/HeaderSelectScreen';
import PaymentScreen from '../views/Settings/PaymentScreen';
import NotificationsScreen from '../views/Settings/NotificationsScreen';
import ConsentScreenWithoutAcceptation from '../views/ConsentScreenWithoutAcceptation';
import TrophiesScreen from '../views/Settings/TrophiesScreen';
import DevSettings from '../views/Settings/DevSettings/DevSettings';
import LogsScreen from '../views/Settings/DevSettings/LogsScreen';
import LocalStorageViewScreen from '../views/Settings/DevSettings/LocalStorageViewScreen';

function InsetSettings() {
  const UIColors = GetUIColors();
  
  return (
    <Stack.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? {
            animation: 'fade_from_bottom',
            navigationBarColor: '#00000000',
            headerStyle: {
              backgroundColor: UIColors.background,
                elevation: 0,
            },
            headerShadowVisible: false,
          }
          : {
            ...headerTitleStyles,
            headerBackTitle: 'Retour',
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
              headerTitle: 'Paramètres',
            }
        }
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: 'Mon profil',
        }}
      />
      <Stack.Screen
        name="CoursColor"
        component={CoursColor}
        options={{
          headerTitle: 'Gestion des matières',
        }}
      />
      <Stack.Screen
        name="Adjustments"
        component={AdjustmentsScreen}
        options={{
          headerTitle: 'Ajustements',
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
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerTitle: 'À propos de Papillon',
        }}
      />
      <Stack.Screen
        name="Donors"
        component={DonorsScreen}
        options={{
          headerTitle: 'Donateurs',
          headerBackTitle: 'À propos',
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
        }}
      />
      <Stack.Screen
        name="TrophiesScreen"
        component={TrophiesScreen}
        options={{
          headerTitle: 'Trophées',
          headerTintColor: '#ffffff',
        }}
      />
      <Stack.Screen
        name="ConsentScreenWithoutAcceptation"
        component={ConsentScreenWithoutAcceptation}
        options={{
          headerTitle: 'Termes & conditions',
          headerBackVisible: true,
          headerBackTitleVisible: false,
          headerTintColor: UIColors.text,
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
      <Stack.Screen
        name="DevSettings"
        component={DevSettings}
        options={{
          headerTitle: 'Options de développement',
        }}
      />
      <Stack.Screen
        name="LogsScreen"
        component={LogsScreen}
        options={{
          headerTitle: 'Logs',
        }}
      />
      <Stack.Screen
        name="LocalStorageViewScreen"
        component={LocalStorageViewScreen}
        options={{
          headerTitle: 'Local storage',
        }}
      />
    </Stack.Navigator>
  );
}

export default InsetSettings;
