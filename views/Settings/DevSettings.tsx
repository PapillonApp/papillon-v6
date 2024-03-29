import * as React from "react"
import { Platform, ScrollView, StatusBar, View } from "react-native";

import { useTheme } from 'react-native-paper';
import GetUIColors from '../../utils/GetUIColors';
import NativeList from "../../components/NativeList";
import ListItem from "../../components/ListItem";
import PapillonIcon from "../../components/PapillonIcon";

import { Network, ScrollText } from 'lucide-react-native';

function DevSettings({ navigation }) {
    const theme = useTheme();
    const UIColors = GetUIColors();
    return (
        <View style={{ flex: 1 }}>
            {Platform.OS === 'ios' ? (
                <StatusBar animated barStyle="light-content" />
            ) : (
                <StatusBar
                    animated
                    barStyle={theme.dark ? 'light-content' : 'dark-content'}
                    backgroundColor="transparent"
                />
            )}
            <ScrollView
                style={{ backgroundColor: UIColors.modalBackground }}
                contentInsetAdjustmentBehavior="automatic"
            >
                <NativeList
                    inset
                    header="Menus"
                >
                    <ListItem
                        title="Déboggeur réseau"
                        subtitle="Affiche les requêtes réseau"
                        color="#FFAA00"
                        left={
                        <PapillonIcon
                            icon={<Network size={24} color="#fff" />}
                            color="#FFAA00"
                            fill
                            small
                        />
                        }
                        onPress={() => navigation.navigate('NetworkLoggerScreen')}
                    />
                    <ListItem
                        title="Logs"
                        subtitle="Affiche les logs de l'application"
                        color="#00AAFF"
                        left={
                        <PapillonIcon
                            icon={<ScrollText size={24} color="#fff" />}
                            color="#00AAFF"
                            fill
                            small
                        />
                        }
                        onPress={() => navigation.navigate('LogsScreen')}
                    />
                </NativeList>
            </ScrollView>
        </View>
    )
}

export default DevSettings;