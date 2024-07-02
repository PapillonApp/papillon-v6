import { useMemo } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';

interface UIColors {
  theme: string;
  dark: boolean;
  background: string;
  backgroundHigh: string;
  backgroundItems: string;
  modalBackground: string;
  element: string;
  elementHigh: string;
  text: string;
  primary: string;
  primaryBackground: string;
  border: string;
  borderLight: string;
}

function useUIColors(schemeForce: string | undefined = undefined, platformForce: string | undefined = undefined): UIColors {  const theme = useTheme();
  const scheme = useColorScheme();

  let isDark: boolean = scheme === 'dark';
  let platform: string = Platform.OS;

  if (schemeForce) {
    isDark = schemeForce === 'dark';
  }

  if (platformForce) {
    platform = platformForce;
  }

  return useMemo(() => {
    let background: string;
    let backgroundHigh: string;
    let backgroundItems: string;

    if (platform === 'ios') {
      background = isDark ? '#0B0B0C' : '#ffffff';
      backgroundHigh = isDark ? '#0B0B0C' : '#f2f2f7';
      backgroundItems = backgroundHigh;
    } else {
      background = theme.colors.background;
      backgroundHigh = theme.colors.background;
      backgroundItems = theme.colors.elevation.level1;
    }

    let modalBackground: string = background;
    if (platform === 'ios') {
      modalBackground = isDark ? '#0B0B0C' : '#f2f2f7';
    }

    let element: string;
    let elementHigh: string;

    if (platform === 'ios') {
      element = isDark ? '#161618' : '#ffffff';
      elementHigh = isDark ? '#161618' : '#f2f2f7';
    } else {
      element = theme.colors.elevation.level2;
      elementHigh = theme.colors.elevation.level2;
    }

    const text: string = isDark ? '#ffffff' : '#000000';

    let primaryBackground: string;
    let primary: string = '#32AB8E';

    if (platform === 'android') {
      primary = theme.colors.primary;
    }

    primaryBackground = primary;

    if (platform === 'android' && isDark) {
      primaryBackground = theme.colors.primaryContainer;
    }

    let borderColor: string;
    let borderColorLight: string;

    if (isDark) {
      borderColor = '#444444';
      borderColorLight = '#333333';
    } else {
      borderColor = '#d5d5d5';
      borderColorLight = '#d5d5d5';
    }

    return {
      theme: isDark ? 'dark' : 'light',
      dark: isDark,
      background,
      backgroundHigh,
      backgroundItems,
      modalBackground,
      element,
      elementHigh,
      text,
      primary,
      primaryBackground,
      border: borderColor,
      borderLight: borderColorLight,
    };
  }, [isDark, platform, theme]);
}

export default useUIColors;