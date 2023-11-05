import * as React from 'react';

import { View, StyleSheet, Platform } from 'react-native';

import { Cell, Section, TableView } from 'react-native-tableview-simple';

import GetUIColors from '../utils/GetUIColors';

import { SFSymbol } from "react-native-sfsymbols";

function NativeItem(props) {
  const { 
    children,
    leading,
    trailing,
    onPress,
    chevron,
    cellProps,
    style,
  } = props;

  const UIColors = GetUIColors();

  return (
    <Cell
      {...cellProps}

      cellImageView={ leading &&
        <View style={styles.cellImageView}>
          {leading}
        </View>
      }
      cellContentView={ children &&
        <View style={styles.cellContentView}>
          {children}
        </View>
      }
      cellAccessoryView={ trailing || chevron &&
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

      backgroundColor={UIColors.element}

      onPress={onPress}
    />
  );
}

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
})

export default NativeItem;