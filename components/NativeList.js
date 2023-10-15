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
        inset ? {marginHorizontal: 15} : null
      ]}
    >
      <Section
        {...sectionProps}
        header={header ? header : null}
        footer={footer ? footer : null}

        roundedCorners={inset ? true : false}
        hideSurroundingSeparators={inset ? true : false}

        separatorTintColor={UIColors.border}

        headerTextStyle={{
          color: UIColors.text,
          fontSize: 13,
          fontWeight: '400',
          opacity: 0.4,
          textTransform: 'uppercase',
          marginBottom: 2,
        }}
      >
        {childrenWithKeys}
      </Section>
    </TableView>
  );
}

const styles = StyleSheet.create({
  
});

export default NativeList;