import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, StatusBar, Platform, ActionSheetIOS } from 'react-native';

import { Text, useTheme } from 'react-native-paper';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import GetUIColors from '../../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, PlusCircle } from 'lucide-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { get } from 'sync-storage';

const GradesSimulatorMenu = ({ navigation }) => {
  const UIColors = GetUIColors();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [grades, setGrades] = useState([]);

  // when transition ends refresh
  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', () => {
      getGrades();
    });

    return unsubscribe;
  }, [navigation]);

  const getGrades = () => {
    AsyncStorage.getItem('custom-grades').then((value) => {
      if (value !== null) {
        let val = JSON.parse(value);
        setGrades(val);
      }
    });
  }

  useEffect(() => {
    getGrades();
  }, []);

  // add plus icon to header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            padding : 7.5,
            backgroundColor: UIColors.primary + '15',
            borderRadius: 20,
            marginRight: -10,
          }}

          onPress={() => navigation.navigate('GradesSimulatorAdd')}
        >
          <Plus size={24} color={UIColors.primary} />
        </TouchableOpacity>
      ),
    });
  }, []);

  const openGrade = (grade) => {
    Alert.alert(
      grade.subject.name,
      "Que voulez-vous faire ?",
      [
        {
          text: "Supprimer",
          onPress: () => {
            AsyncStorage.getItem('custom-grades').then((value) => {
              if (value !== null) {
                let val = JSON.parse(value);
                let index = val.findIndex((item) => item.id === grade.id);
                val.splice(index, 1);
                AsyncStorage.setItem('custom-grades', JSON.stringify(val));
                setGrades(val);
              }
            });
          },
          style: "destructive"
        },
        {
          text: "Annuler",
          style: "cancel"
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView 
      contentInsetAdjustmentBehavior='automatic'
      style={{ backgroundColor: UIColors.modalBackground }}
    >
      { Platform.OS === 'ios' ? <StatusBar barStyle='light-content' /> : <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} /> }

      {grades.length === 0 && (
        <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16, opacity: 0.5 }}>
          Vous n'avez pas encore ajouté de note
        </Text>
      )}

      <NativeList 
        inset
      >
        { grades.map((item, index) => (
          <NativeItem
            key={index}
            trailing={
              <View style={styles.gradeContainer}>
                <NativeText style={styles.gradeVal}>
                  {parseFloat(item.grade.value).toFixed(2)}
                </NativeText>
                <NativeText style={styles.gradeOut}>
                  /{parseInt(item.grade.out_of)}
                </NativeText>
              </View>
            }
            onPress={() => openGrade(item) }
          >
            <NativeText heading="h4">
              {item.subject.name}
            </NativeText>
            <NativeText heading="p2">
              {new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </NativeText>
          </NativeItem>
        ))}
      </NativeList>

    </ScrollView>
  )
};

const styles = StyleSheet.create({
  gradeContainer: {
    paddingVertical: 12,
    gap: 1,
    flexDirection: 'row',
    
  },
  gradeVal: {
    fontSize: 24,
    fontWeight: '400',
  },
  gradeOut: {
    fontSize: 18,
    fontWeight: '400',
    alignSelf: 'flex-end',
    opacity: 0.6,
  },
});

export default GradesSimulatorMenu;