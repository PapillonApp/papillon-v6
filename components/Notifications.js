import AsyncStorage from "@react-native-async-storage/async-storage";

import { Platform, PermissionsAndroid, Linking, Alert } from "react-native";
import packageJson from '../package.json'

import { showMessage } from 'react-native-flash-message';
import notifee, {AndroidImportance, AuthorizationStatus} from '@notifee/react-native';

let vars = {}
async function setVars() {
    return new Promise(async (resolve) => {
        let vars1 = await AsyncStorage.getItem("notifs")
        console.log("vars1")
        vars = vars1 ? JSON.parse(vars1) : {lastUpdatedVersion: null, permStatus: null}
        resolve()
    })
}
async function updateVars() {
    return new Promise(async (resolve) => {
        await AsyncStorage.setItem("notifs", JSON.stringify(vars))
        resolve()
    })
}
async function registerNotifs() {
    return new Promise(async (resolve) => {
        await notifee.createChannelGroups([
            {
                name: "Nouvelles données disponibles",
                description: "Notifications en arrière-plan",
                id: "newdata-group"
            },
            {
                name: "Rappels",
                description: "Notifications de rappels",
                id: "remind-group"
            },
            {
                name: "Notifications silencieuses",
                description: "Notifications en arrière-plan",
                id: "silent-group"
            }])
        await notifee.createChannels([{
            id: "silent",
            groupId: "silent-group",
            name: "Données en arrière-plan",
            description: "Notifie quand l'application récupère les données en arrière-plan",
            importance: AndroidImportance.LOW
        },
        {
            name: "Rappels de devoirs",
            id: "works-remind",
            groupId: "remind-group",
            description: "Notifications de rappels de devoirs",
            importance: AndroidImportance.HIGH
        },
        {
            name: "Rappels de cours",
            id: "course-remind",
            groupId: "remind-group",
            description: "Notifications de rappels de cours (configurable dans l'application)",
            importance: AndroidImportance.HIGH
        },
        {
            name: "Nouvelles actualités",
            id: "new-news",
            groupId: "newdata-group",
            description: "Indique quand une nouvelle actualité est disponible",
            importance: AndroidImportance.HIGH
        },
        ])
        resolve()
    })
}
async function clearNotifChannels() {
    return new Promise((resolve) => {
        notifee.getChannels().then(channels => {
            channels.forEach(ch => { notifee.deleteChannel(ch.id) })
        })
        notifee.getChannelGroups().then(groups => { 
            groups.forEach(gr => { notifee.deleteChannelGroup(gr.id) })
        })
        setTimeout(() => {
            resolve(true)
        }, 1000)
    })
}
async function checkNotifPerm() {
    return new Promise(async (resolve) => {
        if (Platform.OS === "android") {
            if (Platform.Version >= 33) {
                PermissionsAndroid.check("android.permission.POST_NOTIFICATIONS").then((granted) => {
                    if (granted) {
                        resolve({authorized: true, ios: false})
                    }
                    else resolve({authorized: false, ios: false})
                })
            }
            else resolve({authorized: true, ios: false})
        }
        else if (Platform.OS === "ios") {
            let result = await notifee.requestPermission({sound: true, badge: true, alert: true, inAppNotificationSettings: true, announcement: true});
            if(result.authorizationStatus === AuthorizationStatus.DENIED) resolve({authorized: false, ios: true})
            else resolve({authorized: true, ios: true})
        }
    })
}
async function askNotifPerm() {
    return new Promise(async (resolve) => {
        if (Platform.OS === "android") {
            PermissionsAndroid.request("android.permission.POST_NOTIFICATIONS").then(async (result) => {
                if (result === "granted") {
                    resolve({authorized: true, neverAskAgain: false})
                }
                else {
                    result !== "never_ask_again" ? Alert.alert(
                        'Notifications',
                        'Vous avez refusé les notifications. Si vous les refusez, vous ne pourrez pas reçevoir de rappel de devoirs, des cours ou de nouvelles actualités, etc. Souhaitez-vous continuer ?',
                        [
                            {
                                text: 'Continuer',
                                style: 'cancel',
                                onPress: () => {
                                    showMessage({
                                        message: 'Notifications désactivées',
                                        type: 'danger',
                                        icon: 'auto',
                                    });
                                }
                            },
                            {
                                text: "Autoriser",
                                onPress: async () => {
                                    resolve(await askNotifPerm())
                                }
                            }
                        ]
                    ) : Alert.alert(
                        'Notifications',
                        'Vous avez refusé les notifications. Si vous les refusez, vous ne pourrez pas reçevoir de rappel de devoirs, des cours ou de nouvelles actualités, etc. Pour les autoriser, veuillez vous rendre dans les paramètres de votre téléphone.',
                        [
                            {
                                text: 'Continuer',
                                style: 'cancel',
                                onPress: () => {
                                    resolve({authorized: false, neverAskAgain: true})
                                }
                            },
                            {
                                text: 'Ouvrir les paramètres',
                                style: 'cancel',
                                onPress: () => {
                                    Linking.openSettings()
                                    resolve({authorized: false, neverAskAgain: true})
                                }
                            },
                        ]
                    )
                }
            })
        }
        else if (Platform.OS === "ios") {
            const settings = await notifee.requestPermission({ sound: true, badge: true, alert: true, inAppNotificationSettings: true, announcement: true });
    
            if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
                Alert.alert(
                    'Notifications',
                    'Vous avez refusé les notifications. Vous ne pourrez pas reçevoir de rappel de devoirs, des cours ou de nouvelles actualités, etc. Pour les autoriser, veuillez vous rendre dans les paramètres de votre appareil.',
                    [
                        {
                            text: 'Ouvrir les paramètres',
                            onPress: () => {
                                Linking.openSettings()
                                resolve({authorized: false, neverAskAgain: true})
                            }
                        },
                        {
                            text: 'Continuer',
                            style: 'cancel',
                            onPress: () => {
                                resolve({authorized: false, neverAskAgain: true, askAgain: false})
                            }
                        },
                    ]
                )
            }
    
        }
    })
}
async function checkRegisteredChannels() {
    return new Promise(async (resolve) => {
        if(vars.lastUpdatedVersion === packageJson.version) resolve({noUpdate: true})
        else {
            await clearNotifChannels()
            await registerNotifs()
            vars.lastUpdatedVersion = packageJson.version
            updateVars()
            resolve()
        }
    })
}
export async function init() {
    await setVars()
    let perm = await checkNotifPerm()
    if(perm.authorized) {
        if(vars.permStatus !== "granted") {
            vars.permStatus = "granted"
            showMessage({
                message: 'Notifications activées',
                type: 'success',
                icon: 'auto',
                floating: true,
            });
            updateVars()
        }
    }
    else {
        if(vars.permStatus === "neverAskAgain") return;
        let askNotifPermResult = await askNotifPerm()
        if(askNotifPermResult.authorized) {
            showMessage({
                message: 'Notifications activées',
                type: 'success',
                icon: 'auto',
                floating: true,
            });
            vars.permStatus = "granted"
            updateVars()
            checkRegisteredChannels()
        }
        else {
            showMessage({
                message: 'Notifications désactivées',
                type: 'danger',
                icon: 'auto',
                floating: true,
            });
            vars.permStatus = "neverAskAgain"
            vars.lastUpdatedVersion = null
            updateVars()
        }
    }
}