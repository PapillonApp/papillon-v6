import * as React from "react"
import { Platform, ScrollView, StatusBar, View } from "react-native";

import { useTheme } from 'react-native-paper';
import GetUIColors from '../../utils/GetUIColors';
import NativeList from "../../components/NativeList";
import ListItem from "../../components/ListItem";
import PapillonIcon from "../../components/PapillonIcon";

import { Settings, User2, Info, Sparkles, Bell, FlaskConical } from 'lucide-react-native';

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
                        title="Options de développement"
                        subtitle="┬─┬ノ( º _ ºノ)"
                        color="#FF0000"
                        left={
                        <PapillonIcon
                            icon={<FlaskConical size={24} color="#fff" />}
                            color="#FF0000"
                            fill
                            small
                        />
                        }
                        onPress={() => navigation.navigate('Appearance')}
                    />
                </NativeList>
            </ScrollView>
        </View>
    )
}

export default DevSettings;