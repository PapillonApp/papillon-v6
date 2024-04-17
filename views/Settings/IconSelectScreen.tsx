import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableHighlight, Platform } from 'react-native';

import GetUIColors from '../../utils/GetUIColors';

import Reanimated, {ZoomIn, ZoomOut, FadeIn, FadeOut} from 'react-native-reanimated';

import * as Haptics from 'expo-haptics';

interface Icon {
  coverName: string;
  name: string;
  author?: string;
  icon: any;
  category?: string;
}

const categories = [
  {
    name: 'classic',
    title: 'Classique',
    description: 'Les icônes classiques de l\'équipe Papillon',
  },
  {
    name: 'contest2023',
    title: 'Concours d\'icônes 2023',
    description: 'Les icônes créées par les gagnants du concours de la communauté',
  },
];

export const IconsList: Icon[] = [
  {
    coverName: 'Par défaut',
    name: 'classic',
    icon: require('../../assets/customicons/classic.png'),
    category: 'classic',
  },
  {
    coverName: 'Papillon en relief',
    name: 'relief',
    icon: require('../../assets/customicons/relief.png'),
    category: 'classic',
  },
  {
    coverName: 'Version bêta',
    name: 'beta',
    icon: require('../../assets/customicons/beta.png'),
    category: 'classic',
  },
  {
    coverName: 'Icône sombre',
    name: 'black',
    icon: require('../../assets/customicons/black.png'),
    category: 'classic',
  },
  {
    coverName: 'Processeur',
    name: 'chip',
    icon: require('../../assets/customicons/chip.png'),
    category: 'classic',
  },
  {
    coverName: 'Icône brodée',
    name: 'cutted',
    icon: require('../../assets/customicons/cutted.png'),
    category: 'classic',
  },
  {
    coverName: 'Icône en or',
    name: 'gold',
    icon: require('../../assets/customicons/gold.png'),
    category: 'classic',
  },
  {
    coverName: 'Icône dégradée',
    name: 'gradient',
    icon: require('../../assets/customicons/gradient.png'),
    category: 'classic',
  },
  {
    coverName: 'Icône en métal',
    name: 'metal',
    icon: require('../../assets/customicons/metal.png'),
    category: 'classic',
  },
  {
    coverName: 'Icône néon',
    name: 'neon',
    icon: require('../../assets/customicons/neon.png'),
    category: 'classic',
  },
  {
    coverName: 'Pride 2023',
    name: 'pride',
    icon: require('../../assets/customicons/pride.png'),
    category: 'classic',
  },
  {
    coverName: 'Icône violette',
    name: 'purple',
    icon: require('../../assets/customicons/purple.png'),
    category: 'classic',
  },
  {
    coverName: 'Icône violette (rayons)',
    name: 'rayspurple',
    icon: require('../../assets/customicons/rayspurple.png'),
    category: 'classic',
  },
  {
    coverName: 'Icône verte (rayons)',
    name: 'rays',
    icon: require('../../assets/customicons/rays.png'),
    category: 'classic',
  },
  {
    coverName: 'Icône rétro',
    name: 'retro',
    icon: require('../../assets/customicons/retro.png'),
    category: 'classic',
  },
  {
    coverName: 'Icône brillante',
    name: 'sparkles',
    icon: require('../../assets/customicons/sparkles.png'),
    category: 'classic',
  },
  {
    coverName: 'Back to School 2023',
    author: 'Timo (Alokation)',
    name: 'backtoschool',
    icon: require('../../assets/customicons/backtoschool.png'),
    category: 'contest2023',
  },
  {
    coverName: 'Barbie Edition',
    author: 'Lucas (Tryon)',
    name: 'barbie',
    icon: require('../../assets/customicons/barbie.png'),
    category: 'contest2023',
  },
  {
    coverName: 'Better Neon',
    author: 'Yann (Yannou)',
    name: 'betterneon',
    icon: require('../../assets/customicons/betterneon.png'),
    category: 'contest2023',
  },
  {
    coverName: 'Style macOS',
    author: 'Bryan (Ahhj)',
    name: 'macos',
    icon: require('../../assets/customicons/macos.png'),
    category: 'contest2023',
  },
  {
    coverName: 'Style iOS 6',
    author: 'Timo (Alokation)',
    name: 'oldios',
    icon: require('../../assets/customicons/oldios.png'),
    category: 'contest2023',
  },
  {
    coverName: 'Style v5',
    author: 'Timo (Alokation)',
    name: 'verscinq',
    icon: require('../../assets/customicons/verscinq.png'),
    category: 'contest2023',
  },
  {
    coverName: 'Mascotte',
    author: 'Anaël Chevillard',
    name: 'mascotte',
    icon: require('../../assets/customicons/mascotte.png'),
    category: 'classic',
  },
];

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import { Check, AlertTriangle } from 'lucide-react-native';

