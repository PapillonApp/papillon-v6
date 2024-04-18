import * as React from "react"
import { Platform, ScrollView, StatusBar, View, Text, StyleSheet, Alert, TextInput } from "react-native";

import { useTheme } from 'react-native-paper';
import GetUIColors from '../../../utils/GetUIColors';
import { showMessage } from 'react-native-flash-message';

import { Info, CircleX, ScrollText, CircleAlert, Trash2, Pencil, Check, X, Eye, EyeOff } from 'lucide-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import PapillonLoading from "../../../components/PapillonLoading";
import moment from "moment"
moment.locale("fr")

function LocalStorageViewScreen({ navigation }) {
    const theme = useTheme();
    const UIColors = GetUIColors();
    const [storage, setStorage] = React.useState([])
    const [storageList, setStorageList] = React.useState({1: false})
    const [storageLoading, setStorageLoading] = React.useState(true)
    async function loadStorage() {
        let keys = await AsyncStorage.getAllKeys()
        let items = await AsyncStorage.multiGet(keys)
        let storageListObject = {}
        items.forEach((value1) => {
            let item = value1[0]
            let value = value1[1]
            
        })
        //setStorageList(storageListArray)
        console.log
        setStorage(items)
        setStorageLoading(false)
    }
    React.useEffect(() => {
        loadStorage()
    }, [])
    function RenderItem({ item }) {
        let itemName = item[0]
        let itemValue = item[1]
        let options = entryInfo[itemName]
        let userOptions = storageList[itemName]
        if(!options) {
            if(itemName.includes("cache")) {
                options = {
                    about: null,
                    defaultDisplay: false,
                    warnBeforeDisplay: "Charger cette valeur peut faire planter l'application en raison de sa longueur.",
                    sensibledata: false
                }
            }
            else {
                options = {
                    about: null,
                    defaultDisplay: false,
                    warnBeforeDisplay: false,
                    sensibledata: false
                }
            }
        }
        console.log(`${itemName} visible user: ${userOptions}`)
        let displayedValue;
        if(userOptions) {
            if(userOptions.display) displayedValue = (<Text style={{color: UIColors.text}}>{itemValue}</Text>)
            if(userOptions.display === false) displayedValue = (<Text style={{color: "yellow"}}>Contenu masqué</Text>)
        }
        else {
            if(options.defaultDisplay) displayedValue = (<Text style={{color: UIColors.text}}>{itemValue}</Text>)
            else displayedValue = (<Text style={{color: "yellow"}}>Contenu masqué par défaut</Text>)
        }
        return (
            <View style={styles.entryContainer}>
                { options.sensibleData ? (
                    <View>
                        <CircleAlert size={24} color={"yellow"} style={styles.leftIcon} onPress={() => { warningSensibleData(itemName) }}/>
                    </View>
                ) : null}
                <View>
                    <Text style={{color: UIColors.text, fontSize: 10}}>{itemName}</Text>
                    { displayedValue }
                </View>
                <View style={styles.actionView}>
                    { options.about ? (
                        <Info color={UIColors.text} style={styles.actionIcon} onPress={() => { showAbout(itemName) }} />
                    ) : null}
                    { options.defaultDisplay ? (
                        <EyeOff color={UIColors.text} style={styles.actionIcon} onPress={() => { hideData(itemName) }} />
                    ) : (
                        <Eye color={UIColors.text} style={styles.actionIcon} onPress={() => { showData(itemName) }} />
                    )}
                    { options.defaultDisplay ? (
                        <Pencil color={UIColors.text} style={styles.actionIcon} onPress={() => { editEntry(itemName) }}/>
                    ): null}
                    <Trash2 color="red" style={styles.actionIcon} onPress={() => { deleteEntry(itemName) }}/>
                </View>
            </View>
        )
    }
    const entryInfo = {
        "allNotifs": {
            about: "Identifiants locaux des données ayant une notification en attente",
            defaultDisplay: true,
            warnBeforeDisplay: false,
            sensibleData: false
        },
        "devMode": {
            about: "Défini l'activation des options de développement",
            defaultDisplay: true,
            warnBeforeDisplay: false,
            sensibleData: false
        },
        "logs": {
            about: "Logs de l'application",
            defaultDisplay: false,
            warnBeforeDisplay: "Charger cette valeur peut faire planter l'application en raison de sa longueur.",
            sensibleData: false
        },
        "oldGrades": {
            about: "Cache des notes pour le background fetch",
            defaultDisplay: false,
            warnBeforeDisplay: "Charger cette valeur peut faire planter l'application en raison de sa longueur.",
            sensibleData: false
        },
        "ppln_terms": {
            about: "Défini si les conditions ont été acceptées",
            defaultDisplay: true,
            warnBeforeDisplay: false,
            sensibleData: false
        },
        "preventNotifInit": {
            about: "Défini si l'initialisation des notifications doit être ignoré",
            defaultDisplay: true,
            warnBeforeDisplay: false,
            sensibleData: false
        },
        "pronote:account_type_id": {
            about: "Type de compte pronote",
            defaultDisplay: true,
            warnBeforeDisplay: false,
            sensibleData: false
        },
        "pronote:cache_user": {
            about: "Cache des informations utilisateurs. Contient nom, prénom, et autres données personnelles.",
            defaultDisplay: false,
            warnBeforeDisplay: "Cette valeur contient vos données personnelles tel que votre prénom et nom.",
            sensibleData: true
        },
        "pronote:device_uuid": {
            about: "UUID de l'appareil pour pronote (généré automatiquement, modifier cette valeur entraînera l'échec de la reconnexion)",
            defaultDisplay: true,
            warnBeforeDisplay: false,
            sensibleData: false
        },
        "pronote:instance_url": {
            about: "URL de l'instance PRONOTE.",
            defaultDisplay: false,
            warnBeforeDisplay: "Cette valeur contient l'URL de l'instance de PRONOTE. N'importe qui qui accède à cette url peut connaître toutes les informations de votre établissement.",
            sensibleData: true
        },
        "pronote:next_time_token": {
            about: "Token de reconnexion à PRONOTE",
            defaultDisplay: false,
            warnBeforeDisplay: "Cette valeur contient le token de reconnexion à votre compte PRONOTE. Combiné à l'UUID et votre nom d'utilisateur, n'importe qui peut accéder à votre compte.",
            sensibleData: true
        },
        "pronote:username": {
            about: "Nom d'utilisateur PRONOTE",
            defaultDisplay: false,
            warnBeforeDisplay: "Cette valeur contient votre nom d'utilisateur, généralement composé de votre prénom et/ou nom.",
            sensibleData: true
        },
        "savedColors": {
            about: "Stockage des couleurs personnalisées",
            defaultDisplay: false,
            warnBeforeDisplay: "Charger cette valeur peut faire planter l'application en raison de sa longueur.",
            sensibleData: false
        },
        "service": {
            about: "Nom du service utilisé",
            defaultDisplay: true,
            warnBeforeDisplay: false,
            sensibleData: false
        }
    }
    function deleteEntry(name) {
        Alert.alert(
            `Supprimer ${name} ?`,
            "ATTENTION : NE PAS VALIDER SANS SAVOIR CE QUE VOUS FAITES !\nSupprimer cette entrée peut altérer au bon fonctionnement de l'application !",
            [{
                text: "Annuler",
                style: "cancel"
            },
            {
                text: "Supprimer",
                style: "destructive",
                onPress: async() => {
                    AsyncStorage.removeItem(name)
                    .then(() => {
                        showMessage({
                            message: 'Entrée supprimée avec succès',
                            type: 'success',
                            icon: 'auto',
                            floating: true,
                            position: "bottom"
                        });
                    })
                    .catch(err => {
                        showMessage({
                            message: 'Erreur lors de la suppression',
                            description: err,
                            type: "danger",
                            icon: 'auto',
                            floating: true,
                            position: "bottom"
                        });
                    })
                }
            }]
        )
    }
    function editEntry() {
        Alert.alert(
            "Modifier cette entrée ?",
            "ATTENTION : NE PAS VALIDER SANS SAVOIR CE QUE VOUS FAITES !\nModifier cette entrée peut altérer au bon fonctionnement de l'application !",
            [{
                text: "Annuler",
                style: "cancel"
            },
            {
                text: "Continuer",
                onPress: () => navigation.navigate('LocalStorageViewScreen')
            }]
        )
    }
    function validateEdit() {
        Alert.alert(
            "Valider la modification ?",
            "ATTENTION : NE PAS VALIDER SANS SAVOIR CE QUE VOUS FAITES !\nModifier cette entrée peut altérer au bon fonctionnement de l'application !",
            [{
                text: "Non",
                style: "cancel"
            },
            {
                text: "Oui",
            }]
        )
    }
    function cancelEdit() {
        Alert.alert(
            "Annuler la modification ?",
            "",
            [{
                text: "Non",
                style: "cancel"
            },
            {
                text: "Oui",
            }]
        )
    }
    function warningSensibleData(name) {
        Alert.alert(
            "Contient une information sensible",
            entryInfo[name].warnBeforeDisplay || "Cette valeur a été cachée par défaut, car elle contient une donnée sensible."
        )
    }
    function showData(name) {
        console.log("show data" + name)
        let options = entryInfo[name]
        if(!options) {
            if(name.includes("cache")) {
                options = {
                    about: null,
                    defaultDisplay: false,
                    warnBeforeDisplay: "Charger cette valeur peut faire planter l'application en raison de sa longueur.",
                    sensibledata: false
                }
            }
            else {
                options = {
                    warnBeforeDisplay: false
                }
            }
        }
        if(options.warnBeforeDisplay) {
            Alert.alert(
                options.sensibleData ? "Contient une information sensible" : "Afficher la valeur ?",
                options.warnBeforeDisplay + "\n\nSouhaitez-vous quand même afficher la valeur ?",
                [{
                    text: "Annuler",
                    style: "cancel"
                },
                {
                    text: "Continuer",
                    onPress: () => showData1(name)
                }]
            )
        }
        else showData1(name)
    }
    function showData1(name) {
        let entryUserOptions = storageList
        entryUserOptions[name] = { display: true }
        setStorageList(entryUserOptions)
    }
    function hideData(name) {
        let entryUserOptions = storageList
        entryUserOptions[name] = { display: false }
        setStorageList(entryUserOptions)
    }
    function showAbout(name) {
        Alert.alert(
            name,
            entryInfo[name].about
        )
    }
    const styles = StyleSheet.create({
        entryContainer: {
            flexDirection: "row",
            paddingBottom: 5,
            marginBottom: 10,
        },
        actionView: {
            marginLeft: "auto",
            flexDirection: "row",
            marginTop: 4,
        },
        actionIcon: {
            marginLeft: 5
        },
        leftIcon: {
            marginRight: 10,
            marginTop: 4
        }
    })
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
                {storageLoading ? (
                    <PapillonLoading
                        title="Chargement du local storage"
                    />
                ) : 
                    Array.from(storage).map((item, index) => (
                        <RenderItem item={item} key={index} />
                    ))
                }
            </ScrollView>
        </View>
    )
}
/*
{logsLoading ? (
                    <PapillonLoading
                        title="Chargement du local storage"
                    />
                ) : 
                    Array.from(logs).map((log, index) => (
                        <LogsRenderer log={log} key={index} />
                    ))
                }
                */

