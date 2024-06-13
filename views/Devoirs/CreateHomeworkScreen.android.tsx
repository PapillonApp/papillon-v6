import * as React from "react";

import { Text, TextInput, useTheme } from 'react-native-paper';
import GetUIColors from '../../utils/GetUIColors';
import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import { Alert, BackHandler, Modal, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { CalendarDays, Check, Circle, X } from "lucide-react-native";
import SyncStorage from "sync-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useActionSheet } from "@expo/react-native-action-sheet";
import DateTimePicker from '@react-native-community/datetimepicker';
import { getSavedCourseColor, normalizeCoursName } from "../../utils/cours/ColorCoursName";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showMessage } from "react-native-flash-message";
import { RegisterTrophy } from "../Settings/TrophiesScreen";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import ColorPicker, { HueSlider, Panel1, Preview, Swatches } from "reanimated-color-picker";
import { useAppContext } from "../../utils/AppContext";

function CreateHomeworkScreenAndroid({ route, navigation }: {
    navigation: any,
    route: {
        params: {
            homeworkLocalID: string,
        }
    }
}) {
    const theme = useTheme();
    const UIColors = GetUIColors();
    const insets = useSafeAreaInsets();
    const { showActionSheetWithOptions } = useActionSheet();
    const [homeworkContent, setHomeworkContent] = React.useState("")
    const [selectedSubject, setSelectedSubject] = React.useState({})
    const [calendarDate, setCalendarDate] = React.useState(new Date());
    const [calendarModalOpen, setCalendarModalOpen] = React.useState(false)
    const [createNewSubjectModalOpen, setCreateNewSubjectModalOpen] = React.useState<Boolean>(false);
    const [newSubjectName, setNewSubjectName] = React.useState<string>()
    const [newSubjectColor, setNewSubjectColor] = React.useState<string>(UIColors.text)
    const [colorModalOpen, setColorModalOpen] = React.useState(false)
    const [editedHomework, setEditedHomework] = React.useState()
    const textInputRef = React.useRef(null);
    const createNewSubjectModal = React.useRef<BottomSheetModal>(null);
    const { homeworkLocalID } = route.params;
    const appContext = useAppContext();

    async function setupEdit() {
        let customHomeworks = await AsyncStorage.getItem('pap_homeworksCustom')
        let hw = [];
        if (customHomeworks) {
            hw = JSON.parse(customHomeworks);
        }
        let homework = hw.find(h => h.localID === homeworkLocalID)
        navigation.setOptions({
            headerTitle: "Modifier un devoir",
        });
        setHomeworkContent(homework.description)
        setSelectedSubject({name: homework.subject.name, color: homework.background_color})
        setCalendarDate(new Date(homework.date))
        setEditedHomework(homework)
    }

    useFocusEffect(
        React.useCallback(() => {
          // addEventListener and removeEventListener must refer to the same function
          const onBackPress = () => {
            if (createNewSubjectModalOpen) {
              createNewSubjectModal.current?.dismiss();
              return true; // TS complains if handler doesn't return a boolean
            } else {
                navigation.goBack()
                return true;
            }
          };
          BackHandler.addEventListener('hardwareBackPress', onBackPress);
          return () =>
            BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [createNewSubjectModal, createNewSubjectModalOpen]),
      );
    React.useEffect(() => {
        if(homeworkLocalID) {
            setupEdit()
        }
    }, [])
    React.useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                  style={{
                    opacity: 0.4
                  }}
                  onPress={async () => {
                    
                  }}
                >
                    <Check size={24} color={UIColors.text} onPress={async() => {
                        let customHomeworks = await AsyncStorage.getItem('pap_homeworksCustom')
                        let hw = [];
                        if (customHomeworks) {
                            hw = JSON.parse(customHomeworks);
                        }
                        if(homeworkLocalID) {
                            for (let i = 0; i < hw.length; i++) {
                                if (hw[i].id === editedHomework.id) {
                                hw.splice(i, 1);
                                }
                            }
                        }
                        if(!selectedSubject.name) return Alert.alert("Aucune matière", "Veuillez renseigner une matière")
                        if(!homeworkContent || homeworkContent.trim() === "") return Alert.alert("Devoir vide", "Veuillez renseigner le contenu du devoir")
                        let newHw = {
                            id: Math.random().toString(36).substring(7),
                            localID: Math.random().toString(36).substring(7),
                            pronoteCachedSessionID: Math.random().toString(7),
                            cacheDateTimestamp: calendarDate.getTime(),
                            themes: [],
                            attachments: [],
                            subject: {
                                id: Math.random().toString(36).substring(7),
                                name: selectedSubject.name,
                                groups: false
                            },
                            description: homeworkContent,
                            background_color: selectedSubject.color,
                            done: false,
                            date: calendarDate.toISOString(),
                            difficulty: 0,
                            lengthInMinutes: 0,
                            custom: true,
                        };
                        hw.push(newHw)
                        AsyncStorage.setItem('pap_homeworksCustom', JSON.stringify(hw)).then(async() => {
                            showMessage({
                                message: `Devoir ${editedHomework ? 'modifié' : 'ajouté'}`,
                                type: 'success',
                                icon: 'auto',
                                floating: true,
                                position: 'top'
                            });
                    
                            RegisterTrophy('trophy_add_hw');
                            await AsyncStorage.setItem("refreshHomeworks", "true")
                            if(editedHomework) navigation.goBack();
                            navigation.goBack();
                        });
                    }}/>
                </TouchableOpacity>
            ),
        });
    }, [navigation, selectedSubject, homeworkContent, calendarDate])

    function showSubjectsList() {
        let subjects = JSON.parse(SyncStorage.get('savedColors'))
        let subjectsObject = Object.keys(subjects)
        const options = subjectsObject.map(key => subjects[key].originalCourseName)
        options.push("Créer...")
        options.push("Annuler")
        const containerStyle = Platform.OS === 'android' ? { paddingBottom: insets.bottom, backgroundColor: UIColors.background } : null;
        const createButtonIndex = options.length - 2;
        const cancelButtonIndex = options.length - 1;
        showActionSheetWithOptions(
            {
              options,
              tintColor: UIColors.primary,
              containerStyle,
              cancelButtonIndex: cancelButtonIndex
            },
            (buttonIndex) => {
              if (typeof buttonIndex !== 'undefined' && buttonIndex !== cancelButtonIndex) {
                if(buttonIndex === createButtonIndex) {
                    createNewSubjectModal.current?.present();
                    return;
                }
                let subject = subjects[subjectsObject[buttonIndex]]
                setSelectedSubject({name: subject.originalCourseName, color: subject.color})
              }
            }
          );
    }

    const onSelectColor = ({ hex }: { hex: string }) => {
        setNewSubjectColor(hex);
    };

    async function saveNewSubject() {
        if(!newSubjectName) return Alert.alert("Aucun nom de matière", "Vous devez spécifier un nom de matière")
        let subjects = JSON.parse(SyncStorage.get('savedColors'))
        let normalizedSubject = normalizeCoursName(newSubjectName)
        subjects[normalizedSubject] = {
            color: newSubjectColor,
            originalColor: newSubjectColor,
            edited: false,
            originalCourseName: newSubjectName,
            systemCourseName: normalizedSubject,
            locked: false
        }
        await SyncStorage.set('savedColors', JSON.stringify(subjects))
        .then(() => {
            showMessage({
                message: 'Matière ajoutée',
                type: 'success',
                icon: 'auto',
                floating: true,
                position: 'top'
            });
            setSelectedSubject({name: newSubjectName, color: newSubjectColor})
            setNewSubjectColor(UIColors.text)
            setNewSubjectName("")
            createNewSubjectModal.current?.dismiss()
        })
    }

    return (
        <View
            style={{
                backgroundColor: UIColors.backgroundHigh,
                flex: 1,
            }}
        >
            <BottomSheetModal
                ref={createNewSubjectModal}
                onChange={idx => setCreateNewSubjectModalOpen(idx > -1)}
                index={1}
                snapPoints={['10%', '60%', '90%']}

                style={{
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                }}

                backgroundComponent={({ style }) => (
                <View
                    style={[style, {
                    flex: 1,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    borderCurve: 'continuous',
                    overflow: 'hidden',
                    }]}
                />
                )}

                handleComponent={() => (
                <View />
                )}
            >
                <BottomSheetView>
                    <View style={{
                        backgroundColor: UIColors.element,
                        paddingVertical: 16,
                        paddingHorizontal: 20,

                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        borderCurve: 'continuous',

                        justifyContent: 'center',
                    }}
                    >
                        <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: 0, margin: 0}}>
                            <NativeText style={{ marginRight: "auto"}}>Créer une matière</NativeText>
                            <TouchableOpacity
                                style={{
                                    opacity: 0.4,
                                }}
                                onPress={() => { saveNewSubject() }}
                            >
                                <Check size={24} color={UIColors.text} style={{ marginRight: 10 }}/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    opacity: 0.4,
                                }}
                            >
                                <X size={24} color={UIColors.text} onPress={() => { createNewSubjectModal.current?.dismiss() }}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <NativeList>
                            <NativeItem>
                                <TextInput
                                    placeholder="Nom de la matière"
                                    placeholderTextColor={UIColors.text + '77'}
                                    style={[styles.inputSubject, {color: UIColors.text }]}
                                    value={newSubjectName}
                                    onChangeText={text => setNewSubjectName(text)}
                                    ref={textInputRef}
                                />
                            </NativeItem>
                            <NativeItem leading={
                                <TouchableOpacity
                                    style={[styles.colorPreview, { backgroundColor: newSubjectColor }]}
                                />
                            }
                            onPress={() => { setColorModalOpen(true) }}>
                                <NativeText>Appuyez pour modifier la couleur</NativeText>
                                <NativeText heading="subtitle2">{newSubjectColor.toUpperCase()}</NativeText>
                            </NativeItem>
                        </NativeList>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
            <Modal visible={colorModalOpen} animationType='fade' transparent={true}>
                <View style={[styles.colorModalContainer]}>
                <View style={[styles.colorModal, { backgroundColor: UIColors.element }]}>
                    <ColorPicker style={styles.picker} value={newSubjectColor} onComplete={onSelectColor}>
                    <Preview
                        textStyle={{
                            fontFamily: 'Papillon-Semibold',
                        }}
                    />
                    <Panel1 />
                    <HueSlider />
                    <Swatches />
                    </ColorPicker>

                    <View style={[styles.modalActions, { borderColor: UIColors.border }]}>
                    <TouchableOpacity style={[styles.modalAction]} onPress={() => setColorModalOpen(false)}>
                        <Text
                            style={[styles.modalActionText]}
                        >
                        Annuler
                        </Text>
                    </TouchableOpacity>
                    <View style={{ width: 1, height: 47, backgroundColor: UIColors.border + '99' }} />
                    <TouchableOpacity style={[styles.modalAction]} onPress={() => { setColorModalOpen(false) }}>
                        <Text
                            style={[styles.modalActionText, { color: newSubjectColor }]}
                        >
                        Enregistrer
                        </Text>
                    </TouchableOpacity>
                    </View>
                </View>
                </View>
            </Modal>
            <StatusBar
                animated
                translucent
                barStyle={theme.dark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
            />
            {Platform.OS === 'android' && calendarModalOpen && (
                <DateTimePicker
                value={calendarDate}
                mode="date"
                display="calendar"
                onChange={(event, date) => {
                    if (event.type === 'dismissed' || !date) {
                        setCalendarModalOpen(false);
                        return;
                    }
                    let day = new Date().setHours(0, 0, 0, 0);
                    setCalendarModalOpen(false);
                    if(day > Number(date)) return Alert.alert("Date invalide", "Vous ne pouvez pas spécifier un devoir pour une date déjà passée")
                    setCalendarDate(date)
                }}
                />
            )}
            <NativeList header="Détails" inset>
                <NativeItem 
                    leading={( 
                        <Circle fill={selectedSubject.name ? selectedSubject.color : UIColors.text} />
                    )}
                    onPress={() => { showSubjectsList() }}
                >
                    <NativeText>{selectedSubject.name ? selectedSubject.name : "Appuyez pour sélectionner la matière"}</NativeText>
                </NativeItem>
                <NativeItem 
                    leading={( 
                        <CalendarDays color={UIColors.text} />
                    )}
                    onPress={() => { setCalendarModalOpen(true) }}
                >
                    <NativeText>{calendarDate.toLocaleDateString('fr', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                    })}</NativeText>
                </NativeItem>
                <NativeItem>
                    <TextInput
                        placeholder="Contenu du devoir..."
                        placeholderTextColor={UIColors.text + '77'}
                        style={[styles.input, {color: UIColors.text}]}
                        value={homeworkContent}
                        onChangeText={text => setHomeworkContent(text)}
                        ref={textInputRef}
                        multiligne={true}
                    />
                </NativeItem>
            </NativeList>
        </View>
    )
}

const styles = StyleSheet.create({
    input: {
        paddingVertical: 1,
        paddingHorizontal: 16,
        fontFamily: 'Papillon-Medium',
        fontSize: 16,
        minHeight: 100,
        lineHeight: 16
    },
    inputSubject: {
        fontFamily: 'Papillon-Medium',
        fontSize: 16,
    },
    inputBar: {
        borderRadius: 10,
        borderCurve: 'continuous',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
    },
    colorPreview: {
        width: 48,
        height: 20,
        borderRadius: 6,
        borderCurve: 'continuous',
        marginRight: 2,
    },
    colorModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000aa',
    },
    colorModal: {
        width: '70%',
        borderRadius: 20,
        borderCurve: 'continuous',
    },

    picker: {
        gap: 14,
        padding: 18
    },

    modalActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        height: 48,
        borderTopWidth: 1,
    },
    modalAction: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalActionText: {
        fontFamily: 'Papillon-Semibold',
        fontSize: 16,
    },
})

export default CreateHomeworkScreenAndroid;