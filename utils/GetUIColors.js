import { useMemo } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';

function useUIColors(schemeForce, platformForce) {
  const theme = useTheme();
  const scheme = useColorScheme();

  let isDark = scheme === 'dark';
  let platform = Platform.OS;

  if (schemeForce) {
    isDark = schemeForce === 'dark';
  }

  if (platformForce) {
    platform = platformForce;
  }

  return useMemo(() => {
    let background;
    let backgroundHigh;
    let backgroundItems;

    if (platform === 'ios') {
      background = isDark ? '#0B0B0C' : '#ffffff';
      backgroundHigh = isDark ? '#0B0B0C' : '#f2f2f7';
      backgroundItems = backgroundHigh;
    } else {
      background = theme.colors.background;
      backgroundHigh = theme.colors.background;
      backgroundItems = theme.colors.elevation.level1;
    }

    let modalBackground = background;
    if (platform === 'ios') {
      modalBackground = isDark ? '#0B0B0C' : '#f2f2f7';
    }

    let element;
    let elementHigh;

    if (platform === 'ios') {
      element = isDark ? '#161618' : '#ffffff';
      elementHigh = isDark ? '#161618' : '#f2f2f7';
    } else {
      element = theme.colors.elevation.level1;
      elementHigh = theme.colors.elevation.level2;
    }

    const text = isDark ? '#ffffff' : '#000000';

    let primaryBackground;
    let primary = '#32AB8E';

    primaryBackground = primary;

    if (platform === 'android' && isDark) {
      primaryBackground = theme.colors.primaryContainer;
    }

    let borderColor;
    let borderColorLight;

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
