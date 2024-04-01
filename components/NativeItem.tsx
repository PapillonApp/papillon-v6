import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableNativeFeedback, type ViewStyle } from 'react-native';
import type { Cell } from 'react-native-tableview-simple';
import GetUIColors from '../utils/GetUIColors';

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
  first,
  last,
}) => {
  const UIColors = GetUIColors();
  const handlePress = useCallback(() => onPress?.(), [onPress]);

  return (
    <TouchableNativeFeedback
      style={[
        style,
        {
          borderRadius: 12,
        },
      ]}
      onPress={handlePress}
    >
      <View style={[
        styles.content,
        {
          backgroundColor: UIColors.element,
        },
        first && styles.conFirst,
        last && styles.conLast,
        innerStyle
      ]}>
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
    borderRadius: 6,
    overflow: 'hidden',
  },
  children: {
    flex: 1,
  },
  conFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  conLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
});

export default NativeItem;
