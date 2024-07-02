import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableNativeFeedback, type ViewStyle, StyleProp } from 'react-native';
import type { Cell } from 'react-native-tableview-simple';
import GetUIColors from '../utils/GetUIColors';

interface Props {
  children: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: (() => void) | undefined;
  chevron?: boolean;
  cellProps?: Partial<React.ComponentProps<typeof Cell>>;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  first?: boolean;
  last?: boolean;
}

const NativeItem: React.FC<Props> = React.memo(({
  children,
  leading,
  trailing,
  onPress,
  style,
  innerStyle,
  backgroundColor,
  first,
  last,
}) => {
  const UIColors = GetUIColors();
  const handlePress = useCallback(() => onPress?.(), [onPress]);

  return (
    <View
      style={[
        style,
        {
          borderRadius: 6,
          overflow: 'hidden',
        },
        first && styles.conFirst,
        last && styles.conLast,
      ]}
    >
      <TouchableNativeFeedback
        onPress={handlePress}
        useForeground
        background={TouchableNativeFeedback.Ripple(UIColors.text + '22', false)}
      >
        <View style={[
          styles.content,
          {
            backgroundColor: backgroundColor || UIColors.element,
          },
          first && styles.conFirst,
          last && styles.conLast,
          innerStyle,
        ]}>
          {leading && leading}

          <View style={styles.children}>
            {children}
          </View>

          {trailing && trailing}
        </View>
      </TouchableNativeFeedback>
    </View>
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
