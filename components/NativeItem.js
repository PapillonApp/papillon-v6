import * as React from 'react';
import { Row } from 'react-native-ios-list';

import GetUIColors from '../utils/GetUIColors';

function NativeItem(props) {
  const { 
    children,
    leading,
    trailing,
    onPress,
    last,
    style,
  } = props;

  const UIColors = GetUIColors();

  console.log(leading);

  return (
    <Row
      leading={leading}
      trailing={trailing}
      hideDivider={last}
      onPress={onPress}
      style={[
        style
      ]}
      highlightColor={UIColors.text + '12'}
    >
      {children}
    </Row>
  );
}

export default NativeItem;