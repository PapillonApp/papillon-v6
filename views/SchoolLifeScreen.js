import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';

import { Text, useTheme } from 'react-native-paper';

import { SFSymbol } from 'react-native-sfsymbols';
import PapillonInsetHeader from '../components/PapillonInsetHeader';

import { Clock3, UserX } from 'lucide-react-native';
import { PressableScale } from 'react-native-pressable-scale';

import PapillonIcon from '../components/PapillonIcon';
import GetUIColors from '../utils/GetUIColors';
import PapillonLoading from '../components/PapillonLoading';
import { useAppContext } from '../utils/AppContext';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

function SchoolLifeScreen({ navigation }) {
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

  const onRefresh = React.useCallback(() => {
    setIsHeadLoading(true);
    appctx.dataprovider.getViesco(true).then((v) => {
      setIsHeadLoading(false);
      setViesco(v);
    });
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Vie scolaire',
      headerBackTitle: 'Retour',
      headerTintColor: UIColors.text,
      headerShadowVisible: true,
    });
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.backgroundHigh }]}
      contentInsetAdjustmentBehavior="automatic"
    >
      <StatusBar
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />

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
            <NativeList header="Absences" inset>
              {viesco.absences?.map((absence, index) => (
                <NativeItem
                  key={index}
                  leading={!absence.justified ? (
                    <UserX size={24} color="#A84700" />
                  ) : (
                    <UserX size={24} color="#565EA3" />
                  )
                  }
                  trailing={!absence.justified ? (
                    <NativeText
                      style={[
                        styles.absenceItemStatusTitle,
                        styles.absenceItemStatusTitleToJustify,
                      ]}
                    >
                      A justifier
                    </NativeText>
                  ) : (
                    <NativeText style={[styles.absenceItemStatusTitle]}>
                      Justifiée
                    </NativeText>
                  )}
                >
                  <NativeText heading="h4">
                    {absence.hours} manquées
                  </NativeText>
                  {
                    // if from and to is same day :
                    (!absence.to || (new Date(absence.from).getDate() === new Date(absence.to).getDate())) ? (
                      <NativeText heading="p2">
                        le{' '}
                        {new Date(absence.from).toLocaleDateString('fr', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'short',
                        })}
                      </NativeText>
                    ) : (
                      <NativeText heading="p2">
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
                      </NativeText>
                    )
                  }

                  {absence.reasons.length > 0 ? (
                    <NativeText heading="subtitle2" style={{marginTop: 6}}>
                      {absence.reasons[0]}
                    </NativeText>
                  ) : null}
                </NativeItem>
              ))}
            </NativeList>
          ) : null}

          {viesco.delays && viesco.delays.length > 0 ? (
            <NativeList header="Retards" inset>
              {viesco?.delays?.map((delay, index) => (
                <NativeItem
                  key={index}
                  leading={!delay.justified ? (
                    <Clock3 size={24} color="#A84700" />
                    ) : (
                    <Clock3 size={24} color="#565EA3" />
                    )
                  }
                  trailing={!delay.justified ? (
                    <NativeText
                      style={[
                        styles.absenceItemStatusTitle,
                        styles.absenceItemStatusTitleToJustify,
                      ]}
                    >
                      A justifier
                    </NativeText>
                  ) : (
                    <NativeText style={[styles.absenceItemStatusTitle]}>
                      Justifiée
                    </NativeText>
                  )}
                >
                  <NativeText heading="h4">
                    Retard de {delay.duration} min.
                  </NativeText>
                  <NativeText heading="p2">
                    le{' '}
                      {new Date(delay.date).toLocaleDateString('fr', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'short',
                      })}
                  </NativeText>

                  {delay.reasons.length > 0 ? (
                      <NativeText
                        heading="subtitle2"
                        style={{
                          marginTop: 6
                        }}
                      >
                        {delay.reasons[0]}
                      </NativeText>
                  ) : null}
                </NativeItem>
              ))}
            </NativeList>
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
