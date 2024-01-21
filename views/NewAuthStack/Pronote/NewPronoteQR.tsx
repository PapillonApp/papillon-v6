import React from 'react';
import * as Haptics from 'expo-haptics';

import { View, StatusBar, StyleSheet, Platform } from 'react-native';

import { BarCodeScanner } from 'expo-barcode-scanner';
import { LinearGradient } from 'expo-linear-gradient';

import NativeText from '../../../components/NativeText';

import GetUIColors from '../../../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NewPronoteQR = ({ navigation }) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

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
        colors={['#000000e5', '#00000000']}
        locations={[0.5, 1]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 250,
          zIndex: 99
        }}
      />

      <View style={{ height: insets.top + 44 }} />

      <NativeText style={styles.instructionsText}>
        Sur votre espace PRONOTE, sélectionnez le pictogramme en forme de QR-code sur le haut de la page juste a coté de votre nom.
      </NativeText>

      <View style={styles.square} />
      <View style={styles.squareBackground} />

      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScan}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  square: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
    alignSelf: 'center',
    top: '30%',
    zIndex: 9999,
  },

  instructionsText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Papillon-Medium',
    paddingHorizontal: 16,
    paddingVertical: 6,
    opacity: 0.5,
    zIndex: 999,
  },
});

export default NewPronoteQR;
