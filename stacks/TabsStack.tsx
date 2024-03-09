import React, { useMemo } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
const Tab = createBottomTabNavigator();

import {
  Home as PapillonIconsHome,
  HomeFill as PapillonIconsHomeFill,
  Calendar as PapillonIconsCalendar,
  CalendarFill as PapillonIconsCalendarFill,
  Book as PapillonIconsBook,
  Stats as PapillonIconsStats,
  News as PapillonIconsNews,
  NewsFill as PapillonIconsNewsFill,
} from '../interface/icons/PapillonIcons';
import GetUIColors from '../utils/GetUIColors';

import { BottomNavigation, Appbar, useTheme, PaperProvider, Text } from 'react-native-paper';

const getIcon = (Icon, IconFill, color, size, focused, force) => {
  const width = size + 2;
  const height = size + 2;

  const same = Icon == IconFill;

  return focused ? (
    <IconFill fill={(!same || force) ? color : 'transparent'} stroke={color} width={width} height={height} />
  ) : (
    <Icon fill={force ? color : 'transparent'} stroke={color} width={width} height={height} />
  );
};

const views = [
  {
    name: 'AccueilHandler',
    component: require('../views/HomeScreen').default,
    options: {
      tabBarLabel: 'Accueil',
      tabBarIcon: ({ color, size, focused }) =>
        getIcon(PapillonIconsHome, PapillonIconsHomeFill, color, size, focused),
      headerShown: false,
    },
  },
  {
    name: 'CoursHandler',
    component: require('../views/CoursScreen').default,
    options: {
      tabBarLabel: 'Cours',
      tabBarIcon: ({ color, size, focused }) =>
        getIcon(PapillonIconsCalendar, PapillonIconsCalendarFill, color, size, focused),
    },
  },
  {
    name: 'DevoirsHandler',
    component: require('../views/DevoirsScreen').default,
    options: {
      tabBarLabel: 'Devoirs',
      tabBarIcon: ({ color, size, focused }) =>
        getIcon(PapillonIconsBook, PapillonIconsBook, color, size, focused),
    },
  },
  {
    name: 'NotesHandler',
    component: require('../views/GradesScreenNew').default,
    options: {
      tabBarLabel: 'Notes',
      tabBarIcon: ({ color, size, focused }) =>
        getIcon(PapillonIconsStats, PapillonIconsStats, color, size, focused),
    },
  },
  {
    name: 'NewsHandler',
    component: require('../views/NewsScreen').default,
    options: {
      tabBarLabel: 'Actualités',
      tabBarIcon: ({ color, size, focused }) =>
        getIcon(PapillonIconsNews, PapillonIconsNewsFill, color, size, focused, true),
    },
  },
];

const TabsStack = ({ navigation }) => {
  const UIColors = GetUIColors();

  const settings = {
    hideTabBarTitle: true,
  };

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
    <View style={{ flex: 1 }}>
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
          tabBarActiveTintColor:
            !settings?.hideTabBarTitle ? UIColors.primary :
              UIColors.dark ? '#ffffff' : '#000000',
          tabBarStyle: Platform.OS === 'ios' ? {
            paddingHorizontal: 8,
            height: 80,
          } : {
            paddingHorizontal: 8,
          },
        }}
      >
        {views.map((view, index) => (
          <Tab.Screen
            key={index}
            name={view.name}
            component={view.component}
            options={view.options}
          />
        ))}
      </Tab.Navigator>
    </View>
  );
};

export default TabsStack;