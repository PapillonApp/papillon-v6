import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';

import { Text } from 'react-native-paper';
import GetUIColors from '../utils/GetUIColors';

interface Props {
  children: React.ReactNode;
  inset?: boolean;
  title?: string;
  style?: ViewStyle;
  grouped?: boolean;
  plain?: boolean;
}

const PapillonList: React.FC<Props> = ({ children, inset, title, style, grouped, plain }) => {
  const UIColors = GetUIColors(null, plain ? 'ios' : null);

  return (
    <View style={styles.listGroup}>
      {title && (
        <Text style={styles.listTitle}>{title}</Text>
      )}

      <View
        style={[
          styles.list,
          !grouped ? { backgroundColor: UIColors.element } : {gap: 12},
          inset ? styles.inset : void 0,
          plain && {
            borderColor: UIColors.border + 55,
            borderWidth: 0.5,
            shadowColor: '#00000055',
            elevation: 3,
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listGroup: {
    flex: 1,
    marginVertical: 16,
  },

  list: {
    flex: 1,
  },

  inset: {
    borderRadius: 12,
    borderCurve: 'continuous',
    marginHorizontal: 16,
  },

  listTitle: {
    paddingLeft: 32,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
    marginBottom: 9,
  },
});

export default PapillonList;
