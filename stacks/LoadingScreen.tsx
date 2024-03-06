import React, { useEffect } from 'react';
import { Animated, Easing, View, Image, ActivityIndicator, Text, StatusBar } from 'react-native';

import GetUIColors from '../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LoadingScreen = () => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const bannerAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(bannerAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.in(Easing.bezier(0.25, 0, 0, 1)),
      useNativeDriver: true,
    }).start();
  }, []);

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

      <Animated.View
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

          opacity: bannerAnim,
          transform: [
            {
              translateY: bannerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            },
          ],
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
      </Animated.View>
    </View>
  );
};

export default LoadingScreen;
