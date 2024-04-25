import React, { useState, useEffect, useLayoutEffect } from 'react';

import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import type { PapillonUser } from '../../fetch/types/user';
import type { PapillonDiscussionMessage } from '../../fetch/types/discussions';

import { RenderHTML } from 'react-native-render-html';

import { useAppContext } from '../../utils/AppContext';

import * as WebBrowser from 'expo-web-browser';
import GetUIColors from '../../utils/GetUIColors';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Send as SendLucide } from 'lucide-react-native';

import { useAtom } from 'jotai';
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

const MessagesScreen = ({ route, navigation }: {
  navigation: any;
  route: {
    params: {
      conversationID: string;
    }
  }
}) => {
  const UIColors = GetUIColors();
  const appContext = useAppContext();
  const headerHeight  = useHeaderHeight();

  const { conversationID } = route.params;
  const [conversations, setConversations] = useAtom(discussionsAtom);
  const conversation = conversations!.find((conversation) => conversation.local_id === conversationID)!;

  const [user, setUser] = useState<PapillonUser | null>(null);

  useEffect(() => {
    (async () => {
      if (!appContext.dataProvider) return;

      const userData = await appContext.dataProvider.getUser();
      setUser(userData);
    })();
  }, [appContext.dataProvider]);

  const sendMessage = async (text: string) => {
    console.log(conversation);
    if (!appContext.dataProvider) throw new Error('No data provider available.');
    const messages = await appContext.dataProvider.replyToConversation(conversationID, text);
    
    if (messages === null) {
      Alert.alert(
        'Erreur',
        'Impossible d\'envoyer le message.',
        [{ text: 'OK' }],
        { cancelable: false }
      );

      return;
    }

    setConversations((conversations) => {
      if (!conversations) return [];
      const copy = [...conversations];

      const conversationIndex = copy.findIndex((c) => c.local_id === conversation.local_id);
      copy[conversationIndex].messages = messages;
      return copy;
    });
  };

  // Header text is the subject of the conversation.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: conversation.subject,
      headerBackTitle: 'Retour',
      headerTintColor: UIColors.text,
    });
  }, [navigation, conversation, UIColors]);

  return (
    <KeyboardAvoidingView
      style={[
        {
          flex: 1,
          backgroundColor: UIColors.background,
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}
    >
      <FlatList
        data={conversation.messages}
        keyExtractor={(message) => message.id}
        style={[
          {
            marginBottom: 16,
            flex: 1,
          },
        ]}
        inverted
        renderItem={({ item }) => (
          <PapillonMessage
            message={item}
            sent={item.author === `${user?.name} (${user?.class})`}
          />
        )}
      />
      <PapillonSend sendFunction={sendMessage}/>
    </KeyboardAvoidingView>
  );
};

const PapillonMessage = ({ message, sent }: {
  message: PapillonDiscussionMessage
  /** Whether the message was sent by the user or no. */
  sent: boolean
}) => {
  const UIColors = GetUIColors();

  const openURL = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: UIColors.primary,
    });
  };

  return (
    <View
      style={[styles.PapillonMessageContainer, sent ? styles.PapillonMessageContainerSent : {}]}
    >
      { !sent ? (
        <View
          style={[{
            backgroundColor: UIColors.primary,
            width: 34,
            height: 34,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
          }]}
        >
          {!sent && (
            <Text
              style={[
                {
                  color: '#ffffff',
                  fontSize: 16,
                  fontFamily: 'Papillon-Medium',
                },
              ]}
            >
              {getInitials(message.author!)}
            </Text>
          )}
        </View>
      ) : null}
      <View
        style={[
          {
            flex: 1,
          },
        ]}
      >
        <View>
          <Text
            style={[
              {
                color: UIColors.text + '80',
                fontSize: 12,
                marginBottom: 6,
                marginLeft: 12,
              },
            ]}
          >
            {message.author}
          </Text>
        </View>
        <View
          style={[styles.PapillonMessageBubble,
            {
              backgroundColor: !sent ? UIColors.text + '15' : UIColors.primary,
            },
          ]}
        >
          <RenderHTML
            source={{ html: message.content as string }}
            baseStyle={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              color: !sent ? UIColors.text : '#ffffff',
              fontSize: 16,
            }}
            tagsStyles={{
              a: {
                color: UIColors.primary,
              },
            }}
            ignoredStyles={['fontSize']}
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
        </View>
      </View>
    </View>
  );
};

const PapillonSend = ({ sendFunction }: {
  sendFunction: (text: string) => Promise<void>;
}) => {
  const UIColors = GetUIColors();
  const [textValue, setTextValue] = useState('');
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          backgroundColor: UIColors.background,
          borderRadius: 21,
          borderCurve: 'continuous',
          marginHorizontal: 15,
          marginBottom: insets.bottom,
          borderColor: UIColors.text + '20',
          borderWidth: 1,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      ]}
    >
      <TextInput
        style={[
          {
            fontSize: 16,
            paddingVertical: 11,
            textAlignVertical: 'center',
            paddingTop: 11,
            color: UIColors.text,
            flex: 1,
          },
        ]}
        placeholder="Envoyer un message"
        placeholderTextColor={UIColors.text + '80'}
        multiline
        value={textValue}
        onChangeText={(text) => setTextValue(text)}
      />
      <TouchableOpacity
        onPress={async () => {
          await sendFunction(textValue);
          setTextValue('');
        }}
        disabled={textValue.length === 0}
      >
        <SendLucide
          size={22}
          strokeWidth={2.4}
          color={textValue.length > 0 ? UIColors.primary : UIColors.border}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  PapillonMessageContainer: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  PapillonMessageContainerSent: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    paddingRight: 42,
  },
  PapillonMessageBubble: {
    paddingVertical: 4,
    paddingHorizontal: 4,

    borderRadius: 18,
    borderCurve: 'continuous',
  },
  PapillonMessageText: {
    fontSize: 15.5,
  },
});

export default MessagesScreen;
