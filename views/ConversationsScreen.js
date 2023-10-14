import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';

import { Text, useTheme } from 'react-native-paper';
import GetUIColors from '../utils/GetUIColors';

import ListItem from '../components/ListItem';
import PapillonList from '../components/PapillonList';

import { IndexData } from '../fetch/IndexData';

function relativeDate(date) {
  const now = new Date();
  const diff = now - date;

  if (diff < 1000 * 60) {
    return "À l'instant";
  }
  if (diff < 1000 * 60 * 60) {
    return `${Math.floor(diff / (1000 * 60))} minute(s)`;
  }
  if (diff < 1000 * 60 * 60 * 24) {
    return `${Math.floor(diff / (1000 * 60 * 60))} heure(s)`;
  }
  if (diff < 1000 * 60 * 60 * 24 * 7) {
    return `${Math.floor(diff / (1000 * 60 * 60 * 24))} jour(s)`;
  }
  if (diff < 1000 * 60 * 60 * 24 * 30) {
    return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 7))} semaine(s)`;
  }
  if (diff < 1000 * 60 * 60 * 24 * 365) {
    return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 30))} moi(s)`;
  }
  return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 365))} an(s)`;
}

function ConversationsScreen({ navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [conversations, setConversations] = React.useState([]);

  useEffect(() => {
    IndexData.getConversations().then((v) => {
      console.log(v);
      setConversations(v);
    });
  }, []);

  function getInitials(name) {
    let initials = name.match(/\b\w/g) || [];

    // if first initial is M and there is a second initial, use the second initial

    if (initials[0] === 'M' && initials[1]) {
      initials.shift();
    }

    return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
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

      <PapillonList inset grouped>
        { conversations.map((conversation, index) => (
          <ListItem
            key={index}
            title={conversation.subject}
            subtitle={conversation.messages[conversation.messages.length - 1].content.replace(/(\r\n|\n|\r)/gm," ")}
            undertitle={"il y a " + relativeDate(new Date(conversation.messages[conversation.messages.length - 1].date))}
            width
            trimSubtitle
            chevron
            center
            left={
              <View style={{ width: 36, height: 36, borderRadius: 38, backgroundColor: UIColors.primary + '22', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: UIColors.primary }}>{getInitials(conversation.creator)}</Text>
              </View>
            }
            onPress={() => {
              navigation.navigate('InsetConversationsItem', { conversation: conversation });
            }}
          />
        )) }
      </PapillonList>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});

export default ConversationsScreen;
