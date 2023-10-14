import * as React from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { Text } from 'react-native-paper';

function PapillonLoading({ title, subtitle, icon, style }) {
  return (
    <View style={[styles.newsLoading, style]}>
        {icon ?
            <View style={styles.newsLoadingIcon}>
                {icon}
            </View>
        :
            <ActivityIndicator
                style={{ marginTop: 16 }}
                size={26}
            />
        }

        <Text style={styles.newsLoadingText}>
            {title}
        </Text>
        <Text style={styles.newsLoadingSubtext}>
            {subtitle}
        </Text>
    </View>
  );
}

const styles = StyleSheet.create({
    newsLoading: {
        marginVertical: 24,
        marginHorizontal: 24,
        alignItems: 'center',
    },
    newsLoadingText: {
        fontSize: 17,
        fontFamily: 'Papillon-Semibold',
        marginTop: 8,
        textAlign: 'center',
    },
    newsLoadingSubtext: {
        fontSize: 15,
        marginTop: 4,
        opacity: 0.5,
        textAlign: 'center',
    },
});

export default PapillonLoading;
