import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
  Switch,
} from 'react-native';

import {useState, useEffect} from 'react';

import { Text, useTheme } from 'react-native-paper';
import GetUIColors from '../../utils/GetUIColors';

import * as Notifications from 'expo-notifications';

import ListItem from '../../components/ListItem';

import DateTimePicker from '@react-native-community/datetimepicker';

import AsyncStorage from '@react-native-async-storage/async-storage';

function NotificationsScreen() {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [devoirsReminderEnabled, setDevoirsReminderEnabled] = useState(false);
  const [devoirsReminderTime, setDevoirsReminderTime] = useState(new Date());

  useEffect(() => {
    AsyncStorage.getItem('devoirsReminder').then((value) => {
      if (value !== null) {
        const data = JSON.parse(value);

        setDevoirsReminderEnabled(data.enabled);
        setDevoirsReminderTime(new Date(data.time));
      }
    });

    Notifications.getAllScheduledNotificationsAsync().then((value) => {
      console.log(value);
    });
  }, []);

  async function enableDevoirsReminder(val) {
    setDevoirsReminderEnabled(val);

    if (val) {
      updateReminderTime(devoirsReminderTime);
      await AsyncStorage.setItem('devoirsReminder', JSON.stringify({
        enabled: true,
        time: devoirsReminderTime,
      }));
    } else {
      Notifications.cancelScheduledNotificationAsync('devoirsReminder');
      await AsyncStorage.setItem('devoirsReminder', JSON.stringify({
        enabled: false,
        time: devoirsReminderTime,
      }));
    }
  }

  async function updateReminderTime(time) {
    setDevoirsReminderTime(time);

    await AsyncStorage.setItem('devoirsReminder', JSON.stringify({
      enabled: devoirsReminderEnabled,
      time: time,
    }));

    // edit notification
    Notifications.requestPermissionsAsync();
    Notifications.cancelScheduledNotificationAsync('devoirsReminder');

    Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Il est temps de faire tes devoirs !',
        body: "Ouvre l'app Papillon pour voir ce que tu as à faire.",
        sound: true,
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
      contentInsetAdjustmentBehavior="automatic"
    >
      <StatusBar
        animated
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />

      <View style={{ gap: 9, marginTop: 24 }}>
        <Text style={styles.ListTitle}>Rappel des devoirs</Text>

        <ListItem
          title="Activer le rappel des devoirs"
          subtitle="Envoie une notification le soir pour te rappeler de faire tes devoirs"
          color="#29947A"
          center
          style={[
            devoirsReminderEnabled ? (
              {
                marginBottom: 0,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderBottomColor: UIColors.text + "17",
                borderBottomWidth: 1,
              }
            ) : null
          ]}
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Switch value={devoirsReminderEnabled} onValueChange={(val) => enableDevoirsReminder(val)} />
            </View>
          }
        />

        { devoirsReminderEnabled ? (
        <ListItem
        subtitle="Sélectionner l'heure du rappel des devoirs"
          color="#29947A"
          center
          style={{
            marginTop: -9,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <DateTimePicker
                value={devoirsReminderTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, time) => {updateReminderTime(time)}}
              />
            </View>
          }
        />
        ) : null }
      </View>
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
});

export default NotificationsScreen;
