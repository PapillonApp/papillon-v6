import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StatusBar, StyleSheet, ScrollView, Platform, TextInput } from 'react-native';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import GetUIColors from '../../utils/GetUIColors';
import type { GradeSettings } from '../GradesScreenNew';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GradesSettings = ({ navigation }: {
  navigation: any; // TODO
}) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const [gradeSettings, setGradeSettings] = useState<GradeSettings>({
    scale: 20,
  });

  useEffect(() => {
    AsyncStorage.getItem('gradeSettings').then((value) => {
      if (value) setGradeSettings(JSON.parse(value));
    });
  }, []);

  // header background color
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: Platform.OS === 'android' && UIColors.background,
      },
    });
  }, [navigation, UIColors]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
      contentInsetAdjustmentBehavior='automatic'
    >
      <StatusBar animated barStyle={Platform.OS === 'ios' ? 'light-content' : undefined} />

      <NativeList 
        inset
        style={[Platform.OS === 'android' ? { marginTop: insets.top } : null]}
      >
        <NativeItem
          trailing={
            <TextInput
              style={{ color: UIColors.text, fontSize: 22, textAlign: 'center', padding: 0, width: 60, fontFamily: 'Papillon-Medium', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: UIColors.text + '15', marginLeft: 10 }}
              keyboardType='number-pad'
              value={gradeSettings.scale.toString()}
              maxLength={3}
              onChangeText={(value) => {
                // only numbers
                value = value.replace(/[^0-9]/g, '');
                setGradeSettings({ scale: Number(value) });
                AsyncStorage.setItem('gradeSettings', JSON.stringify({ scale: Number(value) }));
              }}
              onBlur={() => {
                if (gradeSettings.scale.toString() === '0') {
                  setGradeSettings({ scale: 20 });
                  AsyncStorage.setItem('gradeSettings', JSON.stringify({ scale: 20 }));
                }
              }}
            />
          }   
        >
          <NativeText heading='h4'>
            Échelle par défaut
          </NativeText>
          <NativeText heading='p2'>
            Sélectionnez l'échelle de notation par défaut
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GradesSettings;
