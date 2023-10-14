import * as React from 'react';
import { List } from 'react-native-ios-list';

import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import GetUIColors from '../utils/GetUIColors';

function NativeList(props) {
  const { 
    children,
    inset,
    header,
    footer,
    style,
    sideBar,
  } = props;
  const UIColors = GetUIColors();

  // Automatically assign unique keys to children
  const childrenWithKeys = React.Children.map(children, (child, index) => {
    // Check if this is the last child and add last={true} prop if it is
    const isLastChild = index === React.Children.count(children) - 1;
    return React.cloneElement(child, { key: `child-${index}`, last: isLastChild });
  });

  return (
    <>
      { header ? (
        <NativeHeader text={header} inset={inset} />
      ) : null }
      <List
        inset={inset}
        style={[
          style,
          {flex: 1}
        ]}
        sideBar={sideBar}

        backgroundColor={UIColors.element}
        containerBackgroundColor={UIColors.background}
        dividerColor={UIColors.border}
      >
        {childrenWithKeys}
      </List>
    </>
  );
}

function NativeHeader(props) {
  return (
    <View style={[styles.listHeader, props.inset ? styles.listHeaderInset : null]}>
      <Text style={styles.listText}>{props.text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  listHeader: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    paddingTop: 10,
  },

  listHeaderInset: {
    paddingHorizontal: 32,
  },

  listText: {
    fontSize: 13,
    fontWeight: '400',
    opacity: 0.6,
    textTransform: 'uppercase',
  },
});

export default NativeList;