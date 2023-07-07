import * as React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';

function PapillonButton({ title, color, onPress, style, light }) {
    return (
        <Pressable onPress={() => onPress()} style={({ pressed }) => [styles.btnBack, { opacity: pressed && Platform.OS === 'ios' ? 0.6 : 1, backgroundColor: !light ? color : color + '22' }, style]}>
            <Text style={[styles.btnBackText, {color : light ? color : '#fff'}]}>{title}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
  btnBack: {
    padding: 14,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignContent: 'center',
    alignItems: 'center',
  },
  btnBackText: {
    color: '#fff',
    fontFamily: 'Papillon-Medium',
    fontSize: 16,
  },
});

export default PapillonButton;