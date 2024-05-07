import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';

import {
  Diff,
  GraduationCap,
  Percent,
  SquareAsterisk,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users2,
  ChevronLeft,
  Link,
  File,
  X,
} from 'lucide-react-native';

import { RegisterTrophy } from '../Settings/TrophiesScreen';

import { useLayoutEffect } from 'react';
import { getSavedCourseColor } from '../../utils/cours/ColorCoursName';

import formatCoursName from '../../utils/cours/FormatCoursName';
import GetUIColors from '../../utils/GetUIColors';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import * as WebBrowser from 'expo-web-browser';

import { calculateSubjectAverage } from '../../utils/grades/averages';
import { PapillonGrades } from '../../fetch/types/grades';
import { PapillonAttachmentType } from '../../fetch/types/attachment';

function GradeView({ route, navigation }) {
  const { grade, allGrades } = route.params as {
    grade: PapillonGrades['grades'][number];
    allGrades: any; // TODO ?
  };
  const UIColors = GetUIColors();

  const openURL = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: 'pageSheet',
      type: 'dismiss',
      controlsColor: UIColors.primary,
    });
  };

  useEffect(() => {
    RegisterTrophy('trophy_grades_view');
  }, []);

  const [modalLoading, setModalLoading] = useState(false);
  const [modalLoadingText, setModalLoadingText] = useState('');

  const [isShared , setIsShared] = useState(false);

  let mainColor = '#888888';
  if (grade.background_color) {
    mainColor = getSavedCourseColor(grade.subject.name, grade.background_color);
  }

  let { description } = grade;
  if (description === '') {
    description = 'Aucune description';
  }

  // change header title component
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: description,
      headerStyle: {
        backgroundColor: mainColor,
      },
      headerShadowVisible: false,
      headerLeft: () => (
        Platform.OS === 'ios' ? ( 
          Platform.isPad ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iosBack}>
              <X size={26} color="#fff" style={styles.iosBackIcon} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iosBack}>
              <ChevronLeft size={26} color="#fff" style={styles.iosBackIcon} />
            </TouchableOpacity>
          )) : null
      ),
    });
  }, [navigation, grade]);

  const [average, setAverage] = useState(0);
  const [averageWithoutGrade, setAverageWithoutGrade] = useState(0);
  const [avgInfluence, setAvgInfluence] = useState(0);
  const [avgPercentInfluence, setAvgPercentInfluence] = useState(0);
  const [classAvg, setClassAvg] = useState(0);
  const [classAvgWithoutGrade, setClassAvgWithoutGrade] = useState(0);
  const [classAvgInfluence, setClassAvgInfluence] = useState(0);
  const [valueTop, setValueTop] = useState(0);
  const [valueBottom, setValueBottom] = useState(0);
  const typeSignificantType: { [key: string]: string } = {
    '-1|ERROR': 'Erreur',
    '1|ABSENT': 'Abs.',
    '2|EXEMPTED': 'Disp.',
    '3|NOT_GRADED': 'N.not',
    '4|UNFIT': 'Inap.',
    '5|UNRETURNED': 'N.Rdu',
    '6|ABSENT_ZERO': 'Abs.0',
    '7|UNRETURNED_ZERO': 'N.Rdu.0',
    '8|CONGRATULATIONS': 'Félicitations',
  };

  async function calculateInfluence(forgr, grlwg) {
    const naverage = await calculateSubjectAverage(forgr, 'value');
    const naverageWithoutGrade = await calculateSubjectAverage(grlwg, 'value');
    const navgInfluence = naverage - naverageWithoutGrade;
    const navgPercentInfluence = (navgInfluence / naverage) * 100 || 0;
    const nclassAvg = await calculateSubjectAverage(forgr, 'average');
    const nclassAvgWithoutGrade = await calculateSubjectAverage(grlwg, 'average');
    const nclassAvgInfluence = nclassAvg - nclassAvgWithoutGrade;

    setAverage(naverage);
    setAverageWithoutGrade(naverageWithoutGrade);
    setAvgInfluence(navgInfluence);
    setAvgPercentInfluence(navgPercentInfluence);
    setClassAvg(nclassAvg);
    setClassAvgWithoutGrade(nclassAvgWithoutGrade);
    setClassAvgInfluence(nclassAvgInfluence);
  }

  useEffect(() => {
    const formatDate = (dateString) => new Date(dateString).getTime();

    const date = formatDate(grade.date);
    const formattedGrades = allGrades.filter(grade => formatDate(grade.date) <= date);

    const formattedValue = parseFloat(grade.grade.value.value).toFixed(2);
    setValueTop(formattedValue.split('.')[0]);
    setValueBottom(formattedValue.split('.')[1]);

    const gradesListWithoutGrade = formattedGrades.filter(g => g.id !== grade.id);
  
    calculateInfluence(formattedGrades, gradesListWithoutGrade);
  }, []);

  useEffect(() => {
    if(grade.share && grade.share.status) {
      setIsShared(true);
    }
  }, [grade, isShared]);

  return (
    <>
      <StatusBar
        animated
        backgroundColor={mainColor}
        barStyle="light-content"
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalLoading}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000000a5',
          gap: 10,
        }}>
          <ActivityIndicator color="#ffffff" />
          <NativeText heading="p" style={{color: '#ffffff'}}>
            {modalLoadingText}
          </NativeText>
        </View>
      </Modal>
      <View style={[styles.gradeHeader, { backgroundColor: mainColor }]}>
        <View style={[styles.gradeHeaderTitle]}>
          <Text style={[styles.gradeHeaderSubject]} numberOfLines={1} ellipsizeMode='tail'>
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
          {grade.grade.value.significant === false && (
            <>
              <Text style={[styles.gradeHeaderGradeValueTop]}>{valueTop}</Text>
              <Text style={[styles.gradeHeaderGradeValueBottom]}>
                .{valueBottom}
              </Text>
              <Text style={[styles.gradeHeaderGradeScale]}>
                /{grade.grade.out_of.value}
              </Text>
            </>
          )}

          {grade.grade.value.significant === true && (<>
            <Text style={[styles.gradeHeaderGradeValueTop]}>
              {typeSignificantType[grade.grade.value.type]}
            </Text>
          </>)}

        </View>
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: UIColors.modalBackground }}
      >
        {isShared && grade.share.name ? (
          <NativeList inset>
            <NativeItem
              leading={
                <Users2 color={UIColors.text} />
              }
              trailing={
                <NativeText heading="h4">
                  {grade.share.name}
                </NativeText>
              }
            >
              <NativeText heading="p2">
                Partagée par
              </NativeText>
            </NativeItem>
          </NativeList>
        ) : null}

        <NativeList
          inset
          header="Détails de la note"
        >
          <NativeItem
            leading={
              <SquareAsterisk color={UIColors.text} />
            }
            trailing={
              <NativeText heading="h4">
                x {parseFloat(grade.grade.coefficient).toFixed(2)}
              </NativeText>
            }
          >
            <NativeText heading="p2">
              Coefficient
            </NativeText>
          </NativeItem>
          
          <NativeItem
            leading={
              <GraduationCap color={UIColors.text} />
            }
            trailing= {
              <View style={[styles.gradeDetailRight]}>
                
                {grade.grade.value.significant === true && (<>
                  <Text style={[styles.gradeDetailValue]}>
                    {typeSignificantType[grade.grade.value.type]}
                  </Text>
                </>)}

                {grade.grade.value.significant === false && (<>
                  <Text style={[styles.gradeDetailValue]}>
                    {parseFloat(
                      (grade.grade.value.value / grade.grade.out_of.value) * 20
                    ).toFixed(2)}
                  </Text>
                  <Text style={[styles.gradeDetailValueSub]}>/20</Text>
                </>)}
              </View>
            }
          >
            <NativeText heading="p2">
              Remis sur /20
            </NativeText>
          </NativeItem>
        </NativeList>

        <NativeList
          inset
          header="Moyennes"
        >
          <NativeItem
            leading={
              <Users2 color={UIColors.text} />
            }
            trailing={
              <View style={[styles.gradeDetailRight]}>
                <Text style={[styles.gradeDetailValue]}>
                  {isNaN(grade.grade.average.value)? 'N.not' : parseFloat(grade.grade.average.value).toFixed(2)}
                </Text>
                <Text style={[styles.gradeDetailValueSub]}>
                  /{grade.grade.out_of.value}
                </Text>
              </View>
            }
          >
            <NativeText heading="p2">
              Moy. de la classe
            </NativeText>
          </NativeItem>
          <NativeItem
            leading={
              <TrendingDown color={UIColors.text} />
            }
            trailing={
              <View style={[styles.gradeDetailRight]}>
                <Text style={[styles.gradeDetailValue]}>
                  {isNaN(grade.grade.min.value)? 'N.not' : parseFloat(grade.grade.min.value).toFixed(2)}
                </Text>
                <Text style={[styles.gradeDetailValueSub]}>
                  /{grade.grade.out_of.value}
                </Text>
              </View>
            }
          >
            <NativeText heading="p2">
              Note minimale
            </NativeText>
          </NativeItem>
          <NativeItem
            leading={
              <TrendingUp color={UIColors.text} />
            }
            trailing={
              <View style={[styles.gradeDetailRight]}>
                <Text style={[styles.gradeDetailValue]}>
                  {isNaN(grade.grade.max.value)? 'N.not' : parseFloat(grade.grade.max.value).toFixed(2)}
                </Text>
                <Text style={[styles.gradeDetailValueSub]}>
                  /{grade.grade.out_of.value}
                </Text>
              </View>
            }
          >
            <NativeText heading="p2">
              Note maximale
            </NativeText>
          </NativeItem>
        </NativeList>

        {allGrades.length > 1 ? (
          <NativeList
            inset
            header="Influence"
          >
            <NativeItem
              leading={
                <UserPlus color={UIColors.text} />
              }
              trailing={
                avgInfluence == 0 ? (
                  <NativeText heading="h4">
                    {parseFloat(avgInfluence)} pts
                  </NativeText>
                ) : avgInfluence > 0 ? (
                  <NativeText heading="h4" style={{ color: '#1AA989' }}>
                  + {parseFloat(avgInfluence).toFixed(2)} pts
                  </NativeText>
                ) : (
                  <NativeText heading="h4" style={{ color: '#D81313' }}>
                  - {parseFloat(avgInfluence).toFixed(2) * -1} pts
                  </NativeText>
                )
              }
            >
              <NativeText heading="p2">
              Moyenne générale
              </NativeText>
            </NativeItem>
            <NativeItem
              leading={
                <Users2 color={UIColors.text} />
              }
              trailing={
                classAvgInfluence > 0 ? (
                  <NativeText heading="h4">
                  + {parseFloat(classAvgInfluence).toFixed(2)} pts
                  </NativeText>
                ) : (
                  <NativeText heading="h4">
                  - {parseFloat(classAvgInfluence).toFixed(2) * -1} pts
                  </NativeText>
                )
              }
            >
              <NativeText heading="p2">
              Moyenne de classe
              </NativeText>
            </NativeItem>
            <NativeItem
              leading={
                <Percent color={UIColors.text} />
              }
              trailing={
                avgPercentInfluence == 0 ? (
                  <NativeText heading="h4">
                    {parseFloat(avgPercentInfluence)} %
                  </NativeText>
                ) : avgPercentInfluence > 0 ? (
                  <NativeText heading="h4" style={{ color: '#1AA989' }}>
                  + {parseFloat(avgPercentInfluence).toFixed(2)} %
                  </NativeText>
                ) : (
                  <NativeText heading="h4" style={{ color: '#D81313' }}>
                  - {parseFloat(avgPercentInfluence).toFixed(2) * -1} %
                  </NativeText>
                )
              }
            >
              <NativeText heading="p2">
              Pourcentage d'influence
              </NativeText>
              <NativeText heading="subtitle2">
              sur la moyenne générale
              </NativeText>
            </NativeItem>
          </NativeList>
        ) : null}

        <NativeList
          inset
          header="Informations"
        >
          <NativeItem
            leading={
              <Diff color={UIColors.text} />
            }
            trailing={
              isNaN((grade.grade.value.value - grade.grade.average.value).toFixed(2)) || (grade.grade.value.value - grade.grade.average.value).toFixed(2) == 0  ? (
                <NativeText heading="h4">
                  0 pts
                </NativeText>
              ) : (grade.grade.value.value - grade.grade.average.value).toFixed(2) > 0 ? (
                <NativeText heading="h4" style={{ color: '#1AA989' }}>
                  + {(grade.grade.value.value - grade.grade.average.value).toFixed(2)} pts
                </NativeText>
              ) : (
                <NativeText heading="h4" style={{ color: '#D81313' }}>
                  - {(grade.grade.value.value - grade.grade.average.value).toFixed(2) * -1} pts
                </NativeText>
              )
            }
          >
            <NativeText heading="p2">
              Diff. avec la moyenne
            </NativeText>
          </NativeItem>
        </NativeList>

        {(grade.subjectFile || grade.correctionFile) && (
          <NativeList header="Fichiers" inset>
            {grade.subjectFile && (
              <NativeItem
                onPress={() => openURL(grade.subjectFile!.url)}
                leading={grade.subjectFile.type === PapillonAttachmentType.Link ? (
                  <Link size={24} color={UIColors.text} />
                ) : (
                  <File size={24} color={UIColors.text} />
                )}
              >
                <NativeText heading="h4">
                  Sujet: {grade.subjectFile.name}
                </NativeText>
                <NativeText numberOfLines={1}>
                  {grade.subjectFile.url}
                </NativeText>
              </NativeItem>
            )}

            {grade.correctionFile && (
              <NativeItem
                onPress={() => openURL(grade.correctionFile!.url)}
                leading={grade.correctionFile.type === PapillonAttachmentType.Link ? (
                  <Link size={24} color={UIColors.text} />
                ) : (
                  <File size={24} color={UIColors.text} />
                )}
              >
                <NativeText heading="h4">
                  Correction: {grade.correctionFile.name}
                </NativeText>
                <NativeText numberOfLines={1}>
                  {grade.correctionFile.url}
                </NativeText>
              </NativeItem>
            )}
          </NativeList> 
        )}

        <View style={{ height: 44 }} />
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
    flex: 1,
    marginRight: 10,
  },
  gradeHeaderSubject: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
    color: '#fff',
    flex: 1,
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

  iosBack: {
    width: 32,
    height: 32,

    borderRadius: 32,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#ffffff33',
  },

  iosBackIcon: {
    width: 0,
    height: 0,
    marginTop: -1,
    marginLeft: -1,
  },

  
});

export default GradeView;
