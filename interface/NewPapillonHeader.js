import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import GetUIColors from '../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Papillon as PapillonIcon } from './icons/PapillonIcons';

const NewPapillonHeader = ({ title, props }) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  console.log(props);

  return (
    <View 
      style={[
        styles.container,
        {
          backgroundColor: props.options.headerTransparent ? 'transparent' : UIColors.background,
          paddingTop: insets.top,
          height: 48 + insets.top,
        }
      ]}
    >
      {props.options.headerLeft ? (
        <View style={[styles.headerSide, styles.headerLeft]}>
          {props.options.headerLeft()}
        </View>
      ) : <PapillonIcon fill={UIColors.text} style={[styles.newHeaderIcon]} width={30} height={30} />}

      <Text style={[styles.newHeaderTitle, { color: UIColors.text }]}>
        {title}
      </Text>

      {props.options.headerRight ? (
        <View style={[styles.headerSide, styles.headerRight]}>
          {props.options.headerRight()}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 22,
  },
  newHeaderIcon: {
    
  },
  newHeaderTitle: {
    fontFamily: 'Onest-Semibold',
    fontSize: 17,
    flex: 1,
  },
});

export default NewPapillonHeader;
