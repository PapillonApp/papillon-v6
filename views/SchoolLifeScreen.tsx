import { PapillonAbsence, PapillonDelay, PapillonObservation, PapillonObservationType, PapillonPunishment, PapillonVieScolaire } from '../fetch/types/vie_scolaire';

import React, { Key, useEffect, useLayoutEffect, useState, type JSX } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';

import { useTheme } from 'react-native-paper';
import { Clock3, UserX, BookMarked, ThumbsUp, type LucideIcon, ChevronDown, ChevronUp, Gavel } from 'lucide-react-native';

import GetUIColors from '../utils/GetUIColors';
import PapillonLoading from '../components/PapillonLoading';
import { useAppContext } from '../utils/AppContext';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

const lz = (n: number) => (n < 10 ? `0${n}` : n);
const getObservationIcon = (type: PapillonObservationType): JSX.Element => {
  let Icon: LucideIcon;

  switch (type) {
    case PapillonObservationType.LogBookIssue:
      Icon = BookMarked;
      break;
    case PapillonObservationType.Encouragement:
      Icon = ThumbsUp;
      break;
    default:
      // TODO: add more icons
      Icon = BookMarked;
      break;
  }

  return <Icon size={24} color="#565EA3" />;
};

function SchoolLifeScreen({ navigation }: {
  navigation: any // TODO
}) {
  const [vieScolaire, setVieScolaire] = useState<PapillonVieScolaire | null>(null);
  const theme = useTheme();
  const UIColors = GetUIColors();
  const appContext = useAppContext();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [totalHoursMissed, setTotalHoursMissed] = useState<number>(0);
  const [totalDelayMinutes, setTotalDelayMinutes] = useState<number>(0);

  const [developAbsences, setDevelopAbsences] = useState(false)
  const [developRetard, setDevelopRetard] = useState(false)
  const [developPunitions, setDevelopPunitions] = useState(false)
  const [developObservations, setDevelopObservations] = useState(false)

  const retrieveData = async (force = false) => {
    try {
      if (!appContext.dataProvider) return;
      const value = await appContext.dataProvider.getViesco(force);
      value.absences = value.absences.sort((a, b) => new Date(b.from).getTime() - new Date(a.from).getTime());
  
      // put the justified absences at the end of the list
      value.absences = value.absences.sort((a, b) => {
        if (a.justified === b.justified) return 0;
        if (a.justified) return 1;
        return -1;
      });

      setVieScolaire(value);
      const total = value.absences.reduce((total, absence) => {
        const hours = parseInt(absence.hours.split('h')[0]);
        const minutes = parseInt(absence.hours.split('h')[1]);
        return total + hours + minutes / 60;
      }, 0);
      setTotalHoursMissed(total);
      const totalDelay = value.delays.reduce((total, delay) => {
        return total + delay.duration;
      }, 0);
      setTotalDelayMinutes(totalDelay);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    retrieveData(false);
  }, [appContext.dataProvider]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Vie scolaire',
      headerBackTitle: 'Retour',
      headerTintColor: UIColors.text,
      headerShadowVisible: true,
      headerLargeTitle: false,
    });
  });
  
  const Absence = ({absence, key, first, end}: {absence: PapillonAbsence, key: Key, first: Boolean, end: Boolean}) => {
    return (
      <NativeItem
        key={key}
        first={first}
        last={end}
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
            À justifier
          </NativeText>
        ) : (
          <NativeText style={[styles.absenceItemStatusTitle]}>
            Justifiée
          </NativeText>
        )}
      >
        <NativeText heading="h4" style={{ color: absence.administrativelyFixed ? 'gray' : (theme.dark ? 'white' : 'black') }}>
          {absence.reasons[0] ?? new Date(absence.from).toLocaleDateString('fr', {
            weekday: 'long',
            day: '2-digit',
            month: 'short',
          })}
        </NativeText>
        <NativeText heading="p2">
          {absence.hours.split('h')[0]}h{lz(parseInt(absence.hours.split('h')[1]))} manquées
        </NativeText>
        {
          // if from and to is same day :
          (!absence.to || (new Date(absence.from).getDate() === new Date(absence.to).getDate())) ? (
            <NativeText heading="subtitle2" style={{marginTop: 6}}>
              le{' '}
              {new Date(absence.from).toLocaleDateString('fr', {
                weekday: 'long',
                day: '2-digit',
                month: 'short',
              })}
            </NativeText>
          ) : (
            <NativeText heading="subtitle2" style={{marginTop: 6}}>
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
      </NativeItem>
    )
  }

  const Retard = ({delay, key, first, end}: {delay: PapillonDelay, key: Key, first: Boolean, end: Boolean}) => {
    return (
      <NativeItem
        key={key}
        first={first}
        last={end}
        leading={!delay.justified ? (
          <Clock3 size={24} color="#A84700" />
        ) : (
          <Clock3 size={24} color="#565EA3" />
        )}
        trailing={!delay.justified ? (
          <NativeText
            style={[
              styles.absenceItemStatusTitle,
              styles.absenceItemStatusTitleToJustify,
            ]}
          >
            À justifier
          </NativeText>
        ) : (
          <NativeText style={[styles.absenceItemStatusTitle]}>
            Justifié
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

        {delay.reasons[0] && (
          <NativeText
            heading="subtitle2"
            style={{
              marginTop: 6
            }}
          >
            {delay.reasons[0]}
          </NativeText>
        )}
      </NativeItem>
    )
  }

  const Punition = ({punition, key, first, end}: {punition: PapillonPunishment, key: Key, first: Boolean, end: Boolean}) => {
    return (
      <NativeItem key={key} first={first} last={end}
        leading={<Gavel size={24} color="#A84700" />}
      >
        <NativeText heading="h4">
          {punition.nature}
        </NativeText>
        <NativeText heading="p2">
        le{' '}
          {new Date(punition.date).toLocaleDateString('fr', {
            weekday: 'long',
            day: '2-digit',
            month: 'short',
          })}
        </NativeText>

        <NativeText
          heading="subtitle2"
          style={{
            marginTop: 6
          }}
        >
          {punition.reason.text.length > 0
            ? "Motif : " + punition.reason.text.join(', ')
            : 'Aucun motif donné'
          }
        </NativeText>
      </NativeItem>
    )
  }

  const Observation = ({observation, key, first, end}: {observation: PapillonObservation, key: Key, first: Boolean, end: Boolean}) => {
    return (
      <NativeItem
        key={key}
        first={first}
        last={end}
        leading={getObservationIcon(observation.sectionType)}
      >
        <NativeText heading="h4">
          {observation.sectionName}
        </NativeText>
        {observation.subjectName && (
          <NativeText heading="p">
            en {observation.subjectName}
          </NativeText>
        )}
        <NativeText heading="p2">
          le{' '}
          {new Date(observation.date).toLocaleDateString('fr', {
            weekday: 'long',
            day: '2-digit',
            month: 'short',
          })}
        </NativeText>

        {observation.reasons[0] && (
          <NativeText
            heading="subtitle2"
            style={{
              marginTop: 6
            }}
          >
            {observation.reasons[0]}
          </NativeText>
        )}
      </NativeItem>
    )
  }

  return (
    <ScrollView
      style={{ backgroundColor: UIColors.backgroundHigh }}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await retrieveData(true);
          }}
        />
      }
    >
      <StatusBar
        animated
        translucent
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />

      {loading && (
        <PapillonLoading
          title="Chargement des événements"
          subtitle="Veuillez patienter quelques instants..."
        />
      )}

      {vieScolaire && (
        <>
          {(vieScolaire.absences.length === 0 && vieScolaire.delays.length === 0 && vieScolaire.punishments.length === 0 && vieScolaire.observations.length === 0) && !loading && (
            <PapillonLoading
              title="Aucun événement"
              subtitle="Vous n'avez aucun événement à afficher"
              icon={<UserX size={26} color={UIColors.primary} />}
            />
          )}

          {vieScolaire.absences && vieScolaire.absences.length > 0 && (
            <NativeList header={`Absences (${vieScolaire.absences.length}) - ${totalHoursMissed.toFixed(1)} heures manquées`} inset>
              {vieScolaire.absences?.map((absence, index) => {
                if(!developAbsences && vieScolaire.absences.indexOf(absence) < 3) return <Absence absence={absence} key={index} first={vieScolaire.absences.indexOf(absence) === 0} end={vieScolaire.absences.indexOf(absence) === vieScolaire.absences.length - 1}/>
                else if(developAbsences) return <Absence absence={absence} key={index} first={vieScolaire.absences.indexOf(absence) === 0} end={false}/>
                else return null
              })
              }
              {vieScolaire.absences.length > 3 && (
                <NativeItem
                  leading={(
                    developAbsences ? <ChevronUp size={24} color={UIColors.text} /> : <ChevronDown size={24} color={UIColors.text} />
                  )}
                  onPress={() => { setDevelopAbsences(!developAbsences) }}
                >
                  <NativeText heading="h4" style={{color: UIColors.text}}>
                    {developAbsences ? "Réduire" : "Développer"} {!developAbsences && `(${vieScolaire.absences.length - 3} restantes)`}
                  </NativeText>
                </NativeItem>
              )
              }
            </NativeList>
          )}

          {vieScolaire.delays && vieScolaire.delays.length > 0 && (
            <NativeList header={`Retards (${vieScolaire.delays.length}) - ${totalDelayMinutes} minutes cumulées`} inset>
              {vieScolaire.delays.map((delay, index) => {
                if(!developRetard && vieScolaire.delays.indexOf(delay) < 3) return <Retard delay={delay} key={index} first={vieScolaire.delays.indexOf(delay) === 0} end={vieScolaire.delays.indexOf(delay) === vieScolaire.delays.length - 1}/>
                else if(developRetard) return <Retard delay={delay} key={index} first={vieScolaire.delays.indexOf(delay) === 0} end={false}/>
                else return null
              })}
              {vieScolaire.delays.length > 3 && (
                <NativeItem
                  leading={(
                    developRetard ? <ChevronUp size={24} color={UIColors.text} /> : <ChevronDown size={24} color={UIColors.text} />
                  )}
                  onPress={() => { setDevelopRetard(!developRetard) }}
                >
                  <NativeText heading="h4" style={{color: UIColors.text}}>
                    {developRetard ? "Réduire" : "Développer"} {!developRetard && `(${vieScolaire.delays.length - 3} restants)`}
                  </NativeText>
                </NativeItem>
              )
              }
            </NativeList>
          )}

          {vieScolaire.punishments && vieScolaire.punishments.length > 0 && (
            <NativeList header={`Punitions (${vieScolaire.punishments.length})`} inset>
              {vieScolaire.punishments.map((punition, index) => {
                if(!developPunitions && vieScolaire.punishments.indexOf(punition) < 3) return <Punition punition={punition} key={index} first={vieScolaire.punishments.indexOf(punition) === 0} end={vieScolaire.punishments.indexOf(punition) === vieScolaire.punishments.length - 1}/>
                else if(developPunitions) return <Punition punition={punition} key={index} first={vieScolaire.punishments.indexOf(punition) === 0} end={false}/>
                else return null
              })}
              {vieScolaire.punishments.length > 3 && (
                <NativeItem
                  leading={(
                    developPunitions ? <ChevronUp size={24} color={UIColors.text} /> : <ChevronDown size={24} color={UIColors.text} />
                  )}
                  onPress={() => { setDevelopPunitions(!developPunitions) }}
                >
                  <NativeText heading="h4" style={{color: UIColors.text}}>
                    {developPunitions ? "Réduire" : "Développer"} {!developPunitions && `(${vieScolaire.punishments.length - 3} restants)`}
                  </NativeText>
                </NativeItem>
              )
              }
            </NativeList>
          )}

          {vieScolaire.observations && vieScolaire.observations.length > 0 && (
            <NativeList header={`Observations (${vieScolaire.observations.length})`} inset>
              {vieScolaire.observations.map((observation, index) => {
                if(!developObservations && vieScolaire.observations.indexOf(observation) < 3) return <Observation observation={observation} key={index} first={vieScolaire.observations.indexOf(observation) === 0} end={vieScolaire.observations.indexOf(observation) === vieScolaire.observations.length - 1}/>
                else if(developObservations) return <Observation observation={observation} key={index} first={vieScolaire.observations.indexOf(observation) === 0} end={false}/>
                else return null
              })}
              {vieScolaire.observations.length > 3 && (
                <NativeItem
                  leading={(
                    developObservations ? <ChevronUp size={24} color={UIColors.text} /> : <ChevronDown size={24} color={UIColors.text} />
                  )}
                  onPress={() => { setDevelopObservations(!developObservations) }}
                >
                  <NativeText heading="h4" style={{color: UIColors.text}}>
                    {developObservations ? "Réduire" : "Développer"} {!developObservations && `(${vieScolaire.observations.length - 3} restants)`}
                  </NativeText>
                </NativeItem>
              )
              }
            </NativeList>
          )}
        </>
      )}

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
