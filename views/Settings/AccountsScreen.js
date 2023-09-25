import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Appearance,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { UserPlus, Trash } from 'lucide-react-native';

import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import GetUIColors from '../../utils/GetUIColors';

import * as AccountManager from '../../utils/AccountsManager'

import { showMessage } from 'react-native-flash-message';

import asyncStorage from '@react-native-async-storage/async-storage';

import { useAppContext } from '../../utils/AppContext';

function AccountItem({ account, changeAccount, current, icon, loading }) {
    console.log("current transmis :", current)
    return (
        <ListItem
            title={account.userCache ? account.userCache.user.name : "Inconnu"}
            subtitle={"Compte " + account.service + " (" + account.credentials.username + ")"}
            color="#A84700"
            style={[styles.iconElem, current ? styles.iconElemCurrent : {}]}
            left={
                <Image source={icon} style={[styles.serviceOptionLogo, {}]} />
            }
            right={
                loading ? (
                  <ActivityIndicator color={'#ffffff'} />
                ) : null
              }
            onPress={() => changeAccount(account.id)}
        />
    )
}

function AccountsScreen({ navigation }) {
    const appCtx = useAppContext();
    const [currentAccount, setCurrentAccount] = React.useState(null)
    const [loadingAccount, setLoadingAccount] = React.useState(null)
    const [accounts, setAccounts] = React.useState(undefined)
    function logoutAll() {
        appCtx.setLoggedIn(false)
        asyncStorage.clear()
    }
    function getAccounts() {
        AccountManager.getAccounts().then(ac => {
            let ac1 = Array.from(ac)
            console.log("données en array : " + ac1)
            setAccounts(ac1)
        })
        asyncStorage.getItem("activeAccount").then(e => { console.log("activeAccount", e); setCurrentAccount(Number(e)) })
    }
    React.useEffect(() => {
        getAccounts()
    }, []);

    const theme = useTheme();
    const UIColors = GetUIColors();
    const logos = {
        "Pronote": require("../../assets/logo_pronote.png"),
        "ecoledirecte": require("../../assets/logo_ed.png"),
        "skolengo": require("../../assets/logo_skolengo.png")
    }
    console.log(logos["Pronote"])
    async function changeAccount(id) {
        if(loadingAccount !== null) return;
        if(currentAccount === id) return;
        setLoadingAccount(id)
        AccountManager.useAccount(id)
        .then(() => {
            showMessage({
                message: "Changement de compte effectué !",
                description: "Vous devez rafraîchir les données pour les syncroniser.",
                type: "success",
                icon: "auto",
                floating: true,
                duration: 5000
            })
            setCurrentAccount(id)
            setLoadingAccount(null)
        })
        .catch(err => {
            showMessage({
                message: err || "Une erreur est survenue",
                type: "danger",
                icon: "auto",
                floating: true,
                duration: 5000
            })
        })
    }

    return (
        <ScrollView
          style={[styles.container, { backgroundColor: UIColors.background }]}
        >
          <StatusBar
            animated
            barStyle={theme.dark ? 'light-content' : 'dark-content'}
          />
    
          <View style={{ gap: 9, marginTop: 24 }}>
            <ListItem
                title="Ajouter un compte"
                color="#29947A"
                left={
                    <PapillonIcon
                    icon={<UserPlus size={24} color="#5d75de" />}
                    color="#5d75de"
                    size={24}
                    small
                    />
                }
                onPress={() => navigation.navigate('Login')}
                center
                />
          </View>
          { typeof accounts !== "undefined" && accounts.length > 0 ? (
            <View style={{ gap: 9, marginTop: 24 }}>
                <Text style={styles.ListTitle}>Comptes liés</Text>
                { accounts.map((account) => (
                    <AccountItem
                        account={account[1]}
                        changeAccount={changeAccount}
                        current={currentAccount === account[1].id}
                        icon={logos[account[1].service]}
                        loading={loadingAccount === account[1].id}
                    />
                ))
                }
                <ListItem
                title="Déconnecter tous les comptes"
                color="#B42828"
                left={
                    <PapillonIcon
                    icon={<Trash size={24} color="#B42828" />}
                    color="#B42828"
                    size={24}
                    small
                    />
                }
                onPress={() => logoutAll()}
                center
                />
            </View>
          ) : (
            <View style={{ gap: 9, marginTop: 24 }}>
                <ListItem
                    title="Chargement..."
                />
            </View>
          ) }
        </ScrollView>
      );
}

const styles = StyleSheet.create({
    ListTitle: {
      paddingLeft: 29,
      fontSize: 15,
      fontFamily: 'Papillon-Medium',
      opacity: 0.5,
    },
    iconElem: {
        borderColor: '#00000000',
        borderWidth: 2,
    },
    iconElemCurrent: {
        borderColor: '#29947A',
        borderWidth: 2,
    },
    serviceOptionLogo: {
        width: 40,
        height: 40,
    
        borderRadius: 300,
    },
  });
  
export default AccountsScreen;