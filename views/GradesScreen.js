import * as React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Platform, Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import * as SystemUI from 'expo-system-ui';

import { getGrades } from '../fetch/PronoteData/PronoteGrades';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PapillonHeader from '../components/PapillonHeader';

function HomeScreen({ navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    // change background color
    SystemUI.setBackgroundColorAsync("#000000");
  }, []);

  React.useEffect(() => {
    getGrades().then((grades) => {
      console.log(grades);
    });
  }, []);

  return (
    <View style={{flex: 1}}>
      {Platform.OS === 'ios' ? (
        <StatusBar animated barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      ) : null}

      <PapillonHeader 
        insetTop={insets.top}
        pageName="Notes"
      />

      <ScrollView style={[styles.container, {paddingTop: insets.top + 52}]} contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>
        {Platform.OS === 'android' ? (
          <StatusBar backgroundColor={theme.colors.background} barStyle={theme.dark ? 'light-content' : 'dark-content'} />
        ) : null}
      
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
});

export default HomeScreen;