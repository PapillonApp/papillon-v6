import React from 'react';
import { StatusBar, StyleSheet, TextInput, Platform, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import GetUIColors from '../../../utils/GetUIColors';

import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';

import { Link2 } from 'lucide-react-native';
import AlertBottomSheet from '../../../interface/AlertBottomSheet';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LoginURL = ({ navigation }: {
  navigation: any // TODO
}) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const [currentURL, setCurrentURL] = React.useState('');
  const [urlAlert, setURLAlert] = React.useState(false);

  const login = () => {
    if (!currentURL || !currentURL.startsWith('http')) {
      setURLAlert(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    navigation.navigate('NGPronoteWebviewLogin', {
      instanceURL: currentURL
    });
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior='automatic'
      style={[styles.container, {backgroundColor: UIColors.modalBackground}]}
    >

      <AlertBottomSheet
        visible={urlAlert}
        title="Erreur"
        subtitle="Veuillez entrer une URL Pronote"
        icon={<Link2 />}
        cancelAction={() => setURLAlert(false)}
      />

      <StatusBar
        animated
        barStyle={
          Platform.OS === 'ios' ?
            'light-content'
            :
            UIColors.theme == 'light' ?
              'dark-content'
              :
              'light-content'
        }
      />

      <NativeList
        inset
        style={[Platform.OS === 'android' ? { marginTop: insets.top } : null]}
      >
        <NativeItem
          leading={
            <Link2 color={UIColors.text + '88'} />
          }
        >
          <TextInput 
            placeholder="Entrer une URL Pronote"
            placeholderTextColor={UIColors.text + '88'}
            style={[styles.input, {color: UIColors.text}]}
            value={currentURL}
            onChangeText={text => setCurrentURL(text)}
          />
        </NativeItem>
        <NativeItem
          onPress={() => login()}
        >
          <NativeText heading="h4" style={{color: UIColors.primary}}>
            Se connecter
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  input: {
    fontSize: 16,
    fontFamily: 'Papillon-Medium',
    paddingVertical: 4,
  },
});

export default LoginURL;
