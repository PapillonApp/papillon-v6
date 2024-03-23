import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Image, StatusBar, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import GetUIColors from '../../utils/GetUIColors';
import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import SyncStorage from 'sync-storage';
import { LinearGradient } from 'expo-linear-gradient';

type Background = {
  name: string;
  description: string;
  slug: string;
  images: Array<{
    name: string;
    slug: string;
    image: any;
  }>;
};

const HeaderSelectScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const UIColors = GetUIColors();
  const [selectedColor, setSelectedColor] = useState<string>('#32AB8E');
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
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

    // Mock backgrounds data
    const mockBackgrounds: Background[] = [
      // Insert your background objects here
    ];
    setBackgrounds(mockBackgrounds);
  }, []);

  function selectImage(image: string) {
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
      style={{ backgroundColor: UIColors.modalBackground }}
    >
      {Platform.OS === 'ios' ? (
        <StatusBar barStyle='light-content' />
      ) : (
        <StatusBar barStyle={UIColors.dark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      )}

      <View style={[styles.previewList]}>
        {backgrounds.map((background, index) => (
          <View style={[styles.previewCollection]} key={index}>
            <View style={[styles.previewTitle]}>
              <Text style={[styles.previewH1]}>{background.name}</Text>
              <Text style={[styles.previewP]}>{background.description}</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.previewScroll]}>
              <View style={[styles.previewScrollList]}>
                {background.images.map((image, imgIndex) => (
                  <TouchableOpacity
                    onPress={() => selectImage(`${background.slug}/${image.slug}`)}
                    key={imgIndex}
                    style={[
                      styles.previewItemContainer,
                      currentSettings.homeThemeImage === `${background.slug}/${image.slug}` && styles.previewItemActive,
                      currentSettings.homeThemeImage === `${background.slug}/${image.slug}` ? { borderColor: UIColors.text } : { borderColor: UIColors.text + '20' },
                    ]}
                  >
                    <View style={[styles.previewItem, { backgroundColor: selectedColor }]}>
                      <Image source={image.image} style={[styles.previewItemImage]} />
                      <View style={[styles.previewItemOver, { backgroundColor: UIColors.element }]} />
                      <View style={[styles.previewItemUI, { backgroundColor: UIColors.modalBackground }]} />
                      <View style={[styles.previewItemUIUser]} />
                      <View style={[styles.previewItemUIPapillon]} />
                      <View style={[styles.previewItemUITitle]} />
                      <LinearGradient
                        colors={[selectedColor + 'FF', selectedColor + '00']}
                        locations={[0.2, 1]}
                        style={[styles.previewItemGradient]}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        ))}
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  previewList: {
    marginTop: 14,
  },
  previewItemContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    opacity: 0.4,
  },
  previewItemActive: {
    opacity: 1,
    borderWidth: 1,
  },
  previewCollection: {},
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
    flexDirection: 'row',
    paddingRight: 32,
  },
  previewItem: {
    width: 168,
    height: 100,
    borderRadius: 8,
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
    borderRadius: 4,
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
    borderRadius: 300,
  },
  previewItemOver: {
    position: 'absolute',
    width: '90%',
    height: '25%',
    top: '65%',
    zIndex: 1,
    borderRadius: 6,
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
