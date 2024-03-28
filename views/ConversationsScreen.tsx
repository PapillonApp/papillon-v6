import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
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

import { Text, useTheme } from 'react-native-paper';
import GetUIColors from '../utils/GetUIColors';

import { useAppContext } from '../utils/AppContext';

import { atom, useAtom } from 'jotai';
import { discussionsAtom } from '../atoms/discussions';

import PapillonLoading from '../components/PapillonLoading';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

import { MessageCircle, Plus, Search } from 'lucide-react-native';
import type { PapillonDiscussion } from '../fetch/types/discussions';

function ConversationsScreen({ navigation }: {
  navigation: any // TODO
}) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [loading, setLoading] = useState(true);
  const [headLoading, setHeadLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const [conversations, setConversations] = useAtom(discussionsAtom);
  const [filteredConversations] = useAtom<PapillonDiscussion[] | null>(
    useMemo(
      () => atom((get) => {
        const conversations = get(discussionsAtom);
        if (conversations === null || searchFilter.length === 0) return conversations;

        const filteredConversations = conversations.filter(
          (conversation) => conversation.subject.toLowerCase().includes(searchFilter.toLowerCase())
        );

        return filteredConversations;
      }),
      [searchFilter]
    )
  );

  const appContext = useAppContext();
  const refreshConversations = async () => {
    if (!appContext.dataProvider) return;
    const value = await appContext.dataProvider.getConversations();

    setConversations(value);
  };

  useEffect(() => { // refresh conversations on mount.
    (async () => {
      await refreshConversations();
      setLoading(false);
    })();
  }, [appContext.dataProvider]);

  const getInitials = (name: string) => {
    if (!name) return '';

    let initials = name.match(/\b\w/g) || [];
    if (initials[0] === 'M' && initials[1]) {
      initials.shift();
    }

    return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
  };

  function trimHtml(html: string) {
    // remove &nbsp;
    html = html.replace(/&nbsp;/g, '');
    // remove html tags and the first space if it's there
    html = html.replace(/<[^>]*>/g, '').replace(/^ /, '');
    // remove multiple spaces
    html = html.replace(/\s{2,}/g, ' ');
    // remove line breaks
    html = html.replace(/\n{1,}/g, '');
    return html;
  }

  // Add search functionality and new conversation button.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Messages',
      headerBackTitle: 'Retour',
      headerTintColor: UIColors.text,
      headerShadowVisible: Platform.OS == 'ios',
      headerLargeTitle: false,
      headerStyle: {
        backgroundColor: Platform.OS == 'android' && UIColors.background,
      },
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
          setSearchFilter(text);
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
            await refreshConversations();
            setHeadLoading(false);
          }}
        />
      }
    >
      <StatusBar
        animated
        translucent
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />

      {loading && (
        <PapillonLoading
          title="Chargement des conversations"
          subtitle="Veuillez patienter pendant que nous récupérons vos conversations."
        />
      )}

      {!loading && (conversations && conversations.length === 0) && (
        <PapillonLoading
          icon={<MessageCircle size={28} color={UIColors.text} />}
          title="Aucune conversation"
          subtitle="Vous n'avez eu aucune conversation."
        />
      )}

      {!loading && (conversations && conversations.length > 0) && (filteredConversations && filteredConversations.length === 0) && (
        <PapillonLoading
          icon={<Search size={28} color={UIColors.text} />}
          title="Aucune conversation trouvée"
          subtitle="Utilisez d'autres mots clés, ceux que vous avez rentrer ne donnent rien."
        />
      )}

      {filteredConversations && filteredConversations.length > 0 && (
        <NativeList inset>
          {filteredConversations.map((conversation) => (
            <NativeItem key={conversation.local_id}
              chevron
              leading={
                <View style={{ width: 36, height: 36, borderRadius: 38, backgroundColor: '#B18619' + '22', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, color: '#B18619' }}>{getInitials(conversation.creator)}</Text>
                </View>
              }
              onPress={() => {
                navigation.navigate('InsetConversationsItem', { conversationID: conversation.local_id });
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                {conversation.unread > 0 && (
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
                )}

                <NativeText heading="h4">
                  {conversation.subject}
                </NativeText>
              </View>

              <NativeText heading="p2" numberOfLines={1}>
                {trimHtml(conversation.messages[conversation.messages.length - 1].content.replace(/(\r\n|\n|\r)/gm,' '))}
              </NativeText>

              <NativeText heading="subtitle2" style={{marginTop: 5}} numberOfLines={1}>
                {conversation.messages[conversation.messages.length - 1].author || 'Vous'} | {moment(conversation.messages[conversation.messages.length - 1].timestamp).fromNow()}
              </NativeText>
            </NativeItem>
          ))}
        </NativeList>
      )}
    </ScrollView>
  );
}

export default ConversationsScreen;
