import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { Animated, View, StyleSheet, Modal, Pressable, TouchableOpacity } from 'react-native';

import { Text } from 'react-native-paper';

import GetUIColors from '../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from 'react-native-pressable-scale';

const AlertBottomSheet = ({ visible = true, title, subtitle, icon, color = "#29975a", cancelAction = () => {}, primaryAction, cancelButton = "OK", primaryButton = "Valider"}) => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  // if icon component is set, set icon color property
  if (icon) {
    icon = React.cloneElement(icon, { color, size: 24 });
  }

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  // animate modal when visible changes
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
          speed: 22,
        }),
        Animated.spring(scale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
          speed: 22,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
          speed: 22,
        }),
        Animated.spring(scale, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
          speed: 22,
        })
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <View style={[styles.container, {paddingBottom: insets.bottom + 8}]}>
        <Pressable style={styles.pressable} onPress={() => {
          cancelAction();
        }}/>

        <Animated.View
          style={[
            styles.alert,
            {backgroundColor: UIColors.element},
            {opacity},
            {
              transform: [
                {
                  translateY: translateY.interpolate({
                    inputRange: [0, 1],
                    outputRange: [70, 0],
                  })
                },
                {
                  scale: scale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  })
                }
              ]
            }
          ]}
        >
          <View style={[styles.content]}>
            <View style={[styles.iconContainer, {backgroundColor: color + 22}]}>
              {icon}
            </View>

            <View style={[styles.data]}>
              <Text style={[styles.title]}>
                {title}
              </Text>
              <Text style={[styles.subtitle]}>
                {subtitle}
              </Text>
            </View>
          </View>

          <View style={[styles.buttons]}>
            { primaryAction &&
              <TouchableOpacity
                style={[styles.button, {backgroundColor: UIColors.primary}]}
                onPress={() => {
                  primaryAction();
                }}
              >
                <Text style={[styles.buttonText, {color: "#ffffff"}]}>
                  {primaryButton}
                </Text>
              </TouchableOpacity>
            }
            <TouchableOpacity
              style={[styles.button, {backgroundColor: UIColors.text + '16'}]}
              onPress={() => {
                cancelAction();
              }}
            >
              <Text style={[styles.buttonText]}>
                {cancelButton}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
  },

  pressable : {
    flex: 1,
    width: "100%",
  },

  alert: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
  },

  content: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderCurve: 'continuous',
    alignItems: "center",
    justifyContent: "center",
  },

  data: {
    flex: 1,
    gap: 2,
  },

  title: {
    fontSize: 17,
    fontWeight: "bold",
    fontFamily: "Papillon-Semibold",
  },

  subtitle: {
    fontSize: 15,
    opacity: 0.8,
  },

  buttons: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 9,
  },

  button: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    fontSize: 17,
    fontWeight: "bold",
    fontFamily: "Papillon-Semibold",
  },
});

export default AlertBottomSheet;