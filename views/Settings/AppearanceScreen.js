import * as React from "react";
import {
    View,
    ScrollView,
    Pressable,
    StyleSheet,
    Image,
    StatusBar,
    Platform,
    Settings,
    Appearance,
    Switch,
    Alert,
} from "react-native";
import { useTheme, Button, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useState, useEffect } from "react";
import * as SystemUI from "expo-system-ui";

import ListItem from "../../components/ListItem";
import PapillonIcon from "../../components/PapillonIcon";

import { Layout, Maximize, SunMoon } from "lucide-react-native";
import GetUIColors from "../../utils/GetUIColors";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function AppearanceScreen({ navigation }) {
    const theme = useTheme();
    const UIColors = GetUIColors();
    const { showActionSheetWithOptions } = useActionSheet();
    const insets = useSafeAreaInsets();

    const changeTheme = () => {
        const options = [
            {
                label: "Defaut",
                value: null,
            },
            {
                label: "Clair",
                value: "light",
            },
            {
                label: "Sombre",
                value: "dark",
            },
            {
                label: "Annuler",
                value: "cancel",
            },
        ];
        showActionSheetWithOptions(
            {
                options: options.map((option) => option.label),
                cancelButtonIndex: options.length - 1,
                containerStyle: {
                    paddingBottom: insets.bottom,
                    backgroundColor: UIColors.elementHigh,
                },
                textStyle: {
                    color: UIColors.text,
                },
                titleTextStyle: {
                    color: UIColors.text,
                    fontWeight: "bold",
                },
                messageTextStyle: {
                    color: UIColors.text,
                },
            },
            (selectedIndex) => {
                if (selectedIndex === undefined) return;
                const newTheme = options[selectedIndex];
                if (newTheme.value === "cancel") return;
                Appearance.setColorScheme(newTheme.value)
                return;
            }
        );
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: UIColors.background }]}
        >
            <StatusBar
                animated
                barStyle={theme.dark ? "light-content" : "dark-content"}
            />

            <View style={{ gap: 9, marginTop: 24 }}>
                <Text style={styles.ListTitle}>Application</Text>
                <ListItem
                    title="Icône de l'application"
                    subtitle="Changer l'icône de l'application"
                    color="#29947A"
                    left={
                        <PapillonIcon
                            icon={<Maximize size={24} color="#29947A" />}
                            color="#29947A"
                            size={24}
                            small
                        />
                    }
                    onPress={() => navigation.navigate("Icons")}
                    center
                />
                <ListItem
                    title="Theme de l'application"
                    subtitle="Sélectionner le thème de l'application"
                    color="#29947A"
                    left={
                        <PapillonIcon
                            icon={<SunMoon size={24} color="#29947A" />}
                            color="#29947A"
                            size={24}
                            small
                        />
                    }
                    onPress={() => changeTheme()}
                    center
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    ListTitle: {
        paddingLeft: 29,
        fontSize: 15,
        fontFamily: "Papillon-Medium",
        opacity: 0.5,
    },
});

export default AppearanceScreen;
