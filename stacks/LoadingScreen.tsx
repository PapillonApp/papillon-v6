import React from 'react';
import { View, Image, ActivityIndicator, Text, StatusBar } from 'react-native';

import GetUIColors from '../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LoadingScreen = () => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: UIColors.primary
      }}
    >
      <Image
        source={require('../assets/launch/splash.png')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -10,
        }}
      />

      <StatusBar translucent backgroundColor={'transparent'}/>

      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',

          paddingTop: insets.top + 10,
          paddingBottom: 10,

          backgroundColor: 'rgba(0, 0, 0, 0.5)',

          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',

          gap: 12,
        }}
      >
        <ActivityIndicator
          size="small"
          color={'#ffffff'}
        />
        <Text
          style={{
            color: '#ffffff',
            fontSize: 15,
            fontFamily: 'Papillon-Medium',
          }}
        >
          Obtention des données
        </Text>
      </View>
    </View>
  );
};

export default LoadingScreen;
