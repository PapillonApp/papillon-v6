import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Turboself from 'papillon-turboself-core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PressableScale } from 'react-native-pressable-scale';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { Text } from 'react-native-paper';
import NativeText from '../../components/NativeText';
import GetUIColors from '../../utils/GetUIColors';

function ReservationCantineScreen({ navigation }) {
  const UIColors = GetUIColors();
  const ts = new Turboself();
  const [loading, setLoading] = useState(true);
  const [resa, setResa] = useState();

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

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
              Alert.alert(data.errorMessage);
            } else {
              console.log('LOGED IN');
              callback();
            }
          }
        );
      }
    });
  }

  function getResaInfo(date) {
    setLoading(true);
    setResa({ days: [] });
    ts.getBooking(date).then((data) => {
      if (data.error) {
        Alert.alert(data.errorMessage);
        return;
      }
      setResa(data.data);
      setLoading(false);
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
      getResaInfo(calendarDate);
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
          Alert.alert(data.errorMessage);
          return;
        }
        console.log(tempResa.days[i].booked, data.data.booked);
        if (tempResa.days[i].booked === data.data.booked) {
          Alert.alert('Erreur', 'Impossible de modifier la réservation');
          return;
        }
        tempResa.days[i].booked = data.data.booked;
        setResa(tempResa);
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
      {loading ? (
        <ActivityIndicator />
      ) : (
        <View>
          <NativeText heading="p2" style={[styles.hMargin]}>
            Repas méridien
          </NativeText>
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
            {resa.days.map((day, i) => (
              // modifier l'opacité du bouton si on ne peut pas réserver
              <PressableScale
                style={[
                  styles.button,
                  !day.canEdit ? { opacity: 0.5 } : {},
                  !day.booked ? { backgroundColor: '#FFF' } : {},
                ]}
                disabled={!day.canEdit}
                onPress={() => {
                  changeResa(i);
                }}
              >
                <NativeText
                  style={[
                    styles.button.day,
                    !day.booked ? { color: '#000' } : {},
                  ]}
                >
                  {day.label.split(' ')[0]}
                </NativeText>
                <NativeText
                  style={[
                    styles.button.number,
                    !day.booked ? { color: '#000' } : {},
                  ]}
                >
                  {day.label.split(' ')[1]}
                </NativeText>
                <NativeText
                  style={[
                    styles.button.month,
                    !day.booked ? { color: '#000' } : {},
                  ]}
                >
                  {day.label.split(' ')[2]}
                </NativeText>
              </PressableScale>
            ))}
          </View>
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
