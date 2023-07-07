import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { useColorScheme, Platform } from 'react-native';

function ListItem({ title, subtitle, left, icon, style, color, isLarge, onPress }) {
    const theme = useTheme();
    const scheme = useColorScheme();

    return (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.listItem, { backgroundColor: theme.dark ? '#111' : '#fff', borderColor: theme.colors.outline, borderColor: theme.dark ? '#191919' : '#e5e5e5', opacity: pressed && Platform.OS === 'ios' ? 0.6 : 1 }, style]} android_ripple={true}>
            
            { left ?
                <View style={[styles.left]}>
                    {left}
                </View>
            : null }

            { icon ?
                <View style={[styles.icon, {backgroundColor: theme.dark ? "#ffffff10" : color + "10"}]}>
                    {icon}
                </View>
            : null }

            <View style={[styles.listItemText, {gap : isLarge ? 8 : 2}]}>
                <Text style={[styles.listItemTextTitle]}>{title}</Text>
                <Text style={[styles.listItemTextSubtitle]}>{subtitle}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    listItem: {
        flexDirection: 'row',
        
        padding: 14,
        marginHorizontal: 14,

        borderRadius: 12,
        borderCurve: 'continuous',
        borderWidth: 1,
    },
    listItemText : {
        gap: 2,
        flex: 1,
    },
    listItemTextTitle: {
        fontSize: 17,
        fontFamily: 'Papillon-Semibold',
    },
    listItemTextSubtitle: {
        fontSize: 15,
        opacity: 0.6,
    },
    left: {
        marginRight: 14,
    },
    icon: {
        marginRight: 14,

        width: 38,
        height: 38,
        borderRadius: 30,

        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ListItem;