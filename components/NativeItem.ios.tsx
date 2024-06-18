import React, { memo, ReactNode } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Cell } from 'react-native-tableview-simple';
import { SFSymbol } from 'react-native-sfsymbols';
import GetUIColors from '../utils/GetUIColors';

interface Props {
  children: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: (() => false | void) | undefined;
  chevron?: boolean;
  cellProps?: Partial<React.ComponentProps<typeof Cell>>;
  style?: View['props']['style'];
  innerStyle?: View['props']['style'];
  backgroundColor?: string;
}

const NativeItem = memo(({
  children,
  leading,
  trailing,
  onPress,
  chevron,
  backgroundColor,
}: Props) => {
  const UIColors = GetUIColors();

  const cellImageView = leading && (
    <View style={styles.cellImageView}>
      {leading}
    </View>
  );

  const cellContentView = children && (
    <View style={styles.cellContentView}>
      {children}
    </View>
  );

  const cellAccessoryView = (trailing || chevron) && (
    <View style={styles.cellAccessoryView}>
      {trailing}

      {chevron && Platform.OS === 'ios' && (
        <SFSymbol
          name="chevron.right"
          weight="semibold"
          size={16}
          color={UIColors.text + '40'}
          style={{ marginRight: 4 }}
        />
      )}
    </View>
  );

  return (
    <Cell
      cellImageView={cellImageView}
      cellContentView={cellContentView}
      cellAccessoryView={cellAccessoryView}
      backgroundColor={!backgroundColor ? UIColors.element : backgroundColor}
      onPress={onPress}
    />
  );
});

const styles = StyleSheet.create({
  cellImageView: {
    marginRight: 14,
  },
  cellContentView: {
    flex: 1,
    paddingVertical: 9,
    gap: 2,
  },
  cellAccessoryView: {
    marginLeft: 14,
  },
});

export default NativeItem;
