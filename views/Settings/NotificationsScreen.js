import React, { useState, useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
  Linking,
  Switch,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import GetUIColors from '../../utils/GetUIColors';

import notifee, { AuthorizationStatus } from '@notifee/react-native';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import {Backpack, BaggageClaim, Calendar, CalendarClock, CheckCircle, TrendingUp, Utensils} from 'lucide-react-native';

function NotificationsScreen({ navigation }) {
  const UIColors = GetUIColors();

  const [notificationsGranted, setNotificationsGranted] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState({
    'notificationsEnabled': true,
    'notifications_CoursEnabled': true,
    'notifications_DevoirsEnabled': true,
    'notifications_NotesEnabled': true,
    'notifications_BagReminderEnabled': false,
    'notifications_SelfReminderEnabled': false,
  });

  const checkPermissions = async () => {
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
      setNotificationsGranted(false);
    }
    else {
      setNotificationsGranted(true);
    }
  };

  useEffect(() => {
    // check on focus
    const unsubscribe = navigation.addListener('focus', () => {
      checkPermissions();
    });

    return unsubscribe;
  }, [navigation]);

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
      { Platform.OS === 'android' && <View style={{ height: 24 }} /> }

      <NativeList inset>
        <NativeItem>
          <NativeText heading='p2'>
            Papillon viendra s'actualiser en arrière-plan pour mettre à jour vos données et vous notifier en temps réel.
          </NativeText>
        </NativeItem>
        <NativeItem
          trailing={
            <Switch
              onValueChange={() => {
                checkPermissions().then(() => {
                  if (notificationsGranted) {
                    toggleNotification('notificationsEnabled');
                  }
                });
              }}
              value={notificationSettings.notificationsEnabled && notificationsGranted}
            />
          }
        >
          <NativeText heading='h4'>
            Activer les notifications
          </NativeText>
        </NativeItem>
      </NativeList>

      {!notificationsGranted && (
        <NativeList
          inset
        >
          <NativeItem
            backgroundColor={'#d45f2c'}
          >
            <NativeText heading='p2' style={{ color: '#ffffff' }}>
              Les notifications sont désactivées pour Papillon. Activez-les dans les paramètres de l'application.
            </NativeText>
          </NativeItem>
          <NativeItem
            backgroundColor={'#d45f2c'}
            onPress={() => {
              Linking.openSettings();
            }}
            chevron
          >
            <NativeText heading='h4' style={{ color: '#ffffff' }}>
              Paramètres de l'application
            </NativeText>
          </NativeItem>
        </NativeList>
      )}

      {notificationSettings.notificationsEnabled && notificationsGranted ? (<>
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

        <NativeList inset header="Rappels">
          <NativeItem
            leading={
              <Backpack
                size={24}
                color={UIColors.text}
              />
            }
            trailing={
              <Switch
                onValueChange={() => toggleNotification('notifications_BagReminderEnabled')}
                value={notificationSettings.notifications_BagReminderEnabled}
              />
            }
          >
            <NativeText heading='h4'>
              Faire son sac
            </NativeText>
            <NativeText heading='p2'>
              Vous rappel de préparer votre sac lorsque la journée suivante contient des cours.
            </NativeText>
          </NativeItem>
          <NativeItem
            leading={
              <Utensils
                size={24}
                color={UIColors.text}
              />
            }
            trailing={
              <Switch
                onValueChange={() => toggleNotification('notifications_SelfReminderEnabled')}
                value={notificationSettings.notifications_SelfReminderEnabled}
              />
            }
          >
            <NativeText heading='h4'>
              Réserver le self
            </NativeText>
            <NativeText heading='p2'>
              Vous rappel de réserver votre repas lorsque la journée suivante contient des cours.
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
