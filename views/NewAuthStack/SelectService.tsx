import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Image, StatusBar, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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
  const [serviceNotSuportedAlertVisible, setServiceNotSuportedAlertVisible] = useState<false|string>(false);

  const [apiResponse, setApiResponse] = useState(false);

  useEffect(() => {
    callFetchPapiAPI('messages')
      .then(response => setApiResponse(response))
      .catch(error => console.error(error));
  }, []);

  function callFetchPapiAPI(path: string) {
    return fetchPapiAPI(path)
      .then(data => {
        return data;
      })
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

  const [selectedService, setSelectedService] = useState<null|number>(null);
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
  ]);

  const selectOption = (index) => {
    setSelectedService(index);
  };

  const continueToLogin = () => {
    if (selectedService !== null) {
      const service = serviceOptions[selectedService];
      if(service.soon) {
        setServiceNotSuportedAlertVisible(service.name);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        setServiceAlertVisible(true);
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
      <AlertBottomSheet
        visible={serviceAlertVisible}
        icon={<Scale />}
        title={apiResponse[serviceOptions[selectedService]?.company]?.title}
        subtitle={apiResponse[serviceOptions[selectedService]?.company]?.content}
        cancelAction={() => setServiceAlertVisible(false)}
        primaryButton='Compris !'
        primaryAction={() => {navigation.navigate(serviceOptions[selectedService]?.view); setServiceAlertVisible(false);}}
      />

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

      <AlertBottomSheet
        color='#A84700'
        visible={serviceNotSuportedAlertVisible !== false}
        icon={<AlertTriangle />}
        title={serviceNotSuportedAlertVisible}
        subtitle={`${serviceNotSuportedAlertVisible} n’est pas encore disponible sur Papillon. Veuillez réessayer plus tard.`}
        cancelAction={() => setServiceNotSuportedAlertVisible(false)}
      />
      
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
