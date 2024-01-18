import React, { useState, useEffect } from 'react';
import { View, StatusBar, StyleSheet, Platform } from 'react-native';

import GetUIColors from '../../../utils/GetUIColors';

import { BarCodeScanner } from 'expo-barcode-scanner';

import * as Haptics from 'expo-haptics';

import { LinearGradient } from 'expo-linear-gradient';

const NewPronoteQR = ({ route, navigation }) => {
  const UIColors = GetUIColors();

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
      style={[styles.container, {backgroundColor: UIColors.modalBackground}]}
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

      <LinearGradient
        colors={['#000000cc', '#00000000']}
        locations={[0, 1]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 100,
          zIndex: 9999
        }}
      />

      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

    </View>
  );
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