import { setAppIcon, getAppIcon } from 'expo-dynamic-app-icon';

const IconSelectScreen = () => {
  const UIColors = GetUIColors();

  const [currentIcon, setCurrentIcon] = useState<string | null>(null);

  useEffect(() => {
    setCurrentIcon(getAppIcon() || 'classic');
  }, []);

  function applyIcon(name: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const icon = setAppIcon(name);

    if (icon === name) {
      setCurrentIcon(name);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
    >
      {Platform.OS == 'android' && (
        <NativeList inset>
          <NativeItem
            leading={
              <AlertTriangle size={24} strokeWidth={2.4} color={UIColors.primary} />
            }
          >
            <NativeText heading="p2">
              Changer l'icône de l'application peut mener à des comportements inattendus sur certains appareils.
            </NativeText>
          </NativeItem>
        </NativeList>
      )}

      {categories.map((category) => (
        <View
          style={[
            styles.preview,
            { backgroundColor: UIColors.element },
          ]}
        >
          <View style={styles.categoryIn}>
            <View style={styles.categoryTitle}>
              <NativeText heading="h3">
                {category.title}
              </NativeText>
              <NativeText heading="p2">
                {category.description}
              </NativeText>
            </View>
            <ScrollView
              horizontal
              style={styles.iconsList}
              scrollIndicatorInsets={{ top: 0, left: 8, bottom: 0, right: 8 }}
              showsHorizontalScrollIndicator={false}
            >
              {IconsList.filter((icon) => icon.category === category.name).map(
                (icon) => (
                  <View style={[styles.iconPreviewContainer, Platform.OS === 'android' ? {paddingTop: 2} : null]}>
                    {currentIcon === icon.name && (
                      <Reanimated.View
                        style={[styles.checkContainer, {backgroundColor: UIColors.element},Platform.OS === 'android' ? {marginTop: 2} : null]}
                        entering={FadeIn.duration(100)}
                        exiting={FadeOut.duration(100)}
                      >
                        <Reanimated.View
                          style={[styles.check, {backgroundColor: UIColors.primary}]}
                          entering={ZoomIn.duration(200).delay(50)}
                          exiting={ZoomOut.duration(200)}
                        >
                          <Check size={20} strokeWidth={2.4} color={'#ffffff'} />
                        </Reanimated.View>
                      </Reanimated.View>
                    )}
                    <TouchableHighlight
                      style={styles.iconPreview}
                      onPress={() => {
                        applyIcon(icon.name);
                      }}
                      activeOpacity={0.6}
                    >
                      <Image
                        source={icon.icon}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </TouchableHighlight>
                  </View>
                )
              )}
              <View style={{ width: 16 }} />
            </ScrollView>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  preview: {
    margin: 16,
    borderRadius: 12,
    borderCurve: 'continuous',
    paddingTop: 9,
    marginBottom: 0,
  },
  categoryTitle: {
    paddingHorizontal: 14,
  },
  iconPreview: {
    width: 64,
    height: 64,
    borderRadius: 14,
    borderCurve: 'continuous',
    overflow: 'hidden',
    zIndex: 0,
  },
  categoryIn: {
    paddingVertical: 4,
    overflow: 'hidden',
  },
  iconsList: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    marginTop: 12,
    paddingHorizontal: 14,
    overflow: 'visible',
    paddingBottom: 12,
  },
  iconPreviewContainer: {
    marginRight: 10,
  },

  check: {
    width: 24,
    height: 24,
    borderRadius: 300,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  checkContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    zIndex: 10000,
    borderRadius: 300,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IconSelectScreen;
