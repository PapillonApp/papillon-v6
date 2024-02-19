import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, StatusBar } from 'react-native';

import { useTheme } from 'react-native-paper';

import { useAppContext } from '../../utils/AppContext';

import GetUIColors from '../../utils/GetUIColors';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import { PressableScale } from 'react-native-pressable-scale';
import { Check, Send } from 'lucide-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const NewConversation = ({ navigation }: {
  navigation: any // TODO
}) => {
  const appContext = useAppContext();
  const UIColors = GetUIColors();

  const [recipients, setRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');

  // add loading indicator to header
  React.useLayoutEffect(() => {
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
  }, [navigation, subject, content, selectedRecipients]);

  const sendMessage = () => {
    if (!appContext.dataProvider) {
      Alert.alert(
        'Erreur',
        'La connexion est serveur n\'est pas encore disponible, réessayez plus tard.',
        [{ text: 'OK' }],
        { cancelable: false }
      );

      return;
    }

    // list names of selected recipients
    let recipientsNames = [];

    for (let i = 0; i < recipients.length; i++) {
      if (selectedRecipients.includes(recipients[i].id)) {
        recipientsNames.push(recipients[i].name);
      }
    }

    let subjectToSend = subject;
    if (subjectToSend == '') {
      subjectToSend = 'Aucun sujet';
    }

    let messageToSend = content;
    if (messageToSend == '') {
      Alert.alert(
        'Message vide',
        'Vous ne pouvez pas envoyer un message vide.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
    }

    let recipientsToSend = selectedRecipients;

    appContext.dataProvider.createDiscussion(
      subjectToSend,
      messageToSend,
      recipientsToSend
    ).then((result) => {
      if (result.status === 'ok') {
        AsyncStorage.setItem('hasNewMessagesSent', 'true');
        navigation.goBack();
      } else {
        Alert.alert(
          'Erreur',
          'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.',
          [{ text: 'OK' }],
          { cancelable: false }
        );
      }
    });
  };

  useEffect(() => {
    if (recipients.length === 0) {
      appContext.dataProvider?.getRecipients().then((v) => {
        if (v) setRecipients(v);
        setLoading(false);
      });
    }
  }, [recipients]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior='automatic'
      style={{ backgroundColor: UIColors.modalBackground }}
    >
      <StatusBar animated barStyle={'light-content'} />

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
                checked={selectedRecipients.includes(item.id)}
                pressed={() => {
                  if (selectedRecipients.includes(item.id)) {
                    setSelectedRecipients(selectedRecipients.filter((e) => e !== item.id));
                  } else {
                    setSelectedRecipients([...selectedRecipients, item.id]);
                  }
                }}
              />
            }
            onPress={() => {
              if (selectedRecipients.includes(item.id)) {
                setSelectedRecipients(selectedRecipients.filter((e) => e !== item.id));
              } else {
                setSelectedRecipients([...selectedRecipients, item.id]);
              }
            }}
          >
            <NativeText heading="h4">
              {item.name}
            </NativeText>
            <NativeText heading="p2">
              {item.functions.join(', ')}
            </NativeText>
            <NativeText heading="subtitle1">
              {item.type == 'teacher' ? 'Professeur' : 'Personnel'}
            </NativeText>
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
