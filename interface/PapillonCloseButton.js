import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import GetUIColors from '../utils/GetUIColors';
import { X } from 'lucide-react-native';

const PapillonCloseButton = ({ onPress, theme }) => {
  const UIColors = GetUIColors(theme);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 30,
        height: 30,
        borderRadius: 20,
        backgroundColor: UIColors.text + '16',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <X
        size={20}
        color={UIColors.text}
        strokeWidth={2.5}
        style={{
          opacity: 0.7,
        }}
      />
    </TouchableOpacity>
  );
};

export default PapillonCloseButton;