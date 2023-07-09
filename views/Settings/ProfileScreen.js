import * as React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Image, StatusBar, Platform } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';

function ProfileScreen({ navigation }) {
    const theme = useTheme();
    
    return (
        <View style={{flex: 1}}>
            {Platform.OS === 'ios' ? (
                <StatusBar animated backgroundColor="#000" barStyle={'light-content'} />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
});

export default ProfileScreen;