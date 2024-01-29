import React from 'react';
import { Text, type TextStyle } from 'react-native';

import GetUIColors from '../utils/GetUIColors';

const HEADING_STYLES = {
  'h1': {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Papillon-Semibold',
  },
  'h2': {
    fontSize: 19,
    fontWeight: '600',
    fontFamily: 'Papillon-Semibold',
  },
  'h3': {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Papillon-Semibold',
  },
  'h4': {
    fontSize: 16,
    fontWeight: 600,
    fontFamily: 'Papillon-Semibold',
  },
  'subtitle1': {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.6,
  },
  'subtitle2': {
    fontSize: 13,
    fontWeight: '400',
    opacity: 0.6,
  },
  'subtitle3': {
    fontSize: 13,
    fontWeight: '400',
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
} as const;

interface Props {
  children: React.ReactNode
  heading?: keyof typeof HEADING_STYLES 
  style?: TextStyle
  numberOfLines?: number
  textProps?: Partial<React.ComponentProps<typeof Text>>
}

const NativeText: React.FC<Props> = ({
  children,
  heading = 'p',
  style,
  numberOfLines,
  textProps,
}) => {
  const UIColors = GetUIColors();

  return (
    <Text
      {...textProps}
      style={[
        { color: UIColors.text },
        HEADING_STYLES[heading],
        style,
      ]}
      numberOfLines={numberOfLines}
      ellipsizeMode='tail'
    >
      {children}
    </Text>
  );
};

export default NativeText;
