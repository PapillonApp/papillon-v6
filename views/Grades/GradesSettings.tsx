import React from 'react';
import { StatusBar, View, StyleSheet, Button, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import GetUIColors from '../../utils/GetUIColors';
import type { gradeSettings } from '../GradesScreenNew';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActionSheet } from '@expo/react-native-action-sheet';

const GradesSettings = ({ navigation }) => {
  const UIColors = GetUIColors();
  const { showActionSheetWithOptions } = useActionSheet();

  const [gradeSettings, setGradeSettings] = React.useState<gradeSettings[]>({
    scale: 20,
    mode: 'trimestre'
  });

  React.useEffect(() => {
    AsyncStorage.getItem('gradeSettings').then((value) => {
      if (value) {
        setGradeSettings(JSON.parse(value));
      }
    });
  }, []);

  const PeriodOptions = [
    { label: 'Trimestre', value: 'trimestre' },
    { label: 'Semestre', value: 'semestre' },
    { label: 'Année', value: 'annee' },
  ];

  function handlePeriodChange(value) {
    setGradeSettings({ ...gradeSettings, mode: value });
    AsyncStorage.setItem('gradeSettings', JSON.stringify({ ...gradeSettings, mode: value }));
  }

  function periodChangePicker() {
    const options = PeriodOptions.map((item) => item.label);
    options.push('Annuler');
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex : cancelButtonIndex,
        tintColor: UIColors.primary,
      },
      (buttonIndex) => {
        if (buttonIndex !== cancelButtonIndex) {
          handlePeriodChange(PeriodOptions[buttonIndex].value);
        }
      }
    );
  }

  // header background color
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: Platform.OS == 'android' && UIColors.background,
      },
    });
  }, [navigation, UIColors]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
      contentInsetAdjustmentBehavior='automatic'
    >
      <StatusBar animated barStyle={Platform.OS === 'ios' ? 'light-content' : undefined} />

      <NativeList inset>
        <NativeItem
          trailing={
            <TouchableOpacity
              onPress={() => {
                periodChangePicker();
              }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: UIColors.primary + '22'}}
            >
              <NativeText style={{ color: UIColors.primary }} heading="h4">
                {gradeSettings.mode === 'trimestre' ? 'Trimestre' : gradeSettings.mode === 'semestre' ? 'Semestre' : 'Année'}
              </NativeText>
            </TouchableOpacity>
          }
        >
          <NativeText heading='h4'>
            Type de période
          </NativeText>
          <NativeText heading='p2'>
            Choisisez le découpage de l'année scolaire
          </NativeText>
        </NativeItem>
        <NativeItem
          trailing={
            <TextInput
              style={{ color: UIColors.text, fontSize: 22, textAlign: 'center', padding: 0, width: 60, fontFamily: 'Papillon-Medium', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: UIColors.text + '15', marginLeft: 10 }}
              keyboardType='numeric'
              value={gradeSettings.scale.toString()}
              maxLength={3}
              onChangeText={(value) => {
                setGradeSettings({ ...gradeSettings, scale: Number(value) });
                AsyncStorage.setItem('gradeSettings', JSON.stringify({ ...gradeSettings, scale: Number(value) }));
              }}
              onBlur={() => {
                if (gradeSettings.scale.toString() === '0') {
                  setGradeSettings({ ...gradeSettings, scale: 20 });
                  AsyncStorage.setItem('gradeSettings', JSON.stringify({ ...gradeSettings, scale: 20 }));
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
