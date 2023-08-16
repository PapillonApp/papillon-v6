import * as React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Platform, Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import * as SystemUI from 'expo-system-ui';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

function DevoirsScreen({ navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    // change background color
    
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

export default DevoirsScreen;