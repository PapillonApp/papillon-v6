import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Image, Alert, StatusBar, TextInput, Platform, ActivityIndicator, KeyboardAvoidingView, InputAccessoryView } from 'react-native';
import { Text } from 'react-native-paper';
import GetUIColors from '../../utils/GetUIColors';
import PapillonInsetHeader from '../../components/PapillonInsetHeader';
import { SFSymbol } from 'react-native-sfsymbols';
import { getDefaultStore } from 'jotai';
import { homeworksAtom } from '../../atoms/homeworks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContextMenuButton } from 'react-native-ios-context-menu';
import DateTimePicker from '@react-native-community/datetimepicker';
import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import { getSavedCourseColor } from '../../utils/cours/ColorCoursName';
import { useAppContext } from '../../utils/AppContext';
import PapillonLoading from '../../components/PapillonLoading';
import formatCoursName from '../../utils/cours/FormatCoursName';
import AlertBottomSheet from '../../interface/AlertBottomSheet';
import { AlertTriangle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RegisterTrophy } from '../Settings/TrophiesScreen';

const CreateHomeworkScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const UIColors = GetUIColors();
  const insets = useSafeAreaInsets();
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const appctx = useAppContext();

  const [selectedSubject, setSelectedSubject] = useState<number>(0);
  const [nativeSubjects, setNativeSubjects] = useState<any[]>([]);

  const [titleMissingAlert, setTitleMissingAlert] = useState<boolean>(false);

  const [homeworkTitle, setHomeworkTitle] = useState<string>('');
  const inputRef = useRef<TextInput>(null);

  function addSubject() {
    Alert.prompt(
      'Ajouter une matière',
      'Veuillez entrer le nom de la matière que vous souhaitez ajouter.',
      [
        {
          text: 'Annuler',
          onPress: () => {},
          style: 'destructive'
        },
        {
          text: 'Ajouter',
          onPress: (text) => {
            if (text.trim() == '') {
              Alert.alert('Erreur', 'Veuillez entrer un nom de matière valide.');
              return;
            }

            AsyncStorage.getItem('savedColors').then((savedColors) => {
              let colors = {};
              if (savedColors) {
                colors = JSON.parse(savedColors);
              }

              let newColor = {
                systemCourseName: text.toLowerCase().replace(' ','').normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
                originalCourseName: text.toUpperCase(),
                color: UIColors.primary,
              };

              colors[newColor.systemCourseName] = newColor;

              AsyncStorage.setItem('savedColors', JSON.stringify(colors)).then(() => {
                // add before the last item
                setNativeSubjects ((prev) => [
                  ...prev.slice(0, prev.length - 1),
                  {
                    actionKey: newColor.systemCourseName,
                    actionTitle: formatCoursName(newColor.originalCourseName),
                    menuAttributes: ['default'],
                  },
                  {
                    actionKey: 'new',
                    actionTitle: 'Ajouter une matière',
                    menuAttributes: ['destructive'],
                    icon: {
                      iconType: 'SYSTEM',
                      iconValue: 'plus',
                    },
                  }
                ]);
              });
            });
          },
          style: 'primary'
        }
      ],
      'plain-text',
      ''
    );
  }

  function addHomework() {
    if (homeworkTitle.trim() == '') {
      setTitleMissingAlert(true);
      return;
    }

    // add homework to the database
    AsyncStorage.getItem('pap_homeworksCustom').then((customHomeworks) => {
      let hw = [];
      if (customHomeworks) {
        hw = JSON.parse(customHomeworks);
      }

      // console.log(hw);

      let hwDate = new Date(date);
      let lid = Math.random().toString(36).substring(7);

      let newHw = {
        id: Math.random().toString(36).substring(7),
        localId: lid,
        pronoteCachedSessionID: Math.random().toString(7),
        cacheDateTimestamp: hwDate.getTime(),
        themes: [],
        attachments: [],
        subject: {
          id: Math.random().toString(36).substring(7),
          name: nativeSubjects[selectedSubject]?.actionTitle,
          groups: false
        },
        description: homeworkTitle,
        background_color: getSavedCourseColor(nativeSubjects[selectedSubject]?.actionTitle, UIColors.primary),
        done: false,
        date: hwDate.toISOString(),
        difficulty: 0,
        lengthInMinutes: 0,
        custom: true,
      };

      hw.push(newHw);

      AsyncStorage.setItem('pap_homeworksCustom', JSON.stringify(hw)).then(() => {
        console.log('Homework added');
        console.log(hw);

        RegisterTrophy('trophy_add_hw');

        navigation.goBack();
      });
    });
    
  }

  useEffect(() => {
    setLoading(true);
    AsyncStorage.getItem('savedColors').then((savedColors) => {
      if (savedColors) {
        savedColors = JSON.parse(JSON.parse(savedColors));
        let savedColorsKeys = Object.keys(savedColors);

        for (let i = 0; i < savedColorsKeys.length; i++) {
          let item = savedColors[savedColorsKeys[i]];
          if(savedColorsKeys[i].trim() == '') continue;
          if(savedColorsKeys[i].trim() == '0') continue;
          if(savedColorsKeys[i].trim() == 'ajouterunematiere') continue;

          setNativeSubjects ((prev) => [
            ...prev,
            {
              actionKey: item.systemCourseName,
              actionTitle: formatCoursName(item.originalCourseName),
              menuAttributes: ['default'],
              icon: {
                type: 'IMAGE_SYSTEM',
                imageValue: {
                  systemName: 'circle.fill',
                },
                // blue icon
                imageOptions: {
                  tint: item.color,
                  renderingMode: 'alwaysOriginal',
                },
              },
            }
          ]);
        }

        setNativeSubjects ((prev) => [
          ...prev,
          {
            type: 'menu',
            menuTitle: '',
            menuOptions: ['displayInline'],
            menuPreferredElementSize: 'large',
            menuItems: [
              {
                actionKey: 'new',
                actionTitle: 'Ajouter une matière',
                icon: {
                  iconType: 'SYSTEM',
                  iconValue: 'plus',
                },
              },
            ],
          }
        ]);

        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    });
  }, []);

  // change the header title
  useEffect(() => {
    navigation.setOptions({
      headerTitle: Platform.OS === 'ios' ? () => (
        <PapillonInsetHeader
          icon={<SFSymbol name="plus" />}
          title="Nouveau devoir"
          color={UIColors.text}
        />
      ) : 'Nouveau devoir',
      headerStyle: {
        backgroundColor: UIColors.element,
      },
      headerShadowVisible: false,
      headerRight: () => (
        <DateTimePicker
          value={date}
          mode="date"
          display="compact"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      ),
    });
  }, [UIColors, date]);

  let layoutDone = false;
  const layouted = () => {
    if (layoutDone) return;
    layoutDone = true;
    inputRef.current?.focus();
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: UIColors.modalBackground}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View onLayout={(event) => {layouted()}} style={{ backgroundColor: UIColors.element, borderBottomColor: UIColors.borderLight, borderBottomWidth: 0.5, gap: 9, paddingBottom: 16, zIndex: 99 }}>
        <View style={[styles.newHwInput, {borderColor: UIColors.text + '18'}]}>
          <SFSymbol style={[styles.newHwIcon]} size={20} color={UIColors.text + '80'} name="square.and.pencil" />
          <TextInput
            placeholder="Titre du devoir"
            placeholderTextColor={UIColors.text + '80'}
            multiline
            inputAccessoryViewID='main'
            style={[
              styles.newHwTextInput,
              {
                color: UIColors.text
              }
            ]}
            value={homeworkTitle}
            onChangeText={(text) => {
              setHomeworkTitle(text);
            }}
            ref={inputRef}
          />
        </View>

        { loading ? (
          <View style={[styles.newHwSubjectInput, {borderColor: UIColors.text + '18', paddingVertical: 11.5}]}>
            <ActivityIndicator size="small" />
            <NativeText heading="p2">
              Chargement des matières...
            </NativeText>
          </View>
        ) : (
          <View style={[styles.newHwSubjectInput, {borderColor: UIColors.text + '18'}]}>
            <View
              style={{
                width: 15,
                height: 15,
                borderRadius: 12,
                backgroundColor: getSavedCourseColor(nativeSubjects[selectedSubject]?.actionTitle, UIColors.primary),
              }}
            />

            <ContextMenuButton
              menuConfig={{
                menuTitle: '',
                menuItems: nativeSubjects,
              }}
              isMenuPrimaryAction={true}
              onPressMenuItem={({nativeEvent}) => {
                if (nativeEvent.actionKey === 'new') {
                  addSubject();
                  return;
                }

                // find id from nativeEvent.actionKey
                let id = nativeEvent.actionKey;
                let index = nativeSubjects.findIndex((item) => item.actionKey === id);
                setSelectedSubject(index);
              }}
            >
              <TouchableOpacity activeOpacity={0.6}>
                <Text
                  style={styles.newHwSubject}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {nativeSubjects[selectedSubject]?.actionTitle || 'Aucune matière'}
                </Text>
              </TouchableOpacity>
            </ContextMenuButton>
          </View>
        )}
      </View>
      <View
        style={{ flex: 1, alignContent: 'center', justifyContent: 'center'}}
      >
        <StatusBar animated backgroundColor="#fff" barStyle="light-content" />

        <PapillonLoading
          title="Ajouter un devoir"
          subtitle={'Indiquez un titre et une matière pour votre devoir personnalisé le ' + new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', month: 'long', day: 'numeric' }) + '.'}
          icon={<SFSymbol color={UIColors.text} name="book" size={26} style={{marginBottom:15}} />}
        />

        <AlertBottomSheet
          visible={titleMissingAlert}
          title="Titre manquant"
          subtitle="Veuillez entrer un titre pour votre devoir."
          icon={<AlertTriangle />}
          cancelAction={() => {
            setTitleMissingAlert(false);
          }}
        />
      </View>
      <InputAccessoryView nativeID='main'>
        <View style={{ backgroundColor: UIColors.element, borderTopColor: UIColors.borderLight, borderTopWidth: 0.5, gap: 9, paddingBottom: 12, paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity
            style={{
              width: 32,
              height: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              inputRef.current?.blur();
            }}
          >
            <SFSymbol name="keyboard.chevron.compact.down" size={20} color={UIColors.text + '80'} />
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              gap: 12,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: UIColors.text + "12",
                paddingVertical: 8,
                paddingHorizontal: 16,
                alignSelf: 'flex-start',
                borderRadius: 300,
              }}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Text
                style={{
                  color: UIColors.text + "80",
                  fontSize: 16,
                  fontFamily: 'Papillon-Semibold',
                }}
              >
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "#32AB8E22",
                paddingVertical: 8,
                paddingHorizontal: 16,
                alignSelf: 'flex-start',
                borderRadius: 300,
              }}
              onPress={() => {
                addHomework();
              }}
            >
              <Text
                style={{
                  color: "#32AB8E",
                  fontSize: 16,
                  fontFamily: 'Papillon-Semibold',
                }}
              >
                Ajouter
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </InputAccessoryView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  newHwInput: {
    marginHorizontal: 16,

    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    borderRadius: 10,
    borderCurve: 'continuous',

    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 13,

    borderWidth: 1,
  },
  newHwIcon : {
    marginTop: 8,
  },
  newHwTextInput: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    width: '100%',
    paddingRight: 10,

    marginBottom: 'auto',
    
    marginTop: -5,
    paddingBottom: 4,
  },
  newHwSubjectInput: {
    marginHorizontal: 16,

    paddingHorizontal: 17,
    paddingVertical: 8,
    borderRadius: 10,
    borderCurve: 'continuous',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
    borderWidth: 1,
  },
  newHwSubject: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: -10,
    borderRadius: 7,
    borderCurve: 'continuous',
    overflow: 'hidden',
    paddingRight: 26,
  },
});

export default CreateHomeworkScreen;
