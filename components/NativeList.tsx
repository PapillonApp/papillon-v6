import React from 'react';

import { View, StyleSheet, type ViewStyle } from 'react-native';
import { List } from 'react-native-paper';

import GetUIColors from '../utils/GetUIColors';
import mapChildrenWithKeys from '../utils/mapChildrenWithKeys';

interface Props {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  style?: ViewStyle
  containerStyle?: ViewStyle
}

const NativeList: React.FC<Props> = ({ 
  children,
  header,
  footer,
  style,
  containerStyle,
}) => {
  const UIColors = GetUIColors();
  const childrenWithKeys = mapChildrenWithKeys(children);

  return (
    <List.Section style={[styles.container, style]}>
      {header && <List.Subheader>{header}</List.Subheader>}

      <View style={[styles.children, { backgroundColor: UIColors.element }, containerStyle]}>
        {childrenWithKeys}
      </View>

      {footer && <List.Subheader>{footer}</List.Subheader>}
    </List.Section>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  children: {
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: 'hidden',
  }
});

export default NativeList;
