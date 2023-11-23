import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, Modal } from 'react-native';

import { useTheme, Text } from 'react-native-paper';
import GetUIColors from '../../utils/GetUIColors'

import SyncStorage, { set } from 'sync-storage';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  HueSlider,
} from 'reanimated-color-picker';

import formatCoursName from '../../utils/FormatCoursName';

import { forceSavedCourseColor } from '../../utils/ColorCoursName';

const CoursColor = ({ navigation }) => {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [savedColors, setSavedColors] = useState([]);

  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [colorModalColor, setColorModalColor] = useState('#000000');
  const [currentEditedSubject, setCurrentEditedSubject] = useState('');

  const onSelectColor = ({ hex }) => {
    setColorModalColor(hex);
  };

  const onSave = () => {
    let hex = colorModalColor;

    setSavedColors({
      ...savedColors,
      [currentEditedSubject]: {
        ...savedColors[currentEditedSubject],
        color: hex,
      },
    });

    forceSavedCourseColor(currentEditedSubject, hex);
    setColorModalOpen(false)
  };

  useEffect(() => {
    SyncStorage.init();

    let col = JSON.parse(SyncStorage.get('savedColors'));

    // remove all entries with no color
    Object.keys(col).forEach((key) => {
      if (!col[key].color) {
        delete col[key];
      }
    });

    setSavedColors(col);
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
    >
      <NativeList
        header="Matières enregistrées"
        inset
      >
        {savedColors && Object.keys(savedColors).map((key, index) => {
          return (
            <NativeItem
              key={index}
              leading={
                <View style={{ width: 18, height: 18, borderRadius: 12, backgroundColor: savedColors[key].color }} />
              }


              onPress={() => {
                setColorModalOpen(true);
                setColorModalColor(savedColors[key].color);

                setCurrentEditedSubject(key);
              }}
            >
              <NativeText heading="b">
                {formatCoursName(savedColors[key].originalCourseName)}
              </NativeText>
              <NativeText heading="subtitle2">
                {savedColors[key].color.toUpperCase()}
              </NativeText>
            </NativeItem>
          )
        })}
      </NativeList>

      <View style={{ height: 20 }} />

      <Modal visible={colorModalOpen} animationType='fade' transparent={true}>
        <View style={[styles.colorModalContainer]}>
          <View style={[styles.colorModal, {backgroundColor: UIColors.element}]}>
            <ColorPicker style={styles.picker} value={colorModalColor} onComplete={onSelectColor}>
              <Preview
                textStyle={{
                  fontFamily: 'Papillon-Semibold',
                }}
              />
              <Panel1 />
              <HueSlider />
              <Swatches />
            </ColorPicker>

            <View style={[styles.modalActions, {borderColor: UIColors.border}]}>
              <TouchableOpacity style={[styles.modalAction]} onPress={() => setColorModalOpen(false)}>
                <Text
                  style={[styles.modalActionText]}
                >
                  Annuler
                </Text>
              </TouchableOpacity>
              <View style={{width: 1, height: 47, backgroundColor: UIColors.border + '99'}} />
              <TouchableOpacity style={[styles.modalAction]} onPress={onSave}>
                <Text
                  style={[styles.modalActionText, {color: colorModalColor}]}
                >
                  Enregistrer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
};

const styles = StyleSheet.create({
  colorModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000aa',
  },
  colorModal: {
    width: '70%',
    borderRadius: 20,
    borderCurve: 'continuous',
  },

  picker: {
    gap: 14,
    padding: 18
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 48,
    borderTopWidth: 1,
  },
  modalAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalActionText: {
    fontFamily: 'Papillon-Semibold',
    fontSize: 16,
  }
});

export default CoursColor;