import React, { useState, useEffect } from 'react';
import { Animated, View, Text, StyleSheet, ActivityIndicator, Easing } from 'react-native';

import GetUIColors from '../utils/GetUIColors';

const AlertAnimated = ({ style, height = 70, left, title, subtitle, visible, marginVertical = 0 }) => {
  const UIColors = GetUIColors();

  // animate height
  const [heightAnim] = useState(new Animated.Value(height));

  useEffect(() => {
    if (visible) {
      Animated.timing(heightAnim, {
        toValue: height,
        duration: 200,
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      }).start();
    } else {
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      }).start();
    }
  }, [visible]);

  // animate opacity
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      }).start();
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 100,
        delay: 50,
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      }).start();
    }
  }, [visible]);

  // animate transform to move up
  const [transformAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(transformAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      }).start();
    } else {
      Animated.timing(transformAnim, {
        toValue: -20,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      }).start();
    }
  }, [visible]);

  // animate margin vertical
  const [marginVerticalAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(marginVerticalAnim, {
        toValue: marginVertical,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      }).start();
    } else {
      Animated.timing(marginVerticalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      }).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.alert,
        {
          backgroundColor: UIColors.element,
          height: heightAnim,
          opacity: opacityAnim,
          transform: [{ translateY: transformAnim }],
          marginTop: marginVerticalAnim,
        },
        style,
      ]}
    >
      <Animated.View style={styles.alertInside}>
        <View style={styles.activity}>
          { left ? left :
            <ActivityIndicator
              animating={true}
            />
          }
        </View>
        <View style={styles.alertContent}>
          <Text style={[styles.alertTitle, { color: UIColors.text }]}>
            {title}
          </Text>
          <Text style={[styles.alertText, { color: UIColors.text }]}>
            {subtitle}
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  alert : {
    borderRadius: 12,
    borderCurve: 'continuous',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  alertInside: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  activity: {
    marginHorizontal: 20,
  },

  alertContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 3,
    marginRight: 20,
  },
  alertTitle: {
    fontSize: 16.5,
    fontWeight: '600',
    fontFamily: 'Papillon-Semibold',
  },
  alertText: {
    fontSize: 15,
    fontWeight: '400',
    opacity: 0.7,
  },
});

export default AlertAnimated;
