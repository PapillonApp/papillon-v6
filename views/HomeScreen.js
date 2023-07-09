import * as React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Platform, Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { ListFilter } from 'lucide-react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PapillonHeader from '../components/PapillonHeader';

function HomeScreen({ navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{flex: 1}}>
      <PapillonHeader 
        insetTop={insets.top}
        pageName="Vue d'ensemble"
        rightButton={
          <Pressable>
            <ListFilter size={24} color={theme.colors.onSurface} />
          </Pressable>
        }
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