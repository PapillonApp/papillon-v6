import * as React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import {
  BadgeCheck,
  PackageOpen,
  ShieldCheck,
  Eye,
  BadgeHelp,
  HelpCircle,
} from 'lucide-react-native';

import PapillonIcon from '../../components/PapillonIcon';
import ListItem from '../../components/ListItem';
import GetUIColors from '../../utils/GetUIColors';

function OfficialServer({ route, navigation }) {
  const UIColors = GetUIColors();

  const { official } = route.params;
  const { server } = route.params;

  // set header title
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: server,
    });
  }, [navigation]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
    >
      {official ? (
        <View style={styles.certifContainer}>
          <PapillonIcon
            icon={<BadgeCheck size={36} color="#fff" />}
            color={UIColors.primary}
            size={128}
            fill
          />
          <Text style={styles.certifTitle}>Certificat de sécurité</Text>
          <Text style={styles.certifDesc}>
            Ce serveur est certifié par Papillon. Il est donc sécurisé, basé sur
            notre code open-source et ne contient pas de contenu malveillant.
          </Text>
        </View>
      ) : (
        <View style={styles.certifContainer}>
          <PapillonIcon
            icon={<BadgeHelp size={36} color="#fff" />}
            color="#0065A8"
            size={128}
            fill
          />
          <Text style={styles.certifTitle}>Certificat de sécurité</Text>
          <Text style={styles.certifDesc}>
            Ce serveur est n'est pas vérifié par Papillon. Il peut
            potentiellement mettre vos données en danger.
          </Text>
        </View>
      )}

      {official ? (
        <View style={styles.certifData}>
          <ListItem
            title="Open-source"
            subtitle="Ce serveur est basé sur un code open-source non altéré. Vous pouvez le consulter sur GitHub."
            color={UIColors.primary}
            icon={<PackageOpen size={24} color={UIColors.primary} />}
          />

          <ListItem
            title="Respecte votre vie privée"
            subtitle="Ce serveur ne collecte aucune donnée personnelle et ne vous traque pas."
            color={UIColors.primary}
            icon={<ShieldCheck size={24} color={UIColors.primary} />}
          />

          <ListItem
            title="Vérifié par l'équipe Papillon"
            subtitle="Ce serveur a été vérifié par les membres de l'équipe Papillon. Nous nous sommes assurés qu'il ne contient pas de contenu malveillant."
            color={UIColors.primary}
            icon={<Eye size={24} color={UIColors.primary} />}
          />
        </View>
      ) : (
        <View style={styles.certifData}>
          <ListItem
            title="Impossible de vérifier ce serveur"
            subtitle="Ce serveur n'est pas vérifié par Papillon. Nous ne pouvons donc pas vous garantir qu'il ne contient pas de contenu malveillant."
            color="#0065A8"
            icon={<HelpCircle size={24} color="#0065A8" />}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  certifContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    marginVertical: 32,
  },
  certifTitle: {
    fontSize: 22,
    fontFamily: 'Papillon-Bold',
    marginTop: 16,
  },
  certifDesc: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.6,
  },
  certifData: {
    flex: 1,
    gap: 10,
  },
});

export default OfficialServer;
