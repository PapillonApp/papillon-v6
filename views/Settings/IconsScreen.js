import * as React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Image, StatusBar, Platform, Settings, Appearance, Alert } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';

import { useState, useEffect } from 'react';

import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import { setAppIcon } from "expo-dynamic-app-icon";

import { Grid } from 'lucide-react-native';

function AppearanceScreen({ navigation }) {
    const theme = useTheme();

    // 3d, beta, black, chip, cutted, gold, gradient, metal, neon, pride, purple, rays-purple, rays, retro, sparkles
    const icons = [
        {
            coverName : 'Par défaut',
            name: 'classic',
            icon: require('../../assets/customicons/classic.png')
        },
        {
            name: '3d',
            icon: require('../../assets/customicons/3d.png')
        },
        {
            name: 'beta',
            icon: require('../../assets/customicons/beta.png')
        },
        {
            name: 'black',
            icon: require('../../assets/customicons/black.png')
        },
        {
            name: 'chip',
            icon: require('../../assets/customicons/chip.png')
        },
        {
            name: 'cutted',
            icon: require('../../assets/customicons/cutted.png')
        },
        {
            name: 'gold',
            icon: require('../../assets/customicons/gold.png')
        },
        {
            name: 'gradient',
            icon: require('../../assets/customicons/gradient.png')
        },
        {
            name: 'metal',
            icon: require('../../assets/customicons/metal.png')
        },
        {
            name: 'neon',
            icon: require('../../assets/customicons/neon.png')
        },
        {
            name: 'pride',
            icon: require('../../assets/customicons/pride.png')
        },
        {
            name: 'purple',
            icon: require('../../assets/customicons/purple.png')
        },
        {
            name: 'rays-purple',
            icon: require('../../assets/customicons/rays-purple.png')
        },
        {
            name: 'rays',
            icon: require('../../assets/customicons/rays.png')
        },
        {
            name: 'retro',
            icon: require('../../assets/customicons/retro.png')
        },
        {
            name: 'sparkles',
            icon: require('../../assets/customicons/sparkles.png')
        },
    ]

    function applyIcon(name) {
        let icon = setAppIcon(name);

        if(icon == name) {
            Alert.alert(
                "Icône appliquée",
                "L'icône " + name + " à été appliquée avec succès !",
                [
                    {
                        text: "OK",
                        style: "cancel"
                    }
                ]
            );      
        }
    }
        
    return (
        <ScrollView contentInsetAdjustmentBehavior="automatic"  style={{flex: 1}}>
            {Platform.OS === 'ios' ? (
                <StatusBar animated backgroundColor="#000" barStyle={'light-content'} />
            ) : null}

            <View style={{gap: 9, paddingVertical: 24}}>
                <Text style={styles.ListTitle}>Application</Text>

                { icons.map((icon, index) => (
                    <ListItem
                        key={index}
                        title={icon.coverName ? icon.coverName : icon.name}
                        subtitle={"Appliquer l'icône " + icon.name}
                        color="#A84700"
                        style={styles.iconElem}
                        left={
                            <Image
                                source={icon.icon}
                                style={styles.icon}
                            />
                        }
                        onPress={() => applyIcon(icon.name)}
                    />
                )) }


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
    icon: {
        width: 38,
        height: 38,
        borderRadius: 9,
    },
});

export default AppearanceScreen;