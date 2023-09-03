import * as React from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { Maximize } from 'lucide-react-native';
import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import GetUIColors from '../../utils/GetUIColors';

function AppearanceScreen({ navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
    >
      <StatusBar
        animated
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
      />

      <View style={{ gap: 9, marginTop: 24 }}>
        <Text style={styles.ListTitle}>Application</Text>
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
