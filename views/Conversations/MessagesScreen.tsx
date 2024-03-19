import React, { useState, useEffect, useLayoutEffect } from 'react';

import {
  View,
  FlatList,
  StyleSheet,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';

import { RenderHTML } from 'react-native-render-html';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PapillonDiscussionMessage } from '../../fetch/types/discussions';
import { useAppContext } from '../../utils/AppContext';

import * as WebBrowser from 'expo-web-browser';

import GetUIColors from '../../utils/GetUIColors';
import { Send as SendLucide } from 'lucide-react-native';

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

const MessagesScreen = ({ route, navigation }) => {
  const UIColors = GetUIColors();
  const appContext = useAppContext();
  const insets = useSafeAreaInsets();

  const { conversationID } = route.params;
  const conversations = useAtomValue(discussionsAtom);
  const conversation = conversations!.find((conversation) => conversation.local_id === conversationID)!;

  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      if (!appContext.dataProvider) return;

      const userData = await appContext.dataProvider.getUser();
      setUser(userData);
    })();
  }, []);

  const openURL = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: 'formSheet',
      controlsColor: UIColors.primary,
    });
  };

  const sendMessage = (text: string) => {
    console.log('Sending message:', text);
  }

  // header text is the subject of the conversation
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
      behavior="padding"
      keyboardVerticalOffset={insets.bottom + 38}
    >
      <FlatList
        data={conversation.messages}
        keyExtractor={(message) => message.id}
        style={[
          {
            flex: 1,
          },
        ]}
        inverted
        renderItem={({ item }) => (
          <PapillonMessage
            message={item}
            UIColors={UIColors}
            sent={item.author === `${user?.name} (${user?.class})`}
            user={user}
          />
        )}
        ListHeaderComponent={<View style={{ height: insets.bottom + 12 }} />}
      />
      <PapillonSend UIColors={UIColors} sendFunction={sendMessage} insets={insets} />
    </KeyboardAvoidingView>
  );
};

const PapillonMessage = ({ message, UIColors, sent, user }) => {
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
          { !sent ? (
            <Text
              style={[
                {
                  color: '#ffffff',
                  fontSize: 16,
                  fontFamily: 'Papillon-Medium',
                },
              ]}
            >
              {getInitials(message.author)}
            </Text>
          ) : null}
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

const PapillonSend = ({ sendFunction = (text) => {}, UIColors, insets }) => {
  const [textValue, setTextValue] = useState('');

  return (
    <View
      style={[
        {
          backgroundColor: UIColors.background,
          borderRadius: 21,
          borderCurve: 'continuous',
          marginHorizontal: 15,
          borderColor: UIColors.text + '20',
          borderWidth: 1,
          paddingHorizontal: 16,
          marginTop: -30,
          marginBottom: insets.bottom,
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
        onPress={() => {
          sendFunction(textValue);
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
