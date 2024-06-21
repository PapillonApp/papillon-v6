import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { Bell, Maximize, Palette } from 'lucide-react-native';
import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import GetUIColors from '../../utils/GetUIColors';

interface AppearenceScreenProps {
  navigation: any;
}

function AppearanceScreen({ navigation }: AppearenceScreenProps) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  return (  
    <ScrollView style={{ backgroundColor: UIColors.modalBackground }}>
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
          color="#32AB8E"
          left={
            <PapillonIcon
              icon={<Maximize size={24} color="#32AB8E" />}
              color="#32AB8E"
              small
            />
          }
          onPress={() => navigation.navigate('Icons')}
          center
        />
        <ListItem
          title="Couleur des matières"
          subtitle="Changer la couleur des matières"
          color="#32AB8E"
          left={
            <PapillonIcon
              icon={<Palette size={24} color="#32AB8E" />}
              color="#32AB8E"
              small
            />
          }
          onPress={() => navigation.navigate('CoursColor')}
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
