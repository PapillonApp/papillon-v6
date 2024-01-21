import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';

interface Props {
  /** Most likely an icon component from `lucide-react-native`. */
  icon: React.ReactElement
  /** Should be in HEX format. */
  color: string
  /** Whether the icon should be filled or not. */
  fill?: boolean
  /** Removes the background of the icon. */
  plain?: boolean
  /** Show icon in a smaller size. */
  small?: boolean
  style?: ViewStyle
}

/**
 * @see https://i.imgur.com/yQ2Fde5.png
 */
const PapillonIcon: React.FC<Props> = ({ icon, color, style, fill, small, plain }) => {
  let opacity = '10';
  if (fill) opacity = 'FF';
  if (plain) opacity = '00';

  return (
    <View
      style={[
        styles.icon,
        { backgroundColor: color + opacity },
        style,
        small ? styles.iconSmall : void 0,
      ]}
    >
      {icon}
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    padding: 10,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignContent: 'center',
    alignItems: 'center',
  },
  iconSmall: {
    padding: 6,
  },
});

export default PapillonIcon;
