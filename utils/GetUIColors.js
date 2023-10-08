import { Platform, useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';

let isDark = false;

function GetUIColors() {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  // Delay the update of isDark for 1 second
  setTimeout(() => {
    isDark = colorScheme === 'dark';
    console.log('isDark: ' + isDark);
  }, 1000); // 1000 milliseconds (1 second) delay

  // background
  let background = '';

  if (Platform.OS === 'ios') {
    background = isDark ? '#000000' : '#f2f2f7';
  } else {
    background = theme.colors.background;
  }

  // element
  let element = '';
  let elementHigh = '';

  if (Platform.OS === 'ios') {
    element = isDark ? '#151515' : '#ffffff';
    elementHigh = isDark ? '#151515' : '#ffffff';
  } else {
    element = theme.colors.elevation.level1;
    elementHigh = theme.colors.elevation.level2;
  }

  // text
  const text = isDark ? '#ffffff' : '#000000';

  // main
  // let primary = '';
  let primaryBackground = '';

  if (Platform.OS === 'ios') {
    // primary = '#29947A';
    primaryBackground = '#29947A';
  } else {
    // primary = theme.colors.primary;
    primaryBackground = isDark
      ? theme.colors.primaryContainer
      : theme.colors.primary;
  }

  // border
  let borderColor = '';

  if (Platform.OS === 'ios') {
    borderColor = isDark ? '#444444' : '#d5d5d5';
  } else {
    borderColor = theme.colors.border;
  }

  return {
    theme: isDark ? 'dark' : 'light',
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
