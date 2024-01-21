import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, View, Image, StatusBar, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import GetUIColors from '../../utils/GetUIColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import CheckAnimated from '../../interface/CheckAnimated';
import AlertBottomSheet from '../../interface/AlertBottomSheet';

import { AlertTriangle } from 'lucide-react-native';

const SelectService = ({ navigation }) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const [edAlertVisible, setEdAlertVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Service scolaire',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: UIColors.background,
      },
    });
  }, [UIColors]);

  const [selectedService, setSelectedService] = useState(null);
  const [serviceOptions, setServiceOptions] = useState([
    {
      name: 'PRONOTE',
      description: 'Identifiants PRONOTE ou ENT',
      icon: require('../../assets/logo_modern_pronote.png'),
    },
    {
      name: 'Skolengo',
      description: 'Comptes régionnaux',
      icon: require('../../assets/logo_modern_skolengo.png'),
    },
    {
      name: 'EcoleDirecte',
      description: 'Identifiants EcoleDirecte',
      icon: require('../../assets/logo_modern_ed.png'),
    }
  ]);

  const selectOption = (index) => {
    setSelectedService(index);
  };

  const continueToLogin = () => {
    if (selectedService !== null) {
      if (selectedService === 0) {
        navigation.navigate('FindEtab');
      }
      if (selectedService === 1) {
        navigation.navigate('LoginSkolengoSelectSchool');
      }
      if (selectedService === 2) {
        setEdAlertVisible(true);
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
        Sélectionnez l’application de vie scolaire que vous utilisez dans votre établissement.
      </NativeText>

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
            <NativeText heading="p2" style={[styles.fontPm]}>
              {serviceOption.description}
            </NativeText>
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
        visible={edAlertVisible}
        setVisible={setEdAlertVisible}
        icon={<AlertTriangle />}
        title="EcoleDirecte"
        subtitle="EcoleDirecte n’est pas encore disponible sur Papillon. Veuillez réessayer plus tard."
        cancelAction={() => setEdAlertVisible(false)}
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
