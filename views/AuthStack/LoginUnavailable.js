import * as React from 'react';
import { ScrollView, View, StatusBar } from 'react-native';

import { Text, Avatar } from 'react-native-paper';

import { useTheme } from '@react-navigation/native';

function LoginUnavailable({ navigation }) {
  const { colors } = useTheme();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>

        <StatusBar backgroundColor={colors.background} barStyle={'light-content'} />

        <View style={{alignItems: 'center', marginTop:50}} >
            <Avatar.Icon size={48} icon="alert" style={{backgroundColor:colors.elevation.level1, marginBottom:16}} />
            <Text variant="titleLarge" style={{fontWeight:500, marginBottom: 4}} >Service indisponible</Text>
            <Text style={{opacity:0.6, marginBottom:70}} >Ce service est indisponible pour le moment.</Text>
        </View>

    </ScrollView>
  );
}

export default LoginUnavailable;