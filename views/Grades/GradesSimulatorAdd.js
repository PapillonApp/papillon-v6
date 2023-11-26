import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, StatusBar, Platform, TextInput, Modal, Pressable } from 'react-native';

import { Text, useTheme } from 'react-native-paper';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import { useAppContext } from '../../utils/AppContext';

import GetUIColors from '../../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, PlusCircle } from 'lucide-react-native';

import { getSavedCourseColor } from '../../utils/ColorCoursName';
import PapillonButton from '../../components/PapillonButton';
import { randomUUID } from 'expo-crypto';

import AsyncStorage from '@react-native-async-storage/async-storage';

const GradesSimulatorAdd = ({ navigation }) => {
  const UIColors = GetUIColors();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const appctx = useAppContext();

  const [description, setDescription] = useState('');
  const [out_of, setOutOf] = useState('20');

  const [subjectList, setSubjectList] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(0);

  const [student, setStudent] = useState('');
  const [classGrade, setClassGrade] = useState('');

  const [coefficient, setCoefficient] = useState('1,00');

  const [selectSubjectModal, setSelectSubjectModal] = useState(false);

  useEffect(() => {
    appctx.dataprovider.getGrades('', false).then((grades) => {
      console.log(grades);
      let subjects = [];
      grades.grades.forEach((grade) => {
        // if subject name is not in the list
        if (subjects.findIndex((subject) => subject.name === grade.subject.name) === -1) {
          subjects.push(grade.subject);
        }
      });

      setSubjectList(subjects);
      console.log(subjects);
    });
  }, []);

  const changeValue = (value, funct) => {
    let originalValue = value;

    let nValue = value.replace(',', '.');
    nValue = parseFloat(nValue);

    if (nValue > 20) {
      nValue = 20;
    }

    if (nValue < 0) {
      nValue = 0;
    }

    if (isNaN(nValue)) {
      nValue = '';
    }

    nValue = nValue.toString().replace('.', ',');
    if (originalValue[originalValue.length - 1] === ',') {
      nValue = nValue + ',';
    }

    funct(nValue);
  }

  function addGrade() {
    let id = randomUUID();

    if (classGrade === '') {
      setClassGrade(student);
    }

    // check if all fields are filled
    if (student === '' || out_of === '' || coefficient === '') {
      Alert.alert(
        "Erreur",
        "Veuillez remplir tous les champs",
        [
          { text: "OK" }
        ]
      );
      return;
    }

    let grade = {
      "id": id,
      "subject": subjectList[selectedSubject],
      "date": new Date().toISOString(),
      "description": description ? description : "Note simulée",
      "is_bonus": false,
      "is_optional": false,
      "is_out_of_20": out_of === '20' ? true : false,
      "grade": {
          "value": parseFloat(student.replace(',', '.')),
          "out_of": parseFloat(out_of.replace(',', '.')),
          "coefficient": parseFloat(coefficient.replace(',', '.')),
          "average": parseFloat(classGrade.replace(',', '.')) || parseFloat(student.replace(',', '.')),
          "max": parseFloat(out_of.replace(',', '.')),
          "min": parseFloat(classGrade.replace(',', '.')) || parseFloat(student.replace(',', '.')),
          "significant": 0
      }
    }

    AsyncStorage.getItem('custom-grades').then((grades) => {
      if (grades) {
        grades = JSON.parse(grades);
        grades.push(grade);
        AsyncStorage.setItem('custom-grades', JSON.stringify(grades));
      } else {
        AsyncStorage.setItem('custom-grades', JSON.stringify([grade]));
      }

      navigation.goBack();
      navigation.goBack();
    });
  }

  return (
    <ScrollView 
      contentInsetAdjustmentBehavior='automatic'
      style={{ backgroundColor: UIColors.background }}
    >
      { Platform.OS === 'ios' ? <StatusBar barStyle='light-content' /> : <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} /> }

      <NativeList
        inset
        header="Matière"
      >
        <NativeItem
          trailing={
            subjectList[selectedSubject] &&
            <TouchableOpacity onPress={() => setSelectSubjectModal(true)} style={{width: '80%'}}>
              <NativeText heading="h4" style={{color: getSavedCourseColor(subjectList[selectedSubject].name, UIColors.primary), width: '100%', textAlign: 'right'}} numberOfLines={1}>
                {subjectList[selectedSubject].name}
              </NativeText>
            </TouchableOpacity>
          }
        >
          <NativeText heading="h4">
            Matière
          </NativeText>
        </NativeItem>
        <NativeItem
          trailing={
            <TextInput
              style={[
                styles.inputText, Platform.OS !== 'ios' && styles.inputValueAndroid,
                {color: UIColors.text}
              ]}
              placeholder='Aucune description'
              placeholderTextColor={UIColors.text + '50'}
              value={description}
              onChangeText={text => setDescription(text)}
            />
          }
        >
          <NativeText heading="h4">
            Description
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList
        inset
        header="Valeurs de la note"
      >
        <NativeItem
          trailing= {
            <TextInput
              style={[
                styles.inputValue, Platform.OS !== 'ios' && styles.inputValueAndroid,
                {color: UIColors.text}
              ]}
              keyboardType="numeric"
              placeholder='14,00'
              placeholderTextColor={UIColors.text + '50'}
              value={student}
              onChangeText={text => changeValue(text, setStudent)}
              maxLength={5}
            />
          } 
        >
          <NativeText heading="h4">
            Note de l'élève
          </NativeText>
        </NativeItem>
        <NativeItem
          trailing= {
            <TextInput
              style={[
                styles.inputValue, Platform.OS !== 'ios' && styles.inputValueAndroid,
                {color: UIColors.text}
              ]}
              keyboardType="numeric"
              placeholder='12,00'
              placeholderTextColor={UIColors.text + '50'}
              value={classGrade}
              onChangeText={text => changeValue(text, setClassGrade)}
              maxLength={5}
            />
          } 
        >
          <NativeText heading="h4">
            Moyenne de la classe
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList
        inset
        header="Données de calcul"
      >
        <NativeItem
          trailing= {
            <TextInput
              style={[
                styles.inputValue, Platform.OS !== 'ios' && styles.inputValueAndroid,
                {color: UIColors.text}
              ]}
              keyboardType="numeric"
              placeholder='20'
              placeholderTextColor={UIColors.text + '50'}
              value={out_of}
              onChangeText={text => setOutOf(text)}
              maxLength={3}
            />
          }
        >
          <NativeText heading="h4">
            Note sur
          </NativeText>
        </NativeItem>
        <NativeItem
          trailing= {
            <TextInput
              style={[
                styles.inputValue, Platform.OS !== 'ios' && styles.inputValueAndroid,
                {color: UIColors.text}
              ]}
              keyboardType="numeric"
              placeholder='1,00'
              placeholderTextColor={UIColors.text + '50'}
              value={coefficient}
              onChangeText={text => changeValue(text, setCoefficient)}
              maxLength={4}
            />
          }
        >
          <NativeText heading="h4">
            Coefficient
          </NativeText>
        </NativeItem>
      </NativeList>

      <PapillonButton
        title="Ajouter"
        color={subjectList[selectedSubject] ? getSavedCourseColor(subjectList[selectedSubject].name, UIColors.primary) : UIColors.primary}
        style={{
          marginHorizontal: 16,
          marginTop: 16,
        }}
        onPress={() => addGrade()}
      />

      <View style={{height: insets.bottom}} />

      <Modal
        animationType="fade"
        transparent={true}
        visible={selectSubjectModal}
        onRequestClose={() => {
          setSelectSubjectModal(false);
        }}
      >
        <View style={{flex: 1, backgroundColor: '#00000080'}} >
          <Pressable style={{flex: 1}} onPress={() => setSelectSubjectModal(false)} />
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{backgroundColor: UIColors.background, borderRadius: 14, borderCurve: 'continuous', padding: 0, marginHorizontal: 14, height: 500}}>
              <NativeText heading="p2" style={{color: UIColors.text, paddingTop: 16, paddingHorizontal: 20}}>
                Sélectionner une matière
              </NativeText>
              <ScrollView style={{marginTop: 16, paddingBottom: 10, paddingHorizontal: 16}}>
                {subjectList.map((subject, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedSubject(index);
                      setSelectSubjectModal(false);
                    }}
                    style={[
                      {
                        backgroundColor: getSavedCourseColor(subject.name, UIColors.primary),
                        borderRadius: 10,
                        borderCurve: 'continuous',
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        marginBottom: 10,
                      }
                    ]}
                  >
                    <NativeText heading="h4" style={{color: "#fff"}}>
                      {subject.name}
                    </NativeText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <Pressable style={{flex: 1}} onPress={() => setSelectSubjectModal(false)} />
        </View>
      </Modal>
    </ScrollView>
  )
};

const styles = StyleSheet.create({
  inputValue: {
    fontSize: 24,
    paddingVertical: 12,
    textAlign: 'right',
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
  },
  inputValueAndroid : {
    paddingVertical: 0,
  },
  inputText: {
    fontSize: 17,
    paddingVertical: 12,
    textAlign: 'right',
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
    width: '70%',
  },

});

export default GradesSimulatorAdd;
