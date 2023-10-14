import * as React from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';

import { IndexData } from '../../fetch/IndexData';

import GetUIColors from '../../utils/GetUIColors';
import { Text } from 'react-native-paper';

import { GiftedChat, Bubble } from 'react-native-gifted-chat'

import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

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
      ...msg,
      _id: msgs.length + 1,
      date: new Date().toISOString(),
    };

    setMsgs(GiftedChat.append(msgs, newMessage));
  }

  return (
    <View style={{backgroundColor: UIColors.background, flex: 1}}>
      <GiftedChat
        style={{ backgroundColor: UIColors.element }}
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

        bottomOffset={insets.bottom + 48}

        renderBubble={(props) => {
          return (
            <Bubble
              {...props}
              wrapperStyle={{
                left: {
                  backgroundColor: UIColors.element,
                },
                right: {
                  backgroundColor: UIColors.primary,
                },
              }}
            />
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  input : {
    borderRadius: 10,
    padding: 10,
    margin: 10,
    flex: 1,
    width: '100%',
    height: 40,
  },
});

export default MessagesScreen;