import * as React from 'react';

import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { Cell, Section, TableView } from 'react-native-tableview-simple';

import GetUIColors from '../utils/GetUIColors';

function NativeList(props) {
  const { 
    children,
    inset,
    header,
    footer,
    style,
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
    <TableView
      {...tableViewProps}
      appearance="auto"
      style={[
        style,
        inset ? {marginHorizontal: 15} : null,
        tableViewProps?.style,
      ]}
    >
      <Section
        {...sectionProps}
        header={header ? header : null}
        footer={footer ? footer : null}

        roundedCorners={sectionProps?.roundedCorners ? sectionProps.roundedCorners : inset ? true : false}
        hideSurroundingSeparators={sectionProps?.hideSurroundingSeparators ? sectionProps.hideSurroundingSeparators : inset ? true : false}
        separatorTintColor={sectionProps?.separatorTintColor ? sectionProps.separatorTintColor : UIColors.border}

        hideSeparator={sectionProps?.hideSeparator ? sectionProps.hideSeparator : false}

        headerTextStyle={[{
          color: UIColors.text,
          fontSize: 13,
          fontWeight: '400',
          opacity: 0.4,
          textTransform: 'uppercase',
          marginBottom: 2,
        }, sectionProps?.headerTextStyle]}
      >
        {childrenWithKeys}
      </Section>
    </TableView>
  );
}

const styles = StyleSheet.create({
  
});

export default NativeList;
