import * as React from 'react';
import { View, StyleSheet, Platform, TouchableNativeFeedback } from 'react-native';
import { List, Text } from 'react-native-paper';

import GetUIColors from '../utils/GetUIColors';

function NativeItem(props) {
  const { 
    children,
    leading,
    trailing,
    onPress,
    chevron,
    cellProps,
    style,
    innerStyle,
  } = props;

  const UIColors = GetUIColors();

  return (
    <TouchableNativeFeedback
      style={[
        styles.elem,
        style,
      ]}
      onPress={onPress}
    >
      <View style={[styles.content, innerStyle]}>
        {leading && (
          <View style={styles.leading}>
            {leading}
          </View>
        )}

        <View style={styles.children}>
          {children}
        </View>

        {trailing && (
          <View style={styles.trailing}>
            {trailing}
          </View>
        )}
      </View>
    </TouchableNativeFeedback>
  );
}

const styles = StyleSheet.create({
  elem: {
    
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  children: {
    flex: 1,
  }
});

export default NativeItem;
