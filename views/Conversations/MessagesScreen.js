import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';

import { IndexData } from '../../fetch/IndexData';

import GetUIColors from '../../utils/GetUIColors';
import { Text } from 'react-native-paper';

import { GiftedChat } from 'react-native-gifted-chat'

function convertPronoteMessages(messages) {
  let msgs = [];
  for (let i = 0; i < messages.length; i++) {
    let msg = messages[i];
    msgs.push({
      _id: msg.id,
      text: msg.content,
      createdAt: new Date(msg.date),
      user: {
        _id: msg.author[0] + msg.author[1] + msg.author[2],
        name: msg.author,
      },
      sent: true,
      received: true,
    });
  }
  return msgs;
}

const MessagesScreen = ({ route, navigation }) => {
  const UIColors = GetUIColors();

  const conversation = route.params.conversation;
  const [msgs, setMsgs] = useState(convertPronoteMessages(conversation.messages));

  // User data
  const [userData, setUserData] = useState({});
  const [profilePicture, setProfilePicture] = useState('');

  useEffect(() => {
    IndexData.getUser(false).then((result) => {
      setUserData(result);
      setProfilePicture(result.profile_picture);
    });
  }, []);
    
  // set header title
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: conversation.subject });
  }, [navigation, conversation]);

  const sendMessage = (msg) => {


    let newMessage = {
      _id: msgs.length + 1,
      text: msg.text,
      date: new Date().toISOString(),
      user : {
        id: '1',
        name: userData.name,
        avatar: profilePicture,
      },
      pending: true,
      sent: false,
      received: false,
    };

    setMsgs(GiftedChat.append(msgs, newMessage));
  }

  return (
    <GiftedChat
    styles
      messages={msgs}
      onSend={messages => {
        sendMessage(messages[0]);
      }}
      user={{
        _id: '1',
        name: userData.name,
        avatar: profilePicture,
      }}

      placeholder='Écrire un message...'
      locale={require('dayjs/locale/fr')}

      renderUsernameOnMessage
    />
  )
}

const styles = StyleSheet.create({
});

export default MessagesScreen;