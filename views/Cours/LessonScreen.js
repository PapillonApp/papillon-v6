import * as React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Image, StatusBar, Platform } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';

import { ContextMenuView } from 'react-native-ios-context-menu';

import { X, DoorOpen, User2, Clock4, Info, Calendar, Hourglass, Clock8 } from 'lucide-react-native';

import { LightenDarkenColor } from 'lighten-darken-color';

import PapillonIcon from '../../components/PapillonIcon';
import ListItem from '../../components/ListItem';

import { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';

import * as ExpoCalendar from 'expo-calendar';

import formatCoursName from '../../utils/FormatCoursName';

import * as Clipboard from 'expo-clipboard';

const calendars = [];

async function getDefaultCalendarSource() {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    return defaultCalendar.source;
}

function LessonScreen({ route, navigation }) {
    const theme = useTheme();
    const lesson = route.params.event;

    console.log(lesson);

    // calculate length of lesson
    const start = new Date(lesson.start);
    const end = new Date(lesson.end);

    const length = Math.floor((end - start) / 60000);
    const lengthString = Math.floor(length / 60) + 'h' + (length % 60 < 10 ? '0' : '') + (length % 60);

    // date (jeudi 1 janvier 1970)
    const dateCours = new Date(lesson.start).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // start time (hh:mm)
    const startStr = new Date(lesson.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // end time (hh:mm)
    const endStr = new Date(lesson.end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // format cours name
    const coursName = formatCoursName(lesson.subject.name);
    console.log(coursName);

    // change title
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: coursName,
        });
    }, [navigation]);

    // main color
    const mainColor = theme.dark ? '#ffffff' : '#444444';
    
    return (
        <>
            <ScrollView contentInsetAdjustmentBehavior="automatic" style={{flex: 1, backgroundColor: theme.dark ? '#050505' : '#f2f2f7'}}>
                <View style={styles.optionsList}>
                    <Text style={styles.ListTitle}>A propos</Text>

                    <ListItem
                        title="Salle de cours"
                        subtitle={lesson.rooms[0]}
                        color={mainColor}
                        left={
                            <DoorOpen size={24} color={mainColor} />
                        }
                        width
                    />
                    <ListItem
                        title="Professeur"
                        subtitle={lesson.teachers[0]}
                        color={mainColor}
                        left={
                            <User2 size={24} color={mainColor} />
                        }
                        width
                    />
                    { lesson.status !== null ? (
                        <ListItem
                            title="Statut du cours"
                            subtitle={lesson.status}
                            color={!lesson.is_cancelled ? mainColor : '#B42828'}
                            left={
                                <Info size={24} color={!lesson.is_cancelled ? mainColor : '#ffffff'} />
                            }
                            fill={lesson.is_cancelled ? true : false}
                            width
                        />
                    ) : null }
                </View>

                <View style={styles.optionsList}>
                    <Text style={styles.ListTitle}>Horaires</Text>

                    
                    <ListItem
                        title="Durée du cours"
                        subtitle={lengthString}
                        color={mainColor}
                        left={
                            <Hourglass size={24} color={mainColor} />
                        }
                        width
                    />

                    <ContextMenuView
                        menuConfig={{
                            menuTitle: '',
                            menuItems: [
                                {
                                    actionKey: 'copy',
                                    actionTitle: 'Copier',
                                    icon: {
                                        type: 'IMAGE_SYSTEM',
                                        imageValue: {
                                            systemName: 'doc.on.doc',
                                        }
                                    }
                                }
                            ]
                        }}
                        onPressMenuItem={({nativeEvent}) => {
                            if (nativeEvent.actionKey === 'copy') {
                                Clipboard.setString(dateCours);
                            }
                        }}
                        previewConfig={{
                            previewType: 'RECT',
                            backgroundColor: theme.colors.surface,
                            borderRadius: 12,
                        }}
                    >
                        <ListItem
                            title="Date du cours"
                            subtitle={dateCours}
                            color={mainColor}
                            left={
                                <Calendar size={24} color={mainColor} />
                            }
                            width
                        />
                    </ContextMenuView>

                    <View style={{flexDirection: 'row', gap: 9}}>
                        <ListItem
                            title="Début"
                            subtitle={startStr}
                            color={mainColor}
                            left={
                                <Clock8 size={24} color={mainColor} />
                            }
                            style={{flex: 1, marginHorizontal: 0}}
                        />
                        <ListItem
                            title="Fin"
                            subtitle={endStr}
                            color={mainColor}
                            left={
                                <Clock4 size={24} color={mainColor} />
                            }
                            style={{flex: 1, marginHorizontal: 0}}
                        />
                    </View>
                </View>

            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    optionsList: {
        gap: 9,
        marginTop: 16,
        marginHorizontal: 14,
    },
    ListTitle: {
        paddingLeft: 29,
        fontSize: 15,
        fontFamily: 'Papillon-Medium',
        opacity: 0.5,
    },
    coursNameView: {
        height: 170,
    },
    coursName: {
        position: 'absolute',
        bottom: 18,
        left: 20,
    },
    coursNameText: {
        fontSize: 22,
        color: '#fff',
        fontFamily: 'Papillon-Semibold',
        marginBottom: 3,
    },
    coursDateText: {
        fontSize: 15,
        color: '#ffffff99',
    }
});

export default LessonScreen;