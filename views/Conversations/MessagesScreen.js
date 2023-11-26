import * as React from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';

import GetUIColors from '../../utils/GetUIColors';
import { Text } from 'react-native-paper';

import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat'

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../../utils/AppContext';

function convertPronoteMessages(messages) {
  let msgs = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    let msg = messages[i];

    if (msg.author === null) {
      msg.author = 'Inconnu';
    }

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

  msgs.push({
    _id: 1,
    text: "Vous avez rejoint la conversation",
    createdAt: new Date(messages[0].date),
    system: true,
  });

  return msgs;
}

function MessagesScreen ({ route, navigation }) {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const conversation = route.params.conversation;
  console.log(conversation);

  const [msgs, setMsgs] = useState(convertPronoteMessages(conversation.messages));

  // User data
  const [userData, setUserData] = useState({});
  const [profilePicture, setProfilePicture] = useState('');

  const appctx = useAppContext();

  useEffect(() => {
    appctx.dataprovider.getUser(false).then((result) => {
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

    // setMsgs(GiftedChat.append(msgs, newMessage));
    
    Alert.alert(
      "Envoi de message indisponible",
      "L'envoi de message n'est pas encore disponible sur Papillon, ça arrive bientôt...",
      [
        {
          text: "Ok",
          style: "cancel"
        }
      ]
    );
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

        renderMessageText={(props) => {
          return (
            <Text style={{ color: UIColors.text, fontSize: 16, padding: 10, paddingBottom: 0 }}>{props.currentMessage.text}</Text>
          )
        }}

        textInputStyle={{
          color: UIColors.text,
          marginTop: 10,
          
        }}

        minInputToolbarHeight={48}

        renderInputToolbar={(props) => {
          return (
            <InputToolbar
              {...props}
              containerStyle={{
                backgroundColor: UIColors.element,
                borderTopColor: UIColors.text + '26',
                paddingHorizontal: 5,
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