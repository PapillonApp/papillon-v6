import CaptureLogs from "../../utils/CaptureLogs";

import {
    StyleSheet,
    View,
    FlatList,
    ScrollView,
    StatusBar,
    Platform,
    Alert,
    TextInput,
    KeyboardAvoidingView,
    Button,
} from 'react-native';
  
import ListItem from '../../components/ListItem';
import NativeList from '../../components/NativeList'

import { Text, useTheme } from 'react-native-paper';
import GetUIColors from '../../utils/GetUIColors';


function ApplicationLogs() {

    const UIColors = GetUIColors();

    let list = [];

    const getCircularReplacer = () => {
        const seen = new WeakSet();
        return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
        };
    };

    CaptureLogs.messages.forEach(obj => {
        switch(obj.type) {
            case 'log':
                obj.color = "black"
            break;
            case 'warn':
                obj.color = "yellow"
            break;

            case 'error':
                obj.color = "red"
            break;
        }
        list.push(obj)
    })
    
    return (
        <View style={{ gap: 9, marginTop: 16 }}>

        <FlatList
            data={list}
            renderItem={({item}) => (<Text style={[styles.item, {color: item.color }]}>{JSON.stringify(item.message, getCircularReplacer())}</Text>)}
        />
        
        </View>
    )

}

const styles = StyleSheet.create({
    ListTitle: {
      paddingLeft: 29,
      fontSize: 15,
      fontFamily: 'Papillon-Medium',
      opacity: 0.5,
    },

    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
  });

export default ApplicationLogs;