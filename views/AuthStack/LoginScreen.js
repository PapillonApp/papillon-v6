import * as React from 'react';
import { Image, ScrollView, StyleSheet, View, StatusBar } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { List } from 'react-native-paper';

import { useColorScheme } from 'react-native';

import packageJson from '../../package.json';

function ServiceOption({ service, color, logo, identitifants, press }) {
  const theme = useTheme();
  const scheme = useColorScheme();

  return (
    <List.Item
      title={"Connexion avec " + service}
      titleStyle={{ fontWeight: 600, fontSize: 17, fontFamily: 'Papillon-Semibold' }}
      description={"avec des identifiants " + identitifants}
      descriptionStyle={{ fontWeight: 400, fontSize: 15 }}
      left={() => 
        <Image source={logo} style={[styles.serviceOptionLogo, {}]} />
      }
      right={() =>
        <List.Icon icon="chevron-right" color={theme.colors.outline} />
      }
      onPress={press}
      style={[styles.serviceOption, { backgroundColor: theme.dark ? '#111' : '#fff', borderColor: theme.colors.outline, borderColor: theme.dark ? '#191919' : '#e5e5e5', borderWidth: theme.dark ? 1 : 0 }]}
    />
  );
}

function LoginScreen({ navigation }) {
  const theme = useTheme();

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

  function pressedService(service) {
    if (service == 'Pronote') navigation.navigate('LoginPronoteSelectEtab')
    else navigation.navigate('LoginUnavailable')
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={[styles.container, {  }]}>

      <StatusBar backgroundColor={theme.colors.background} barStyle={theme.dark ? 'light-content' : 'dark-content'} />

      <List.Section style={styles.serviceOptionList}>
        <List.Subheader>Services scolaires disponibles</List.Subheader>
        
        {services.map((service, index) => (
          <ServiceOption
            key={index}
            service={service.name}
            color={service.color}
            logo={service.logo}
            identitifants={service.identitifants}
            press={() => pressedService(service.name)}
          />
        ))}

      </List.Section>

      <View style={styles.versionTextContainer}>
        <Text style={styles.versionText}>
          Papillon v{packageJson.version} ({packageJson.canal})
        </Text>

        <Text style={styles.versionText}>
          Cette application est une preview technique. Elle peut ne pas faire partie de la v6 finale. Il peut même ne pas y avoir de v6 du tout. Il s'agit uniquement d'une exploration technique pour le moment.
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  serviceOption: {
    borderRadius: 10,
    overflow: 'hidden',

    paddingHorizontal: 14,
    paddingVertical: 6,

    marginBottom: 8,

    marginHorizontal: 12,

    borderWidth: 0,

    overflow: 'hidden',
  },
  serviceOptionList: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,

    elevation: 2,
    zIndex: 9999,
  },
  serviceOptionLogo: {
    width: 38,
    height: 38,

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