import { Platform, useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';

function GetUIColors(schemeForce) {
  const theme = useTheme();
  const scheme = useColorScheme();

  let isDark = scheme === 'dark';

  if (schemeForce) {
    if (schemeForce === 'dark') {
      isDark = true;
    } else if (schemeForce === 'light') {
      isDark = false;
    }
  }

  // background
  let background;
  let backgroundHigh;

  if (Platform.OS === 'ios') {
    background = isDark ? '#0B0B0C' : '#ffffff';
    backgroundHigh = isDark ? '#0B0B0C' : '#f2f2f7';
  } else {
    background = theme.colors.background;
    backgroundHigh = theme.colors.background;
  }

  let modalBackground = background;
  if (Platform.OS === 'ios') {
    modalBackground = isDark ? '#0B0B0C' : '#f2f2f7';
  }

  // element
  let element = '';
  let elementHigh = '';

  if (Platform.OS === 'ios') {
    element = isDark ? '#161618' : '#ffffff';
    elementHigh = isDark ? '#161618' : '#f2f2f7';
  } else {
    element = theme.colors.elevation.level1;
    elementHigh = theme.colors.elevation.level2;
  }

  // text
  const text = isDark ? '#ffffff' : '#000000';

  // main
  let primaryBackground = '';
  let primary = '';

  if (Platform.OS === 'ios') {
    // primary = '#29947A';
    primary = '#29947A';
  } else {
    // primary = theme.colors.primary;
    primary = isDark
      ? theme.colors.primary
      : theme.colors.primary;
  }

  primaryBackground = primary;

  if (Platform.OS === 'android' && isDark) {
    primaryBackground = theme.colors.primaryContainer;
  }

  // border
  let borderColor = '';
  let borderColorLight = '';

  if (Platform.OS === 'ios') {
    borderColor = isDark ? '#444444' : '#d5d5d5';
    borderColorLight = isDark ? '#333333' : '#d5d5d5';
  } else {
    borderColor = isDark ? '#444444' : '#d5d5d5';
    borderColorLight = isDark ? '#333333' : '#d5d5d5';
  }

  return {
    theme: isDark ? 'dark' : 'light',
    dark: isDark,
    background,
    backgroundHigh,
    modalBackground,
    element,
    elementHigh,
    text,
    primary,
    primaryBackground,
    border: borderColor,
    borderLight: borderColorLight,
  };
}

export default GetUIColors;
