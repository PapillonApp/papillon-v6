import * as React from 'react';
import { Image, ScrollView, StyleSheet, View, StatusBar, Platform } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { List } from 'react-native-paper';

import { useColorScheme } from 'react-native';

import packageJson from '../../package.json';

import { Info } from 'lucide-react-native';
import ListItem from '../../components/ListItem';

import { useState, useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';
import GetUIColors from '../../utils/GetUIColors';


import PapillonIcon from '../../components/PapillonIcon';

function ServiceOption({ service, color, logo, identitifants, press }) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const UIColors = GetUIColors();

  return (
    <ListItem
              title={"Connexion avec " + service}
              center
              subtitle={"avec des identifiants " + identitifants}
              left={
                <Image source={logo} style={[styles.serviceOptionLogo, {}]} />
              }
              style={[
                { borderColor: UIColors.primary },
              ]}
              onPress={press}
            />
  );
}

function LoginCantineScreen({ navigation }) {
  const theme = useTheme();

  // hide back button on ios
  React.useLayoutEffect(() => {
    if (Platform.OS == 'ios') {
      navigation.setOptions({ headerLeft: () => <View></View> });
    }
  }, [navigation]);

  useEffect(() => {
      // change modal color
      
  }, []);

  const services = [
    {
      name: 'Turboself',
      color: '#FFFFFF',
      logo: require('../../assets/logo_turboself.png'),
      identitifants: 'Turboself',
    },
  ];

  function pressedService(service, color) {
    if (service == 'Turboself') navigation.navigate('LoginTurboself')
    else navigation.navigate('LoginUnavailable', { service: service, color: color || '#A84700' })
  }

  const UIColors = GetUIColors();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={[styles.container, { backgroundColor: UIColors.modalBackground }]}>
      {Platform.OS === 'ios' ? (
          <StatusBar animated barStyle="light-content" />
        ) : (
          <StatusBar
            animated
            barStyle={theme.dark ? 'light-content' : 'dark-content'}
            backgroundColor="transparent"
          />
        )}

      <ListItem
        title="Papillon est aussi un client alternatif pour Turboself et d’autres services de restaurations scolaires"
        subtitle="Cette fonction est en bêta, certaines choses peuvent ne pas fonctionner normalement."
        icon={<Info color="#29947A" />}
        color="#29947A"
        style={{ marginTop: 14 }}
        isLarge={true}
      />

      <List.Section style={styles.serviceOptionList}>
        <List.Subheader>Services de restaurations scolaires disponibles</List.Subheader>
        
        {services.map((service, index) => (
          <ServiceOption
            key={index}
            service={service.name}
            color={service.color}
            logo={service.logo}
            identitifants={service.identitifants}
            press={() => pressedService(service.name, service.color)}
          />
        ))}

      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  serviceOption: {
    borderRadius: 12,
    borderCurve: 'continuous',
    overflow: 'hidden',

    paddingHorizontal: 14,
    paddingVertical: 7,

    marginBottom: 8,

    marginHorizontal: 14,

    borderWidth: 0,

    overflow: 'hidden',
  },
  serviceOptionList: {
    
  },
  serviceOptionLogo: {
    width: 40,
    height: 40,

    borderRadius: 300,
  },
  versionTextContainer: {
    marginHorizontal: 12,
    marginTop: 24,
  },
  versionText: {
    opacity: 0.3,
    fontSize: 12,
    marginBottom: 6,
  },
  ListTitle: {
    paddingLeft: 29,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },
  
});

export default LoginCantineScreen;