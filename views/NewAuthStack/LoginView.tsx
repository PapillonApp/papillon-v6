import React, { useRef, useEffect } from 'react';
import { Animated, View, StatusBar, StyleSheet, TouchableOpacity, Image, PanResponder, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import packageJson from '../../package.json';

const LoginView = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const createPanResponder = (pan) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([
        null,
        { dx: pan.x, dy: pan.y }
      ], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        setTimeout(() => {
          animatePan(pan);
        }, 250);
      }
    });
  };

  const pan1 = useRef(new Animated.ValueXY()).current;
  const panResponder1 = createPanResponder(pan1);

  const pan2 = useRef(new Animated.ValueXY()).current;
  const panResponder2 = createPanResponder(pan2);

  const pan3 = useRef(new Animated.ValueXY()).current;
  const panResponder3 = createPanResponder(pan3);

  const pan4 = useRef(new Animated.ValueXY()).current;
  const panResponder4 = createPanResponder(pan4);

  const animatePan = (pan, delay = 0) => {
    // apply random delay
    delay = Math.floor(Math.random() * 1000) + delay;

    const sequence = Animated.sequence([
      Animated.timing(pan.y, {
        toValue: -10,
        duration: 0,
        useNativeDriver: false,
      }),
      Animated.timing(pan.y, {
        toValue: 10,
        duration: 2000 + (delay / 3),
        useNativeDriver: false,
      }),
      Animated.timing(pan.y, {
        toValue: -10,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]);
  
    const loop = Animated.loop(sequence);
    loop.start();
  };
  
  useEffect(() => {
    animatePan(pan1, 750);    // Start immediately
    animatePan(pan2, 500);  // Start after 250ms
    animatePan(pan3, 0);  // Start after 500ms
    animatePan(pan4, 250);  // Start after 750ms
  }, []);

  // rotate animation for longstar
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: false,
      })
    ).start();

    return () => {
      rotate.stopAnimation();
    };
  }, []);

  // scale bounce animation for star
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    return () => {
      scale.stopAnimation();
    };
  }, []);

  return (
    <View style={[styles.container]}>
      <StatusBar
        animated
        translucent
        barStyle={'light-content'}
        backgroundColor={'transparent'}
      />

      <View style={[styles.shapes, {marginTop: insets.top}]}>
        <Animated.View
          {...panResponder1.panHandlers}
          style={[pan1.getLayout()]}
        >
          <Animated.Image
            style={[
              styles.shape,
              shapesStyles.longstar,
              {
                transform: [
                  {
                    rotate: rotate.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }
                ]
              }
            ]}
            source={require('../../assets/shape_longstar.png')}
          />
        </Animated.View>

        <Animated.View
          {...panResponder2.panHandlers}
          style={[pan2.getLayout()]}
        >
          <Animated.Image
            style={[
              styles.shape,
              shapesStyles.star,
              {
                transform: [
                  {
                    scale: scale
                  }
                ]
              }
            ]}
            source={require('../../assets/shape_star.png')}
          />
        </Animated.View>

        <Animated.View
          {...panResponder3.panHandlers}
          style={[pan3.getLayout()]}
        >
          <Image
            style={[styles.shape, shapesStyles.blue_sq]}
            source={require('../../assets/shape_blue_sq.png')}
          />
        </Animated.View>

        <Animated.View
          {...panResponder4.panHandlers}
          style={[pan4.getLayout()]}
        >
          <Image
            style={[styles.shape, shapesStyles.green_sq]}
            source={require('../../assets/shape_green_sq.png')}
          />
        </Animated.View>
      </View>

      <View
        style={[styles.titleContainer, {
          bottom: insets.bottom + 20,
        }]}
      >
        <Image
          style={[styles.logo]}
          source={require('../../assets/logotype_gray_dark.png')}
        />
        <Text style={[styles.mainTitle]}>
          Envolez-vous vers une meilleure vie scolaire
        </Text>
        <Text style={[styles.mainSubtitle]}>
          Toute votre vie scolaire et bien plus au même endroit, une application que vous risquez d'adorer !
        </Text>

        <TouchableOpacity
          activeOpacity={0.5}
          style={[styles.startButton]}
          onPress={() => {
            navigation.navigate('SelectService');
          }}
        >
          <Text style={[styles.startText]}>
            Commencer
          </Text>
        </TouchableOpacity>
      </View>

      <Text
        style={[styles.mainVersion, {top: insets.top}]}
        onLongPress={() => {
          navigation.navigate('NetworkLoggerScreen');
        }}
      >
        v{packageJson.version} {packageJson.canal}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#32AB8E',
  },

  shapes: {
    backgroundColor: 'red',
    width: '100%',
  },
  shape: {
    position: 'absolute',
  },

  titleContainer: {
    position: 'absolute',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginHorizontal: 24,
    gap: 12,
    maxWidth: 500,
    alignSelf: 'center',
  },

  logo: {
    width: 110,
    height: 24,
  },
  mainTitle: {
    fontSize: 26,
    lineHeight: 26,
    letterSpacing: -0.5,
    fontFamily: 'Papillon-Bold',
    color: '#FFFFFF',
  },
  mainSubtitle: {
    fontSize: 16,
    fontFamily: 'Papillon-Semibold',
    color: '#FFFFFF99',
  },

  startButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 300,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    marginTop: 20,
  },
  startText: {
    fontSize: 16,
    fontFamily: 'Papillon-Semibold',
    color: '#32AB8E',
  },

  mainVersion: {
    fontSize: 12,
    fontFamily: 'Papillon-Medium',
    color: '#FFFFFF55',
    position: 'absolute',
    right: 10,
  },
});

const shapesStyles = StyleSheet.create({
  longstar: {
    width: 250,
    height: 250,
    left: -120,
    top: 20,
  },
  star: {
    width: 230,
    height: 230,
    right: -70,
    top: 80,
  },
  blue_sq: {
    width: 120,
    height: 120,
    right: 110,
    top: 0,
  },
  green_sq: {
    width: 180,
    height: 180,

    left: 80,
    top: 250,
  },
});

export default LoginView;
