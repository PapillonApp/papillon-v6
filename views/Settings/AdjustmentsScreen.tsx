import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Animated, ScrollView, Switch, Platform } from 'react-native';

import { Text } from 'react-native-paper';

import GetUIColors from '../../utils/GetUIColors';

import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  HueSlider,
} from 'reanimated-color-picker';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import { AlertTriangle, Palette } from 'lucide-react-native';

import SyncStorage from 'sync-storage';
import { Home } from '../../interface/icons/PapillonIcons';
import AlertAnimated from '../../interface/AlertAnimated';

const AdjustmentsScreen = ({ navigation }) => {
  const UIColors = GetUIColors();

  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [colorModalColor, setColorModalColor] = useState('#000000');

  const onSelectColor = ({ hex }) => {
    setColorModalColor(hex);
  };

  const onSave = () => {
    let hex = colorModalColor;

    updateSetting('homeThemeColor', hex, false);
    setColorModalOpen(false);
  };

  const [currentSettings, setCurrentSettings] = useState({
    hideTabBarTitle: false,
    homeThemesEnabled: false,
    homeThemeColor: '#32AB8E',
    homeThemeImage: 'papillon/default',
  });
  const [willNeedRestart, setWillNeedRestart] = useState(false);

  useEffect(() => {
    const settings = SyncStorage.get('adjustments');
    if (settings) {
      setCurrentSettings(settings);
      setColorModalColor(settings.homeThemeColor || '#32AB8E');
    }
    else {
      SyncStorage.set('adjustments', currentSettings);
    }
  }, []);

  function updateSetting(element, value, needsRestart = false) {
    const settings = SyncStorage.get('adjustments');
    
    if (settings) {
      setCurrentSettings({
        ...settings,
        [element]: value,
      });

      SyncStorage.set('adjustments', {
        ...settings,
        [element]: value,
      });

      if (needsRestart) {
        setTimeout(() => {
          setWillNeedRestart(true);
        }, 350);
      }
    }
  }

  // animate tab name
  const tabNameOpacity = useRef(new Animated.Value(1)).current;
  const tabNameTranslate = useRef(new Animated.Value(0)).current;
  const tabNameIconTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentSettings.hideTabBarTitle) {
      Animated.timing(tabNameOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start();
      Animated.timing(tabNameTranslate, {
        toValue: 10,
        duration: 120,
        useNativeDriver: true,
      }).start();
      Animated.timing(tabNameIconTranslate, {
        toValue: 8,
        duration: 120,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(tabNameOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }).start();
      Animated.timing(tabNameTranslate, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start();
      Animated.timing(tabNameIconTranslate, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start();
    }
  }, [currentSettings.hideTabBarTitle]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior='automatic'
      style={[
        styles.container,
        {
          backgroundColor: UIColors.modalBackground,
        },
      ]}
    >
      <AlertAnimated
        visible={willNeedRestart}
        left={
          <AlertTriangle color={UIColors.primary} />
        }
        title="Redémarrage requis"
        subtitle="Redémarrage requis pour appliquer certains changements."
        height={76}
        marginVertical={16}
        style={{
          marginHorizontal: 16,
          backgroundColor: UIColors.primary + '22',
        }}
      />

      <NativeList header="Thèmes" inset>
        <NativeItem 
          leading={
            <Palette color={UIColors.text} />
          }
          onPress={() => {
            navigation.navigate('HeaderSelect');
          }}
          chevron
        >
          <NativeText heading="h4">
            Thème de l'écran d'accueil
          </NativeText>
          <NativeText heading="p2">
            Applique un arrière-plan et un bandeau personnalisé
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList header="Navigation" inset>
        { Platform.OS === 'ios' ? (
          <NativeItem
            leading={
              <View style={[previewStyles.tabPreview, {backgroundColor: UIColors.text + '16', borderColor : UIColors.text + '16', borderWidth: 1}]}>
                <TouchableOpacity
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Animated.View style={{transform: [{translateY: tabNameIconTranslate}]}}>
                    <Home stroke={UIColors.text} />
                  </Animated.View>
                  <Animated.View style={{opacity: tabNameOpacity, transform: [{translateY: tabNameTranslate}]}}>
                    <Text style={[previewStyles.tabPreviewText]}>
                    Accueil
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              </View>
            }
            trailing={
              <Switch
                value={currentSettings.hideTabBarTitle}
                onValueChange={(value) => updateSetting('hideTabBarTitle', value, true)}
              />
            }
          >
            <NativeText heading="h4">
            Cacher le nom des onglets
            </NativeText>
            <NativeText heading="p2">
            Masquer le nom des onglets dans la barre de navigation
            </NativeText>
          </NativeItem>
        ) : <View /> }
      </NativeList>

      <Modal visible={colorModalOpen} animationType='fade' transparent={true}>
        <View style={[styles.colorModalContainer]}>
          <View style={[styles.colorModal, {backgroundColor: UIColors.element}]}>
            <ColorPicker style={styles.picker} value={colorModalColor} onComplete={onSelectColor}>
              <Preview
                textStyle={{
                  fontFamily: 'Papillon-Semibold',
                }}
              />
              <Panel1 />
              <HueSlider />
              <Swatches />
            </ColorPicker>

            <View style={[styles.modalActions, {borderColor: UIColors.border}]}>
              <TouchableOpacity style={styles.modalAction} onPress={() => setColorModalOpen(false)}>
                <Text
                  style={styles.modalActionText}
                >
                  Annuler
                </Text>
              </TouchableOpacity>
              <View style={{width: 1, height: 47, backgroundColor: UIColors.border + '99'}} />
              <TouchableOpacity style={[styles.modalAction]} onPress={onSave}>
                <Text
                  style={[styles.modalActionText, {color: colorModalColor}]}
                >
                  Enregistrer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  colorModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000aa',
  },
  colorModal: {
    width: '70%',
    borderRadius: 20,
    borderCurve: 'continuous',
  },

  picker: {
    gap: 14,
    padding: 18
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 48,
    borderTopWidth: 1,
  },
  modalAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalActionText: {
    fontFamily: 'Papillon-Semibold',
    fontSize: 16,
  },

  colorPreview: {
    width: 48,
    height: 20,
    borderRadius: 6,
    borderCurve: 'continuous',
    marginRight: 2,
  }
});

const previewStyles = StyleSheet.create({
  tabPreview: {
    width: 64,
    height: 56,
    borderRadius: 8,
    borderCurve: 'continuous',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  tabPreviewText: {
    fontFamily: 'Papillon-Medium',
    fontSize: 13,
    letterSpacing: 0.2,
  },
});

export default AdjustmentsScreen;
