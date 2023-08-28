import React from 'react';
import { StyleSheet, View, Button, ScrollView, StatusBar } from 'react-native';

import { Text, useTheme } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { PressableScale } from 'react-native-pressable-scale';



function ConversationsScreen({ navigation }) {
  const theme = useTheme();

  useEffect(() => {
    
  }, []);

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior='automatic'>
      <StatusBar animated barStyle={'light-content'} />
      
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