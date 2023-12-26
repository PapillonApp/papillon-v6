import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, StyleSheet, Modal, Animated, TouchableWithoutFeedback, ScrollView, Switch, Alert, Platform, Image } from 'react-native';

import { Text } from 'react-native-paper';
import GetUIColors from '../../utils/GetUIColors';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import SyncStorage from 'sync-storage';
import { TouchableOpacity } from '@gorhom/bottom-sheet';

const HeaderSelectScreen = ({ navigation }) => {
  const UIColors = GetUIColors();

  const [selectedColor, setSelectedColor] = useState('#32AB8E');

  const backgrounds = [
    {
      name: "Papillon",
      description: "Avec le logo de l'app",
      slug: "papillon",
      images : [
        {
          name: "Default",
          slug: "default",
          image: require('../../assets/themes/papillon/default.png'),
        },
        {
          name: "Gros Papillon",
          slug: "grospapillon",
          image: require('../../assets/themes/papillon/grospapillon.png'),
        },
        {
          name: "Papillon Ligne",
          slug: "papillonligne",
          image: require('../../assets/themes/papillon/papillonligne.png'),
        },
        {
          name: "Papillon Lumineux",
          slug: "papillonlumineux",
          image: require('../../assets/themes/papillon/papillonlumineux.png'),
        },
        {
          name: "Papillon Papier",
          slug: "papillonpapier",
          image: require('../../assets/themes/papillon/papillonpapier.png'),
        },
        {
          name: "Papillon Plusieurs",
          slug: "papillonplusieurs",
          image: require('../../assets/themes/papillon/papillonplusieurs.png'),
        },
        {
          name: "Formes",
          slug: "formes",
          image: require('../../assets/themes/papillon/formes.png'),
        },
        {
          name: "Formes (Couleur)",
          slug: "formescolor",
          image: require('../../assets/themes/papillon/formescolor.png'),
        },
      ]
    },
    {
      name: "Hero Patterns",
      description: "Des motifs simples inspirés de Hero Patterns",
      slug: "hero",
      images : [
        {
          name: "Circuit",
          slug: "circuit",
          image: require('../../assets/themes/hero/circuit.png'),
        },
        {
          name: "Damier",
          slug: "damier",
          image: require('../../assets/themes/hero/damier.png'),
        },
        {
          name: "Flocons",
          slug: "flakes",
          image: require('../../assets/themes/hero/flakes.png'),
        },
        {
          name: "Movement",
          slug: "movement",
          image: require('../../assets/themes/hero/movement.png'),
        },
        {
          name: "Spark Circle",
          slug: "sparkcircle",
          image: require('../../assets/themes/hero/sparkcircle.png'),
        },
        {
          name: "Topography",
          slug: "topography",
          image: require('../../assets/themes/hero/topography.png'),
        },
        {
          name: "Wave",
          slug: "wave",
          image: require('../../assets/themes/hero/wave.png'),
        },
      ]
    },
    {
      name: "Gribouillage",
      description: "Des griffonnages basiques et inspirants",
      slug: "gribouillage",
      images : [
        {
          name: "Nuages",
          slug: "clouds",
          image: require('../../assets/themes/gribouillage/clouds.png'),
        },
        {
          name: "Cross",
          slug: "cross",
          image: require('../../assets/themes/gribouillage/cross.png'),
        },
        {
          name: "Gribs",
          slug: "gribs",
          image: require('../../assets/themes/gribouillage/gribs.png'),
        },
        {
          name: "Coeurs",
          slug: "hearts",
          image: require('../../assets/themes/gribouillage/hearts.png'),
        },
        {
          name: "Heavy",
          slug: "heavy",
          image: require('../../assets/themes/gribouillage/heavy.png'),
        },
        {
          name: "Lignes",
          slug: "lines",
          image: require('../../assets/themes/gribouillage/lines.png'),
        },
        {
          name: "Etoiles",
          slug: "stars",
          image: require('../../assets/themes/gribouillage/stars.png'),
        },
      ]
    }
  ]

  const [currentSettings, setCurrentSettings] = useState({
    homeThemesEnabled: false,
    homeThemeColor: '#32AB8E',
    homeThemeImage: "papillon/default",
  });

  useEffect(() => {
    const settings = SyncStorage.get('adjustments');
    if (settings) {
      setCurrentSettings({
        ...currentSettings,
        homeThemesEnabled: settings.homeThemesEnabled || false,
        homeThemeColor: settings.homeThemeColor || '#32AB8E',
        homeThemeImage: settings.homeThemeImage || 'papillon/default',
      });
      setSelectedColor(settings.homeThemeColor || '#32AB8E');
    }
  }, []);

  function selectImage(image) {
    setCurrentSettings({
      ...currentSettings,
      homeThemeImage: image,
    });

    SyncStorage.set('adjustments', {
      ...currentSettings,
      homeThemeImage: image,
    });
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior='automatic'
      style={{backgroundColor: UIColors.modalBackground}}
    >
      <View
        style={[
          styles.previewList,
        ]}
      >
        {backgrounds.map((background, index) => (
          <View
            style={[
              styles.previewCollection,
            ]} 
            key={index}
          >
            <View style={[
              styles.previewTitle,
            ]}>
              <Text style={[
                styles.previewH1,
              ]}>
                {background.name}
              </Text>
              <Text style={[
                styles.previewP,
              ]}>
                {background.description}
              </Text>
            </View>

            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={[
                styles.previewScroll,
              ]}
            >
              <View style={[
                styles.previewScrollList,
              ]}>
                {background.images.map((image, index) => (
                  <TouchableOpacity
                    onPress={() => selectImage(`${background.slug}/${image.slug}`)}
                    key={index}
                    style={[
                      styles.previewItemContainer,
                      currentSettings.homeThemeImage === `${background.slug}/${image.slug}` && styles.previewItemActive,
                      currentSettings.homeThemeImage === `${background.slug}/${image.slug}` && {
                        borderColor: UIColors.text,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.previewItem,
                        {
                          backgroundColor: selectedColor,
                        },
                      ]}
                    >
                      <Image
                        source={image.image}
                        style={[
                          styles.previewItemImage,
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  previewList: {
    gap: 16,
    marginTop: 14,
  },

  previewItemContainer: {
    borderRadius: 10,
    borderCurve: 'continuous',
    opacity: 0.4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  previewItemActive: {
    opacity: 1,
    borderWidth: 2,
  },

  previewCollection: {
    
  },

  previewTitle: {
    marginLeft: 16,
    marginBottom: 12,
  },
  previewH1: {
    fontSize: 18,
    fontWeight: '700',
  },
  previewP: {
    fontSize: 14,
    opacity: 0.6,
  },

  previewScroll: {
    paddingLeft: 14,
  },
  previewScrollList: {
    gap: 6,
    flexDirection: 'row',
    paddingRight: 32,
  },

  previewItem: {
    width: 200,
    height: 100,
    borderRadius: 8,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewItemImage: {
    width: 200,
    height: 100,
  },
});

export default HeaderSelectScreen;