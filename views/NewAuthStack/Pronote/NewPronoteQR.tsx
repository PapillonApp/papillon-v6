import React from 'react';
import * as Haptics from 'expo-haptics';

import { View, StatusBar, StyleSheet, Platform } from 'react-native';

import { BarCodeScanner } from 'expo-barcode-scanner';
import { LinearGradient } from 'expo-linear-gradient';

import GetUIColors from '../../../utils/GetUIColors';

const NewPronoteQR = ({ navigation }) => {
  const UIColors = GetUIColors();

  // TODO: When should we use this ?
  // eslint-disable-next-line no-unused-vars
  const [hasPermission, setHasPermission] = React.useState(false);
  const [scanned, setScanned] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScan = ({ data }) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setScanned(true);
    
    const qrData = JSON.parse(data);
    navigation.navigate('LoginPronoteQR', { qrData });
  };

  return (
    <View
      // @ts-expect-error : Not sure if this is typed ?
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
        onBarCodeScanned={scanned ? undefined : handleBarCodeScan}
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
