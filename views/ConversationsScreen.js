import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, StatusBar, Platform } from 'react-native';

import { useTheme } from 'react-native-paper';
import GetUIColors from '../utils/GetUIColors';

import { WillBeSoon } from './Global/Soon';
import { useAppContext } from '../utils/AppContext';

function ConversationsScreen() {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const appctx = useAppContext();

  useEffect(() => {
    appctx.dataprovider.getConversations().then((v) => {
      console.log(v);
    });
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
      contentInsetAdjustmentBehavior="automatic"
    >
      {Platform.OS === 'ios' ? (
        <StatusBar animated barStyle="light-content" />
      ) : (
        <StatusBar
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
      )}

      <WillBeSoon name="Les conversations" plural />
    </ScrollView>
  );
}

const styles = StyleSheet.create({});

export default ConversationsScreen;
