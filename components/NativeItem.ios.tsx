import React from 'react';

import { View, StyleSheet, Platform } from 'react-native';

import { Cell } from 'react-native-tableview-simple';
import { SFSymbol } from 'react-native-sfsymbols';

import GetUIColors from '../utils/GetUIColors';

interface Props {
  children: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode
  onPress?: () => void
  chevron?: boolean
  cellProps?: Partial<React.ComponentProps<typeof Cell>>
  backgroundColor?: string
}

const NativeItem: React.FC<Props> = ({ 
  children,
  leading,
  trailing,
  onPress,
  chevron,
  cellProps,
  backgroundColor,
}) => {
  const UIColors = GetUIColors();

  return (
    <Cell
      cellImageView={leading &&
        <View style={styles.cellImageView}>
          {leading}
        </View>
      }
      cellContentView={children &&
        <View style={styles.cellContentView}>
          {children}
        </View>
      }
      cellAccessoryView={(trailing || chevron) &&
        <View style={styles.cellAccessoryView}>
          {trailing}

          {chevron && Platform.OS === 'ios' &&
            <SFSymbol
              name="chevron.right"
              weight="semibold"
              size={16}
              color={UIColors.text + '40'}
              style={{marginRight: 4}}
            />
          }
        </View>
      }

      backgroundColor={!backgroundColor ? UIColors.element : backgroundColor}
      onPress={onPress && onPress}

      {...cellProps}
    />
  );
};

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
