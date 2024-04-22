import React, { useState, useEffect, useRef } from 'react';
import { Animated, Easing, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import GetUIColors from '../utils/GetUIColors';

import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const CheckAnimated = ({ checked, pressed = () => {}, loading, backgroundColor, style = {} }) => {
  const UIColors = GetUIColors();
  const [check, setCheck] = useState(checked);
  const [initialState, setInitialState] = useState(false);
  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    if (checked) {
      setCheck(true);
      if (initialState) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      }
    } else {
      setCheck(false);
    }
  }, [check, checked, initialState]);

  useEffect(() => {
    if (loading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [loading]);

  function handlePress() {
    setInitialState(true);
    pressed();
  }

  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (check) {
      Animated.spring(
        checkScale,
        {
          toValue: 1,
          speed: 20,
          useNativeDriver: true,
        }
      ).start();
    } else {
      Animated.timing(
        checkScale,
        {
          toValue: 0,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }
      ).start();
    }
  }, [check]);

  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (check) {
      rippleOpacity.setValue(0.5);
      Animated.parallel([
        Animated.timing(
          rippleScale,
          {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }
        ),
        Animated.timing(
          rippleOpacity,
          {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }
        )
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(
          rippleScale,
          {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }
        )
      ]).start();
    }
  }, [check]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        style,
      ]}
      onPress={handlePress}
    >
      <Animated.View
        style={[
          styles.checkboxRipple,
          {
            backgroundColor: UIColors.primary,
            opacity: rippleOpacity,
            transform: [
              {
                scale: rippleScale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1.3],
                })
              }
            ]
          }
        ]}
      />

      <View
        style={[
          styles.checkbox,
          {
            borderColor: !isLoading ? (check ? UIColors.primary : UIColors.border) : 'transparent',
            backgroundColor: 'transparent',
          }
        ]}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            style={{
              position: 'absolute',
            }}
          />
        ) : null}

        <Animated.View
          style={[
            styles.checkboxChecked,
            {
              backgroundColor: UIColors.primary,
              transform: [
                {
                  scale: checkScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  })
                }
              ]
            }
          ]}
        >
          <Check
            size={20}
            color={'#ffffff'}
          />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    margin : -4,
  },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 300,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  checkboxChecked: {
    width: 28,
    height: 28,
    borderRadius: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxRipple: {
    width: '100%',
    height: '100%',
    borderRadius: 300,
    position: 'absolute',
    opacity: 0.2,
  },
});

export default CheckAnimated;
