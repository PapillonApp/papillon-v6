import * as React from 'react';
import { ScrollView, View, Pressable, StyleSheet, Platform } from 'react-native';

import { useTheme, Text } from 'react-native-paper';

import { AlertCircle } from 'lucide-react-native';
import ListItem from '../../components/ListItem';

import PapillonButton from '../../components/PapillonButton';

function LoginUnavailable({ route, navigation }) {
  const theme = useTheme();

  const { service, color } = route.params;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Connexion avec ' + service,
    });
  }, [navigation]);

  return (
    <ScrollView style={{ flex: 1 }}>

    <ListItem
      title={"La connexion avec " + service + " n'est pas encore disponible."}
      subtitle={service + " sera disponible prochainement, nous travaillons sur cette fonctionnalité."}
      icon={<AlertCircle color={color} />}
      color={color}
      style={{ marginTop: 14 }}
      isLarge={true}
    />

    <PapillonButton
      title="Retour"
      color={color}
      onPress={() => navigation.goBack()}
      style={{ marginTop: 14, marginHorizontal: 14 }}
    />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  btnBack: {
    padding: 14,
    borderRadius: 12,
    borderCurve: 'continuous',
    marginTop: 14,
    marginHorizontal: 14,
    alignContent: 'center',
    alignItems: 'center',
  },
  btnBackText: {
    color: '#fff',
    fontFamily: 'Papillon-Medium',
    fontSize: 16,
  },
});

export default LoginUnavailable;