import React from 'react';

import { View, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';

import GetUIColors from '../utils/GetUIColors';
function NativeList(props) {
  const { 
    children,
    inset,
    header,
    footer,
    style,
    containerStyle,
    tableViewProps,
    sectionProps,
  } = props;
  const UIColors = GetUIColors();

  // Automatically assign unique keys to children
  const childrenWithKeys = React.Children.map(children, (child, index) => {
    // remove null/undefined children
    if (!child) {
      return null;
    }

    // Check if this is the last child and add last={true} prop if it is
    const isLastChild = index === React.Children.count(children) - 1;
    return React.cloneElement(child, { key: `child-${index}`, last: isLastChild });
  });

  return (
    <List.Section style={[styles.container, style]}>
      {header && <List.Subheader>{header}</List.Subheader>}

      <View style={[styles.children, {backgroundColor: UIColors.element}, containerStyle]}>
        {childrenWithKeys}
      </View>

      {footer && <List.Subheader>{footer}</List.Subheader>}
    </List.Section>
  );
}

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
