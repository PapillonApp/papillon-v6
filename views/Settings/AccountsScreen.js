import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Appearance,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { UserPlus } from 'lucide-react-native';

import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import GetUIColors from '../../utils/GetUIColors';

import * as AccountManager from '../../utils/AccountsManager'

import { showMessage } from 'react-native-flash-message';

import asyncStorage from '@react-native-async-storage/async-storage';

async function AccountItem({ account, changeAccount, current, icon }) {
    return (
        <ListItem
            title={account.userCache.name}
            subtitle={"Compte " + account.service + " (" + account.credentials.username + ")"}
            color="#A84700"
            style={[styles.iconElem, current ? styles.iconElemCurrent : {}]}
            left={
                <Image source={icon} style={[styles.serviceOptionLogo, {}]} />
            }
            right={
                loadingAccount === account.id ? (
                  <ActivityIndicator color={'#ffffff'} />
                ) : null
              }
            onPress={() => changeAccount(id)}
        />
    )
}

function AccountsScreen({ navigation }) {
    const [currentAccount, setCurrentAccount] = React.useState(null)
    asyncStorage.getItem("activeAccount").then(e => { setCurrentAccount(Number(e)) })
    const [loadingAccount, setLoadingAccount] = React.useState(true)
    const [accounts, setAccounts] = React.useState(null)
    async function getAccounts() {
        let ac = await AccountManager.getAccounts()
        setAccounts(ac)
    }
    getAccounts()
    const theme = useTheme();
    const UIColors = GetUIColors();
    const logos = {
        "Pronote": require("../../assets/logo_pronote.png"),
        "ecoledirecte": require("../../assets/logo_ed.png"),
        "skolengo": require("../../assets/logo_skolengo.png")
    }
    async function changeAccount(id) {
        if(loadingAccount !== null) return;
        if(currentAccount === id) return;
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
          <View style={{ gap: 9, marginTop: 24 }}>
            <Text style={styles.ListTitle}>Comptes liés</Text>
                {accounts ? accounts.forEach(account => {
                    <AccountItem
                    account={account}
                    changeAccount={changeAccount}
                    current={currentAccount === account.id}
                    icon={logos[account.service]}
                />
                }) : null}
          </View>
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
  });
  
export default AccountsScreen;