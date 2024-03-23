import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Image, Platform, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import GetUIColors from '../../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import CheckAnimated from '../../interface/CheckAnimated';
import AlertBottomSheet from '../../interface/AlertBottomSheet';

import { AlertTriangle, Scale } from 'lucide-react-native';

import { fetchPapiAPI } from '../../utils/api';

const SelectService = ({ navigation }) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const [serviceAlertVisible, setServiceAlertVisible] = useState(false);

  const [apiResponse, setApiResponse] = useState<Record<string, {title:string; content:string}>>({});

  useEffect(() => {
    callFetchPapiAPI('messages')
      .then(response => setApiResponse(response))
      .catch(error => console.error(error));
  }, []);

  function callFetchPapiAPI(path: string) {
    return fetchPapiAPI(path)
      .then(data => {
        return data;
      });
  }
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Service scolaire',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: UIColors.background,
      },
    });
  }, [UIColors]);

  const [selectedService, setSelectedService] = useState<number|null>(null);
  const [serviceOptions, setServiceOptions] = useState([
    {
      name: 'PRONOTE',
      company: 'Index Education',
      description: 'Identifiants PRONOTE ou ENT',
      icon: require('../../assets/logo_modern_pronote.png'),
      view: 'FindEtab',
      soon: false,
    },
    {
      name: 'Skolengo',
      company: 'Kosmos',
      description: 'Comptes régionnaux',
      icon: require('../../assets/logo_modern_skolengo.png'),
      view: 'LocateSkolengoEtab',
      soon: !(__DEV__),
    },
    {
      name: 'EcoleDirecte',
      company: 'Aplim',
      description: 'Identifiants EcoleDirecte',
      icon: require('../../assets/logo_modern_ed.png'),
      soon: true,
    }
  ] as const);

  const selectOption = (index:number) => {
    setSelectedService(index);
  };

  const continueToLogin = () => {
    if (selectedService !== null) {
      
      setServiceAlertVisible(true);
      if(serviceOptions[selectedService]?.soon) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
  };
  

  return (
    <View
      style={[styles.container, { backgroundColor: UIColors.background }]}
    >
      <StatusBar
        animated
        barStyle={UIColors.dark ? 'light-content' : 'dark-content'}
        backgroundColor={UIColors.background}
      />

      <NativeText style={styles.instructionsText}>
        Sélectionnez le service de vie scolaire que vous utilisez dans votre établissement.
      </NativeText>

      {selectedService !== null && serviceOptions[selectedService] && (
        <AlertBottomSheet
          color={serviceOptions[selectedService]?.soon ? '#A84700' : undefined}
          visible={serviceAlertVisible}
          setVisible={setServiceAlertVisible}
          icon={serviceOptions[selectedService]?.soon ? <AlertTriangle /> : <Scale />}
          title={apiResponse[serviceOptions[selectedService].company]?.title}
          subtitle={apiResponse[serviceOptions[selectedService].company]?.content}
          cancelAction={() => setServiceAlertVisible(false)}
          primaryButton={!serviceOptions[selectedService]?.soon && 'Compris !' || undefined}
          primaryAction={!serviceOptions[selectedService]?.soon && (() => {navigation.navigate(serviceOptions[selectedService]?.view); setServiceAlertVisible(false);}) ||undefined}
        />
      )}

      {Platform.OS !== 'ios' && (
        <View style={{ height: 16 }} />
      )}

      <NativeList
        sectionProps={{
          hideSeparator: true,
          hideSurroundingSeparators: true,
        }}
      >
        {serviceOptions.map((serviceOption, index) => (
          <NativeItem
            key={index}
            onPress={() => selectOption(index)}
            backgroundColor={UIColors.background}
            cellProps={{
              contentContainerStyle: {
                paddingVertical: 3,
              },
              backgroundColor: UIColors.background,
            }}

            leading={
              <Image
                source={serviceOption.icon}
                style={styles.serviceImage}
              />
            }
            trailing={
              <CheckAnimated
                checked={index === selectedService}
                pressed={() => selectOption(index)}
                backgroundColor={UIColors.background}
              />
            }
          >
            <NativeText heading="h3">
              {serviceOption.name}
            </NativeText>

            {!serviceOption.soon && (
              <NativeText heading="p2" style={[styles.fontPm]}>
                {serviceOption.description}
              </NativeText>
            )}

            {serviceOption.soon && (
              <NativeText heading="p2" style={[styles.fontPm, { color: UIColors.text + '80' }]}>
                Bientôt disponible
              </NativeText>
            )}
          </NativeItem>
        ))}
      </NativeList>

      <View
        style={[{
          position: 'absolute',
          bottom: insets.bottom + 20,
          width: '100%',
          paddingHorizontal: 16,
        }]}
      >
        <TouchableOpacity
          style={[styles.startButton, {
            backgroundColor: selectedService !== null ? UIColors.primary : UIColors.text + '40',
          }]}
          activeOpacity={selectedService !== null ? 0.5 : 1}
          onPress={() => {
            continueToLogin();
          }}
        >
          <NativeText style={[styles.startText]}>
            Continuer
          </NativeText>
        </TouchableOpacity>
      </View>      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  fontPm: {
    fontFamily: 'Papillon-Medium',
  },

  instructionsText: {
    fontSize: 16,
    fontFamily: 'Papillon-Medium',
    paddingHorizontal: 16,
    paddingVertical: 6,
    opacity: 0.5,
  },

  serviceImage: {
    width: 32,
    height: 32,
  },

  startButton: {
    borderRadius: 300,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    width: '100%',
  },
  startText: {
    fontSize: 16,
    fontFamily: 'Papillon-Semibold',
    color: '#ffffff',
  },
});

export default SelectService;