import * as React from 'react';
import { Row } from 'react-native-ios-list';

import { View } from 'react-native';

import GetUIColors from '../utils/GetUIColors';

import { SFSymbol } from "react-native-sfsymbols";

function NativeItem(props) {
  const { 
    children,
    leading,
    trailing,
    onPress,
    last,
    style,
    chevron
  } = props;

  const UIColors = GetUIColors();

  console.log(leading);

  return (
    <Row
      leading={leading}
      trailing={
        <View style={{paddingRight: 6}}>
          { trailing }

          { chevron &&
          <SFSymbol
                name="chevron.right"
                weight="semibold"
                size={16}
                color={UIColors.text + '40'}
              />
          }
        </View>
      }
      hideDivider={last}
      onPress={onPress}
      style={[
        style,
        {flex: 1, maxWidth: '100%'},
      ]}
      highlightColor={UIColors.text + '12'}
    >
      {children}
    </Row>
  );
}

export default NativeItem;