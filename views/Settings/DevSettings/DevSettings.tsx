import * as React from 'react';
import { Alert, Platform, ScrollView, StatusBar, View } from 'react-native';

import { useTheme } from 'react-native-paper';
import GetUIColors from '../../../utils/GetUIColors';
import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';
import ListItem from '../../../components/ListItem';
import PapillonIcon from '../../../components/PapillonIcon';

import { Network, ScrollText, Database } from 'lucide-react-native';

function DevSettings({ navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();
  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === 'ios' ? (
        <StatusBar animated barStyle="light-content" />
      ) : (
        <StatusBar
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
      )}
      <ScrollView
        style={{ backgroundColor: UIColors.modalBackground }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <NativeList
          inset
        >
          <NativeItem
            leading={
              <PapillonIcon
                icon={<Network size={24} color="#fff" />}
                color="#FFAA00"
                fill
                small
              />
            }
            chevron
            onPress={() => navigation.navigate('NetworkLoggerScreen')}
          >
            <NativeText heading="h4">
              Déboggeur réseau
            </NativeText>
            <NativeText heading="p2">
              Affiche les requêtes réseau
            </NativeText>
          </NativeItem>

          <NativeItem
            leading={
              <PapillonIcon
                icon={<ScrollText size={24} color="#fff" />}
                color="#00AAFF"
                fill
                small
              />
            }
            chevron
            onPress={() => navigation.navigate('LogsScreen')}
          >
            <NativeText heading="h4">
              Logs
            </NativeText>
            <NativeText heading="p2">
              Affiche les logs de l'application
            </NativeText>
          </NativeItem>

          <NativeItem
            leading={
              <PapillonIcon
                icon={<Database size={24} color="#fff" />}
                color="#7F00FF"
                fill
                small
              />
            }
            chevron
            onPress={() => {
              Alert.alert(
                'Avertissement de sécurité',
                'Le local storage contient vos informations d\'identification sous la forme de token. Il contient également vos données personnelles. Faites donc très attention aux informations que vous fournissez en faisant une capture d\'écran.\n\nLes informations sensibles sont indiqués, veillez-donc à les masquer.\n\nL\'équipe Papillon ne saurait être tenue responsable de tout bug lié à la manipulation du local storage.',
                [{
                  text: 'Annuler',
                  style: 'cancel'
                },
                {
                  text: 'Continuer',
                  onPress: () => navigation.navigate('LocalStorageViewScreen')
                }]
              );
            }}
          >
            <NativeText heading="h4">
              Local storage
            </NativeText>
            <NativeText heading="p2">
              Affiche le local storage de l'application
            </NativeText>
          </NativeItem>
        </NativeList>
      </ScrollView>
    </View>
  );
}

export default DevSettings;
