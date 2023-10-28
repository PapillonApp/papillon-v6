import CaptureLogs from "../../utils/CaptureLogs";

import * as React from "react"

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


async function sleep(num) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, num)
    })
}
function ApplicationLogs() {
    const theme = useTheme();
    const UIColors = GetUIColors();
    const [isSwitchOn, setIsSwitchOn] = React.useState(null)
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

    function objToString(obj, ndeep) {
        //sleep(10000)
        switch(typeof obj){
          case "string": return '"'+obj+'"';
          case "function": return obj.name || obj.toString();
          case "object":
            if(obj === null) return "null"
            var indent = Array(ndeep||1).join('\t'), isArray = Array.isArray(obj);
            return ('{['[+isArray] + Object.keys(obj).map(function(key){
                 return '\n\t' + indent +(isArray?'': key + ': ' )+ objToString(obj[key], (ndeep||1)+1);
               }).join(',') + '\n' + indent + '}]'[+isArray]).replace(/[\s\t\n]+(?=(?:[^\'"]*[\'"][^\'"]*[\'"])*[^\'"]*$)/g,'');
          case "symbol":
               return "symbol"
          case 'undefined':
            return "undefined"
          default: return obj.toString();
        }
      }
    let captured = 0
    CaptureLogs.messages.forEach(obj => {
        if(captured === 100) return;
        captured ++
        switch(obj.type) {
            case 'log':
                obj.color = "white"
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
        <ScrollView style={{ gap: 9, backgroundColor: UIColors.background }}>

        <FlatList
            data={list}
            renderItem={({item}) => <Text style={[styles.item, {color: item.color }]}>{objToString(item.message)}</Text>}
        />
        <Text>{list.length} logs restants</Text>
        </ScrollView>
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