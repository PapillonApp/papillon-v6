import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, StatusBar } from 'react-native';

import { useTheme } from 'react-native-paper';

import { useAppContext } from '../../utils/AppContext';

import GetUIColors from '../../utils/GetUIColors';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import { PressableScale } from 'react-native-pressable-scale';
import { Check, Send } from 'lucide-react-native';

import { PapillonRecipientType, type PapillonRecipient } from '../../fetch/types/discussions';

const NewConversation = ({ navigation }: {
  navigation: any // TODO
}) => {
  const appContext = useAppContext();
  const UIColors = GetUIColors();

  const [recipients, setRecipients] = useState<PapillonRecipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<PapillonRecipient[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');

  // add loading indicator to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <TouchableOpacity
              onPress={() => sendMessage()}
            >
              <Send size={24} color={UIColors.primary} />
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [navigation, loading, subject, content, selectedRecipients]);

  const sendMessage = async () => {
    if (!appContext.dataProvider) {
      Alert.alert(
        'Erreur',
        'La connexion est serveur n\'est pas encore disponible, réessayez plus tard.',
        [{ text: 'OK' }],
        { cancelable: false }
      );

      return;
    }

    if (!content.trim()) {
      Alert.alert(
        'Message vide',
        'Vous ne pouvez pas envoyer un message vide.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
    }

    try {
      await appContext.dataProvider.createDiscussion(
        subject.trim() ||'Aucun sujet',
        content,
        selectedRecipients
      );

      navigation.goBack();
    }
    catch {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
    }
  };

  useEffect(() => {
    (async () => {
      if (!appContext.dataProvider) return;

      const recipients = await appContext.dataProvider.getCreationRecipients();
      setRecipients(recipients);
      setLoading(false);
    })();
  }, [appContext.dataProvider]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior='automatic'
      style={{ backgroundColor: UIColors.modalBackground }}
    >
      <StatusBar translucent animated barStyle={'light-content'} />

      <NativeList header="Message">
        <NativeItem>
          <NativeText heading="h4">
            Sujet
          </NativeText>
          <TextInput
            placeholder="Entrez un sujet"
            placeholderTextColor={UIColors.text + '77'}
            style={[styles.input, {color: UIColors.text}]}
            value={subject}
            onChangeText={t => setSubject(t)}
          />
        </NativeItem>

        <NativeItem>
          <NativeText heading="h4">
            Message
          </NativeText>
          <TextInput
            placeholder="Saisissez votre message"
            placeholderTextColor={UIColors.text + '77'}
            multiline={true}
            style={[styles.inputMsg, {color: UIColors.text}]}
            value={content}
            onChangeText={t => setContent(t)}
          />
        </NativeItem>
      </NativeList>

      <NativeList header="Personnes disponibles">
        {recipients.map((item, index) => (
          <NativeItem
            key={index}
            leading={
              <HwCheckbox
                loading={false}
                checked={selectedRecipients.some((e) => e.id === item.id)}
                pressed={() => {
                  // if already selected, remove it
                  if (selectedRecipients.some((e) => e.id === item.id)) {
                    setSelectedRecipients(prev => prev.filter((e) => e.id !== item.id));
                  }
                  // otherwise add it
                  else {
                    setSelectedRecipients(prev => [...prev, item]);
                  }
                }}
              />
            }
            onPress={() => {
              // if already selected, remove it
              if (selectedRecipients.some((e) => e.id === item.id)) {
                setSelectedRecipients(prev => prev.filter((e) => e.id !== item.id));
              }
              // otherwise add it
              else {
                setSelectedRecipients(prev => [...prev, item]);
              }
            }}
          >
            <NativeText heading="h4">
              {item.name}
            </NativeText>
            <NativeText heading="p2">
              {item.functions.join(', ')}
            </NativeText>
            {item.type !== PapillonRecipientType.UNKNOWN && (
              <NativeText heading="subtitle1">
                {item.type === PapillonRecipientType.TEACHER ? 'Professeur' : 'Personnel'}
              </NativeText>
            )}
          </NativeItem>
        ))}
      </NativeList>
    </ScrollView>
  );
};

function HwCheckbox({ checked, pressed, loading }: {
  checked: boolean
  loading: boolean
  pressed: () => unknown
}) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  return !loading ? (
    <PressableScale
      style={[
        styles.checkContainer,
        { borderColor: theme.dark ? '#333333' : '#c5c5c5' },
        checked ? styles.checkChecked : null,
        checked
          ? { backgroundColor: UIColors.primary, borderColor: UIColors.primary }
          : null,
      ]}
      weight="light"
      activeScale={0.7}
      onPress={() => {
        pressed();
      }}
    >
      {checked ? <Check size={20} color="#ffffff" /> : null}
    </PressableScale>
  ) : (
    <ActivityIndicator size={26} />
  );
}

const styles = StyleSheet.create({
  checkContainer: {
    width: 26,
    height: 26,
    borderRadius: 16,
    borderCurve: 'continuous',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
  },
  checkChecked: {
    backgroundColor: '#159C5E',
    borderColor: '#159C5E',
  },

  input: {
    fontFamily: 'Papillon-Medium',
    fontSize: 16,
    padding: 0,
    margin: 0,
    textAlign: 'left',
  },

  inputMsg: {
    fontFamily: 'Papillon-Medium',
    fontSize: 16,
    padding: 0,
    margin: 0,
    textAlign: 'left',
    height: 100,
  },
});

export default NewConversation;
