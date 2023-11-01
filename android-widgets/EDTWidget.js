import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function HelloWidget() {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
      }}
    >
      
    </FlexWidget>
  );
}