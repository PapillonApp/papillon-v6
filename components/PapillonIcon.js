import * as React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';

function PapillonIcon({ icon, color, style, fill, small, plain }) {
    

    let opacity = "10";
    if (fill) {
        opacity = "FF";
    }
    if (plain) {
        opacity = "00";
    }

    return (
        <View style={[styles.icon, {backgroundColor: color + opacity}, style, small ? styles.iconSmall : null]}>
            {icon}
        </View>
    )
}

const styles = StyleSheet.create({
    icon: {
        padding: 10,
        borderRadius: 14,
        borderCurve: 'continuous',
        alignContent: 'center',
        alignItems: 'center',
    },
    iconSmall : {
        padding: 6,
    }
});

export default PapillonIcon;