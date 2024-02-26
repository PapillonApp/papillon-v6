import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
  Switch,
} from 'react-native';

import { Text, useTheme } from 'react-native-paper';

import * as Notifications from 'expo-notifications';

import DateTimePicker from '@react-native-community/datetimepicker';

import AsyncStorage from '@react-native-async-storage/async-storage';
import SyncStorage from 'sync-storage';
import ListItem from '../../components/ListItem';
import GetUIColors from '../../utils/GetUIColors';

import { AlertTriangle } from 'lucide-react-native';
import AlertAnimated from '../../interface/AlertAnimated';


import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

function NotificationsScreen() {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [willNeedRestart, setWillNeedRestart] = useState(false);

  const [notificationCounterEnabled, setNotificationCounterEnabled] = useState(false);
  const [devoirsReminderEnabled, setDevoirsReminderEnabled] = useState(false);
  const [devoirsReminderTime, setDevoirsReminderTime] = useState(new Date());

  const [timePickerEnabled, setTimePickerEnabled] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      setTimePickerEnabled(true);
    }

    AsyncStorage.getItem('devoirsReminder').then((value) => {
      if (value !== null) {
        const data = JSON.parse(value);

        setDevoirsReminderEnabled(data.enabled);
        setDevoirsReminderTime(new Date(data.time));
      }
    });

    setNotificationCounterEnabled(SyncStorage.get('notificationsCounter').enabled);

    Notifications.getAllScheduledNotificationsAsync().then((value) => {
      return;
    });
  }, []);

  async function enableNotificationCounter(val) {
    setNotificationCounterEnabled(val);

    SyncStorage.set('notificationsCounter', {
      enabled: val,
    });

    // SyncStorage doesn't support auto-reloading, so if we want to keep the
    // code clean and simple, we can't reload (it would be possible with an Atom)
    setTimeout(() => {
      setWillNeedRestart(true);
    }, 350);
  }

  async function enableDevoirsReminder(val) {
    setDevoirsReminderEnabled(val);

    if (val) {
      updateReminderTime(devoirsReminderTime);
      await AsyncStorage.setItem(
        'devoirsReminder',
        JSON.stringify({
          enabled: true,
          time: devoirsReminderTime,
        })
      );
    } else {
      Notifications.cancelScheduledNotificationAsync('devoirsReminder');
      await AsyncStorage.setItem(
        'devoirsReminder',
        JSON.stringify({
          enabled: false,
          time: devoirsReminderTime,
        })
      );
    }
  }

  async function updateReminderTime(time) {
    setDevoirsReminderTime(time);
    closeTimePicker();

    await AsyncStorage.setItem(
      'devoirsReminder',
      JSON.stringify({
        enabled: devoirsReminderEnabled,
        time,
      })
    );

    // edit notification
    Notifications.requestPermissionsAsync();
    Notifications.cancelScheduledNotificationAsync('devoirsReminder');

    Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Il est temps de faire tes devoirs !',
        body: 'Ouvre l\'app Papillon pour voir ce que tu as à faire.',
        sound: 'papillon_ding.wav',
      },
      trigger: {
        channelId: 'devoirsReminder',
        hour: devoirsReminderTime.getHours(),
        minute: devoirsReminderTime.getMinutes(),
        repeats: true,
      },
      identifier: 'devoirsReminder',
    });
  }

  function openTimePicker() {
    setTimePickerEnabled(true);
  }

  function closeTimePicker() {
    setTimePickerEnabled(false);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
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

      <AlertAnimated
        visible={willNeedRestart}
        left={
          <AlertTriangle color={UIColors.primary} />
        }
        title="Redémarrage requis"
        subtitle="Redémarrage requis pour appliquer certains changements."
        height={76}
        marginVertical={16}
        style={{
          marginHorizontal: 16,
          backgroundColor: UIColors.primary + '22',
        }}
      />

      <NativeList
        header="Notifications"
        inset
      >
        <NativeItem
          trailing={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Switch
                value={devoirsReminderEnabled}
                onValueChange={(val) => enableDevoirsReminder(val)}
              />
            </View>
          }
        >
          <NativeText heading="h4">
            Activer le rappel des devoirs
          </NativeText>
          <NativeText heading="p2">
            Envoie une notification le soir pour te rappeler de faire tes devoirs
          </NativeText>
        </NativeItem>

        {devoirsReminderEnabled ? (
          <NativeItem
            trailing={
              timePickerEnabled || Platform.OS === 'ios' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <DateTimePicker
                    value={devoirsReminderTime}
                    mode="time"
                    is24Hour
                    display="default"
                    onChange={(event, time) => {
                      updateReminderTime(time);
                    }}
                  />
                </View>
              ) : null
            }
            onPress={Platform.OS !== 'ios' ? () => {
              openTimePicker();
            } : null}
          >
            <NativeText heading="p">
              Sélectionner l'heure du rappel des devoirs
            </NativeText>
          </NativeItem>
        ) : null}

        <NativeItem
          trailing={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Switch
                value={notificationCounterEnabled}
                onValueChange={(val) => enableNotificationCounter(val)}
              />
            </View>
          }
        >
          <NativeText heading="h4">
            Notifications dans la barre de navigation
          </NativeText>
          <NativeText heading="p2">
            Affiche un compteur de notifications dans la barre de navigation
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ListTitle: {
    paddingLeft: 29,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },

  timeText: {
    fontSize: 17,
    fontWeight: 500,
  },
});

export default NotificationsScreen;
