import React from 'react';
import { Pressable, StyleSheet, Platform, View, Text, ViewStyle } from 'react-native';

interface Props {
  /** Text displayed inside the button. */
  title: string;
  /** Should be in HEX format. */
  color: string;
  onPress: () => unknown;
  style?: ViewStyle | ViewStyle[];
  /** Defines if the button should be filled or not. */
  light?: boolean | null;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

const PapillonButton: React.FC<Props> = ({ title, color, onPress, style, light, left, right }) => {
  return (
    <Pressable
      onPress={() => onPress()}
      style={({ pressed }) => [
        styles.button,
        {
          opacity: pressed && Platform.OS === 'ios' ? 0.6 : 1,
          backgroundColor: light === null ? `${color}22` : color,
        },
        style,
      ]}
    >
      {left && <View style={styles.left}>{left}</View>}
      <Text style={[styles.text, { color: light ? color : '#fff' }]}>{title}</Text>
      {right && <View style={styles.right}>{right}</View>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Arial',
  },
  left: {
    position: 'absolute',
    left: 16,
  },
  right: {
    position: 'absolute',
    right: 16,
  },
});

export default PapillonButton;
