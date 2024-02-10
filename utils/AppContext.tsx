import React from 'react';
import { useColorScheme } from 'react-native';

import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native';
import { MD3LightTheme, MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';

import type { IndexDataInstance } from '../fetch';

interface AppContextType {
  loggedIn: boolean
  setLoggedIn: (loggedIn: boolean) => void
  dataProvider: IndexDataInstance | null
  setDataProvider: (dataProvider: IndexDataInstance) => void
} 

/**
 * Temporary values until everything is set
 * through the app authentication process.
 */
export const DefaultValuesAppContext: AppContextType = {
  loggedIn: false,
  setLoggedIn: () => void 0,
  dataProvider: null,
  setDataProvider: () => void 0
};

const AppContext = React.createContext<AppContextType>(DefaultValuesAppContext);
export const useAppContext = () => React.useContext(AppContext);

export const baseColor = '#32AB8E';

export function AppContextProvider({ children, state }) {
  const scheme = useColorScheme();
  const { theme } = useMaterial3Theme({ fallbackSourceColor: baseColor });
  const paperTheme = {
    ...(scheme === 'dark' ? MD3DarkTheme : MD3LightTheme),
    version: 3,
    colors: {
      ...(scheme === 'dark' ? theme.dark : theme.light),
    },
  };

  const classicTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: baseColor,
    },
  };

  return (
    <AppContext.Provider value={state}>
      {/* @ts-expect-error : Incorrect props type. */}
      <PaperProvider theme={paperTheme}>
        <ActionSheetProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer theme={classicTheme}>
              {children}
            </NavigationContainer>
          </GestureHandlerRootView>
        </ActionSheetProvider>
      </PaperProvider>
    </AppContext.Provider>
  );
}
