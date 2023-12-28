import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { PressableScale } from 'react-native-pressable-scale';
import { ContextMenuView } from 'react-native-ios-context-menu';
import { Album, BookX, CopyCheck, CreditCard, UserX } from 'lucide-react-native';

import { useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Turboself from 'papillon-turboself-core';
import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';
import GetUIColors from '../utils/GetUIColors';

import { useAppContext } from '../utils/AppContext';
import PapillonLoading from '../components/PapillonLoading';

function CantineScreen({ navigation }) {
  const UIColors = GetUIColors();
  const theme = useTheme();
  const appctx = useAppContext();
  const ts = new Turboself();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [homeData, setHomeData] = React.useState({});
  const [userData, setUserData] = React.useState({
    authorization: { pay: true, book: true, cafeteria: false },
    cardData: '',
  });

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: 'Retour',
      headerTintColor: UIColors.text,
      headerShadowVisible: true,
    });
  });

  function formatDateToDDMMYYY(dateString) {
    const dateObject = new Date(dateString);
    const day = `0${dateObject.getDate()}`.slice(-2);
    const month = `0${dateObject.getMonth() + 1}`.slice(-2);
    const year = dateObject.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function extractHourFromDateJson(dateJson) {
    const dateObject = new Date(dateJson);

    // Obtenir les composants de l'heure
    const hours = `0${dateObject.getHours()}`.slice(-2);
    const minutes = `0${dateObject.getMinutes()}`.slice(-2);
    const seconds = `0${dateObject.getSeconds()}`.slice(-2);

    const formattedTime = `${hours}:${minutes}`;

    return formattedTime;
  }

  function textPriceHistory(debit, credit) {
    if (credit != null) {
      return (
        <NativeText heading="h4" style={{ color: '#2A937A' }}>
          +{Number(credit / 100).toFixed(2)}€
        </NativeText>
      );
    }
    if (debit != null) {
      return (
        <NativeText heading="h4" style={{ color: '#B42828' }}>
          {Number(debit.toFixed(2))}€
        </NativeText>
      );
    }
    return <NativeText heading="h4" />;
  }

  function login() {
    AsyncStorage.getItem('linkedAccount').then((result) => {
      let res = { restaurant: {} };
      if (result != null) {
        res = JSON.parse(result);
      }
      if (res.restaurant.username != null) {
        ts.login(res.restaurant.username, res.restaurant.password).then(
          (data) => {
            if (data.error) {
              Alert.alert(data.errorMessage);
              return;
            }
            setIsLoggedIn(true);
            getHome();
          }
        );
      }
    });
  }

  function getHome() {
    ts.getHome().then((data) => {
      if (data.error) {
        Alert.alert(data.errorMessage);
        return;
      }
      setHomeData(data.data);
      getUser();
    });
  }

  function getUser() {
    ts.getUserInfo().then((data) => {
      if (data.error) {
        Alert.alert(data.errorMessage);
        return;
      }
      setUserData(data.data);
      setLoading(false);
    });
  }

  useEffect(() => {
    login();
  }, []);

  console.log(isLoggedIn);

  return (
    <ScrollView>
      {isLoggedIn == false ? (
        <View>
            <PapillonLoading
              icon={<UserX size={26} color={UIColors.text} />}
              title="Pas de compte Turboself lié"
              subtitle="Veuillez lier un compte Turboself pour accéder à la cantine."
              style={{ marginTop: 36 }}
            />
        
        

        <View style={[styles.tabs.tabsContainer]}>
        <View style={[styles.tabs.tabRow]}>
        {appctx.dataprovider.service === 'Pronote' ? (
          <ContextMenuView style={{ flex: 1 }} borderRadius={12}>
            <PressableScale
              style={
                [styles.tabs.tab, {backgroundColor: UIColors.element}]
              }
              weight="light"
              activeScale={0.9}
              onPress={() => navigation.navigate('InsetMenuCantine')}
            >
              <Album size={24} color={theme.dark ? '#ffffff' : '#000000'} />
              <NativeText style={[styles.tabs.tabText]}>Menu</NativeText>
            </PressableScale>
          </ContextMenuView>
        ) : null}
        </View>
        </View>
        </View>
      
    ) : (
      <View>
        {loading ? (
          <View>
          <ActivityIndicator style={{ marginTop: 16 }} />
          <PapillonLoading
            icon={<UserX size={26} color={UIColors.text} />}
            title="Pas de compte Turboself lié"
            subtitle="Veuillez lier un compte Turboself pour accéder à la cantine."
            style={{ marginTop: 36 }}
          />
          </View>
        ) : (
          <View>
            <View
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 50,
            marginBottom: 50,
          }}
        >
          <NativeText heading="p" style={{ opacity: 0.6 }}>
            Solde actuel
          </NativeText>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <NativeText heading="h1" style={{ fontSize: 40 }}>
                {Number(homeData.userInfo.balance).toFixed(2)}€
              </NativeText>
              <NativeText heading="p" style={{ opacity: 0.6 }}>
                Solde estimée{' : '}
                {Number(homeData.userInfo.estimatedBalance).toFixed(2)}€
              </NativeText>
            </View>
          )}
            </View>
            <View style={[styles.tabs.tabsContainer]}>
          <View style={[styles.tabs.tabRow]}>
            {/* Show only if user is allowed to book */}

            {userData.authorization.book ? (
              <ContextMenuView style={{ flex: 1 }} borderRadius={12}>
                <PressableScale
                  style={
                    [styles.tabs.tab, {backgroundColor: UIColors.element}]
                  }
                  weight="light"
                  activeScale={0.9}
                  disabled={loading}
                  onPress={() => navigation.navigate('InsetReservationCantine')}
                >
                  <CopyCheck
                    size={24}
                    color={theme.dark ? '#ffffff' : '#000000'}
                  />
                  <NativeText style={[styles.tabs.tabText]}>Mes résa.</NativeText>
                </PressableScale>
              </ContextMenuView>
            ) : null}

            {/* Show only if user has a card */}
            {userData.cardData != null ? (
              <ContextMenuView style={{ flex: 1 }} borderRadius={12}>
                <PressableScale
                  style={
                      [styles.tabs.tab, {backgroundColor: UIColors.element}]
                  }
                  weight="light"
                  activeScale={0.9}
                  onPress={() => navigation.navigate('InsetCardCantine')}
                >
                  <CreditCard
                    size={24}
                    color={theme.dark ? '#ffffff' : '#000000'}
                  />
                  <NativeText style={[styles.tabs.tabText]}>Ma carte</NativeText>
                </PressableScale>
              </ContextMenuView>
            ) : null}

            {/* Show "menu" only if user use Pronote */}
            {appctx.dataprovider.service === 'Pronote' ? (
              <ContextMenuView style={{ flex: 1 }} borderRadius={12}>
                <PressableScale
                  style={
                      [styles.tabs.tab, {backgroundColor: UIColors.element}]
                  }
                  weight="light"
                  activeScale={0.9}
                  onPress={() => navigation.navigate('InsetMenuCantine')}
                >
                  <Album size={24} color={theme.dark ? '#ffffff' : '#000000'} />
                  <NativeText style={[styles.tabs.tabText]}>Menu</NativeText>
                </PressableScale>
              </ContextMenuView>
            ) : null}
          </View>
            </View>
            {loading 
	  	? (<ActivityIndicator style={{ marginTop: 16 }} />) 
		  : homeData.history.length > 0 
			? (<NativeList inset header="Historiques">
				{homeData.history.map((history, index) => (
					<NativeItem trailing={textPriceHistory(history.cost)}>
					<NativeText heading="h4">{history.name}</NativeText>
					<NativeText heading="p" style={{ opacity: 0.6, fontSize: 15 }}>
						Le {formatDateToDDMMYYY(history.date)} à{' '}
						{extractHourFromDateJson(history.date)}
					</NativeText>
					</NativeItem>
				))}
        	   </NativeList>) 
			: (
        <PapillonLoading
          icon={<BookX size={26} color={UIColors.text} />}
          title="Pas d'historique disponible"
          subtitle="Vous n'avez pas encore effectué de paiement ou de rechargement. Si vous venez de recharger ou de payer, veuillez patienter quelques minutes."
          style={{ marginTop: 36 }}
        />
      )}
          </View>
        )
        }
      </View>
    )}
      
      
      
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabs: {
    tabsContainer: {
      marginHorizontal: 16,
      gap: 6,
    },
    tabRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 6,
    },

    tab: {
      borderRadius: 12,
      borderCurve: 'continuous',

      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 10,
      gap: 4,

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 0.5,
      },
      shadowOpacity: 0.15,
      shadowRadius: 1,
      elevation: 0,
    },

    tabText: {
      fontSize: 14.5,
      fontFamily: 'Papillon-Semibold',
    },
  },
});

export default CantineScreen;
