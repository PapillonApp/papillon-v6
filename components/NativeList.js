import * as React from 'react';
import { List } from 'react-native-ios-list';

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
    <List
      inset={inset}
      header={header}
      footer={footer}
      style={[
        style,
      ]}
      sideBar={sideBar}

      backgroundColor={UIColors.element}
      containerBackgroundColor={UIColors.background}
      dividerColor={UIColors.border}
    >
      {childrenWithKeys}
    </List>
  );
}

export default NativeList;