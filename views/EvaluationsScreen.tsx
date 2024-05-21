import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Pressable,
  TouchableOpacity,
} from 'react-native';

import Fade from 'react-native-fade';

import { Text, useTheme } from 'react-native-paper';
import { PressableScale } from 'react-native-pressable-scale';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Newspaper } from 'lucide-react-native';
import formatCoursName from '../utils/cours/FormatCoursName';
import getClosestGradeEmoji from '../utils/cours/EmojiCoursName';
import GetUIColors from '../utils/GetUIColors';
import PapillonLoading from '../components/PapillonLoading';

import { useAppContext } from '../utils/AppContext';
import { WillBeSoon } from './Global/Soon';

import { getSavedCourseColor } from '../utils/cours/ColorCoursName';
import type { PapillonPeriod } from '../fetch/types/period';
import type { PapillonEvaluation } from '../fetch/types/evaluations';

type SortedEvaluations = {
  subject: PapillonEvaluation['subject']
  evaluations: PapillonEvaluation[]
};

function EvaluationsScreen({ navigation }: {
  navigation: any;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const UIColors = GetUIColors();
  const { showActionSheetWithOptions } = useActionSheet();

  const ABBREVIATION_COLORS = {
    'A': '#1C7B64',
    'A+': '#1C7B64',
    'B': UIColors.primary,
    'C': '#A84700',
    'D': '#B42828',
    '1': '#1C7B64',
    '2': UIColors.primary,
    '3': '#A84700',
    '4': '#B42828',
  };

  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<SortedEvaluations[]>([]);
  const [periods, setPeriods] = useState<PapillonPeriod[]>([]);

  const appContext = useAppContext();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Compétences',
      headerBackTitle: 'Retour',
      headerTintColor: UIColors.text,
      headerShadowVisible: true,
      headerRight: () => (
        <Fade visible={selectedPeriod} direction="up" duration={200}>
          <TouchableOpacity
            onPress={newPeriod}
            style={styles.periodButtonContainer}
          >
            <Text
              style={[styles.periodButtonText, { color: UIColors.text, fontFamily: 'Papillon-Medium', opacity: 0.5 }]}
            >
              {selectedPeriod ?? 'Chargement...'}
            </Text>
          </TouchableOpacity>
        </Fade>
      ),
    });
  }, [navigation, selectedPeriod]);

  function newPeriod() {
    const options = periods.map((period) => period.name);
    options.push('Annuler');

    showActionSheetWithOptions(
      {
        title: 'Changer de période',
        message: 'Sélectionnez la période de votre choix',
        options,
        cancelButtonIndex: options.length - 1,
        containerStyle: {
          paddingBottom: insets.bottom,
          backgroundColor: UIColors.elementHigh,
        },
        textStyle: {
          color: UIColors.text,
        },
        titleTextStyle: {
          color: UIColors.text,
          fontWeight: 'bold',
        },
        messageTextStyle: {
          color: UIColors.text,
        },
      },
      (selectedIndex) => {
        if (typeof selectedIndex === 'undefined' || selectedIndex === options.length - 1) return;
        const selectedPeriod = periods[selectedIndex];
        setSelectedPeriod(selectedPeriod.name);
      }
    );
  }

  async function getPeriods() {
    if (!appContext.dataProvider) return;
    const user = await appContext.dataProvider.getUser(false);
    const periods = user.periodes.evaluations;
    
    setPeriods(periods);
    const currentPeriod = periods.find((period) => period.actual)!;

    setSelectedPeriod(currentPeriod.name);
    return currentPeriod;
  }

  React.useEffect(() => { getPeriods(); }, []);

  useEffect(() => {
    (async () => {
      if (!appContext.dataProvider || !selectedPeriod) return;
      setIsHeadLoading(true);
  
      const evaluations = await appContext.dataProvider.getEvaluations(selectedPeriod, false);
      const finalEvaluations: SortedEvaluations[] = [];
  
      // for each eval, sort by subject
      for (const item of evaluations ?? []) {
        const { subject } = item;
        // Find the subject by its name
        const currentSubject = finalEvaluations.find((item) => item.subject.name === subject.name);
  
        if (typeof currentSubject !== 'undefined') {
          currentSubject.evaluations.push(item);
        }
        else {
          finalEvaluations.push({
            subject,
            evaluations: [item],
          });
        }
      }
  
      setEvaluations(finalEvaluations);
      setIsHeadLoading(false);

    })();
  }, [appContext.dataProvider, selectedPeriod]);

  const [isHeadLoading, setIsHeadLoading] = useState(false);

  if (appContext.dataProvider?.service === 'skolengo') {
    return (
      <ScrollView
        style={{ backgroundColor: UIColors.background }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <StatusBar
          translucent
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />

        <WillBeSoon name="Les compétences" plural />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: UIColors.backgroundHigh }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <StatusBar
        translucent
        animated
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />

      {isHeadLoading ? (
        <PapillonLoading
          title="Chargement des évaluations"
          subtitle="Veuillez patienter quelques instants..."
        />
      ) : null}

      {evaluations.length === 0 && !isHeadLoading && (
        <PapillonLoading
          title="Aucune évaluation"
          subtitle="Vous n'avez aucune évaluation pour le moment"
          icon={<Newspaper size={24} color={UIColors.text} />}
        />
      )}

      {evaluations.length > 0
        ? evaluations.map((subject, index) => (
          <View
            key={index}
            style={[
              styles.subjectContainer,
              { backgroundColor: UIColors.element },
            ]}
          >
            <Pressable
              style={[
                styles.subjectNameContainer,
                { backgroundColor: getSavedCourseColor(subject.subject.name, UIColors.primary) },
              ]}
            >
              <Text style={[styles.subjectName]}>
                {formatCoursName(subject.subject.name)}
              </Text>
            </Pressable>
            <View style={[styles.competencesList]}>
              {subject.evaluations.map((evaluation, id) => (
                <View
                  key={id}
                  style={[
                    styles.competenceContainer,
                    {
                      borderColor: theme.dark ? '#ffffff20' : '#00000015',
                      borderBottomWidth:
                          id !== subject.evaluations.length - 1 ? 1 : 0,
                    },
                  ]}
                >
                  <PressableScale style={[styles.competence]}>
                    <View style={styles.competenceEmojiContainer}>
                      <Text style={[styles.competenceEmoji]}>
                        {getClosestGradeEmoji(evaluation.subject.name)}
                      </Text>
                    </View>
                    <View style={styles.competenceNameContainer}>
                      <Text style={[styles.competenceName]}>
                        {formatCoursName(evaluation.name)}
                      </Text>
                      <Text style={[styles.competenceDate]}>
                        {new Date(evaluation.date).toLocaleDateString('fr', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                    <View style={styles.competenceGradeContainer}>
                      {evaluation.acquisitions
                        .slice(0, 3)
                        .map((acquisition) => (
                          <View
                            key={acquisition.id}
                            style={[
                              styles.competenceGrade,
                              { backgroundColor: ABBREVIATION_COLORS[acquisition.abbreviation as keyof typeof ABBREVIATION_COLORS] }
                            ]}
                          >
                            <Text style={styles.competenceGradeText}>
                              {acquisition.abbreviation === 'A+' ? '+' : acquisition.abbreviation}
                            </Text>
                          </View>
                        ))
                      }
                      {evaluation.acquisitions.length > 3 && (
                        <View
                          style={[
                            styles.competenceGrade,
                            { backgroundColor: '#888' },
                          ]}
                        >
                          <Text style={styles.competenceGradeText}>...</Text>
                        </View>
                      )}
                    </View>
                  </PressableScale>
                </View>
              ))}
            </View>
          </View>
        ))
        : null}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  subjectContainer: {
    marginTop: 14,
    marginHorizontal: 14,
    borderRadius: 12,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },

  subjectNameContainer: {
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subjectName: {
    fontSize: 16,
    fontFamily: 'Papillon-Semibold',
    color: '#fff',
  },

  competencesList: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },

  competenceContainer: {
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },

  periodButtonContainer: {
    position: 'absolute',
    top: -16,
    right: 0,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  periodButtonText: {
    fontSize: 17,
    color: '#21826A',
  },

  competence: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
    gap: 16,
  },

  competenceNameContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
  },

  competenceName: {
    fontSize: 16,
    fontFamily: 'Papillon-Semibold',
  },
  competenceDate: {
    fontSize: 15,
    marginTop: 2,
    opacity: 0.5,
  },

  competenceEmojiContainer: {},
  competenceEmoji: {
    fontSize: 24,
  },

  competenceGradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  competenceGrade: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ffffff20',
    borderWidth: 1,
  },
  competenceGradeText: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    color: '#fff',
    marginLeft: 1,
    opacity: 0.7,
  },
});

export default EvaluationsScreen;
