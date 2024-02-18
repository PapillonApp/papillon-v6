import React from 'react';

import { View, StyleSheet, type ViewStyle } from 'react-native';
import { List } from 'react-native-paper';

import GetUIColors from '../utils/GetUIColors';
import mapChildrenWithKeys from '../utils/mapChildrenWithKeys';
import type { TableView, Section } from 'react-native-tableview-simple';

interface Props {
  children: React.ReactNode
  inset?: boolean
  header?: React.ReactNode
  footer?: React.ReactNode
  style?: ViewStyle
  containerStyle?: ViewStyle
  plain?: boolean
  tableViewProps?: Partial<React.ComponentProps<typeof TableView>>
  sectionProps?: Partial<React.ComponentProps<typeof Section>>
}

const NativeList: React.FC<Props> = ({ 
  children,
  header,
  footer,
  style,
  containerStyle,
  plain,
}) => {
  const UIColors = GetUIColors(null, plain ? 'ios' : null);
  const childrenWithKeys = mapChildrenWithKeys(children);

  return (
    <List.Section style={[styles.container, style]}>
      {header && <List.Subheader>{header}</List.Subheader>}

      <View style={[styles.children, { backgroundColor: UIColors.element, borderColor: UIColors.borderLight }, plain && styles.plain, containerStyle]}>
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
  },
  plain: {
    borderWidth: 0.5,
    shadowColor: '#00000055',
    elevation: 3,
  },
});

export default NativeList;
