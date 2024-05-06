import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Animated, Easing, View, StyleSheet, Modal, Pressable, StatusBar, Platform } from 'react-native';


import { BlurView } from 'expo-blur';

import GetUIColors from '../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const AlertBottomSheet = (props) => {
  const { visible, onDismiss, align, style } = props;

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const [isVisible, setVisible] = useState(visible);

  function fullCancelAction() {
    setVisible(false);

    setTimeout(() => {
      onDismiss();
    }, 150);
  }

  // animate modal when visible changes
  useEffect(() => {
    if (visible) {
      setVisible(true);
    }
    else {
      setTimeout(() => {
        setVisible(false);
      }, 100);
    }
  }, [visible]);

  const opacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconBg = useRef(new Animated.Value(0)).current;
  const modalScaleY = useRef(new Animated.Value(0)).current;

  // animate modal when visible changes
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          delay: 50,
          useNativeDriver: true
        }),
        Animated.timing(iconBg, {
          toValue: 1,
          delay: 0,
          duration: 300,
          easing: Easing.in(Easing.bezier(0.17, 0.84, 0.44, 1)),
          useNativeDriver: true
        }),
        Animated.timing(modalScaleY, {
          toValue: 1,
          duration: 400,
          easing: Easing.in(Easing.bezier(0.17, 0.84, 0.44, 1)),
          useNativeDriver: true
        }),
      ]).start();
    }
    else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(iconBg, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(modalScaleY, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [isVisible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <StatusBar animated backgroundColor={'transparent'} barStyle={'light-content'} translucent />

      <View style={[styles.container]}>
        <BlurView intensity={Platform.OS === 'ios' ? 50 : 30} tint="dark" style={[StyleSheet.absoluteFill, styles.blurContainer, {justifyContent: align !== 'top' ? 'flex-end' : 'flex-start', paddingTop: insets.top}]}>
          <Pressable
            style={[StyleSheet.absoluteFill]}
            onPress={() => {
              fullCancelAction();
            }}
          />
          
          <Animated.View
            style={[
              styles.modal,
              Platform.OS === 'android' && styles.androidModal,
              {
                backgroundColor: UIColors.background, marginBottom: insets.bottom,
                borderColor: UIColors.borderLight,
                borderWidth: UIColors.dark ? 0.5 : 0,
                opacity: opacity,
                transform: [
                  {
                    scaleY: modalScaleY.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.78, 1]
                    })
                  },
                  {
                    translateY: modalScaleY.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-70, 0]
                    })
                  },
                  {
                    scaleX: modalScaleY.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1]
                    })
                  }
                ]
              },
              style && [...style]
            ]}
          >
            {props.children}
          </Animated.View>

          
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  blurContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  modal : {
    width: '100%',
    borderRadius: 26,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  androidModal: {
    borderRadius: 12,
    elevation: 3,
  },
});

export default AlertBottomSheet;
