import * as React from "react"
import { Platform, ScrollView, StatusBar, View, Text, StyleSheet } from "react-native";

import { useTheme } from 'react-native-paper';
import GetUIColors from '../../../utils/GetUIColors';
import NativeList from "../../../components/NativeList";
import ListItem from "../../../components/ListItem";
import PapillonIcon from "../../../components/PapillonIcon";

import { Info, CircleX, ScrollText, CircleAlert } from 'lucide-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import PapillonLoading from "../../../components/PapillonLoading";
import moment from "moment"
moment.locale("fr")
let UIColors;
function setValues(UIColors1) {
    UIColors = UIColors1
}
function LogsRenderer({ log }) {
    let icon;
    let color = UIColors.text
    switch(log.type) {
        case "log": 
            icon = <ScrollText size={24} color={"#FFFFFF"} style={styles.icon}/>
            break;
        case "info":
            icon = <Info size={24} color={"cyan"} style={styles.icon}/>
            break;
        case "warn":
            icon = <CircleAlert size={24} color={"yellow"} style={styles.icon}/>
            color = "yellow"
            break;
        case "error":
            icon = <CircleX size={24} color={"red"} style={styles.icon}/>
            color = "red"
            break;
    }
    let formatedDate = moment(log.time).format("DD/MM/YYYY HH:MM:ss.SSS")
    return (
        <View style={styles.logContainer}>
            {icon}
            <View style={{
                marginLeft: 10
            }}>
                <Text style={{color: UIColors.text, fontSize: 10}}>{formatedDate} - {log.type}</Text>
                <Text style={{color: color}}>{log.message}</Text>
            </View>
        </View>
    )
}

function LogsScreen({ navigation }) {
    const theme = useTheme();
    const UIColors = GetUIColors();
    setValues(UIColors)
    const [logs, setLogs] = React.useState([])
    const [logsLoading, setLogsLoading] = React.useState(true)
    async function loadLogs() {
        let logs1 = await AsyncStorage.getItem("logs")
        let logsArray = Array.from(JSON.parse(logs1))
        let sortedLogArray = logsArray.sort((a, b) => b.time - a.time)
        setLogs(sortedLogArray)
        setLogsLoading(false)
    }
    React.useEffect(() => {
        loadLogs()
    }, [])
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
                style={{ 
                    backgroundColor: UIColors.modalBackground,
                    padding: 10, 
                }}
                contentInsetAdjustmentBehavior="automatic"
            >
                {logsLoading ? (
                    <PapillonLoading
                        title="Chargement des logs"
                    />
                ) : 
                    Array.from(logs).map((log, index) => (
                        <LogsRenderer log={log} key={index} />
                    ))
                }
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    logContainer: {
        flexDirection: "row",
        marginBottom: 10
    },
    icon: {
        marginTop: 4
    }
})

export default LogsScreen;