/*
                <View style={styles.entryContainer}>
                    <View>
                        <Text style={{color: UIColors.text, fontSize: 10}}>service</Text>
                        <Text style={{color: UIColors.text}}>pronote</Text>
                    </View>
                    <View style={styles.actionView}>
                        <EyeOff color={UIColors.text} style={styles.actionIcon} />
                        <Pencil color={UIColors.text} style={styles.actionIcon} onPress={() => { editEntry() }}/>
                        <Trash2 color="red" style={styles.actionIcon} onPress={() => { deleteEntry() }}/>
                    </View>
                </View>
                <View style={styles.entryContainer}>
                    <View>
                        <Pencil size={24} color={UIColors.text} style={styles.leftIcon} />
                    </View>
                    <View>
                        <View style={{flexDirection: "row", alignItems: "center"}}>
                            <Text style={{color: UIColors.text}}>Nom : </Text>
                            <TextInput numberOfLines={1} defaultValue="service" style={{color: UIColors.text, borderBottomWidth: 1, borderBottomColor: UIColors.text}}/>
                        </View>
                        <View>
                            <Text style={{color: UIColors.text}}>Valeur :</Text>
                            <TextInput numberOfLines={1} defaultValue="pronote" style={{color: UIColors.text, borderBottomWidth: 1, borderBottomColor: UIColors.text}}/>
                        </View>
                    </View>
                    <View style={styles.actionView}>
                        <X color="red" style={styles.actionIcon} onPress={() => { cancelEdit() }}/>
                        <Check color="green" style={styles.actionIcon} onPress={() => { validateEdit() }}/>
                    </View>
                </View>
                <View style={styles.entryContainer}>
                    <View>
                        <CircleAlert size={24} color={"yellow"} style={styles.leftIcon} onPress={() => { warningSensibleData() }}/>
                    </View>
                    <View>
                        <Text style={{color: UIColors.text, fontSize: 10}}>accessToken</Text>
                        <Text style={{color: UIColors.text}}>Contenu caché</Text>
                    </View>
                    <View style={styles.actionView}>
                        <Eye color={UIColors.text} style={styles.actionIcon} onPress={() => { showData() }} />
                        <Pencil color={UIColors.text} style={styles.actionIcon} onPress={() => { editEntry() }}/>
                        <Trash2 color="red" style={styles.actionIcon} onPress={() => { deleteEntry() }}/>
                    </View>
                </View>
                */
export default LocalStorageViewScreen;