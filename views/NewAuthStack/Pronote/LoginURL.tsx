import React from 'react';
import { View, StatusBar, StyleSheet, TextInput, Platform, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import GetUIColors from '../../../utils/GetUIColors';

import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';

import { Link2 } from 'lucide-react-native';
import AlertBottomSheet from '../../../interface/AlertBottomSheet';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native-gesture-handler';

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

      <View style={[styles.inputContainer]}>
        <View style={[styles.inputBar, {backgroundColor: UIColors.element}]}>
          <Link2 size={24} color={UIColors.text + '77'} />
          <TextInput 
            placeholder="Entrer une URL Pronote"
            placeholderTextColor={UIColors.text + '77'}
            style={[styles.input, {color: UIColors.text}]}
            value={currentURL}
            onChangeText={text => setCurrentURL(text)}
          />
        </View>

        <TouchableOpacity
          onPress={() => login()}
          style={[styles.btn, {backgroundColor: UIColors.primary}]}
        >
          <NativeText heading="h4" style={{color: '#ffffff', textAlign: 'center'}}>
            Se connecter
          </NativeText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  
  inputContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },

  inputBar: {
    borderRadius: 10,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },

  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: 'Papillon-Medium',
    fontSize: 16,
  },

  btn: {
    paddingVertical: 14,
    borderRadius: 10,
    borderCurve: 'continuous',
  }
});

export default LoginURL;
