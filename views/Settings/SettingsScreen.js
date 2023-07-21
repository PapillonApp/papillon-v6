import * as React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Image, StatusBar, Platform, Settings, Alert } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';

import { useState, useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';

import AsyncStorage from '@react-native-async-storage/async-storage';

import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import { LogOut } from 'lucide-react-native';

function SettingsScreen({ navigation }) {
    const theme = useTheme();

    useEffect(() => {
        // change modal color
        SystemUI.setBackgroundColorAsync("#565EA3");
    }, []);

    function LogOutAction() {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'Déconnexion',
                    style: 'destructive',
                    onPress: () => {
                        AsyncStorage.clear();
                    }
                }
            ]
        );
    }
    
    return (
        <ScrollView style={{flex: 1}}>
            {Platform.OS === 'ios' ? (
                <StatusBar animated backgroundColor="#000" barStyle={'light-content'} />
            ) : null}

            <View style={{gap: 9, marginTop: 24}}>
                <Text style={styles.ListTitle}>Mon compte</Text>
                <ListItem
                    title="Déconnexion"
                    subtitle="Se déconnecter de votre compte"
                    color="#B42828"
                    left={
                        <PapillonIcon
                            icon={<LogOut size={24} color="#FFF" />}
                            color="#B42828"
                            size={24}
                            small
                            fill
                        />
                    }
                    onPress={() => LogOutAction()}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    ListTitle: {
        paddingLeft: 29,
        fontSize: 15,
        fontFamily: 'Papillon-Medium',
        opacity: 0.5,
    },
});

export default SettingsScreen;