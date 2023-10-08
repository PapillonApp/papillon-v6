import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

function GetUIColors() {
  const theme = useTheme();

  // background
  let background = '';

  if (Platform.OS === 'ios') {
    background = theme.dark ? '#000000' : '#f2f2f7';
  } else {
    background = theme.colors.background;
  }

  // element
  let element = '';
  let elementHigh = '';

  if (Platform.OS === 'ios') {
    element = theme.dark ? '#151515' : '#ffffff';
    elementHigh = theme.dark ? '#151515' : '#ffffff';
  } else {
    element = theme.colors.elevation.level1;
    elementHigh = theme.colors.elevation.level2;
  }

  // text
  const text = theme.dark ? '#ffffff' : '#000000';

  // main
  // let primary = '';
  let primaryBackground = '';

  if (Platform.OS === 'ios') {
    // primary = '#29947A';
    primaryBackground = '#29947A';
  } else {
    // primary = theme.colors.primary;
    primaryBackground = theme.dark
      ? theme.colors.primaryContainer
      : theme.colors.primary;
  }

  // border
  let borderColor = '';

  if (Platform.OS === 'ios') {
    borderColor = theme.dark ? '#444444' : '#d5d5d5';
  } else {
    borderColor = theme.colors.border;
  }

  return {
    theme : theme.dark ? 'dark' : 'light',
    background,
    element,
    elementHigh,
    text,
    primary: primaryBackground,
    primaryBackground,
    border: borderColor,
  };
}

export default GetUIColors;
