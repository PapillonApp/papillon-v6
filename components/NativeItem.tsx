import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableNativeFeedback, type ViewStyle } from 'react-native';
import type { Cell } from 'react-native-tableview-simple';

interface Props {
  children: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode
  onPress?: () => unknown
  chevron?: boolean
  cellProps?: Partial<React.ComponentProps<typeof Cell>>
  style?: ViewStyle
  innerStyle?: ViewStyle
  backgroundColor?: string
}

const NativeItem: React.FC<Props> = React.memo(({
  children,
  leading,
  trailing,
  onPress,
  style,
  innerStyle,
}) => {
  const handlePress = useCallback(() => onPress?.(), [onPress]);

  return (
    <TouchableNativeFeedback
      style={style}
      onPress={handlePress}
    >
      <View style={[styles.content, innerStyle]}>
        {leading && leading}

        <View style={styles.children}>
          {children}
        </View>

        {trailing && trailing}
      </View>
    </TouchableNativeFeedback>
  );
});

const styles = StyleSheet.create({
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
