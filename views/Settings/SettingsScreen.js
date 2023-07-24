import * as React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Image, StatusBar, Platform, Settings, Alert } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';

import { useState, useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';

import { refreshToken } from '../../fetch/AuthStack/LoginFlow';

import AsyncStorage from '@react-native-async-storage/async-storage';

import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import { LogOut, RefreshCw } from 'lucide-react-native';

function SettingsScreen({ navigation }) {
    const theme = useTheme();

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

    function TokenAction() {
        refreshToken().then((token) => {
            Alert.alert(
                'Token regénéré',
                'Le token de votre compte a été regénéré avec succès !',
                [
                    {
                        text: 'OK',
                        style: 'cancel',
                    },
                ]
            );
        });
    }
    
    return (
        <ScrollView style={{flex: 1}}>
            <View style={{gap: 9, marginTop: 16}}>
                <Text style={styles.ListTitle}>Mon compte</Text>

                <ListItem
                    title="Regénerer le token"
                    subtitle="Regénerer le token de votre compte"
                    color="#B42828"
                    left={
                        <PapillonIcon
                            icon={<RefreshCw size={24} color="#565EA3" />}
                            color="#565EA3"
                            size={24}
                            small
                        />
                    }
                    onPress={() => TokenAction()}
                />
                <ListItem
                    title="Déconnexion"
                    subtitle="Se déconnecter de votre compte"
                    color="#B42828"
                    left={
                        <PapillonIcon
                            icon={<LogOut size={24} color="#B42828" />}
                            color="#B42828"
                            size={24}
                            small
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