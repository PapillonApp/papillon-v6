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

  const changeTheme = () => {
    const options = [
      {
        label: 'Par défaut',
        value: null,
      },
      {
        label: 'Clair',
        value: 'light',
      },
      {
        label: 'Sombre',
        value: 'dark',
      },
      {
        label: 'Annuler',
        value: 'cancel',
      },
    ];
    showActionSheetWithOptions(
      {
        options: options.map((option) => option.label),
        cancelButtonIndex: options.length - 1,
        containerStyle: {
          paddingBottom: insets.bottom,
          backgroundColor: UIColors.elementHigh,
        },
        textStyle: {
          color: UIColors.text,
        },
        titleTextStyle: {
          color: UIColors.text,
          fontWeight: 'bold',
        },
        messageTextStyle: {
          color: UIColors.text,
        },
      },
      (selectedIndex) => {
        if (selectedIndex === undefined) return;
        const newTheme = options[selectedIndex];
        if (newTheme.value === 'cancel') return;
        Appearance.setColorScheme(newTheme.value);
      }
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
    >
      <StatusBar
        animated
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
      />

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
        {Platform.OS === 'android' && (
          <ListItem
            title="Thème de l'application"
            subtitle="Sélectionner le thème de l'application"
            color="#29947A"
            left={
              <PapillonIcon
                icon={<SunMoon size={24} color="#29947A" />}
                color="#29947A"
                size={24}
                small
              />
            }
            onPress={() => changeTheme()}
            center
          />
        )}
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
