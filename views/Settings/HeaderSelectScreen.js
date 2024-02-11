import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Animated, TouchableWithoutFeedback, ScrollView, Switch, Alert, Platform, Image, StatusBar } from 'react-native';

import { Text } from 'react-native-paper';
import GetUIColors from '../../utils/GetUIColors';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import SyncStorage from 'sync-storage';

import { LinearGradient } from 'expo-linear-gradient';

import { getRandomColor } from '../../utils/ColorCoursName';

const HeaderSelectScreen = ({ navigation }) => {
  const UIColors = GetUIColors();

  const [selectedColor, setSelectedColor] = useState('#32AB8E');

  const backgrounds = [
    {
      name: 'Papillon',
      description: 'Bandeaux disponibles par défaut',
      slug: 'papillon',
      images : [
        {
          name: 'Default',
          slug: 'default',
          image: require('../../assets/themes/papillon/default.png'),
        },
        {
          name: 'Gros Papillon',
          slug: 'grospapillon',
          image: require('../../assets/themes/papillon/grospapillon.png'),
        },
        {
          name: 'Papillon Ligne',
          slug: 'papillonligne',
          image: require('../../assets/themes/papillon/papillonligne.png'),
        },
        {
          name: 'Papillon Lumineux',
          slug: 'papillonlumineux',
          image: require('../../assets/themes/papillon/papillonlumineux.png'),
        },
        {
          name: 'Papillon Papier',
          slug: 'papillonpapier',
          image: require('../../assets/themes/papillon/papillonpapier.png'),
        },
        {
          name: 'Papillon Plusieurs',
          slug: 'papillonplusieurs',
          image: require('../../assets/themes/papillon/papillonplusieurs.png'),
        },
        {
          name: 'Formes',
          slug: 'formes',
          image: require('../../assets/themes/papillon/formes.png'),
        },
        {
          name: 'Formes (Couleur)',
          slug: 'formescolor',
          image: require('../../assets/themes/papillon/formescolor.png'),
        },
      ]
    },
    {
      name: 'Art-déco',
      description: 'Un style art-déco, avec des formes géométriques',
      slug: 'artdeco',
      images : [
        // arrows, clouds, cubes, sparks, stripes
        {
          name: 'Flèches',
          slug: 'arrows',
          image: require('../../assets/themes/artdeco/arrows.png'),
        },
        {
          name: 'Nuages',
          slug: 'clouds',
          image: require('../../assets/themes/artdeco/clouds.png'),
        },
        {
          name: 'Cubes',
          slug: 'cubes',
          image: require('../../assets/themes/artdeco/cubes.png'),
        },
        {
          name: 'Etincelles',
          slug: 'sparks',
          image: require('../../assets/themes/artdeco/sparks.png'),
        },
        {
          name: 'Rayures',
          slug: 'stripes',
          image: require('../../assets/themes/artdeco/stripes.png'),
        },
      ]
    },
    {
      name: 'Hero Patterns',
      description: 'Des motifs simples inspirés de Hero Patterns',
      slug: 'hero',
      images : [
        {
          name: 'Circuit',
          slug: 'circuit',
          image: require('../../assets/themes/hero/circuit.png'),
        },
        {
          name: 'Damier',
          slug: 'damier',
          image: require('../../assets/themes/hero/damier.png'),
        },
        {
          name: 'Flocons',
          slug: 'flakes',
          image: require('../../assets/themes/hero/flakes.png'),
        },
        {
          name: 'Movement',
          slug: 'movement',
          image: require('../../assets/themes/hero/movement.png'),
        },
        {
          name: 'Spark Circle',
          slug: 'sparkcircle',
          image: require('../../assets/themes/hero/sparkcircle.png'),
        },
        {
          name: 'Topography',
          slug: 'topography',
          image: require('../../assets/themes/hero/topography.png'),
        },
        {
          name: 'Wave',
          slug: 'wave',
          image: require('../../assets/themes/hero/wave.png'),
        },
      ]
    },
    {
      name: 'Gribouillage',
      description: 'Des griffonnages basiques et inspirants',
      slug: 'gribouillage',
      images : [
        {
          name: 'Nuages',
          slug: 'clouds',
          image: require('../../assets/themes/gribouillage/clouds.png'),
        },
        {
          name: 'Cross',
          slug: 'cross',
          image: require('../../assets/themes/gribouillage/cross.png'),
        },
        {
          name: 'Gribs',
          slug: 'gribs',
          image: require('../../assets/themes/gribouillage/gribs.png'),
        },
        {
          name: 'Coeurs',
          slug: 'hearts',
          image: require('../../assets/themes/gribouillage/hearts.png'),
        },
        {
          name: 'Heavy',
          slug: 'heavy',
          image: require('../../assets/themes/gribouillage/heavy.png'),
        },
        {
          name: 'Lignes',
          slug: 'lines',
          image: require('../../assets/themes/gribouillage/lines.png'),
        },
        {
          name: 'Etoiles',
          slug: 'stars',
          image: require('../../assets/themes/gribouillage/stars.png'),
        },
      ]
    },
  ];

  const [currentSettings, setCurrentSettings] = useState({
    homeThemesEnabled: false,
    homeThemeColor: '#32AB8E',
    homeThemeImage: 'papillon/default',
  });

  useEffect(() => {
    const settings = SyncStorage.get('adjustments');
    if (settings) {
      setCurrentSettings({
        ...settings,
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
      { Platform.OS === 'ios' ? (
        <StatusBar barStyle='light-content' />
      ) : (
        <StatusBar barStyle={UIColors.dark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent"/>
      )}

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
                      currentSettings.homeThemeImage === `${background.slug}/${image.slug}` ? {
                        borderColor: UIColors.text,
                      }
                        : {
                          borderColor: UIColors.text + '20',
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
                      <View 
                        style={[
                          styles.previewItemOver,
                          {
                            backgroundColor: UIColors.element,
                          },
                        ]}
                      />
                      <View 
                        style={[
                          styles.previewItemUI,
                          {
                            backgroundColor: UIColors.modalBackground,
                          },
                        ]}
                      />
                      <View style={[styles.previewItemUIUser]}/>
                      <View style={[styles.previewItemUIPapillon]}/>
                      <View style={[styles.previewItemUITitle]}/>
                      <LinearGradient
                        colors={[selectedColor + 'FF', selectedColor + '00']}
                        locations={[0.2, 1]}
                        style={[
                          styles.previewItemGradient,
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

      <View style={{height: 20}}/>
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
    borderWidth: 1,
  },
  previewItemActive: {
    opacity: 1,
    borderWidth: 1,
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
    width: 168,
    height: 100,
    borderRadius: 8,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewItemImage: {
    width: 200,
    height: '75%',
    position: 'absolute',
    top: '0%',
  },
  previewItemUI: {
    position: 'absolute',
    width: '100%',
    height: '25%',
    top: '75%',
  },
  previewItemUITitle: {
    backgroundColor: '#ffffff55',
    position: 'absolute',
    width: '30%',
    height: '5%',
    top: '13%',
    zIndex: 9,
    borderRadius: 6,
  },
  previewItemUIPapillon: {
    backgroundColor: '#ffffff55',
    position: 'absolute',
    width: 12,
    height: 12,
    top: '9%',
    left: '8%',
    zIndex: 9,
    borderRadius: 4
  },
  previewItemUIUser: {
    borderColor: '#ffffff55',
    borderWidth: 1,
    position: 'absolute',
    width: 15,
    height: 15,
    top: '8%',
    right: '8%',
    zIndex: 9,
    borderRadius: 300
  },
  previewItemOver: {
    position: 'absolute',
    width: '90%',
    height: '25%',
    top: '65%',
    zIndex: 1,
    borderRadius: 6,
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },
  previewItemGradient: {
    position: 'absolute',
    width: '100%',
    height: '50%',
    top: '0%',
    zIndex: 2,
  },
});

export default HeaderSelectScreen;
