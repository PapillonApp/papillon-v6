import React, { useState, useEffect } from 'react';

import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Modal,
  Platform,
  Alert
} from 'react-native';

import { RenderHTML } from 'react-native-render-html';

import type { PapillonDiscussionMessage } from '../../fetch/types/discussions';
import { useAppContext } from '../../utils/AppContext';

import { Text } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { GiftedChat, Bubble, InputToolbar, Send, IMessage } from 'react-native-gifted-chat';

import GetUIColors from '../../utils/GetUIColors';
import { Send as SendLucide, X } from 'lucide-react-native';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import { useAtomValue } from 'jotai';
import { discussionsAtom } from '../../atoms/discussions';

function getInitials(name: string): string {
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

function convertPronoteMessages(messages: PapillonDiscussionMessage[]): IMessage[] {
  const outputMessages: IMessage[] = [];

  for (const message of messages) {
    let id: number | undefined;

    if (!message.author || message.author === 'Inconnu') {
      message.author = undefined;
      id = 1;
    }

    outputMessages.push({
      _id: message.id,
      text: message.content,
      createdAt: new Date(message.timestamp),
      user: {
        _id: id || getInitials(message.author ?? '?'),
        name: message.author,
        avatar: getInitials(message.author ?? '?'),
      },
      sent: true,
      received: true // message.seen,
    });
  }

  outputMessages.push({
    _id: 1,
    text: 'Vous avez rejoint la conversation',
    createdAt: new Date(messages[0].timestamp),
    system: true,
    user: { _id: -1 }
  });

  return outputMessages;
}

function MessagesScreen ({ route, navigation }: {
  navigation: any // TODO
  route: {
    params: {
      conversationID: string
    } 
  }
}) {
  const UIColors = GetUIColors();
  const tabBarHeight = useBottomTabBarHeight(); 
  const appContext = useAppContext();

  const { conversationID } = route.params;
  const conversations = useAtomValue(discussionsAtom);
  const conversation = conversations!.find((conversation) => conversation.local_id === conversationID)!;
  
  const [recipientsModalVisible, setRecipientsModalVisible] = useState(false);
  const [urlOpened, setUrlOpened] = useState(false);
  const [msgs, setMsgs] = useState<IMessage[]>([]);

  async function openURL(url: string): Promise<void> {
    setUrlOpened(true);

    try {
      await WebBrowser.openBrowserAsync(url, {
        dismissButtonStyle: 'done',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        controlsColor: UIColors.primary,
      });
    } catch { /** No-op. */ }
    finally {
      setUrlOpened(false);
    }
  }

  useEffect(() => { // Set the conversation as read when the user opens it.
    (async () => {
      setMsgs(convertPronoteMessages(conversation.messages));

      if (conversation.unread > 0) {
        await appContext.dataProvider?.readStateConversation(conversation.local_id);
        // TODO: mark as read in atom
      }
    })();
  }, [conversation]);

  // set header title
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitleVisible: false,
      headerTintColor: UIColors.text,
      headerShadowVisible: true,
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
    setRecipientsModalVisible(true);
    setUrlOpened(true);
  };

  const sendMessage = async (msg: IMessage[]) => {
    if (!appContext.dataProvider) {
      Alert.alert(
        'Erreur',
        'La connexion est serveur n\'est pas encore disponible, réessayez plus tard.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
      
      return;
    }
    
    let content = msg[0].text;

    await appContext.dataProvider.replyToConversation(conversation.local_id, content);
    setMsgs(GiftedChat.append(msgs, msg));
  };

  return (
    <View style={{backgroundColor: UIColors.backgroundHigh, flex: 1}}>
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
        user={{ _id: 1 }}

        renderUsernameOnMessage={true}

        timeFormat="HH:mm"
        dateFormat="dddd DD MMMM"

        locale='fr'

        renderAvatar={(props) => {
          return (
            <View style={{width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: UIColors.primary + '22', alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{fontFamily: 'Papillon-Medium', fontSize: 20, textAlign: 'center', color: UIColors.primary}}>
                {props.currentMessage?.user.avatar as string}
              </Text>
            </View>
          );
        }}

        renderBubble={(props) => {
          return (
            <Bubble
              {...props}
              renderMessageText={(props) => (
                <RenderHTML
                  source={{ html: props.currentMessage?.text as string }}
                  baseStyle={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    color: props.position === 'left' ? UIColors.text : '#ffffff',
                  }}
                  renderersProps={{
                    a: {
                      onPress (_, href) {
                        let url = href;
                        if (!url.startsWith('http')) {
                          url = 'https://' + url.split('://')[1];
                        }
                        
                        openURL(url);
                      },
                    }
                  }}
                  contentWidth={300}
                />
              )}
              textStyle={{
                right: {
                  color: '#ffffff',
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
          );
        }}

        renderInputToolbar={(props) => {
          return (
            <InputToolbar
              {...props}
              containerStyle={{
                backgroundColor:
                    UIColors.dark ? UIColors.background
                      : UIColors.element + 'FF'
                ,
                borderTopColor:
                    UIColors.dark ? UIColors.text + '22'
                      : UIColors.border
                ,
                borderTopWidth: 1,
                padding: 0,
                paddingTop: 6,
              }}
              primaryStyle={{
                backgroundColor: UIColors.element + '00',
                paddingLeft: 10,
              }}

              // @ts-expect-error : Not sure if this is typed or not in the library.
              textInputStyle={{
                color: UIColors.text,
                fontFamily: 'Papillon-Medium',
              }}
            />
          );
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
          );
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
        <View style={{flex: 1, backgroundColor: UIColors.backgroundHigh}}>
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
              {conversation.participants.map((participant, index) => (
                <NativeItem
                  key={index}
                >
                  <NativeText heading="p">
                    {participant}
                  </NativeText>
                </NativeItem>
              ))}
            </NativeList>

            <View style={{height: 20}} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
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
