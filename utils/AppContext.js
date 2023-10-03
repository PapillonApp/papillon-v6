import * as React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';

import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

/** @type {{logged: boolean, setLogged: (logged: boolean) => void, dataprovider: import('../fetch/IndexDataInstance').IndexDataInstance, setDataprovider: (dataprovider: import('../fetch/IndexDataInstance').IndexDataInstance) => void, service: string|null, setService: (service: string|null) => void}} */
export const DefaultValuesAppContext = {
  loggedIn: false,
  setLoggedIn: () => {},
  dataprovider: null,
  service: null,
  setService: () => {},
};

const AppContext = React.createContext(DefaultValuesAppContext);

export const baseColor = '#29947a';

export const useAppContext = () => React.useContext(AppContext);

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
