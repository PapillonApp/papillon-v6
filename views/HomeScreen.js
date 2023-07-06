import * as React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Platform } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

function HomeScreen({ navigation }) {
  const theme = useTheme();

  const insets = useSafeAreaInsets();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={[styles.container, {paddingTop: insets.top, paddingBottom: insets.bottom}]} contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>
      {Platform.OS === 'android' ? (
        <StatusBar backgroundColor={theme.colors.background} barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      ) : null}


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
  },
});

export default HomeScreen;