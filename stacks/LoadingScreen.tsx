import React, { useEffect } from 'react';
import { Animated, Easing, View, Image, ActivityIndicator, Text, StatusBar, useColorScheme, Dimensions } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LoadingScreen = () => {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const dynamicNotchEnabled = false;

  const bannerAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(bannerAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.in(Easing.bezier(0.25, 0, 0, 1)),
      useNativeDriver: !dynamicNotchEnabled,
    }).start();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: scheme === 'dark' ? '#000000' : '#ffffff',
      }}
    >
      <Image
        source={
          scheme === 'dark' ? require('../assets/launch/splash-dark.png') :
            require('../assets/launch/splash.png')
        }
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

      {dynamicNotchEnabled ? (
        <Animated.View
          style={{
            backgroundColor : '#000000',
            width: 227,

            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,

            borderCurve: 'continuous',

            position: 'absolute',
            top: -100,

            paddingTop: 130,

            zIndex: 1000,
            height: bannerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [134, 170],
            }),

            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',

            gap: 12,
          }}
        >
          <ActivityIndicator />
          <Text
            style={{
              color: '#ffffff',
              fontSize: 15,
              fontFamily: 'Papillon-Medium',
              opacity: 0.5,
            }}
          >
            Chargement...
          </Text>
        </Animated.View>
      ) : (
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
      )}
    </View>
  );
};

export default LoadingScreen;
