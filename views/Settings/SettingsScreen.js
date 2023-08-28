import * as React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Image, ActivityIndicator, Platform, Settings, Alert } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';

import { useState, useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';

import { refreshToken, expireToken } from '../../fetch/AuthStack/LoginFlow';

import AsyncStorage from '@react-native-async-storage/async-storage';

import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import { LogOut, RefreshCw, Trash2 } from 'lucide-react-native';

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
                    onPress: async () => {
                        AsyncStorage.getItem('credentials').then((result) => {
                            const URL = JSON.parse(result).url;
                            AsyncStorage.clear();
                            AsyncStorage.setItem('old_login', JSON.stringify({ url: URL }));
                        });
                    }
                }
            ]
        );
    }

    const [tokenLoading, setTokenLoading] = useState(false);

    function TokenAction() {
        setTokenLoading(true);
        refreshToken().then((token) => {
            setTokenLoading(false);
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

    function ExpireAction() {
        expireToken("expireAction");
    }
    
    return (
        <ScrollView style={[styles.container, {backgroundColor: theme.dark ? "#000000" : "#f2f2f7"}]}>
            <View style={{gap: 9, marginTop: 16}}>
                <Text style={styles.ListTitle}>Mon compte</Text>

                <ListItem
                    title="Regénerer le token"
                    subtitle="Regénerer le token de votre compte"
                    color="#B42828"
                    center
                    left={
                        <PapillonIcon
                            icon={<RefreshCw size={24} color="#565EA3" />}
                            color="#565EA3"
                            size={24}
                            small
                        />
                    }
                    right={
                        tokenLoading ?
                            <ActivityIndicator size="small" />
                        : null
                    }
                    onPress={() => TokenAction()}
                />
                <ListItem
                    title="Forcer l'expiration du token"
                    subtitle="Regénerer le token de votre compte"
                    color="#B42828"
                    center
                    left={
                        <PapillonIcon
                            icon={<Trash2 size={24} color="#565EA3" />}
                            color="#565EA3"
                            size={24}
                            small
                        />
                    }
                    onPress={() => ExpireAction()}
                />
                <ListItem
                    title="Déconnexion"
                    subtitle="Se déconnecter de votre compte"
                    color="#B42828"
                    center
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