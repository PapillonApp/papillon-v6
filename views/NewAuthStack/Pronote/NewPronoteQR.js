import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StatusBar, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';

import { Text } from 'react-native-paper';

import { getENTs } from '../../../fetch/AuthStack/LoginFlow';

import GetUIColors from '../../../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';

import { AlertTriangle, Bird } from 'lucide-react-native';

import { BarCodeScanner } from 'expo-barcode-scanner';

import * as Haptics from 'expo-haptics';

const NewPronoteQR = ({ route, navigation }) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    Haptics.notificationAsync('success');
    setScanned(true);
    
    data = JSON.parse(data);
    navigation.navigate('LoginPronoteQR', { qrData: data });
  };

  return (
    <View
      contentInsetAdjustmentBehavior='automatic'
      style={[styles.container, {backgroundColor: UIColors.background}]}
    >
      <StatusBar
        animated
        barStyle={
          Platform.OS === 'ios' ?
            'light-content'
          :
            UIColors.theme == 'light' ?
              'dark-content'
            :
              'light-content'
        }
      />

      <View style={[styles.warn, {paddingBottom: insets.bottom}]}>
        <AlertTriangle color="#ffffff" />
        <Text style={styles.warnText}>
          Ce mode de connexion est instable et peut causer de nombreux bugs.
        </Text>
      </View>

      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  warn: {
    backgroundColor: '#ff0000',
    padding: 10,
    paddingHorizontal: 20,
    paddingRight: 50,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,

    zIndex: 999,

    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },

  warnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  }
});

export default NewPronoteQR;