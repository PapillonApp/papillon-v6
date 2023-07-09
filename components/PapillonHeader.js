import * as React from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { BlurView } from 'expo-blur';

import { useEffect } from 'react';

import { getUser } from '../fetch/PronoteData/PronoteUser';

function PapillonHeader ({insetTop, pageName, rightButton, flat, disbaleBlur}) {
    const theme = useTheme();
    const [userData, setUserData] = React.useState({});

    useEffect(() => {
        getUser(false).then((result) => {
            setUserData(result);
            console.log(result);
        });
    }, []);

    let transparency = "99";
    if(disbaleBlur) transparency = "ff";

    return (
        <BlurView intensity={80} style={[styles.header, { backgroundColor: theme.dark ? '#111111'+transparency : '#ffffff'+transparency, borderColor: theme.colors.outline, borderColor: theme.dark ? '#353535' : '#c5c5c5', paddingTop:insetTop + 8}, flat ? styles.headerFlat : undefined]}>
            <Image style={styles.profilePicture} source={{uri: userData.profile_picture}} />
            <Text style={[styles.headerText]}>{pageName}</Text>

            <View style={[styles.right, {flex: 1}]}>
                {rightButton}
            </View>
        </BlurView>
    )
}

const styles = StyleSheet.create({
    header: {
        width: '100%',
        paddingBottom: 12,
        paddingHorizontal: 29,
        borderBottomWidth: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,

        position: 'absolute',
        top: 0,
        zIndex: 1,
    },
    headerFlat: {
        borderBottomWidth: 0,
        backgroundColor: 'transparent',
    },
    headerText: {
        fontSize: 17,
        fontFamily: 'Papillon-Semibold',
    },
    profilePicture: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    right: {
        opacity: 0.5,
        alignItems: 'flex-end',
    },
});

export default PapillonHeader;