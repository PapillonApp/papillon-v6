import * as React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';

function PapillonIcon({ icon, color, style, fill, small }) {
    console.log(fill);

    return (
        <View style={[styles.icon, {backgroundColor: fill? color : color + "10"}, style, small ? styles.iconSmall : null]}>
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