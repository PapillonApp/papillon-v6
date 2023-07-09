import * as React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';

import PapillonHeader from '../components/PapillonHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Settings } from 'lucide-react-native';

import {refreshToken, expireToken} from '../fetch/AuthStack/LoginFlow';

function SettingsScreen({ navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const logout = () => {
    AsyncStorage.removeItem('token');
  }

  return (
    <View style={{flex: 1}}>
      <PapillonHeader 
        insetTop={insets.top}
        pageName="Compte"
        rightButton={
          <Pressable>
            <Settings size={24} color={theme.colors.onSurface} />
          </Pressable>
        }
      />
      <ScrollView style={[{paddingTop: insets.top + 52}]} contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>

        <Button style={{marginTop: 22, width:'90%'}} mode="contained" onPress={() => logout()}>
          Se déconnecter
        </Button>

        <Button style={{marginTop: 10, width:'90%'}} mode="contained-tonal" onPress={() => refreshToken()}>
          Rafraîchir le token
        </Button>

        <Button style={{marginTop: 10, width:'90%'}} mode="contained-tonal" onPress={() => expireToken()}>
          Forcer l'expiration du token
        </Button>

      </ScrollView>
    </View>
  );
}

export default SettingsScreen;