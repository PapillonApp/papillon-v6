import React, { useState, useEffect } from 'react';
import { Alert, View, StatusBar, ScrollView, useWindowDimensions, Text, Button, TouchableOpacity, Platform } from 'react-native';

import GetUIColors from '../utils/GetUIColors';
import { licenceFile } from './NewAuthStack/LicenceFile';

import * as Haptics from 'expo-haptics';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import RenderHtml from 'react-native-render-html';


const ConsentScreenWithoutAcceptation = ({ navigation }: { navigation: any }) => {
  const UIColors = GetUIColors();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const defaultHTMLTextProps = {};

  const [canAccept, setCanAccept] = useState(false);

  // header right button
  useEffect(() => {
    navigation.setOptions({
      headerTitle: Platform.OS ==='ios' ? ' ' : 'Termes & conditions',
      headerLeft: Platform.OS ==='ios' ? () => (
        <Text
          style={{
            color: UIColors.text,
            fontSize: 17,
            fontFamily: 'Papillon-Semibold',
          }}
        >
          Termes & conditions
        </Text>
      ) : () => null,
    });
  }, [canAccept, UIColors]);

  // haptic when can accept
  useEffect(() => {
    if (canAccept) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [canAccept]);

  return (
    <ScrollView
      style={{
        backgroundColor: UIColors.background,
      }}
      scrollEventThrottle={16}
      onScroll={({ nativeEvent }) => {
        if (nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - 50) {
          setCanAccept(true);
        }
      }}
    >
      { Platform.OS === 'ios' ? ( 
        <StatusBar barStyle="light-content" backgroundColor={UIColors.background} />
      ) : (
        <StatusBar translucent backgroundColor="transparent" barStyle={UIColors.dark ? 'light-content' : 'dark-content'} />
      ) }

      

      <RenderHtml
        contentWidth={width}
        defaultTextProps={defaultHTMLTextProps}
        source={{ html: licenceFile }}
        
        baseStyle={{
          fontSize: 15,
          color: UIColors.text,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 10,
        }}

        tagsStyles={{
          p: {
            marginBottom: 0,
          },
          ul: {
            marginLeft: -10,
          },
          li: {
            marginBottom: 5,
            marginLeft: 10,
            marginBottom: 10,
          },
        }}
      />

      

    </ScrollView>
  );
};

export default ConsentScreenWithoutAcceptation;
