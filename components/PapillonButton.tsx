import React from 'react';
import { Pressable, StyleSheet, Platform, View, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';

interface Props {
  /** Text displayed inside the button. */
  title: string
  /** Should be in HEX format. */
  color: string
  onPress: () => unknown
  style?: ViewStyle
  /** Defines if the button should be filled or not. */
  light?: boolean
  left?: React.ReactElement
  right?: React.ReactElement
}

/**
 * @see https://i.imgur.com/KnBA6qC.png
 */
const PapillonButton: React.FC<Props> = ({ title, color, onPress, style, light, left, right }) => {
  return (
    <Pressable
      onPress={() => onPress()}
      style={({ pressed }) => [
        styles.btnBack,
        {
          opacity: pressed && Platform.OS === 'ios' ? 0.6 : 1,
          backgroundColor: !light ? color : `${color}22`,
        },
        style,
      ]}
    >
      {left && (
        <View style={styles.left}>{left}</View>
      )}

      <Text style={[styles.btnBackText, { color: light ? color : '#fff' }]}>
        {title}
      </Text>
      
      {right && (
        <View style={styles.right}>{right}</View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btnBack: {
    padding: 14,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnBackText: {
    color: '#fff',
    fontFamily: 'Papillon-Medium',
    fontSize: 16,
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
