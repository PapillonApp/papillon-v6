import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Animated, ScrollView, Modal, TouchableOpacity, StyleSheet, View, Text, FlatList, Alert, Platform, StatusBar } from 'react-native';

import GetUIColors from '../../utils/GetUIColors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NativeText from '../../components/NativeText';
import { BlurView } from 'expo-blur';

import notifee from '@notifee/react-native';

import { PressableScale } from 'react-native-pressable-scale';

import moment from 'moment';

import { Trash2, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MaskedView from '@react-native-masked-view/masked-view';

const trophiesList = [
  {
    id: 'trophy_trophy1',
    emoji: '🏆',
    title: 'Trophées',
    description: 'Ouvrir la page des trophées 3 fois',
    required: 3,
    done: 0,
  },
  {
    id: 'trophy_hw_done',
    emoji: '☑️',
    title: 'Check',
    description: 'Terminer 10 devoirs différents sur l\'app',
    completionLabel: '* devoir(s)',
    required: 10,
    done: 0,
  },
  {
    id: 'trophy_course_color',
    emoji: '🎨',
    title: 'Peintre',
    description: 'Changer la couleur de 10 cours',
    completionLabel: '* cours individuel(s)',
    required: 10,
    done: 0,
  },
  {
    id: 'trophy_profile_picture',
    emoji: '📸',
    title: 'Selfie',
    description: 'Changer de photo de profil',
    required: 1,
    done: 0,
  },
  {
    id: 'trophy_add_hw',
    emoji: '📝',
    title: 'Planificateur',
    description: 'Ajouter 3 devoirs personnalisés',
    completionLabel: '* devoir(s)',
    required: 3,
    done: 0,
  },
  {
    id: 'trophy_grades_view',
    emoji: '📊',
    title: 'Comptable',
    description: 'Ouvrir le détail d\'une note 10 fois',
    required: 10,
    done: 0,
  },
  {
    id: 'trophy_bandeau',
    emoji: '🖼️',
    title: 'Décorateur',
    description: 'Changer de bandeau 3 jours de suite',
    completionLabel: '* jour(s) sur *',
    required: 3,
    done: 0,
  },
];

const originalTrophiesList = [
  ...trophiesList,
];

export const RegisterTrophy = async (trophyId, proof : any) => {
  AsyncStorage.getItem('trophies').then((trophies) => {
    if (trophies) {
      trophies = JSON.parse(trophies);
    } else {
      trophies = [];
    }

    if(!proof) {
      proof = new Date();
    }

    trophies.push({
      id: trophyId,
      date: new Date(),
      proof: proof,
    });

    const setTrophy = trophiesList.find((trophy) => trophy.id === trophyId);
    
    let currentCount = trophies.filter((trophy) => trophy.id === trophyId).length;
    const requiredCount = setTrophy ? setTrophy.required : currentCount + 1;

    if(currentCount == requiredCount + 1) {
      /* notifee.displayNotification({
        title: '🏆 Trophée obtenu !',
        body: 'Vous avez obtenu le trophée ' + (setTrophy.title ? setTrophy.title : '') + ' !',
        ios: {
          sound: 'papillon_ding.wav',
          foregroundPresentationOptions: {
            badge: true,
            sound: true,
            banner: true,
            list: true,
          },
        },
      }); */
    }

    AsyncStorage.setItem('trophies', JSON.stringify(trophies));
  });
};

const TrophiesScreen = ({ navigation }) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();

  const [trophies, setTrophies] = useState(trophiesList);
  const [selectedTrophy, setSelectedTrophy] = useState(0);
  const [trophyModalVisible, setTrophyModalVisible] = useState(false);

  // floating 3d rotation animation
  const animatedValueX = new Animated.Value(0);
  const animatedValueY = new Animated.Value(0);

  Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValueX, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValueX, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValueX, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ])
  ).start();

  Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValueY, {
        toValue: 0,
        duration: 0,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValueY, {
        toValue: 1,
        duration: 2000,
        delay: 0,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValueY, {
        toValue: 0,
        duration: 2000,
        delay: 0,
        useNativeDriver: true,
      }),
    ])
  ).start();

  // scale on open
  const scale = new Animated.Value(0);

  useEffect(() => {
    if (trophyModalVisible) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        mass: 0.7,
        stiffness: 100,
        damping: 10,
      }).start();
    }
    else {
      Animated.timing(scale, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [trophyModalVisible]);

  // header background color
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#d16213',
      },
      headerShadowVisible: false,
      headerBackTitleVisible: false,
      headerRight: () => (
        <TouchableOpacity onPress={resetTrophies}>
          <Trash2 size={24} color='#fff' />
        </TouchableOpacity>
      ),
    });
  }, [trophies]);

  function resetTrophies() {
    Alert.alert('Réinitialiser les trophées', 'Êtes-vous sûr de vouloir réinitialiser tous vos trophées ? Vous perdrez tout votre progrès.', [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Réinitialiser',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Êtes-vous vraiment sûr ?', 'Vous perdrez tout votre progrès et ne pourrez pas le récupérer.', [
            {
              text: 'Annuler',
              style: 'cancel',
            },
            {
              text: 'Réinitialiser',
              style: 'destructive',
              onPress: () => {
                // set all trophies done to 0
                let newTrophies = [...trophiesList];
                newTrophies = newTrophies.map((trophy) => {
                  trophy.done = 0;
                  return trophy;
                });

                setTrophies(newTrophies);

                AsyncStorage.removeItem('trophies');
              },
            },
          ]);
        },
      },
    ]);
  }

  useEffect(() => {
    AsyncStorage.getItem('trophies').then((trophies) => {
      if (trophies) {
        let newTrohpies = [...trophiesList];
        trophies = JSON.parse(trophies);

        // if multiple trophies share same id and proof, only count it once
        let uniqueTrophies = [];
        trophies.forEach((trophy) => {
          if (!uniqueTrophies.find((t) => t.id === trophy.id && t.proof === trophy.proof)) {
            uniqueTrophies.push(trophy);
          }
        });

        uniqueTrophies.forEach((trophy) => {
          newTrohpies = newTrohpies.map((t) => {
            if (t.id === trophy.id) {
              // if already in list
              if (t.list && t.list.includes(trophy.date)) {
                return t;
              }

              t.done++;
              if(t.list) {
                t.list.push(trophy.date);
              }
              else {
                t.list = [trophy.date];
              }
            }

            // if completed, set date to when it was completed
            if (t.done >= t.required && !t.date) {
              t.date = trophy.date;
            }

            return t;
          });
        });

        setTrophies(newTrohpies);
      }
    });
  }, []);

  useEffect(() => {
    RegisterTrophy('trophy_trophy1');
  }, []);

  return (
    <View style={{ backgroundColor: UIColors.modalBackground, flex: 1 }}>
      {Platform.OS === 'android' && (
        <StatusBar translucent backgroundColor={'transparent'} barStyle={'light-content'} />
      )}
      <Modal
        animationType='fade'
        transparent={true}
        visible={trophyModalVisible}
        onRequestClose={() => {
          setTrophyModalVisible(false);
        }}
      >
        <BlurView intensity={100} style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }} tint={'dark'}>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: insets.top + 10,
              right: 16,
              padding: 8,
              zIndex: 100,
              backgroundColor: '#ffffff25',
              borderRadius: 100,
            }}
            onPress={() => {
              setTrophyModalVisible(false);
            }}
          >
            <X size={20} strokeWidth={2.5} color='#fff' />
          </TouchableOpacity>

          <Animated.View
            style={[
              {
                zIndex: 100,
                transform: [
                  {
                    scale: scale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                  {
                    rotateX: animatedValueX.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-20deg', '20deg'],
                    }),
                  },
                  {
                    rotateY: animatedValueY.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-20deg', '20deg'],
                    }),
                  },
                  {
                    rotate: animatedValueY.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-5deg', '5deg'],
                    }),
                  }
                ],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 1,
                shadowRadius: 2,
              }
            ]}
          >
            <Text
              style={{
                fontSize: 172,
              }}
            >
              {trophies[selectedTrophy].emoji}
            </Text>
          </Animated.View>

          <Text
            style={{
              fontSize: 22,
              fontFamily: 'Papillon-Semibold',
              color: '#fff',
              marginTop: 10,
              marginHorizontal: 20,
              textAlign: 'center',
            }}
          >
            {trophies[selectedTrophy].title}
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontFamily: 'Papillon-Medium',
              color: '#fff',
              opacity: 0.5,
              marginTop: 5,
              marginHorizontal: 20,
              textAlign: 'center',
            }}
          >
            {trophies[selectedTrophy].description}
          </Text>
        </BlurView>
      </Modal>

      <View style={[styles.secondHeader, {backgroundColor: '#d16213'}]}>
        <View style={[styles.secondHeaderText]}>
          <Text style={[styles.secondHeaderTitle]}>
            {trophies.filter((trophy) => trophy.done >= trophy.required).length} trophée{trophies.filter((trophy) => trophy.done >= trophy.required).length > 1 ? 's' : ''} obtenu{trophies.filter((trophy) => trophy.done >= trophy.required).length > 1 ? 's' : ''} !
          </Text>
          <Text style={[styles.secondHeaderDescription]}>
            Terminez tous les trophées et devenez le roi de Papillon !
          </Text>
        </View>

        <View style={[styles.secondHeaderCompletion]}>
          <Text style={[styles.secondHeaderValue]}>
            {trophies.filter((trophy) => trophy.done >= trophy.required).length}
          </Text>
          <Text style={[styles.secondHeaderOutOf]}>
            / {trophies.length}
          </Text>
        </View>
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
      >
        <View style={[styles.trophyGrid]}>
          {trophies.map((trophy, index) => (
            <PressableScale
              activeScale={0.94}
              weight='light'
              key={trophy.id}
              style={[styles.trophyContainer]}
              onPress={() => {
                if (trophy.done >= trophy.required) {
                  setSelectedTrophy(index);
                  setTrophyModalVisible(true);
                }
              }}
            >
              <View
                style={[
                  styles.trophy,
                  {
                    backgroundColor: UIColors.element
                  },
                  (trophy.done >= trophy.required) ? styles.trophyFullyCompleted : null
                ]}
              >
                <View style={[styles.trophyEmojiContainer]}>
                  { Platform.OS !== 'android' && trophy.done < trophy.required && (
                    <BlurView intensity={15} style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 100,
                    }} tint={UIColors.dark ? 'dark' : 'light'} />
                  )}

                  <NativeText style={[styles.trophyEmoji, (trophy.done < trophy.required) ? styles.trophyEmojiUncompleted : null]}>
                    {trophy.emoji}
                  </NativeText>
                </View>

                <View style={[styles.trophyData]}>
                  <NativeText style={[styles.trophyTitle]} numberOfLines={1}>
                    {trophy.title}
                  </NativeText>
                  <NativeText style={[styles.trophyDescription]} numberOfLines={2}>
                    {trophy.description}
                  </NativeText>

                  <View style={[
                    styles.trophyCompletionBar,
                    Platform.OS === 'android' ? { backgroundColor: UIColors.primary + '22' } : null,
                  ]}>
                    <View style={[styles.trophyCompletionBarFill, {
                      width: `${(trophy.done < trophy.required) ? (trophy.done / trophy.required) * 100 : 100}%`,
                      backgroundColor: '#d16213',
                    }]} />
                  </View>

                  { (trophy.done < trophy.required) ? (
                    trophy.completionLabel ? (
                      <NativeText style={[styles.trophyCompleted]} numberOfLines={1}>
                        {trophy.completionLabel.replace('*', trophy.done).replace('*', trophy.required)}
                      </NativeText>
                    ) : (
                      <NativeText style={[styles.trophyCompleted]} numberOfLines={1}>
                      Complété à { Math.round(trophy.done * 100 / trophy.required) }%
                    </NativeText>
                    )
                  ) : (
                    <NativeText style={[styles.trophyCompletedCompleted, {color: '#d16213'}]} numberOfLines={1}>
                      { moment(trophy.date).fromNow() }
                    </NativeText>
                  )}
                </View>
              </View>
            </PressableScale>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  trophyGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    margin: 5,
  },
  trophyContainer: {
    width: '50%',
    padding: 5,
  },
  trophy: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',

    height: 230,
    borderRadius: 10,

    padding: 12,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,

    borderColor: 'transparent',
    borderWidth: 2,
  },

  trophyFullyCompleted: {
    borderColor: '#d16213',
    borderWidth: 2,
  },

  trophyEmojiContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  trophyEmoji: {
    fontSize: 68,
    marginTop: '-10%',
    alignSelf: 'center',
    width: '100%',
    textAlign: 'center',
  },

  trophyEmojiUncompleted: {
    opacity: 0.5,
  },

  trophyData: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 3,
  },
  trophyTitle: {
    fontSize: 16,
    fontFamily: 'Papillon-Semibold',
  },
  trophyDescription: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },

  trophyCompletionBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 5,
  },

  trophyCompletionBarFill: {
    height: '100%',
    borderRadius: 5,
  },

  trophyCompleted: {
    fontSize: 14,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },
  trophyCompletedCompleted: {
    fontSize: 14,
    fontFamily: 'Papillon-Semibold',
  },

  secondHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 16,
  },

  secondHeaderText: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 3,
    flex: 1,
  },

  secondHeaderTitle: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
    color: '#fff',
  },

  secondHeaderDescription: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    color: '#fff',
    opacity: 0.5,
  },

  secondHeaderCompletion: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: 5,
  },
  secondHeaderValue: {
    fontSize: 32,
    fontFamily: 'Papillon-Semibold',
    color: '#fff',
  },

  secondHeaderOutOf: {
    fontSize: 20,
    fontFamily: 'Papillon-Medium',
    color: '#fff',
    opacity: 0.5,
  },
});

export default TrophiesScreen;
