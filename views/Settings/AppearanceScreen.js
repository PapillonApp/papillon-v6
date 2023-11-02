import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Appearance,
  Platform,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { Bell, Maximize, SunMoon } from 'lucide-react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import GetUIColors from '../../utils/GetUIColors';

function AppearanceScreen({ navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();
  const { showActionSheetWithOptions } = useActionSheet();
  const insets = useSafeAreaInsets();



  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
    >
      {Platform.OS === 'ios' ? (
        <StatusBar animated barStyle="light-content" />
      ) : (
        <StatusBar
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
      )}

      <View style={{ gap: 9, marginTop: 24 }}>
        <Text style={styles.ListTitle}>Thèmes et personnalisation</Text>
        <ListItem
          title="Icône de l'application"
          subtitle="Changer l'icône de l'application"
          color="#29947A"
          left={
            <PapillonIcon
              icon={<Maximize size={24} color="#29947A" />}
              color="#29947A"
              size={24}
              small
            />
          }
          onPress={() => navigation.navigate('Icons')}
          center
        />
      </View>

      <View style={{ gap: 9, marginTop: 24 }}>
        <Text style={styles.ListTitle}>Notifications</Text>
        <ListItem
          title="Notifications"
          subtitle="Gérer les rappels et les mises à jour des données en arrière plan"
          color="#29947A"
          left={
            <PapillonIcon
              icon={<Bell size={24} color="#5d75de" />}
              color="#5d75de"
              size={24}
              small
            />
          }
          onPress={() => navigation.navigate('Notifications')}
          center
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ListTitle: {
    paddingLeft: 29,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },
});

export default AppearanceScreen;
