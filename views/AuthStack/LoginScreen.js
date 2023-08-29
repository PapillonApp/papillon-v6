import * as React from 'react';
import { Image, ScrollView, StyleSheet, View, StatusBar } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { List } from 'react-native-paper';

import { useColorScheme } from 'react-native';

import packageJson from '../../package.json';

import { Info } from 'lucide-react-native';
import ListItem from '../../components/ListItem';

import { useState, useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';

function ServiceOption({ service, color, logo, identitifants, press }) {
  const theme = useTheme();
  const scheme = useColorScheme();

  return (
    <List.Item
      title={"Connexion avec " + service}
      titleStyle={{ fontWeight: 600, fontSize: 17, fontFamily: 'Papillon-Semibold', color: '#fff' }}
      description={"avec des identifiants " + identitifants}
      descriptionStyle={{ fontWeight: 400, fontSize: 15, color: '#fff', opacity: 0.6 }}
      left={() => 
        <Image source={logo} style={[styles.serviceOptionLogo, {}]} />
      }
      onPress={press}
      style={[styles.serviceOption, { backgroundColor: color, borderColor: theme.colors.outline, borderColor: theme.dark ? '#191919' : '#e5e5e5', borderWidth: theme.dark ? 1 : 0 }]}
    />
  );
}

function LoginScreen({ navigation }) {
  const theme = useTheme();

  useEffect(() => {
      // change modal color
      
  }, []);

  const services = [
    {
      name: 'Pronote',
      color: '#0E6D42',
      logo: require('../../assets/logo_pronote.png'),
      identitifants: 'Pronote ou ENT',
    },
    {
      name: 'ÉcoleDirecte',
      color: '#0062A6',
      logo: require('../../assets/logo_ed.png'),
      identitifants: 'ÉcoleDirecte',
    },
    {
      name: 'Skolengo',
      color: '#222647',
      logo: require('../../assets/logo_skolengo.png'),
      identitifants: 'régionnaux',
    },
  ];

  function pressedService(service, color) {
    if (service == 'Pronote') navigation.navigate('LoginPronoteSelectEtab')
    else navigation.navigate('LoginUnavailable', { service: service, color: color || '#A84700' })
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={[styles.container, {  }]}>
      <StatusBar animated barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor={theme.dark ? '#121212' : '#ffffff'} />

      <ListItem
        title="Papillon est un client alternatif pour Pronote et d’autres services scolaires"
        subtitle="Cette application est en bêta, certaines choses peuvent ne pas fonctionner normalement."
        icon={<Info color="#29947A" />}
        color="#29947A"
        style={{ marginTop: 14 }}
        isLarge={true}
      />

      <List.Section style={styles.serviceOptionList}>
        <List.Subheader>Services scolaires disponibles</List.Subheader>
        
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

      <View style={styles.versionTextContainer}>
        <Text style={styles.versionText}>
          Papillon v{packageJson.version} ({packageJson.canal})
        </Text>

        <Text style={styles.versionText}>
          Cette application est une preview technique. Elle peut contenir de nombreux bugs et ne pas fonctionner correctement.
        </Text>
      </View>

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
  }
});

export default LoginScreen;