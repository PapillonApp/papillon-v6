import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
  Switch,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import GetUIColors from '../../utils/GetUIColors';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import { Calendar, CalendarClock, CheckCircle, TrendingUp } from 'lucide-react-native';

function NotificationsScreen() {
  const UIColors = GetUIColors();

  const [notificationSettings, setNotificationSettings] = useState({
    'notificationsEnabled': true,
    'notifications_CoursEnabled': true,
    'notifications_DevoirsEnabled': true,
    'notifications_NotesEnabled': true,
  });

  useEffect(() => {
    (async () => {
      try {
        const settings = await AsyncStorage.getItem('notificationSettings');
        if (settings !== null) {
          setNotificationSettings(JSON.parse(settings));
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const toggleNotification = async (key) => {
    try {
      setNotificationSettings({ ...notificationSettings, [key]: !notificationSettings[key] });
      AsyncStorage.setItem('notificationSettings', JSON.stringify({ ...notificationSettings, [key]: !notificationSettings[key] }));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
      contentInsetAdjustmentBehavior="automatic"
    >
      <NativeList inset>
        <NativeItem>
          <NativeText heading='p2'>
            Papillon viendra s'actualiser en arrière-plan pour mettre à jour vos données et vous notifier en temps réel.
          </NativeText>
        </NativeItem>
        <NativeItem
          trailing={
            <Switch
              onValueChange={() => toggleNotification('notificationsEnabled')}
              value={notificationSettings.notificationsEnabled}
            />
          }
        >
          <NativeText heading='h4'>
            Activer les notifications
          </NativeText>
        </NativeItem>
      </NativeList>

      {notificationSettings.notificationsEnabled ? (<>
        <NativeList inset header="Cours">
          <NativeItem
            leading={
              <CalendarClock
                size={24}
                color={UIColors.text}
              />
            }
            trailing={
              <Switch
                onValueChange={() => toggleNotification('notifications_CoursEnabled')}
                value={notificationSettings.notifications_CoursEnabled}
              />
            }
          >
            <NativeText heading='h4'>
              Modification des cours
            </NativeText>
            <NativeText heading='p2'>
              Vous notifie quelques minutes avant lorsqu'un cours est annulé ou modifié.
            </NativeText>
          </NativeItem>
        </NativeList>

        <NativeList inset header="Devoirs">
          <NativeItem
            leading={
              <CheckCircle
                size={24}
                color={UIColors.text}
              />
            }
            trailing={
              <Switch
                onValueChange={() => toggleNotification('notifications_DevoirsEnabled')}
                value={notificationSettings.notifications_DevoirsEnabled}
              />
            }
          >
            <NativeText heading='h4'>
              Travail à faire pour demain
            </NativeText>
            <NativeText heading='p2'>
              Vous notifie en soirée lorsqu'un devoir est non-fait pour le lendemain.
            </NativeText>
          </NativeItem>
        </NativeList>

        <NativeList inset header="Notes">
          <NativeItem
            leading={
              <TrendingUp
                size={24}
                color={UIColors.text}
              />
            }
            trailing={
              <Switch
                onValueChange={() => toggleNotification('notifications_NotesEnabled')}
                value={notificationSettings.notifications_NotesEnabled}
              />
            }
          >
            <NativeText heading='h4'>
              Nouvelle note
            </NativeText>
            <NativeText heading='p2'>
              Vous envoie une notification lorsque Papillon récupère une nouvelle note.
            </NativeText>
          </NativeItem>
        </NativeList>
      </>) : (
        <NativeList inset>
          <NativeItem>
            <NativeText heading='p2' style={{ textAlign: 'center' }}>
              Les notifications sont désactivées.
            </NativeText>
          </NativeItem>
        </NativeList>
      )}

      <NativeText heading='subtitle2' style={{marginHorizontal: 26, marginVertical: 9, opacity: 0.4}}>
        Les notifications peuvent consommer de la batterie et engendrer des frais de données mobiles si celles-ci sont activées.
      </NativeText>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
});

export default NotificationsScreen;
