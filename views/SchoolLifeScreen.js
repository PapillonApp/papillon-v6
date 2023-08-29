import React from 'react';
import { StyleSheet, View, Button, ScrollView, StatusBar, Platform } from 'react-native';

import { Text, useTheme } from 'react-native-paper';
import { useEffect, useState } from 'react';

import { getViesco } from '../fetch/PronoteData/PronoteViesco';
import { PressableScale } from 'react-native-pressable-scale';
import { Clock3, UserX } from 'lucide-react-native';

import PapillonIcon from '../components/PapillonIcon';

function SchoolLifeScreen({ navigation }) {
  const [viesco, setViesco] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    getViesco().then((viesco) => {
      setViesco(viesco);
    });
  }, []);

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior='automatic'>
      { Platform.OS === 'ios' ?
        <StatusBar animated barStyle={'light-content'} />
      :
        <StatusBar animated barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor={theme.dark ? '#121212' : '#ffffff'} />
      }
      
      { viesco ? (
        <>
          { viesco.absences.length > 0 ? (
            <View style={styles.optionsList}>
              <Text style={styles.ListTitle}>Absences</Text>

              {viesco.absences.map((absence, index) => {
                return (
                  <PressableScale key={index} style={[styles.absenceItem, {
                    backgroundColor: theme.dark ? '#151515' : '#FFFFFF',
                  }]}>
                    <PapillonIcon
                      icon={<UserX size={24} color={'#A84700'} />}
                      color="#A84700"
                      small
                    />
                    <View style={styles.absenceItemData}>
                      <Text style={styles.absenceItemTitle}>{absence.hours} manquées</Text>
                      <Text style={styles.absenceItemSubtitle}>le {new Date(absence.from).toLocaleDateString('fr', {weekday: 'long', day: '2-digit', month: 'short'})}</Text>

                      { absence.reasons.length > 0 ? (
                        <Text style={[styles.absenceItemSubtitle, styles.absenceReason]}>{absence.reasons[0]}</Text>
                      ) : null }
                    </View>
                    <View style={styles.absenceItemStatus}>
                      { !absence.justified ? (
                        <Text style={[styles.absenceItemStatusTitle, styles.absenceItemStatusTitleToJustify]}>A justifier</Text>
                      ) : (
                        <Text style={[styles.absenceItemStatusTitle]}>Justifiée</Text>
                      ) }
                    </View>
                  </PressableScale>
                )
              })}
            </View>
          ) : null }

          { viesco.delays.length > 0 ? (
            <View style={styles.optionsList}>
              <Text style={styles.ListTitle}>Retards</Text>

              {viesco.delays.map((delay, index) => {
                return (
                  <PressableScale key={index} style={[styles.absenceItem, {
                    backgroundColor: theme.dark ? '#151515' : '#FFFFFF',
                  }]}>
                    <PapillonIcon
                      icon={<Clock3 size={24} color={'#565EA3'} />}
                      color="#565EA3"
                      small
                    />
                    <View style={styles.absenceItemData}>
                      <Text style={styles.absenceItemTitle}>Retard de {delay.duration} min.</Text>
                      <Text style={styles.absenceItemSubtitle}>le {new Date(delay.date).toLocaleDateString('fr', {weekday: 'long', day: '2-digit', month: 'short'})}</Text>

                      { delay.reasons.length > 0 ? (
                        <Text style={[styles.absenceItemSubtitle, styles.absenceReason]}>{delay.reasons[0]}</Text>
                      ) : null }
                    </View>
                    <View style={styles.absenceItemStatus}>
                      { !delay.justified ? (
                        <Text style={[styles.absenceItemStatusTitle, styles.absenceItemStatusTitleToJustify]}>A justifier</Text>
                      ) : (
                        <Text style={[styles.absenceItemStatusTitle]}>Justifiée</Text>
                      ) }
                    </View>
                  </PressableScale>
                )
              })}
            </View>
          ) : null }
        </>
      ) : null }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    gap: 9,
    marginTop: 21,
    marginHorizontal: 14,
  },
  ListTitle: {
    paddingLeft: 18,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },

  absenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderCurve: 'continuous',
    gap: 16,
  },

  absenceItemData: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 0,
    flex: 1,
  },

  absenceItemTitle: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
  },

  absenceItemSubtitle: {
    fontSize: 15,
    opacity: 0.5,
    marginTop: 2,
  },

  absenceReason: {
    opacity: 1,
    marginTop: 7,
  },

  absenceItemStatus: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 0,
  },

  absenceItemStatusTitle: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },

  absenceItemStatusTitleToJustify: {
    color: '#A84700',
    opacity: 1,
  },
});

export default SchoolLifeScreen;