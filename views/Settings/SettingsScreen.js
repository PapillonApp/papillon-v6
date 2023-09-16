import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';

import { useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, RefreshCw, Server, Trash2 } from 'lucide-react-native';
import { refreshToken, expireToken } from '../../fetch/AuthStack/LoginFlow';

import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import GetUIColors from '../../utils/GetUIColors';
import { useAppContext } from '../../utils/AppContext';

import * as AccountManager from '../../utils/AccountsManager'

import { showMessage } from 'react-native-flash-message';

function SettingsScreen({ navigation }) {
  const UIColors = GetUIColors();

  const appCtx = useAppContext();

  function LogOutAction() {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          try {
            AsyncStorage.getItem('credentials').then((result) => {
              const URL = JSON.parse(result).url;
              AsyncStorage.setItem('old_login', JSON.stringify({ url: URL }));
            });
          } catch (e) {
            /* empty */
          }
          await AccountManager.deleteAccount()
          let accounts = await AccountManager.getAccounts()
          if(accounts.size > 0) {
            let account = accounts.get(accounts.size)
            AccountManager.useAccount(1)
            showMessage({
              message: `Déconnecté avec succès`,
              description: `Le compte ${account.service} ${account.credentials ? "(" + account.credentials.username + ")" : null} a été automatiquement activé.`,
              type: "info",
              icon: "auto",
              floating: true,
              duration: 5000
            })
            navigation.popToTop();
          }
          else {
            let credentials = await AsyncStorage.getItem("credentials")
            const URL = JSON.parse(credentials).url
            AsyncStorage.clear()
            AsyncStorage.setItem('old_login', JSON.stringify({ url: URL }));
            showMessage({
              message: "Déconnecté avec succès !",
              type: "success",
              icon: "auto",
              floating: true
            })
            appCtx.setLoggedIn(false);
            navigation.popToTop();
          }
        },
      },
    ]);
  }

  const [tokenLoading, setTokenLoading] = useState(false);

  function TokenAction() {
    setTokenLoading(true);
    refreshToken().then(() => {
      setTokenLoading(false);
      showMessage({
        message: "Token régénéré !",
        type: "success",
        floating: true,
        icon: "auto"
      })
    });
  }

  function ExpireAction() {
    expireToken('expireAction');
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
    >
    <View style={{ gap: 9, marginTop: 16 }}>
      <Text style={styles.ListTitle}>Serveur et identifiants (avancé)</Text>

        <ListItem
          title="Changer de serveur (avancé)"
          subtitle="Modifier le serveur utilisé dans l'app"
          color="#B42828"
          center
          left={
            <PapillonIcon
              icon={<Server size={24} color="#565EA3" />}
              color="#565EA3"
              size={24}
              small
            />
          }
          onPress={() => navigation.navigate('changeServer')}
        />
        <ListItem
          title="Regénerer le token"
          subtitle="Regénerer le token de votre compte"
          color="#B42828"
          center
          left={
            <PapillonIcon
              icon={<RefreshCw size={24} color="#565EA3" />}
              color="#565EA3"
              size={24}
              small
            />
          }
          right={tokenLoading ? <ActivityIndicator size="small" /> : null}
          onPress={() => TokenAction()}
        />
        <ListItem
          title="Forcer l'expiration du token"
          subtitle="Regénerer le token de votre compte"
          color="#B42828"
          center
          left={
            <PapillonIcon
              icon={<Trash2 size={24} color="#565EA3" />}
              color="#565EA3"
              size={24}
              small
            />
          }
          onPress={() => ExpireAction()}
        />
      </View>

      <View style={{ gap: 9, marginTop: 16 }}>
        <Text style={styles.ListTitle}>Mon compte</Text>

        <ListItem
          title="Déconnexion"
          subtitle="Se déconnecter de votre compte"
          color="#B42828"
          center
          left={
            <PapillonIcon
              icon={<LogOut size={24} color="#B42828" />}
              color="#B42828"
              size={24}
              small
            />
          }
          onPress={() => LogOutAction()}
        />
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
});

export default SettingsScreen;
