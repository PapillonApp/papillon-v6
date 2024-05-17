import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Animated, Easing, View, StyleSheet, Modal, Pressable, TouchableOpacity, StatusBar, Platform } from 'react-native';

import { Text } from 'react-native-paper';
import { BlurView } from 'expo-blur';

import GetUIColors from '../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from 'react-native-pressable-scale';

import { X } from 'lucide-react-native';

const AlertBottomSheet = ({ visible = true, emphasize = false, title, subtitle, icon, color = '#32AB8E', cancelAction = () => {}, primaryAction = undefined, cancelButton = 'Compris !', primaryButton = 'Valider'}) => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const [isVisible, setVisible] = useState(visible);

  let newIcon = null;

  // if icon component is set, set icon color property
  if (icon) {
    icon = React.cloneElement(icon, { color, size: 56 });
    newIcon = React.cloneElement(icon, { color, size: 256 });
  }

  function fullCancelAction() {
    setVisible(false);

    setTimeout(() => {
      cancelAction();
    }, 150);
  }

  // if no primary action is set, set cancel action as primary action
  if (!primaryAction) {
    primaryAction = fullCancelAction;
    primaryButton = cancelButton;
  }

  function fullPrimaryAction() {
    fullCancelAction();

    setTimeout(() => {
      primaryAction();
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

  const flareTranslateX = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

  // emphasize button continously
  useEffect(() => {
    if (emphasize) {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(flareTranslateX, {
              toValue: 1,
              duration: 2000,
              easing: Easing.in(Easing.bezier(0.20, 0.30, 0.30, 1)),
              useNativeDriver: true
            }),
            Animated.timing(flareTranslateX, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true
            })
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(buttonScale, {
              toValue: 1,
              delay: 1000,
              duration: 500,
              easing: Easing.out(Easing.bezier(0.20, 0.30, 0.30, 1)),
              useNativeDriver: true
            }),
            Animated.timing(buttonScale, {
              toValue: 0,
              duration: 500,
              easing: Easing.in(Easing.bezier(0.20, 0.30, 0.30, 1)),
              useNativeDriver: true
            })
          ])
        )
      ]).start();
    }
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <StatusBar animated barStyle={'light-content'} translucent />

      <View style={[styles.container]}>
        <BlurView intensity={Platform.OS === 'ios' ? 50 : 30} tint="dark" style={[StyleSheet.absoluteFill, styles.blurContainer]}>
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
                backgroundColor: UIColors.background, marginBottom: insets.bottom + (insets.bottom < 12 ? 12 : 0),
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
            ]}
          >
            <View
              style={[
                styles.header,
                {
                  backgroundColor: color + '22'
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.bgIcon,
                  {
                    transform: [
                      {
                        scale: iconBg.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1]
                        })
                      },
                      {
                        translateX: iconBg.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-200, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                {newIcon}
              </Animated.View>
              
              <Animated.View
                style={[
                  {
                    transform: [
                      {
                        scale: iconScale.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1]
                        })
                      }
                    ]
                  }
                ]}
              >
                {icon}
              </Animated.View>

              <TouchableOpacity
                style={[
                  styles.close,
                  {
                    backgroundColor: UIColors.text + '22'
                  }
                ]}
                onPress={() => {
                  fullCancelAction();
                }}
              >
                <X size={20} strokeWidth={2.5} color={UIColors.text} />
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.content,
              ]}
            >
              <Text
                style={[
                  styles.title,
                ]}
              >
                {title}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                ]}
              >
                {subtitle}
              </Text>

              <Animated.View
                style={[
                  {
                    transform: [
                      {
                        scale: buttonScale.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.04]
                        })
                      }
                    ]
                  }
                ]}
              >
                <PressableScale
                  activeScale={0.95}
                  weight='light'
                  style={[
                    styles.button,
                    {
                      backgroundColor: color,
                    },
                  ]}
                  onPress={() => {
                    fullPrimaryAction();
                  }}
                >
                  <Animated.View 
                    style={[
                      styles.flare,
                      {
                        transform: [
                          {
                            rotate: '10deg',
                          },
                          {
                            translateX: flareTranslateX.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-200, 500]
                            })
                          },
                          {
                            translateY: flareTranslateX.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -200]
                            })
                          }
                        ]
                      }
                    ]}
                  />
                  <Text
                    style={[
                      styles.buttonText,
                    ]}
                  >
                    {primaryButton}
                  </Text>
                </PressableScale>
              </Animated.View>
            </View>
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
    justifyContent: 'flex-end',
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
  
  header: {
    width: '100%',
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  bgIcon: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -20,
    right: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
    opacity: 0.05,
  },

  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  title: {
    fontSize: 21,
    fontFamily: 'Papillon-Semibold',
    marginBottom: 8,
  },

  subtitle: {
    fontFamily: 'Papillon-Medium',
    fontSize: 16,
    lineHeight: 20,
    opacity: 0.7,
  },

  button: {
    paddingVertical: 12,
    borderRadius: 100,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    overflow: 'hidden',
  },

  flare: {
    position: 'absolute',
    top: -10,
    left: 0,
    bottom: 0,
    width: '40%',
    height: '1000%',
    backgroundColor: '#fff',
    opacity: 0.2,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Papillon-Semibold',
  },

  close: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
    borderRadius: 100,
    opacity: 0.5,
  },
});

export default AlertBottomSheet;
