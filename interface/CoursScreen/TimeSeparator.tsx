import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, StyleProp, ViewStyle } from 'react-native';

import GetUIColors from '../../utils/GetUIColors';

import {
  Sun,
  Utensils,
} from 'lucide-react-native';
import { PressableScale } from 'react-native-pressable-scale';

interface TimeSeparatorProps {
  style?: StyleProp<ViewStyle>;
  showLine: boolean;
  reason: string;
  time: string;
  lunch: boolean;
}

const TimeSeparator: React.FC<TimeSeparatorProps> = ({ style, showLine, reason, time, lunch }) => {
  const UIColors = GetUIColors();

  return (
    <PressableScale style={[
      styles.timeSeparator,
      {
        backgroundColor: UIColors.text + '08',
      },
      style
    ]}>
      {showLine &&
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            height: '100%',
            width: 4,
            backgroundColor: UIColors.border
          }}
        />
      }
      <Image source={require('../../assets/stripes.png')} style={[styles.stripes, { tintColor: UIColors.text }]} />
      <View style={[styles.separatorData]}>
        <View style={[styles.reasonContainer]}>
          {lunch && <Utensils size={20} strokeWidth={2.3} color={UIColors.text} />}
          {!lunch && <Sun size={20} strokeWidth={2.3} color={UIColors.text} />}
          <Text style={[styles.reasonText, { color: UIColors.text }]}>
            {reason}
          </Text>
        </View>
        <View style={[styles.timeContainer]}>
          <Text style={[styles.timeText, { color: UIColors.text }]}>
            {time}
          </Text>
        </View>
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  timeSeparator: {
    flex: 1,
    height: 36,
    overflow: 'hidden',
    borderRadius: 10,
    borderCurve: 'continuous'
  },
  stripes: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '250%',
    height: 96,
    alignSelf: 'center',
    marginTop: -32,
    marginLeft: -64,
    opacity: 0.04,
  },
  separatorData: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  reasonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    opacity: 0.8,
    gap: 12,
  },
  reasonText: {
    fontSize: 15,
    fontFamily: 'Papillon-Semibold'
  },
  timeContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    opacity: 0.6,
  },
  timeText: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
  },
});

export default TimeSeparator;