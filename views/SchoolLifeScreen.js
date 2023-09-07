import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';

import { Text, useTheme } from 'react-native-paper';

import { Clock3, UserX } from 'lucide-react-native';
import { PressableScale } from 'react-native-pressable-scale';
import { IndexData } from '../fetch/IndexData';

import PapillonIcon from '../components/PapillonIcon';
import GetUIColors from '../utils/GetUIColors';

function SchoolLifeScreen() {
  const [viesco, setViesco] = useState(null);
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [isHeadLoading, setIsHeadLoading] = useState(false);

  useEffect(() => {
    setIsHeadLoading(true);
    IndexData.getViesco().then((v) => {
      setIsHeadLoading(false);
      setViesco(v);
    });
  }, []);

  const onRefresh = React.useCallback(() => {
    setIsHeadLoading(true);
    IndexData.getViesco(true).then((v) => {
      setIsHeadLoading(false);
      setViesco(v);
    });
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={isHeadLoading}
          onRefresh={onRefresh}
          colors={[Platform.OS === 'android' ? '#29947A' : null]}
        />
      }
    >
      {Platform.OS === 'ios' ? (
        <StatusBar animated barStyle="light-content" />
      ) : (
        <StatusBar
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
      )}

      {viesco ? (
        <>
          {viesco.absences && viesco.absences.length > 0 ? (
            <View style={styles.optionsList}>
              <Text style={styles.ListTitle}>Absences</Text>

              {viesco.absences?.map((absence, index) => (
                <PressableScale
                  key={index}
                  style={[
                    styles.absenceItem,
                    {
                      backgroundColor: UIColors.element,
                    },
                  ]}
                >
                  <PapillonIcon
                    icon={<UserX size={24} color="#A84700" />}
                    color="#A84700"
                    small
                  />
                  <View style={styles.absenceItemData}>
                    <Text style={styles.absenceItemTitle}>
                      {absence.hours} manquées
                    </Text>
                    <Text style={styles.absenceItemSubtitle}>
                      le{' '}
                      {new Date(absence.from).toLocaleDateString('fr', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'short',
                      })}
                    </Text>

                    {absence.reasons.length > 0 ? (
                      <Text
                        style={[
                          styles.absenceItemSubtitle,
                          styles.absenceReason,
                        ]}
                      >
                        {absence.reasons[0]}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.absenceItemStatus}>
                    {!absence.justified ? (
                      <Text
                        style={[
                          styles.absenceItemStatusTitle,
                          styles.absenceItemStatusTitleToJustify,
                        ]}
                      >
                        A justifier
                      </Text>
                    ) : (
                      <Text style={[styles.absenceItemStatusTitle]}>
                        Justifiée
                      </Text>
                    )}
                  </View>
                </PressableScale>
              ))}
            </View>
          ) : null}

          {viesco.delays && viesco.delays.length > 0 ? (
            <View style={styles.optionsList}>
              <Text style={styles.ListTitle}>Retards</Text>

              {viesco?.delays?.map((delay, index) => (
                <PressableScale
                  key={index}
                  style={[
                    styles.absenceItem,
                    {
                      backgroundColor: UIColors.element,
                    },
                  ]}
                >
                  <PapillonIcon
                    icon={<Clock3 size={24} color="#565EA3" />}
                    color="#565EA3"
                    small
                  />
                  <View style={styles.absenceItemData}>
                    <Text style={styles.absenceItemTitle}>
                      Retard de {delay.duration} min.
                    </Text>
                    <Text style={styles.absenceItemSubtitle}>
                      le{' '}
                      {new Date(delay.date).toLocaleDateString('fr', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'short',
                      })}
                    </Text>

                    {delay.reasons.length > 0 ? (
                      <Text
                        style={[
                          styles.absenceItemSubtitle,
                          styles.absenceReason,
                        ]}
                      >
                        {delay.reasons[0]}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.absenceItemStatus}>
                    {!delay.justified ? (
                      <Text
                        style={[
                          styles.absenceItemStatusTitle,
                          styles.absenceItemStatusTitleToJustify,
                        ]}
                      >
                        A justifier
                      </Text>
                    ) : (
                      <Text style={[styles.absenceItemStatusTitle]}>
                        Justifiée
                      </Text>
                    )}
                  </View>
                </PressableScale>
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      <View style={{ height: 20 }} />
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
