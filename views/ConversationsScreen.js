import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';

import { Text, useTheme } from 'react-native-paper';
import GetUIColors from '../utils/GetUIColors';

import { SFSymbol } from 'react-native-sfsymbols';
import PapillonInsetHeader from '../components/PapillonInsetHeader';

import { useAppContext } from '../utils/AppContext';

import ListItem from '../components/ListItem';
import PapillonList from '../components/PapillonList';

import PapillonLoading from '../components/PapillonLoading';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';

function ConversationsScreen({ navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const [conversations, setConversations] = React.useState([]);
  const [originalConversations, setOriginalConversations] = React.useState([]); // for search

  const [loading, setLoading] = React.useState(true);
  const [headLoading, setHeadLoading] = React.useState(false);

  const appctx = useAppContext();

  useEffect(() => {
    appctx.dataprovider.getConversations().then((v) => {
      if (v) {
        setConversations(v);
        setOriginalConversations(v);
        setLoading(false);
      }
    });
  }, []);

  function getInitials(name) {
    if (name == null) return '';

    let initials = name.match(/\b\w/g) || [];

    // if first initial is M and there is a second initial, use the second initial

    if (initials[0] === 'M' && initials[1]) {
      initials.shift();
    }

    return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
  }

  // add search functionality
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: Platform.OS === 'ios' ? () => (
        <PapillonInsetHeader
          icon={<SFSymbol name="bubble.left.circle.fill" />}
          title="Conversations"
          color="#B18619"
          inset
        />
      ) : 'Conversations',
      headerBackTitleVisible: false,
      headerTintColor: UIColors.text,
      headerSearchBarOptions: {
        placeholder: 'Rechercher une conversation',
        cancelButtonText: 'Annuler',
        onChangeText: (event) => {
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
      style={[styles.container, { backgroundColor: UIColors.background }]}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={headLoading}
          onRefresh={() => {
            setHeadLoading(true);
            appctx.dataprovider.getConversations().then((v) => {
              if (v) {
                setConversations(v);
                setOriginalConversations(v);
                setHeadLoading(false);
              }
            });
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
                <View style={{ width: 36, height: 36, borderRadius: 38, backgroundColor: UIColors.primary + '22', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, color: UIColors.primary }}>{getInitials(conversation.creator)}</Text>
                </View>
              }
              onPress={() => {
                navigation.navigate('InsetConversationsItem', { conversation: conversation });
              }}
            >
              <NativeText heading="h4">{conversation.subject}</NativeText>
              <NativeText heading="p2" numberOfLines={1}>
                {conversation.messages[conversation.messages.length - 1].content.replace(/(\r\n|\n|\r)/gm," ")}
              </NativeText>
              <NativeText heading="subtitle2" style={{marginTop: 5}} numberOfLines={1}>
                {new Date(conversation.messages[conversation.messages.length - 1].date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
              </NativeText>
            </NativeItem>
          )) }
        </NativeList>
      ) }
    </ScrollView>
  );
}

const styles = StyleSheet.create({});

export default ConversationsScreen;
