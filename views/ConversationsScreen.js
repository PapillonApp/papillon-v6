import React from 'react';
import { StyleSheet, View, Button, ScrollView, StatusBar, Platform } from 'react-native';

import { Text, useTheme } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { PressableScale } from 'react-native-pressable-scale';
import GetUIColors from '../utils/GetUIColors';



function ConversationsScreen({ navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  useEffect(() => {
    
  }, []);

  return (
    <ScrollView style={[styles.container, {backgroundColor: UIColors.background}]} contentInsetAdjustmentBehavior='automatic'>
      { Platform.OS === 'ios' ?
        <StatusBar animated barStyle={'light-content'} />
      :
        <StatusBar animated barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor='transparent' />
      }
      
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20, marginHorizontal: 20}}>
        <Text style={{fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 20}}>Ça arrive, t'inquiètes...</Text>
        <Text style={{fontSize: 16, textAlign: 'center', opacity: 0.5, marginTop: 4}}>Les conversartions seront disponibles dans une prochaîne beta.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  
});

export default ConversationsScreen;