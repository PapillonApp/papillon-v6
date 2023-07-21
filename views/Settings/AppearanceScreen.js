import * as React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Image, StatusBar, Platform, Settings, Appearance } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';

import { useState, useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';

import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import { Grid } from 'lucide-react-native';

function AppearanceScreen({ navigation }) {
    const theme = useTheme();

    useEffect(() => {
        // change modal color
        SystemUI.setBackgroundColorAsync("#A84700");
    }, []);
    
    return (
        <ScrollView style={{flex: 1}}>
            {Platform.OS === 'ios' ? (
                <StatusBar animated backgroundColor="#000" barStyle={'light-content'} />
            ) : null}

            <View style={{gap: 9, marginTop: 24}}>
                <Text style={styles.ListTitle}>Application</Text>
                <ListItem
                    title="Icône de l'application"
                    subtitle="Changer l'icône de l'application"
                    color="#A84700"
                    left={
                        <PapillonIcon
                            icon={<Grid size={24} color="#FFF" />}
                            color="#A84700"
                            size={24}
                            small
                            fill
                        />
                    }
                    onPress={() => navigation.navigate('Icons')}
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

export default AppearanceScreen;