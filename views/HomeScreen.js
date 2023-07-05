import * as React from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

function HomeScreen({ navigation }) {
  const theme = useTheme();

  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={[styles.container, {paddingTop: insets.top, paddingBottom: insets.bottom}]} contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>
      <StatusBar backgroundColor={theme.colors.background} barStyle={theme.dark ? 'light-content' : 'dark-content'} />


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
  },
});

export default HomeScreen;