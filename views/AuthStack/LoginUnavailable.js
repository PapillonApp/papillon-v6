import * as React from 'react';
import { ScrollView, View, StatusBar, Platform } from 'react-native';

import { useTheme, Text, Avatar, Button } from 'react-native-paper';

function LoginUnavailable({ navigation }) {
  const theme = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>

        <StatusBar barStyle={Platform.OS == 'ios' ? 'light-content' : 'dark-content'} />

        <View style={{alignItems: 'center', marginTop:50}} >
            <Avatar.Icon size={56} icon="alert" style={{backgroundColor:theme.colors.primary, marginBottom:16}} />
            <Text variant="titleLarge" style={{fontWeight:500, marginBottom: 4, fontFamily: 'Papillon-Semibold'}} >Service indisponible</Text>
            <Text style={{opacity:0.6, marginBottom:50}} >Ce service est indisponible pour le moment.</Text>

            <Button mode="contained-tonal" onPress={() => {navigation.goBack()}} style={{width: 200, marginBottom: 16}} >Retour</Button>
        </View>

    </ScrollView>
  );
}

export default LoginUnavailable;