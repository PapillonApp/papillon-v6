import * as React from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  StatusBar,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import fr from 'dayjs/locale/fr';

import GetUIColors from '../../utils/GetUIColors';
import { Text } from 'react-native-paper';

import { GiftedChat, Bubble, InputToolbar, Send } from 'react-native-gifted-chat'

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../../utils/AppContext';

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { Send as SendLucide, X } from 'lucide-react-native';

import { Linking } from 'react-native';

import * as WebBrowser from 'expo-web-browser';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

function getInitials(name) {
  if (name === undefined) {
    return 'M';
  }

  // if first letter is M, remove it
  if (name.startsWith('M. ')) {
    name = name.substring(3);
  }

  let initials = name[0];

  for (let i = 0; i < name.length; i++) {
    if (name[i] === ' ' && initials.length < 2) {
      initials += name[i + 1];
    }
  }

  return initials;
}

function convertPronoteMessages(messages, userData) {
  let msgs = [];

  console.log(messages);

  for (let i = messages.length - 1; i >= 0; i--) {
    let msg = JSON.parse(JSON.stringify(messages[i]));

    let avatar = undefined;
    let id = null;

    if (msg.author === null || msg.author === 'Inconnu') {
      msg.author = undefined;
      id = 1;
    }

    msgs.push({
      _id: msg.id,
      text: msg.content,
      createdAt: new Date(msg.date),
      user: {
        _id: id || getInitials(msg.author),
        name: msg.author,
        avatar: avatar,
        initials: getInitials(msg.author),
      },
      sent: true,
      received: msg.seen,
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

  const tabBarHeight = useBottomTabBarHeight(); 

  const conversation = route.params.conversation;
  const [msgs, setMsgs] = useState([]);

  const [recipientsModalVisible, setRecipientsModalVisible] = useState(false);

  // User data
  const [userData, setUserData] = useState({});
  const [profilePicture, setProfilePicture] = useState('');

  const appctx = useAppContext();

  const [urlOpened, setUrlOpened] = useState(false);

  function openURL(url) {
    setUrlOpened(true);

    WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'done',
      presentationStyle: 'pageSheet',
      controlsColor: UIColors.primary,
    }).then(() => {
      setUrlOpened(false);
    });
  }

  useEffect(() => {
    if (conversation.unread > 0) {
      appctx.dataprovider.readStateConversation(conversation.local_id).then((result) => {
        if (result.status === 'ok') {
          AsyncStorage.setItem('hasNewMessagesSent', 'true');
        }
      });
    }
  }, []);

  useEffect(() => {
    appctx.dataprovider.getUser(false).then((result) => {
      setUserData(result);
      setProfilePicture(result.profile_picture);

      setMsgs(convertPronoteMessages(conversation.messages, result));
    });
  }, []);
    
  // set header title
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitleVisible: false,
      headerTitle : Platform.OS === 'ios' ? () => (
        <TouchableOpacity style={{flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden', width: '100%', paddingRight: 56}} onPress={() => openModal()}>
          <Text style={{fontFamily: 'Papillon-Semibold', fontSize: 17, color: UIColors.text, flex: 1}} numberOfLines={1}>
            {conversation.subject}
          </Text>
          <Text style={{fontFamily: 'Papillon-Medium', fontSize: 14.5, color: UIColors.text + '99', flex: 1}} numberOfLines={1}>
            {conversation.participants.join(', ')}
          </Text>
        </TouchableOpacity>
      ) : conversation.subject,
    });
  }, [navigation, conversation]);

  const openModal = () => {
    setRecipientsModalVisible(true)
    setUrlOpened(true);
  }

  const sendMessage = (msg) => {
    let newMessage = {
      ...msg,
      _id: msgs.length + 1,
      date: new Date().toISOString(),
      user: {
        _id: 1,
      },
    };
   
    
    let content = msg[0].text;

    appctx.dataprovider.replyToConversation(conversation.local_id, content).then((result) => {
      console.log(result);
      if (result.status === 'ok') {
        setMsgs(GiftedChat.append(msgs, msg));
      }
    });

    // save newMessages to AsyncStorage
    AsyncStorage.setItem('hasNewMessagesSent', 'true');
  }

  return (
    <View style={{backgroundColor: UIColors.background, flex: 1}}>
      <StatusBar
        animated
        barStyle={
          !urlOpened ?
            UIColors.theme === 'dark' ? 'light-content' : 'dark-content'
          : 'light-content'
        }
      />

        <GiftedChat

          messages={msgs}
          onSend={sendMessage}
          user={{
            _id: 1,
          }}

          renderUsernameOnMessage={true}

          timeFormat="HH:mm"
          dateFormat="dddd DD MMMM"

          locale='fr'

          renderAvatar={(props) => {
            return (
              <View style={{width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: UIColors.primary + '22', alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontFamily: 'Papillon-Medium', fontSize: 20, textAlign: 'center', color: UIColors.primary}}>
                  {props.currentMessage.user.initials}
                </Text>
              </View>
            )
          }}

          renderBubble={(props) => {
            return (
              <Bubble
                {...props}
                textStyle={{
                  right: {
                    color: "#ffffff",
                    fontFamily: 'Papillon-Medium',
                  },
                  left: {
                    color: UIColors.text,
                    fontFamily: 'Papillon-Medium',
                  },
                }}
                wrapperStyle={{
                  left: {
                    backgroundColor: UIColors.element,
                    borderRadius: 14,
                    borderCurve: 'continuous',
                    paddingHorizontal: 2,
                    paddingVertical: 3,
                  },
                  right: {
                    backgroundColor: UIColors.primary,
                    borderRadius: 14,
                    borderCurve: 'continuous',
                    paddingHorizontal: 2,
                    paddingVertical: 3,
                  }
                }}
              />
            )
          }}

          parsePatterns={(linkStyle) => [
            {
              type: 'url',
              style: {
                textDecorationLine: 'underline',
              },
              onPress: (url) => {
                openURL(url);
              },
            },
          ]}

          renderInputToolbar={(props) => {
            return (
              <InputToolbar
                {...props}
                containerStyle={{
                  backgroundColor: UIColors.element + 'FF',
                  borderTopColor: UIColors.border,
                  borderTopWidth: 1,
                  padding: 0,
                  paddingTop: 6,
                }}
                primaryStyle={{
                  backgroundColor: UIColors.element + '00',
                  paddingLeft: 10,
                }}
                textInputStyle={{
                  color: UIColors.text,
                  fontFamily: 'Papillon-Medium',
                }}
              />
            )
          }}

          renderSend={(props) => {
            return (
              <Send
                {...props}
                containerStyle={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View style={{marginRight: 18, alignSelf: 'center', marginTop:-6}}>
                  <SendLucide {...props} color={UIColors.primary} />
                </View>
              </Send>
            )
          }}

          placeholder="Écrire un message..."

          minInputToolbarHeight={50}
          bottomOffset={tabBarHeight}
        />

      <Modal
        animationType="slide"
        presentationStyle='pageSheet'
        visible={recipientsModalVisible}
        onRequestClose={() => {
          setRecipientsModalVisible(false);
          setUrlOpened(false);
        }}
      >
        <View style={{flex: 1, backgroundColor: UIColors.modalBackground}}>
          <View style={[styles.modalHeader, {backgroundColor: UIColors.element, borderColor: UIColors.text + '18'}]}>
            <NativeText heading="h4">
              Liste des participants
            </NativeText>

            <TouchableOpacity
              onPress={() => {
                setRecipientsModalVisible(false);
                setUrlOpened(false);
              }}
              style={{
                position: 'absolute',
                right: 18,
                backgroundColor: UIColors.text + '18',
                borderRadius: 100,
                padding: 4,
              }}
            >
              <X size={24} color={UIColors.text + '99'} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <NativeList
              inset
              header="Participants"
            >
              
              { conversation.participants.map((participant, index) => (
                <NativeItem
                  key={index}
                >
                  <NativeText heading="p">
                    {participant}
                  </NativeText>
                </NativeItem>
              )) }
            </NativeList>

            <View style={{height: 20}} />
          </ScrollView>
        </View>
      </Modal>
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

  modalHeader: {
    padding: 18,
    borderBottomWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MessagesScreen;