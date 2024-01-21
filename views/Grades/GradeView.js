import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  Platform,
  Share as ShareUI,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import Config from 'react-native-config';

import {
  Diff,
  GraduationCap,
  Percent,
  Share,
  SquareAsterisk,
  TrendingDown,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users2,
  ChevronLeft,
} from 'lucide-react-native';

import { useLayoutEffect } from 'react';
import { PressableScale } from 'react-native-pressable-scale';
import { getSavedCourseColor } from '../../utils/ColorCoursName';

import formatCoursName from '../../utils/FormatCoursName';
import GetUIColors from '../../utils/GetUIColors';
import { useAppContext } from '../../utils/AppContext';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import { Buffer } from 'buffer';

import {calculateAverage, calculateSubjectAverage} from '../../utils/grades/averages';

function GradeView({ route, navigation }) {
  const appctx = useAppContext();
  const theme = useTheme();
  const { grade, allGrades } = route.params;
  const UIColors = GetUIColors();

  const [modalLoading, setModalLoading] = React.useState(false);
  const [modalLoadingText, setModalLoadingText] = React.useState('');

  const [isShared , setIsShared] = React.useState(false);
  
  async function getName() {
    var user = await appctx.dataprovider.getUser();
    return user.name.split(' ').pop();
  }

  async function shareGrade(grade, color) {
    setModalLoadingText('Génération du lien de partage...');
    setModalLoading(true);

    let newGrade = grade;
    // requires YOURLS_SECRET in .env
    let yourls_secret = Config.YOURLS_SECRET;

    // replace ids with 0 
    newGrade.subject.id = 0;
    newGrade.id = 0;

    newGrade.share = {
      status: true,
      name: await getName(),
    };

    // parse grade to JSON
    let gradeJSON = JSON.stringify(newGrade);

    // encode grade to base64
    let gradeBase64 = Buffer.from(gradeJSON).toString('base64');

    // create link
    let link = `https://getpapillon.xyz/grade/${encodeURIComponent(gradeBase64)}`;
    let shorten_link = link;

    // shorten link
    let response = await fetch(`https://r.getpapillon.xyz/yourls-api.php?signature=${yourls_secret}&action=shorturl&format=json&url=${encodeURIComponent(link)}`);
    

    let shortened = await response.json();
    if (shortened.shorturl) {
      shorten_link = shortened.shorturl;
    }

    setModalLoading(false);

    // share shorten_link
    ShareUI.share({
      message: `${shorten_link}`,
      title: 'Note partagée depuis l\'app Papillon',
    });
  }

  let mainColor = '#888888';
  if (grade.background_color) {
    mainColor = getSavedCourseColor(grade.subject.name, grade.background_color);
  }

  let { description } = grade;
  if (description === '') {
    description = 'Aucune description';
  }

  /*
  // fix (temp) des notes
  grade.grade.value.value = grade.grade.value.value / 20 * grade.grade.out_of.value;
  grade.grade.max.value = grade.grade.max.value / 20 * grade.grade.out_of.value;
  grade.grade.min.value = grade.grade.min.value / 20 * grade.grade.out_of.value;
  grade.grade.average.value = grade.grade.average.value / 20 * grade.grade.out_of.value;

  // correct class averages
  grade.grade.average.value = (grade.grade.average.value / 20) * grade.grade.out_of.value;
  grade.grade.max.value = (grade.grade.max.value / 20) * grade.grade.out_of.value;
  grade.grade.min.value = (grade.grade.min.value / 20) * grade.grade.out_of.value;
  */

  // change header title component
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: description,
      headerStyle: {
        backgroundColor: mainColor,
      },
      headerShadowVisible: false,
      headerRight: () => (
        <TouchableOpacity onPress={() => shareGrade(grade, mainColor)}>
          <Share size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerLeft: () => (
        Platform.OS === 'ios' ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iosBack}>
            <ChevronLeft size={26} color="#fff" style={styles.iosBackIcon} />
          </TouchableOpacity>
        ) : null
      ),
    });
  }, [navigation, grade]);

  const formatDate = (dateString) => new Date(dateString).getTime();

  const date = formatDate(grade.date);
  const formattedGrades = allGrades.filter(grade => formatDate(grade.date) <= date);

  const formattedValue = parseFloat(grade.grade.value.value).toFixed(2);
  const [valueTop, valueBottom] = formattedValue.split('.');

  const gradesListWithoutGrade = formattedGrades.filter(g => g.id !== grade.id);

  const [average, setAverage] = React.useState(0);
  const [averageWithoutGrade, setAverageWithoutGrade] = React.useState(0);
  const [avgInfluence, setAvgInfluence] = React.useState(0);
  const [avgPercentInfluence, setAvgPercentInfluence] = React.useState(0);
  const [classAvg, setClassAvg] = React.useState(0);
  const [classAvgWithoutGrade, setClassAvgWithoutGrade] = React.useState(0);
  const [classAvgInfluence, setClassAvgInfluence] = React.useState(0);

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

  React.useEffect(() => {
    calculateInfluence(formattedGrades, gradesListWithoutGrade);
  }, [formattedGrades, gradesListWithoutGrade]);

  React.useEffect(() => {
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
            </>
          )}

          {grade.grade.value.significant === true && (<>
            {grade.grade.value.type[0] == '1' ? (
              <Text style={[styles.gradeHeaderGradeValueTop]}>
                Abs.
              </Text>
            ) : (
              <Text style={[styles.gradeHeaderGradeValueTop]}>
                N.not
              </Text>
            )}
          </>)}

          <Text style={[styles.gradeHeaderGradeScale]}>
            /{grade.grade.out_of.value}
          </Text>
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
                <Text style={[styles.gradeDetailValue]}>
                  {parseFloat(
                    (grade.grade.value.value / grade.grade.out_of.value) * 20
                  ).toFixed(2)}
                </Text>
                <Text style={[styles.gradeDetailValueSub]}>/20</Text>
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
                  {parseFloat(grade.grade.average.value).toFixed(2)}
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
                  {parseFloat(grade.grade.min.value).toFixed(2)}
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
                  {parseFloat(grade.grade.max.value).toFixed(2)}
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
                avgInfluence > 0 ? (
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
                avgPercentInfluence > 0 ? (
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
              (grade.grade.value.value - grade.grade.average.value).toFixed(2) > 0 ? (
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
