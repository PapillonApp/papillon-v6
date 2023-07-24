import * as React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Platform, Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import * as SystemUI from 'expo-system-ui';

import { ListFilter } from 'lucide-react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PapillonHeader from '../components/PapillonHeader';

function HomeScreen({ navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    // change background color
    SystemUI.setBackgroundColorAsync("#000000");
  }, []);

  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={[styles.container]} contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>
        
      
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
  },
});

export default HomeScreen;