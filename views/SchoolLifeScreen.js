import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';

import { Text, useTheme } from 'react-native-paper';

import { Clock3, UserX } from 'lucide-react-native';
import { PressableScale } from 'react-native-pressable-scale';

import PapillonIcon from '../components/PapillonIcon';
import GetUIColors from '../utils/GetUIColors';
import PapillonLoading from '../components/PapillonLoading';
import { useAppContext } from '../utils/AppContext';

function SchoolLifeScreen() {
  const [viesco, setViesco] = useState(null);
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [isHeadLoading, setIsHeadLoading] = useState(false);

  const appctx = useAppContext();

  useEffect(() => {
    setIsHeadLoading(true);
    appctx.dataprovider.getViesco().then((v) => {
      setIsHeadLoading(false);
      setViesco(v);
    });
  }, []);

  // eslint-disable-next-line no-unused-vars
  const onRefresh = React.useCallback(() => {
    setIsHeadLoading(true);
    appctx.dataprovider.getViesco(true).then((v) => {
      setIsHeadLoading(false);
      setViesco(v);
    });
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
      contentInsetAdjustmentBehavior="automatic"
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

      {isHeadLoading ? (
        <PapillonLoading
          title="Chargement des évenements"
          subtitle="Veuillez patienter quelques instants..."
        />
      ) : null}

      {viesco ? (
        <>
          {viesco.absences.length === 0 &&
          viesco.delays.length === 0 &&
          !isHeadLoading ? (
            <PapillonLoading
              title="Aucun évenement"
              subtitle="Vous n'avez aucun évenement à afficher"
              icon={<UserX size={26} color={UIColors.primary} />}
            />
          ) : null}

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
                      {absence.hours}h manquées
                    </Text>
                    
                    {
                      // if from and to is same day :
                      (!absence.to || (new Date(absence.from).getDate() === new Date(absence.to).getDate())) ? (
<Text style={styles.absenceItemSubtitle}>
                      le{' '}
                      {new Date(absence.from).toLocaleDateString('fr', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'short',
                      })}
                    </Text>) : (
                      <Text style={styles.absenceItemSubtitle}>
                      du{' '}
                      {new Date(absence.from).toLocaleDateString('fr', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'short',
                      })} au {new Date(absence.to).toLocaleDateString('fr', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'short',
                      })}
                    </Text>
                    )
                    }

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
