import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme, Text, Switch } from 'react-native-paper';

import { useState, useEffect } from 'react';

import { setAppIcon, getAppIcon } from 'expo-dynamic-app-icon';
import ListItem from '../../components/ListItem';

import GetUIColors from '../../utils/GetUIColors';

interface Icon {
  coverName: string;
  name: string;
  author?: string;
  icon: any;
}

interface Props {
  navigation: any;
}

function IconItem({ icon, applyIcon, current }: { icon: Icon; applyIcon: (name: string) => void; current: boolean }) {
  const [isLoaded, setIsLoaded] = useState(false);

  let subt = 'par l\'équipe Papillon';
  if (icon.author) {
    subt = `Concours 2023 - par ${icon.author}`;
  }

  return (
    <ListItem
      title={icon.coverName ? icon.coverName : icon.name}
      subtitle={subt}
      color="#A84700"
      style={[styles.iconElem, current ? styles.iconElemCurrent : {}]}
      left={
        <>
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

          <Image
            source={icon.icon}
            style={[styles.icon, { opacity: isLoaded ? 1 : 0 }]}
            onLoad={() => setIsLoaded(true)}
          />
        </>
      }
      onPress={() => applyIcon(icon.name)}
    />
  );
}

function AppearanceScreen({ navigation }: Props) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [isSwitchOn, setIsSwitchOn] = React.useState(false);

  // 3d, beta, black, chip, cutted, gold, gradient, metal, neon, pride, purple, rays-purple, rays, retro, sparkles, monochrome
  const papillonIcons: Icon[] = [
    {
      coverName: 'Par défaut',
      name: 'classic',
      icon: require('../../assets/customicons/classic.png'),
    },
    {
      coverName: 'Papillon en relief',
      name: 'relief',
      icon: require('../../assets/customicons/relief.png'),
    },
    // Other icon objects...
  ];

  // backtoschool, barbie, betterneon, macos, oldios, verscinq
  const communityIcons: Icon[] = [
    {
      coverName: 'Back to School 2023',
      author: 'Timo (Alokation)',
      name: 'backtoschool',
      icon: require('../../assets/customicons/backtoschool.png'),
    },
    // Other icon objects...
  ];

  const [currentIcon, setCurrentIcon] = useState<string | null>(null);

  useEffect(() => {
    setCurrentIcon(getAppIcon() || 'classic');

    // if getappicon is not null
    if (getAppIcon() !== 'DEFAULT') {
      setIsSwitchOn(true);
    }
  }, []);

  function applyIcon(name: string) {
    const icon = setAppIcon(name);

    if (icon === name) {
      setCurrentIcon(name);
    }
  }

  // add switch in header
  React.useLayoutEffect(() => {
    if (Platform.OS === 'android') {
      navigation.setOptions({
        headerRight: () => (
          <Switch
            value={isSwitchOn}
            onValueChange={() => {
              setIsSwitchOn(!isSwitchOn);
            }}
          />
        ),
      });
    }
  }, [navigation, isSwitchOn]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
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

      {Platform.OS === 'android' ? (
        <ListItem
          title="Icône de l'application"
          subtitle="Cette fonctionnalité est instable sous Android et elle peut provoquer des comportements innatendus dans votre lanceur d'applications."
          color="#A84700"
          style={{ marginTop: 14 }}
        />
      ) : null}

      <View
        style={[
          { gap: 9, paddingVertical: 24 },
          Platform.OS === 'android' && !isSwitchOn
            ? { opacity: 0.5 }
            : undefined,
        ]}
        pointerEvents={
          Platform.OS === 'android' && !isSwitchOn ? 'none' : 'auto'
        }
      >
        <Text style={styles.ListTitle}>Icônes Papillon</Text>

        {papillonIcons.map((icon, index) => (
          <IconItem
            icon={icon}
            key={index}
            current={currentIcon === icon.name}
            applyIcon={(ico) => applyIcon(ico)}
          />
        ))}

        <Text style={[styles.ListTitle, { marginTop: 24 }]}>
          Icônes de la communauté
        </Text>

        {communityIcons.map((icon, index) => (
          <IconItem
            icon={icon}
            key={index}
            current={currentIcon === icon.name}
            applyIcon={(ico) => applyIcon(ico)}
          />
        ))}
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
  icon: {
    width: 38,
    height: 38,
    borderRadius: 9,
  },

  iconElem: {
    borderColor: '#00000000',
    borderWidth: 2,
  },
  iconElemCurrent: {
    borderColor: '#32AB8E',
    borderWidth: 2,
  },
  container: {
    flex: 1,
  },
});

export default AppearanceScreen;
