import React, { useEffect } from 'react';
import {
  Animated,
  ActivityIndicator,
  Alert,
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  Pressable,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Dimensions,
  Switch,
} from 'react-native';
import Turboself from 'papillon-turboself-core';
import { useTheme, Text } from 'react-native-paper';

import { ContextMenuButton, ContextMenuView } from 'react-native-ios-context-menu';

import { useState } from 'react';

import { useActionSheet } from '@expo/react-native-action-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import GetUIColors from '../../utils/GetUIColors';
import { useAppContext } from '../../utils/AppContext';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';


function ReservationCantineScreen({ navigation }) {
	const theme = useTheme();
	const appctx = useAppContext();
	const UIColors = GetUIColors();
	const ts = new Turboself();
	const { showActionSheetWithOptions } = useActionSheet();
	const insets = useSafeAreaInsets();
	//const [periodsList, setPeriodsList] = useState([]);
	const [selectedPeriod, setSelectedPeriod] = useState(null);

	const [isLoggedIn, setIsLoggedIn] = React.useState(false);
	const [loading, setLoading] = React.useState(true);
	const [resaLoading, setResaLoading] = React.useState(true);
	const [bookingData, setBookingData] = React.useState({});
	const [homeData, setHomeData] = React.useState({});
	const [userData, setUserData] = React.useState({
	  authorization: { pay: true, book: true, cafeteria: false },
	  cardData: '',
	});
	const [etabData, setEtabData] = React.useState({});
  
	const yOffset = new Animated.Value(0);
  
	function genererPeriodsList (numSemaineAutorise) {
		let periodsList = [];
		let firstDay = new Date();
		for (let i = 0; i < numSemaineAutorise; i++) {
			periodsList.push({
				name: 'Semaine ' + (numeroSemaine(new Date(firstDay.getTime() + i*(7 * 24 * 60 * 60 * 1000)))),
				date: formatDateToDDMMYYY(new Date(firstDay.getTime() + i*(7 * 24 * 60 * 60 * 1000))),
			},);
		}
		return periodsList;
	}

	const headerOpacity = yOffset.interpolate({
	  inputRange: [-75, -60],
	  outputRange: [0, 1],
	  extrapolate: 'clamp',
	});

	function numeroSemaine (date) {
		var debut = new Date(date.getFullYear(), 0, 1);
		var fin = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		var nbJours = (fin - debut) / (1000 * 60 * 60 * 24);
		return Math.ceil((nbJours + debut.getDay() + 1) / 7);
	}

	function formatDateToDDMMYYY(dateString) {
		const dateObject = new Date(dateString);
		const day = `0${dateObject.getDate()}`.slice(-2);
		const month = `0${dateObject.getMonth() + 1}`.slice(-2);
		const year = dateObject.getFullYear();
		return `${day}-${month}-${year}`;
	}

	  async function login() {
		const result = await AsyncStorage.getItem('linkedAccount')
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
		;
	  }
	
	  async function getHome() {
		ts.getHome().then((data) => {
		  if (data.error) {
			Alert.alert(data.errorMessage);
			return;
		  }
		  setHomeData(data.data);
		  getUser();
		});
	  }
	
	  async function getUser() {
		ts.getUserInfo().then((data) => {
		  if (data.error) {
			Alert.alert(data.errorMessage);
			return;
		  }
		  setUserData(data.data);
		  getEtabInfo();
		  getResaInfo();
		});
		
	  }

	  async function getEtabInfo() {
		ts.getEtabInfo().then((data) => {
		  if (data.error) {
			Alert.alert(data.errorMessage);
			return;
		  }
		  setEtabData(data.data);
		  setLoading(false);
		  
		});
	  }

	  async function getResaInfo (date) {
		const data = await ts.getBooking(new Date())
		  if (data.error) {
			Alert.alert(data.errorMessage);
			return;
		  }
		  setBookingData(data.data);
		  setResaLoading(false);
		  console.log(data.data);
		;
	  }

	
	  useEffect(() => {
		login();
		setSelectedPeriod(periodsList[0]);
	  }, []);

	  const periodsList = genererPeriodsList(2);
	// add plus button to header
	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<View style={styles.rightActions}>
				<ContextMenuButton
					isMenuPrimaryAction={true}
					menuConfig={{
					menuTitle: 'Périodes',
						menuItems: periodsList.map((period) => {
						return {
							actionKey: period.name,
							actionTitle: period.name,
							menuState : selectedPeriod?.name === period.name ? 'on' : 'off',
						}
						}),
					}}
					onPressMenuItem={({nativeEvent}) => {
					setSelectedPeriod(periodsList.find((period) => period.name));
					console.log(periodsList.find((period) => period.name === nativeEvent.actionKey).date);
					console.log(isLoggedIn);
					getResaInfo(periodsList.find((period) => period.name === nativeEvent.actionKey).date);
					//changePeriodPronote(periodsList.find((period) => period.name === nativeEvent.actionKey));
					}}
				>
					<TouchableOpacity
					onPress={() => {
						if (Platform.OS !== 'ios') {
						newPeriod();
						}
					}}
					style={styles.periodButtonContainer}>
					<Text style={[styles.periodButtonText, { color: UIColors.primary }]}>
						{selectedPeriod?.name || 'semaine ?' }
					</Text>
					</TouchableOpacity>
				</ContextMenuButton>
				</View>
			),
		});
	}, [navigation, selectedPeriod, UIColors, isLoggedIn]);

	function newPeriod() {
	const options = periodsList.map((period) => period.name);
	options.push('Annuler');

	showActionSheetWithOptions(
		{
		title: 'Changer de période',
		message: 'Sélectionnez la période de votre choix',
		options,
		tintColor: UIColors.primary,
		cancelButtonIndex: options.length - 1,
		containerStyle: {
			paddingBottom: insets.bottom,
			backgroundColor: UIColors.elementHigh,
		},
		textStyle: {
			color: UIColors.text,
		},
		titleTextStyle: {
			color: UIColors.text,
			fontWeight: 'bold',
		},
		messageTextStyle: {
			color: UIColors.text,
		},
		},
		(selectedIndex) => {
		if (selectedIndex === options.length - 1) return;
		const selectedPer = periodsList[selectedIndex];
		setSelectedPeriod(selectedPer);
		//changePeriodPronote(selectedPer);
		}
	);
	}
	  
	return (
		<ScrollView
        style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
        contentInsetAdjustmentBehavior="automatic"
        >
			
        {loading ? (
			<View style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					marginTop: 50,
					marginBottom: 50,
			}}>
				<ActivityIndicator />
			</View>
        ) : (
			<View style={{ display: 'flex', alignItems: 'center' }}>
				{homeData.userInfo.estimatedBalance != homeData.userInfo.balance 
				? (
				<View style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					marginTop: 50,
					marginBottom: 50,
				}}>
					<NativeText heading="p" style={{opacity: 0.6}}>Solde prévsionnel au {homeData.userInfo.estimatedFor}</NativeText>
					<NativeText heading="h1" style={{fontSize: 40}}>{Number(homeData.userInfo.estimatedBalance).toFixed(2)}€</NativeText>
					<NativeText heading="p" style={{opacity: 0.6}}>Soit {parseInt(homeData.userInfo.estimatedBalance/etabData.prixDej)} repas</NativeText>
				</View>) 
				: (
				<View style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					marginTop: 50,
					marginBottom: 50,
				}}>
					<NativeText heading="p" style={{opacity: 0.6}}>Solde actuel</NativeText>
					<NativeText heading="h1" style={{fontSize: 40}}>{Number(homeData.userInfo.balance).toFixed(2)}€</NativeText>
					<NativeText heading="p" style={{opacity: 0.6}}>Soit {parseInt(homeData.userInfo.balance/etabData.prixDej)} repas</NativeText>
				</View>
				)}
			</View>
        )}


			{resaLoading ? (
				<ActivityIndicator />	
			) : (
				<NativeList inset header="Réservation du repas méridien">
				{
					bookingData.days.map((day, index) => (
						<NativeItem trailing={<Switch style={{opacity: 0.6, fontSize: 15}} value={day.booked} disabled={!day.canEdit}/>}>
							<NativeText heading="h4">{day.label}</NativeText>
						</NativeItem>
					))
				}
			</NativeList>
			)}
			
			{/* Prevoir reservation du soir quand on aura les données */}
		</ScrollView>
	)
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
	}
	})

export default ReservationCantineScreen;