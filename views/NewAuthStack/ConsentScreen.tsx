import React, { useState, useEffect } from 'react';
import { Alert, View, StatusBar, ScrollView, useWindowDimensions, Text, Button, TouchableOpacity, Platform } from 'react-native';

import GetUIColors from '../../utils/GetUIColors';
import { licenceFile } from './LicenceFile';

import * as Haptics from 'expo-haptics';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import RenderHtml from 'react-native-render-html';

import { AlertTriangle, Check } from 'lucide-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const ConsentScreen = ({ navigation }: { navigation: any }) => {
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
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (canAccept) {
              // set the consent
              AsyncStorage.setItem('ppln_terms', 'true');

              navigation.goBack();
            }
            else {
              Alert.alert(
                'Termes & conditions',
                'Vous devez lire les termes et conditions avant de continuer.'
              );
            }
          }}
          style={{
            marginRight: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Check
            size={24}
            color={canAccept ? UIColors.primary : UIColors.text + 55}
          />
          <Text
            style={{
              color: canAccept ? UIColors.primary : UIColors.text + 55,
              fontSize: 17,
              fontFamily: 'Papillon-Medium',
            }}
          >
            Accepter
          </Text>
        </TouchableOpacity>
      ),
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

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          paddingHorizontal: 16,
          margin: 16,
          marginTop: 20,
          marginBottom: 0,
          gap: 14,
          backgroundColor: UIColors.primary + '33',
          borderRadius: 10,
          borderCurve: 'continuous',
        }}
      >
        <AlertTriangle size={24} color={UIColors.primary} />
        <Text
          style={{
            flex: 1,
            color: UIColors.text,
            fontSize: 16,
            fontFamily: 'Papillon-Semibold',
          }}
        >
          Vous devez lire et accepter les termes et conditions avant de continuer.
        </Text>
      </View>

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
            marginBottom: 10,
            marginLeft: 10,
          },
        }}
      />

      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
          backgroundColor: canAccept ? UIColors.primary : '#888888',
          opacity: canAccept ? 1 : 0.5,
          margin: 16,
          gap: 9,
          borderRadius: 10,
          borderCurve: 'continuous',
          marginTop: 0,
        }}
        disabled={!canAccept}
        onPress={() => {
          if (canAccept) {
            // set the consent
            AsyncStorage.setItem('ppln_terms', 'true');

            navigation.goBack();
          }
          else {
            Alert.alert(
              'Termes & conditions',
              'Vous devez lire les termes et conditions avant de continuer.'
            );
          }
        }}
      >
        <Check size={24} color={'#ffffff'} />
        <Text style={{ color: '#ffffff', fontSize: 17, fontFamily: 'Papillon-Semibold' }}>
          Accepter
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          color: UIColors.text + '55',
          fontSize: 14,
          fontFamily: 'Papillon-Medium',
          textAlign: 'center',
          marginBottom: insets.bottom + 20,
          marginHorizontal: 16,
        }}
      >
        En acceptant, vous certifiez avoir pris connaissance des termes et conditions de l'application et vous vous engagez à les respecter.
      </Text>
    </ScrollView>
  );
};

export default ConsentScreen;
