import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, StyleSheet, Modal, Animated, TouchableWithoutFeedback, ScrollView, Switch, Alert, Platform } from 'react-native';

import { Text } from 'react-native-paper';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GetUIColors from '../../utils/GetUIColors';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import { AlertTriangle, Type } from 'lucide-react-native';

import SyncStorage from 'sync-storage';
import { Home } from '../../interface/icons/PapillonIcons';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import AlertAnimated from '../../interface/AlertAnimated';

const AdjustmentsScreen = ({ navigation }) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const [currentSettings, setCurrentSettings] = useState({
    hideTabBarTitle: false,
  });
  const [willNeedRestart, setWillNeedRestart] = useState(false);

  useEffect(() => {
    const settings = SyncStorage.get('adjustments');
    if (settings) {
      setCurrentSettings(settings);
    }
  }, []);

  function updateSetting(element, value, needsRestart = false) {
    setCurrentSettings({
      ...currentSettings,
      [element]: value,
    });

    SyncStorage.set('adjustments', {
      ...currentSettings,
      [element]: value,
    });

    if (needsRestart) {
      setTimeout(() => {
        setWillNeedRestart(true);
      }, 350);
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
        subtitle="Vous devez redémarrer l'application pour appliquer certains changements."
        height={74}
        marginVertical={16}
        style={{
          marginHorizontal: 16,
          backgroundColor: UIColors.primary + '22',
        }}
      />
      
      <NativeList header="Navigation" inset>
        { Platform.OS === 'ios' ? (
        <NativeItem
          leading={
            <View style={[previewStyles.tabPreview, {backgroundColor: UIColors.text + '16', borderColor : UIColors.text + '16', borderWidth: 1}]}>
              <TouchableOpacity
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const previewStyles = StyleSheet.create({
  tabPreview: {
    width: 64,
    height: 56,
    borderRadius: 8,
    borderCurve: "continuous",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  tabPreviewText: {
    fontFamily: 'Papillon-Medium',
    fontSize: 13,
    letterSpacing: 0.2,
  },
});

export default AdjustmentsScreen;