import * as React from 'react';
import { View, ScrollView, Settings } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {refreshToken} from '../fetch/AuthStack/LoginFlow';

function SettingsScreen({ navigation }) {
  const theme = useTheme();

  const logout = () => {
    AsyncStorage.removeItem('token');
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1 }} contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>

      <Button style={{marginTop: 22, width:'90%'}} mode="contained" onPress={() => logout()}>
        Se déconnecter
      </Button>

      <Button style={{marginTop: 10, width:'90%'}} mode="contained-tonal" onPress={() => refreshToken()}>
        Rafraîchir le token
      </Button>

    </ScrollView>
  );
}

export default SettingsScreen;