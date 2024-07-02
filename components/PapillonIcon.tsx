import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  icon: React.ReactElement;
  color: string;
  fill?: boolean;
  plain?: boolean;
  small?: boolean;
  style?: ViewStyle;
  size?: number;
}

const PapillonIcon: React.FC<Props> = ({ icon, color, style, fill, small, plain, size }) => {
  let opacity = '10';
  if (fill) opacity = 'FF';
  if (plain) opacity = '00';

  return (
    <View
      style={[
        styles.icon,
        { backgroundColor: color + opacity },
        style,
        small ? styles.iconSmall : undefined,
        size ? { width: size, height: size, borderRadius: size / 2 } : undefined,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSmall: {
    padding: 6,
  },
});

export default PapillonIcon;
