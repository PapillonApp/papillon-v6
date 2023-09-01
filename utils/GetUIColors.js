import { Platform } from "react-native";
import { useTheme } from "react-native-paper";

function GetUIColors() {
    const theme = useTheme();

    // background
    let background = '';

    if (Platform.OS === 'ios') {
        background = theme.dark ? "#000000" : "#f2f2f7";
    }
    else {
        background = theme.colors.background;
    }

    // element
    let element = '';

    if (Platform.OS === 'ios') {
        element = theme.dark ? "#151515" : "#fff";
    }
    else {
        element = theme.colors.elevation.level1;
    }

    // text
    let text = theme.dark ? "#fff" : "#000";

    // main
    let primary = '';

    if (Platform.OS === 'ios') {
        primary = '#29947A';
    }
    else {
        primary = theme.colors.primary;
    }

    // textOnPrimary
    let textOnPrimary = "#ffffff";

    if (Platform.OS === 'android') {
        textOnPrimary = theme.colors.onPrimary;
    }

    return {
        background: background,
        element: element,
        text: text,
        primary: primary
    }
}

export default GetUIColors;