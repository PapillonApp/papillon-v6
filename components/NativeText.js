import * as React from 'react';
import { Text } from 'react-native';

import GetUIColors from '../utils/GetUIColors';

function NativeText(props) {
  const {
    children,
    heading = 'p',
    style
  } = props;

  const UIColors = GetUIColors();

  const headingStyles = {
    "h1": {
      fontSize: 24,
      fontWeight: 600,
      fontFamily: 'Papillon-Semibold',
    },
    "h2": {
      fontSize: 19,
      fontWeight: 600,
      fontFamily: 'Papillon-Semibold',
    },
    "h3": {
      fontSize: 17,
      fontWeight: 600,
      fontFamily: 'Papillon-Semibold',
    },
    "h4": {
      fontSize: 15,
      fontWeight: 600,
      fontFamily: 'Papillon-Semibold',
    },
    "subtitle1": {
      fontSize: 13,
      fontWeight: 500,
      opacity: 0.6,
    },
    "subtitle2": {
      fontSize: 13,
      fontWeight: 400,
      opacity: 0.6,
    },
    "subtitle3": {
      fontSize: 13,
      fontWeight: 400,
      opacity: 0.6,
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    "p": {
      fontSize: 15,
    },
    "p2": {
      fontSize: 15,
      opacity: 0.6,
    },
  };

  return (
    <Text
      style={[
        style,
        {
          color: UIColors.text,
        },
        headingStyles[heading],
      ]}
    >
      {children}
    </Text>
  );
}

export default NativeText;