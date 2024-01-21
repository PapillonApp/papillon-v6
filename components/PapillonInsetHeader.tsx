import React from 'react';

import { View, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { Text } from 'react-native-paper';

interface Props {
  /** Most likely an icon component from `lucide-react-native`. */
  icon?: React.ReactElement
  title: string
  size?: number
  color?: string
  inset?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

const PapillonInsetHeader: React.FC<Props> = ({
  icon,
  title,
  size = 24,
  color = '#000000',
  inset = false,
  style,
  textStyle
}) => {
  // Add size and color to icon.
  if (icon) icon = React.cloneElement(icon, { size, color });

  return (
    <View style={[
      styles.header,
      inset && styles.headerInset,
      style
    ]}>
      {icon &&
        <View style={styles.headerIcon}>
          {icon}
        </View>
      }
      <Text
        style={[styles.headerText, textStyle]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems:'center',
    marginHorizontal: 14,
    
  },
  headerInset: {
    marginHorizontal: 0,
    marginLeft: 7,
    marginEnd: 110,
  },
  headerIcon: {
    marginRight: 30,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Papillon-Semibold',
    flex: 1,
  }
});

export default PapillonInsetHeader;
