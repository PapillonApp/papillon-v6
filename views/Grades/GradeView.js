import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import {
  GraduationCap,
  Share,
  SquareAsterisk,
  UserMinus,
  UserPlus,
  Users2,
} from 'lucide-react-native';

import { useEffect, useLayoutEffect } from 'react';
import { PressableScale } from 'react-native-pressable-scale';

import formatCoursName from '../../utils/FormatCoursName';
import GetUIColors from '../../utils/GetUIColors';

function GradeView({ route, navigation }) {
  const theme = useTheme();
  const { grade } = route.params;
  const UIColors = GetUIColors();

  function shareGrade() {
    Alert.alert(
      'Partager la note',
      "Le partage de la note n'est pas encore disponible.",
      [{ text: 'OK' }]
    );
  }

  let mainColor = '#888888';
  if (grade.color) {
    mainColor = grade.color;
  }

  let { description } = grade;
  if (description === '') {
    description = 'Aucune description';
  }

  // fix (temp) des notes
  grade.grade.value = grade.grade.value / 20 * grade.grade.out_of;
  grade.grade.max = grade.grade.max / 20 * grade.grade.out_of;
  grade.grade.min = grade.grade.min / 20 * grade.grade.out_of;
  grade.grade.average = grade.grade.average / 20 * grade.grade.out_of;

  // correct class averages
  grade.grade.average = (grade.grade.average / 20) * grade.grade.out_of;
  grade.grade.max = (grade.grade.max / 20) * grade.grade.out_of;
  grade.grade.min = (grade.grade.min / 20) * grade.grade.out_of;

  // change header title component
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: description,
      headerStyle: {
        backgroundColor: mainColor,
      },
      headerShadowVisible: false,
      mdTitleColor: '#ffffff',
      headerTintColor: '#ffffff',
      headerRight: () => (
        <TouchableOpacity onPress={() => shareGrade()}>
          <Share size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, grade]);

  const formattedValue = parseFloat(grade.grade.value).toFixed(2);
  const valueTop = formattedValue.split('.')[0];
  const valueBottom = formattedValue.split('.')[1];

  return (
    <>
      <StatusBar
        animated
        backgroundColor={mainColor}
        barStyle="light-content"
      />
      <View style={[styles.gradeHeader, { backgroundColor: mainColor }]}>
        <View style={[styles.gradeHeaderTitle]}>
          <Text style={[styles.gradeHeaderSubject]}>
            {formatCoursName(grade.subject.name)}
          </Text>
          <Text style={[styles.gradeHeaderDate]}>
            {new Date(grade.date).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View style={[styles.gradeHeaderGrade]}>
          {grade.grade.significant === 0 ? (
            <>
              <Text style={[styles.gradeHeaderGradeValueTop]}>{valueTop}</Text>
              <Text style={[styles.gradeHeaderGradeValueBottom]}>
                .{valueBottom}
              </Text>
            </>
          ) : grade.grade.significant === 3 ? (
            <Text style={[styles.gradeHeaderGradeValueTop]}>Abs.</Text>
          ) : (
            <Text style={[styles.gradeHeaderGradeValueTop]}>N.not</Text>
          )}

          <Text style={[styles.gradeHeaderGradeScale]}>
            /{grade.grade.out_of}
          </Text>
        </View>
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: UIColors.background }}
      >
        <View style={styles.optionsList}>
          <Text style={styles.ListTitle}>Détails de la note</Text>

          <PressableScale
            style={[
              styles.gradeDetail,
              {
                backgroundColor: UIColors.element,
                borderColor: theme.dark ? '#191919' : '#e5e5e5',
              },
            ]}
          >
            <SquareAsterisk
              color={!theme.dark ? '#000' : '#fff'}
              style={[styles.averageIcon]}
            />

            <Text style={[styles.gradeDetailTitle]}>Coeff.</Text>
            <Text style={[styles.gradeDetailValue]}>
              x {parseFloat(grade.grade.coefficient).toFixed(2)}
            </Text>
          </PressableScale>
          {grade.grade.significant === 0 && grade.grade.out_of !== 20 ? (
            <PressableScale
              style={[
                styles.gradeDetail,
                {
                  backgroundColor: UIColors.element,
                  borderColor: theme.dark ? '#191919' : '#e5e5e5',
                },
              ]}
            >
              <GraduationCap
                color={!theme.dark ? '#000' : '#fff'}
                style={[styles.averageIcon]}
              />
              <Text style={[styles.gradeDetailTitle]}>Remis sur /20</Text>
              <View style={[styles.gradeDetailRight]}>
                <Text style={[styles.gradeDetailValue]}>
                  {parseFloat(
                    (grade.grade.value / grade.grade.out_of) * 20
                  ).toFixed(2)}
                </Text>
                <Text style={[styles.gradeDetailValueSub]}>/20</Text>
              </View>
            </PressableScale>
          ) : null}
        </View>

        <View style={styles.optionsList}>
          <Text style={styles.ListTitle}>Moyennes</Text>

          <PressableScale
            style={[
              styles.gradeDetail,
              {
                backgroundColor: UIColors.element,
                borderColor: theme.dark ? '#191919' : '#e5e5e5',
              },
            ]}
          >
            <Users2
              color={!theme.dark ? '#000' : '#fff'}
              style={[styles.averageIcon]}
            />
            <Text style={[styles.gradeDetailTitle]}>Classe</Text>
            <View style={[styles.gradeDetailRight]}>
              <Text style={[styles.gradeDetailValue]}>
                {parseFloat(grade.grade.average).toFixed(2)}
              </Text>
              <Text style={[styles.gradeDetailValueSub]}>
                /{grade.grade.out_of}
              </Text>
            </View>
          </PressableScale>
          <PressableScale
            style={[
              styles.gradeDetail,
              {
                backgroundColor: UIColors.element,
                borderColor: theme.dark ? '#191919' : '#e5e5e5',
              },
            ]}
          >
            <UserPlus
              color={!theme.dark ? '#000' : '#fff'}
              style={[styles.averageIcon]}
            />
            <Text style={[styles.gradeDetailTitle]}>Max.</Text>
            <View style={[styles.gradeDetailRight]}>
              <Text style={[styles.gradeDetailValue]}>
                {parseFloat(grade.grade.max).toFixed(2)}
              </Text>
              <Text style={[styles.gradeDetailValueSub]}>
                /{grade.grade.out_of}
              </Text>
            </View>
          </PressableScale>
          <PressableScale
            style={[
              styles.gradeDetail,
              {
                backgroundColor: UIColors.element,
                borderColor: theme.dark ? '#191919' : '#e5e5e5',
              },
            ]}
          >
            <UserMinus
              color={!theme.dark ? '#000' : '#fff'}
              style={[styles.averageIcon]}
            />
            <Text style={[styles.gradeDetailTitle]}>Min.</Text>
            <View style={[styles.gradeDetailRight]}>
              <Text style={[styles.gradeDetailValue]}>
                {parseFloat(grade.grade.min).toFixed(2)}
              </Text>
              <Text style={[styles.gradeDetailValueSub]}>
                /{grade.grade.out_of}
              </Text>
            </View>
          </PressableScale>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    gap: 9,
    marginTop: 16,
    marginHorizontal: 14,
  },
  ListTitle: {
    paddingLeft: 14,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },

  gradeHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
  },
  gradeHeaderTitle: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 2,
    maxWidth: '72%',
  },
  gradeHeaderSubject: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
    color: '#fff',
  },
  gradeHeaderDate: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    color: '#fff',
    opacity: 0.6,
  },

  gradeHeaderGrade: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: 1,
    minWidth: 100,
  },
  gradeHeaderGradeValueTop: {
    fontSize: 36,
    fontFamily: 'Papillon-Medium',
    color: '#fff',
    letterSpacing: 0.5,
  },
  gradeHeaderGradeValueBottom: {
    fontSize: 24,
    fontFamily: 'Papillon-Medium',
    color: '#fff',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  gradeHeaderGradeScale: {
    fontSize: 20,
    fontFamily: 'Papillon-Medium',
    color: '#fff',
    opacity: 0.6,
    marginBottom: 2,
    letterSpacing: 0.5,
  },

  gradeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 18,
    borderRadius: 12,
  },
  averageIcon: {
    opacity: 0.7,
    marginBottom: 1,
  },
  gradeDetailTitle: {
    fontSize: 17,
    fontFamily: 'Papillon-Medium',
    opacity: 0.6,
    flex: 1,
  },
  gradeDetailRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 0,
    marginBottom: 1,
  },
  gradeDetailValue: {
    fontSize: 18,
    fontFamily: 'Papillon-Semibold',
    letterSpacing: 0.15,
  },
  gradeDetailValueSub: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.6,
    letterSpacing: 0.15,
  },
});

export default GradeView;
