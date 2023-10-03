// React Native code
import * as React from 'react';
import { View, StyleSheet } from 'react-native';

import { Text } from 'react-native-paper';
import GetUIColors from '../utils/GetUIColors';

function PapillonList({ children, inset, title, style }) {
  const UIColors = GetUIColors();

  return (
    <View style={[styles.listGroup]}>
      <Text style={[styles.listTitle]}>{title}</Text>
      <View
        style={[
          styles.list,
          { backgroundColor: UIColors.element },
          inset ? styles.inset : null,
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

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
