import * as React from 'react';
import { Text } from 'react-native';

import GetUIColors from '../utils/GetUIColors';

function NativeText(props) {
  const {
    children,
    heading = 'p',
    style,
    numberOfLines,
    textProps,
  } = props;

  const UIColors = GetUIColors();

  const headingStyles = {
    'h1': {
      fontSize: 24,
      fontWeight: 600,
      fontFamily: 'Papillon-Semibold',
    },
    'h2': {
      fontSize: 19,
      fontWeight: 600,
      fontFamily: 'Papillon-Semibold',
    },
    'h3': {
      fontSize: 18,
      fontWeight: 600,
      fontFamily: 'Papillon-Semibold',
    },
    'h4': {
      fontSize: 16,
      fontWeight: 600,
      fontFamily: 'Papillon-Semibold',
    },
    'subtitle1': {
      fontSize: 13,
      fontWeight: 500,
      opacity: 0.6,
    },
    'subtitle2': {
      fontSize: 13,
      fontWeight: 400,
      opacity: 0.6,
    },
    'subtitle3': {
      fontSize: 13,
      fontWeight: 400,
      opacity: 0.6,
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    'p': {
      fontSize: 16,
    },
    'p2': {
      fontSize: 16,
      opacity: 0.6,
    },
    'b': {
      fontSize: 16,
      fontWeight: '600',
    },
  };

  return (
    <Text
      {...textProps}
      style={[
        {
          color: UIColors.text,
        },
        headingStyles[heading],
        style,
      ]}
      numberOfLines={numberOfLines}
      ellipsizeMode='tail'
    >
      {children}
    </Text>
  );
}

export default NativeText;
