import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import moment from 'moment/moment';
import 'moment/locale/fr';
moment.locale('fr');

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Text, useTheme } from 'react-native-paper';
import GetUIColors from '../utils/GetUIColors';

import { useAppContext } from '../utils/AppContext';

import PapillonLoading from '../components/PapillonLoading';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

import { Plus } from 'lucide-react-native';
import type { PapillonDiscussion } from '../fetch/types/discussions';

function ConversationsScreen({ navigation }: {
  navigation: any // TODO
}) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [conversations, setConversations] = React.useState<PapillonDiscussion[]>([]);
  const [originalConversations, setOriginalConversations] = React.useState<PapillonDiscussion[]>([]); // for search

  const [loading, setLoading] = React.useState(true);
  const [headLoading, setHeadLoading] = React.useState(false);

  const appContext = useAppContext();

  useEffect(() => {
    (async () => {
      if (!appContext.dataProvider) return;
      const value = await appContext.dataProvider.getConversations();

      setConversations(value);
      setOriginalConversations(value);
      setLoading(false);
    })();
  }, [appContext.dataProvider]);

  // force refresh when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      AsyncStorage.getItem('hasNewMessagesSent').then((has) => {
        if (has === 'true') {
          AsyncStorage.removeItem('hasNewMessagesSent');
          appContext.dataProvider?.getConversations(true).then((v) => {
            if (v) {
              setConversations(v);
              setOriginalConversations(v);
              setLoading(false);
            }
          });
        }
      });
    });

    return unsubscribe;
  }, [navigation]);

  function getInitials(name: string) {
    if (name == null) return '';

    let initials = name.match(/\b\w/g) || [];

    // if first initial is M and there is a second initial, use the second initial

    if (initials[0] === 'M' && initials[1]) {
      initials.shift();
    }

    return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
  }

  // add search functionality
  // add new conversation button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Conversations',
      headerBackTitle: 'Retour',
      headerTintColor: UIColors.text,
      headerShadowVisible: true,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('InsetNewConversation');
          }}
        >
          <Plus size={24} />
        </TouchableOpacity>
      ),
      headerSearchBarOptions: {
        placeholder: 'Rechercher une conversation',
        cancelButtonText: 'Annuler',
        onChangeText: (event: any) => { // TODO: Type this when `navigation` is typed.
          const text = event.nativeEvent.text.trim();

          if (text.length > 0) {
            // filter conversations
            const filteredConversations = originalConversations.filter(
              (conversation) => conversation.subject.toLowerCase().includes(text.toLowerCase())
            );

            setConversations(filteredConversations);
          } else {
            setConversations(originalConversations);
          }
        },
      },
    });
  }, [navigation]);

  return (
    <ScrollView
      style={{ backgroundColor: UIColors.backgroundHigh }}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={headLoading}
          onRefresh={async () => {
            setHeadLoading(true);

            const conversations = await appContext.dataProvider?.getConversations();
            if (typeof conversations !== 'undefined') {
              setConversations(conversations);
              setOriginalConversations(conversations);
            }

            setHeadLoading(false);
          }}
        />
      }
    >
      <StatusBar
        animated
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />

      { loading && (
        <PapillonLoading
          title="Chargement des conversations"
          subtitle="Veuillez patienter pendant que nous récupérons vos conversations."
        />
      ) }

      { conversations.length > 0 && (
        <NativeList inset>
          { conversations.map((conversation, index) => (
            <NativeItem
              key={index}
              chevron
              leading={
                <View style={{ width: 36, height: 36, borderRadius: 38, backgroundColor: '#B18619' + '22', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, color: '#B18619' }}>{getInitials(conversation.creator)}</Text>
                </View>
              }
              onPress={() => {
                navigation.navigate('InsetConversationsItem', { conversation: conversation });
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                {conversation.unread > 0 ? (
                  <View
                    style={{
                      backgroundColor: '#B18619',
                      borderRadius: 300,
                      padding: 4,
                      marginRight: 2,
                      width: 9,
                      height: 9,
                    }}
                  />
                ) : null}
                <NativeText heading="h4">
                  {conversation.subject}
                </NativeText>
              </View>

              <NativeText heading="p2" numberOfLines={1}>
                {conversation.messages[conversation.messages.length - 1].content.replace(/(\r\n|\n|\r)/gm,' ')}
              </NativeText>

              <NativeText heading="subtitle2" style={{marginTop: 5}} numberOfLines={1}>
                {conversation.messages[conversation.messages.length - 1].author || 'Vous'} | {moment(conversation.messages[conversation.messages.length - 1].timestamp).fromNow()}
              </NativeText>
            </NativeItem>
          )) }
        </NativeList>
      ) }
    </ScrollView>
  );
}

export default ConversationsScreen;
