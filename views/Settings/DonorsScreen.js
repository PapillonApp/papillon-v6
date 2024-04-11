import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { useState, useEffect } from 'react';
import {
  Euro, Heart,
} from 'lucide-react-native';
import PapillonIcon from '../../components/PapillonIcon';

import KofiSupporters from './KofiSupporters.json';
import GetUIColors from '../../utils/GetUIColors';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import PapillonLoading from '../../components/PapillonLoading';

function DonorsScreen({ navigation }) {
  const UIColors = GetUIColors();

  const theme = useTheme();

  function formatDate(date) {
    let s = date.split(' ');
    let d = s[0].split('-');
    let t = s[1].split(':');
    const month = [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre',
    ];
    return `${d[2].startsWith('0') ? d[2].replace('0', '') : d[2]} ${
      month[parseInt(d[1]) - 1]
    } ${d[0]}`;
  }

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
        style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        <PapillonLoading
          icon={<Heart size={32} color="#bf941d" />}
          title="Merci à tous nos donateurs !"
          subtitle="Vous êtes géniaux ! Grâce à vous, nous pouvons continuer à développer Papillon de manière indépendante & gratuite !"
        />

        <NativeList
          inset
          header={'Donateurs'}
        >
          {KofiSupporters.map((item, index) => (
            <NativeItem
              key={index}
              leading={
                item.DiscordProfilePicture ? (
                  <DonorsPfp image={item.DiscordProfilePicture} />
                ) : (
                  <PapillonIcon
                    icon={<Euro size={20} strokeWidth={2.3} color="#bf941d" />}
                    color="#bf941d"
                    size={24}
                    small
                  />
                )
              }
              trailing={
                <NativeText heading="p2">
                  {(parseFloat(item.Total.replace(',','.')) / 1).toFixed(2)} €
                </NativeText>
              }
            >
              <NativeText heading="h4">
                {item.Name}
              </NativeText>
              <NativeText heading="subtitle1">
                le {formatDate(item.LastSupportedDateUTC)}
              </NativeText>
            </NativeItem>
          ))}
        </NativeList>
      </ScrollView>
    </View>
  );
}

const DonorsPfp = ({ image }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <View
      style={[{
        width: 38,
        height: 38,
      }]}
    >
      {!isLoaded && (
        <ActivityIndicator
          size="small"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        />
      )}
      
      { image && image.startsWith('https://') ? (
        <Image
          onLoad={() => setIsLoaded(true)}
          source={{ uri: image }}
          style={{ width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#00000022' }}
        />
      ) : null }
    </View>
  );
};

const styles = StyleSheet.create({
  optionsList: {
    width: '100%',
    gap: 9,
    marginTop: 16,
    marginBottom: 12,
  },
  ListTitle: {
    paddingLeft: 29,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },
  certif: {
    backgroundColor: '#32AB8E',

    padding: 1,
    borderRadius: 8,
    alignContent: 'center',
    justifyContent: 'center',

    position: 'absolute',
    bottom: -2,
    right: -4,

    borderWidth: 2,
  },
});

export default DonorsScreen;