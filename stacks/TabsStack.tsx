import React, { useMemo } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { BottomNavigation } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../utils/AppContext';

import {
  Home as PapillonIconsHome,
  HomeFill as PapillonIconsHomeFill,
  Calendar as PapillonIconsCalendar,
  CalendarFill as PapillonIconsCalendarFill,
  Check as PapillonIconsCheck,
  Stats as PapillonIconsStats,
  News as PapillonIconsNews,
  NewsFill as PapillonIconsNewsFill,
} from '../interface/icons/PapillonIcons';
import GetUIColors from '../utils/GetUIColors';

const Tab = createBottomTabNavigator();

const getIcon = (
  Icon: React.ComponentType<{ fill: string; stroke: string; width: number; height: number }>,
  IconFill: React.ComponentType<{ fill: string; stroke: string; width: number; height: number }>,
  color: string,
  size: number,
  focused: boolean,
  force: boolean = false
) => {
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
      tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) =>
        getIcon(PapillonIconsHome, PapillonIconsHomeFill, color, size, focused),
      headerShown: true,
      headerShadowVisible: false,
      color: '#29947a',
    },
  },
  {
    name: 'CoursHandler',
    component: require('../views/CoursScreen').default,
    options: {
      tabBarLabel: 'Cours',
      tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) =>
        getIcon(PapillonIconsCalendar, PapillonIconsCalendarFill, color, size, focused),
      color: '#0065A8',
    },
  },
  {
    name: 'DevoirsHandler',
    component: require('../views/DevoirsScreen').default,
    options: {
      tabBarLabel: 'Devoirs',
      tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) =>
        getIcon(PapillonIconsCheck, PapillonIconsCheck, color, size, focused),
      color: '#2A937A',
    },
  },
  {
    name: 'NotesHandler',
    component: require('../views/GradesScreen').default,
    options: {
      tabBarLabel: 'Notes',
      tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) =>
        getIcon(PapillonIconsStats, PapillonIconsStats, color, size, focused),
      color: '#A84700',
    },
  },
  {
    name: 'NewsHandler',
    component: require('../views/NewsScreen').default,
    options: {
      tabBarLabel: 'Actualités',
      tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) =>
        getIcon(PapillonIconsNews, PapillonIconsNewsFill, color, size, focused, true),
      color: '#B42828',
    },
  },
];

const TabsStack = () => {
  const appContext = useAppContext();
  if (appContext.dataProvider?.service === "ecoledirecte") {
    views[4] = {
      name: 'ED_ExtendedMenu',
      component: require('../views/ecoledirecte/EDExtendedMenu').default,
      options: {
        tabBarLabel: 'Plus',
        tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) =>
          getIcon(PapillonIconsNews, PapillonIconsNewsFill, color, size, focused, true),
        color: '#3248a8',
      },
    }
  }

  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const tabBar = useMemo(() => {
    if (Platform.OS !== 'ios') {
      return ({
        navigation,
        state,
        descriptors,
        insets
      }: {
        navigation: any,
        state: any,
        descriptors: any,
        insets: any
      }) => (
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
          tabBarLabelStyle: {
            fontFamily: 'Papillon-Semibold',
            fontSize: 13,
            letterSpacing: 0,
            margin: 0,
            padding: 0,
            marginTop: (insets.bottom > 30) ? -3 : 0,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          },
          headerTitleStyle: Platform.OS === 'ios' ? {
            fontFamily: 'Papillon-Semibold',
            fontSize: 17.5,
          } : {
            fontSize: 17.5,
          },
          tabBarShowLabel: true,
          tabBarActiveTintColor:
            UIColors.dark ? '#ffffff' : '#000000',
          tabBarStyle: [
            Platform.OS === 'ios' ? {
              paddingHorizontal: 8,
            } : {
              paddingHorizontal: 8,
            },
            (insets.bottom > 30) ? {
              height: 80,
            } : null,
          ],
          headerTitleAlign: 'left',
          headerStyle: Platform.OS === 'android' ? {
            backgroundColor: UIColors.background,
            borderBottomWidth: 0,
            elevation: 0,
          } : undefined,
        }}
      >
        {views.map((view, index) => (
          <Tab.Screen
            key={index}
            name={view.name}
            component={view.component}
            options={{
              ...view.options,
              headerLeft: () => (
                <View style={{ marginLeft: 16, marginRight: -4 }}>
                  {view.options.tabBarIcon({ color: view.options.color, size: 26, focused: true })}
                </View>
              ),
            }}
          />
        ))}
      </Tab.Navigator>
    </View>
  );
};

export default TabsStack;
