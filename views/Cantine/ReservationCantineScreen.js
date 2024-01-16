import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  View,
} from 'react-native';
import Turboself from 'papillon-turboself-core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AlertTriangle, Calendar, CopyCheck } from 'lucide-react-native';
import { Text } from 'react-native-paper';
import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import GetUIColors from '../../utils/GetUIColors';
import PapillonLoading from '../../components/PapillonLoading';

import AlertBottomSheet from '../../interface/AlertBottomSheet';

function ReservationCantineScreen({ navigation }) {
  const UIColors = GetUIColors();
  const ts = new Turboself();
  const [loading, setLoading] = useState(true);
  const [homeInfoLoading, setHomeInfoLoading] = useState(true);
  const [resa, setResa] = useState();
  const [homeData, setHomeData] = React.useState({});


  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState(null);
  const [errorAlert, setErrorAlert] = useState(false);

  let date = new Date();
  let nextWeekDate = (new Date(new Date().getTime() + 20*(7 * 24 * 60 * 60 * 1000)));

  function formatDateToDDMMYYY(dateString) {
    const dateObject = new Date(dateString);
    const day = `0${dateObject.getDate()}`.slice(-2);
    const month = `0${dateObject.getMonth() + 1}`.slice(-2);
    const year = dateObject.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function login(callback) {
    AsyncStorage.getItem('linkedAccount').then((result) => {
      let res = { restaurant: {} };
      if (result != null) {
        res = JSON.parse(result);
      }
      if (res.restaurant.username != null) {
        ts.login(res.restaurant.username, res.restaurant.password).then(
          (data) => {
            if (data.error) {
              setErrorMessage(data.errorMessage);
              setErrorAlert(true);
            } else {
              console.log('LOGED IN');
              callback();
            }
          }
        );
      }
    });
  }

  async function getHomeInfo() {
    setHomeInfoLoading(true);
    ts.getHome().then((data) => {
      if (data.error) {
        setErrorMessage(data.errorMessage);
        setErrorAlert(true);
        return;
      }
      setHomeData(data.data);
      console.log('homeData :', homeData);
      setHomeInfoLoading(false);
    });
  }


  function getResaInfo(date) {
    setLoading(true);
    setResa({ days: [] });
    ts.getBooking(date).then((data) => {
      if (data.error) {
        setErrorMessage(data.errorMessage);
        setErrorAlert(true);
        return;
      }
      setResa(data.data);
    });
  }

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        Platform.OS === 'ios' ? (
          <DateTimePicker
            value={calendarDate}
            locale="fr_FR"
            mode="date"
            display="compact"
            onChange={(event, date) => {
              if (event.type === 'set') {
                getResaInfo(date);
                setCalendarDate(date);
              }
            }}
          />
        ) : (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginRight: 2,
            }}
            onPress={() => setCalendarModalOpen(true)}
          >
            <Calendar size={20} color={UIColors.text} />
            <Text style={{ fontSize: 15, fontFamily: 'Papillon-Medium' }}>
              {new Date(calendarDate).toLocaleDateString('fr', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
              })}
            </Text>
          </TouchableOpacity>
        ),
    });
    login(() => {
      console.log(calendarDate)
      getResaInfo(calendarDate);
      getHomeInfo();
      console.log(resa);
      setLoading(false);
    });
  }, [calendarDate, calendarModalOpen]);

  function changeResa(i) {
    console.log('clicked');
    login(() => {
      const tempResa = JSON.parse(JSON.stringify(resa));
      ts.setBooking(
        tempResa.weekId,
        tempResa.days[i].dayNumber,
        !tempResa.days[i].booked
      ).then((data) => {
        console.log(data);
        if (data.error) {
          setErrorMessage(data.errorMessage);
          setErrorAlert(true);
          return;
        }
        console.log(tempResa.days[i].booked, data.data.booked);
        if (tempResa.days[i].booked === data.data.booked) {
          Alert.alert('Erreur', 'Impossible de modifier la réservation');
          return;
        }
        tempResa.days[i].booked = data.data.booked;
        setResa(tempResa);
        ts.getHome().then((data) => {
          if (data.error) {
            setErrorMessage(data.errorMessage);
            setErrorAlert(true);
            return;
          }
          setHomeData(data.data);
          console.log('homeData :', homeData);
        });
      });
    });
  }

  return (
    <ScrollView>
      {Platform.OS === 'android' && calendarModalOpen ? (
        <DateTimePicker
          value={calendarDate}
          locale="fr-FR"
          mode="date"
          display="calendar"
          onChange={(event, date) => {
            if (event.type === 'dismissed') {
              setCalendarModalOpen(false);
              return;
            }

            setCalendarModalOpen(false);

            setCalendarDate(date);
            login();
          }}
        />
      ) : null}
      <AlertBottomSheet
        visible={errorAlert}
        title={'Erreur'}
        subtitle={errorMessage}
        color='#D81313'
        icon={<AlertTriangle/>}
        cancelAction={() => setErrorAlert(false)}
      />
      {homeInfoLoading ? (
        <ActivityIndicator />
      ) : (
        <View>
        {isNaN(homeData.userInfo.balance) || null || NaN ? (

          <PapillonLoading
          icon={<PiggyBank size={26} color={UIColors.text} />}
          title="Solde indisponible"
          subtitle="Votre établissement ne communique pas cette information. Merci de vous rapprocher de ce dernier pour plus amples informations."
          style={{ marginTop: 36 }}
          />
        ) : (
      
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 50,
            marginBottom: 50,
          }}
        >
          <NativeText heading="p" style={{ opacity: 0.6 }}>
            Solde prévisionnel
          </NativeText>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <NativeText heading="h1" style={{ fontSize: 40 }}>
                {Number(homeData.userInfo.estimatedBalance).toFixed(2)}€
              </NativeText>
              <NativeText heading="p" style={{ opacity: 0.6 }}>
                pour le {(formatDateToDDMMYYY(homeData.userInfo.estimatedFor))}
              </NativeText>
            </View>
          )}
        </View>
        )}
        {resa.days.length != 0 ? (
        <View>
          <NativeList inset header="Repas méridien">
            {
              resa.days.map((day, i) => (
                <NativeItem trailing={<Switch style={{opacity: 0.6, fontSize: 15}} value={day.booked} disabled={!day.canEdit} onChange={() => changeResa(i)}/>}>
                  <NativeText heading="h4">{day.label}</NativeText>
                </NativeItem>
              ))
            }
          </NativeList>
          <View
            style={[
              styles.hMargin,
              {
                marginVertical: 8,
                display: 'flex',
                gap: 6,
                flexDirection: 'row',
                alignItems: 'center',
              },
            ]}
          >
          </View>
        </View>)
        : (
          <View>
            <PapillonLoading
              icon={<CopyCheck  color={UIColors.primary} />}
              title={'Aucune réservation'}
              subtitle={'Aucune réservation n\'est disponible pour la semaine sélectionnée'}
            />
          </View>
        )}
      </View>
      )}

      {/* Prevoir reservation du soir quand on aura les données */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hMargin: {
    marginHorizontal: 16,
  },
  button: {
    height: 80,
    flex: 1,
    backgroundColor: '#2A937A',
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 0,
    day: {
      color: '#FFF',
      fontSize: 13,
    },
    number: {
      color: '#FFF',
      fontSize: 25,
    },
    month: {
      color: '#FFF',
      fontSize: 10,
    },
  },
});

export default ReservationCantineScreen;
