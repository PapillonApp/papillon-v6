import * as React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { AlertTriangle } from 'lucide-react-native';

function UnstableItem({ text }) {
    const theme = useTheme();

    return (
        <View style={[styles.unstable]}>
            <AlertTriangle size={20} color={'#fff'} />
            <Text style={[styles.unstableText]}>{text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    unstable: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 30,
        backgroundColor: '#A84700',
    },
    unstableText: {
        fontSize: 15,
        color: '#fff',
    }
});

export default UnstableItem;