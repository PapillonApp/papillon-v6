import React, { useEffect, useState } from 'react';
import {
	Alert,
	StyleSheet,
	View,
	ScrollView,
	Switch,
	Image,
	StatusBar,
	Platform,
	Button,
	RefreshControl,
	TouchableOpacity,
	TouchableHighlight,
} from 'react-native';

import Turboself from 'papillon-turboself-core';

import AsyncStorage from '@react-native-async-storage/async-storage';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import GetUIColors from '../../utils/GetUIColors';
import { useTheme, Text } from 'react-native-paper';

import AppleWalletLogo from '../../assets/fr_add_to_apple_wallet.svg';
import GoogleWalletLogo from '../../assets/fr_add_to_google_wallet.svg';

import QRCode from 'react-native-qrcode-svg';
import { center } from '@shopify/react-native-skia';
import PapillonLoading from '../../components/PapillonLoading';



function CardCantineScreen({ navigation }) {
	const UIColors = GetUIColors();
	const theme = useTheme();
	const ts = new Turboself();
	const [loading, setLoading] = useState(true);
	const [userData, setUserData] = React.useState({
		authorization: { pay: true, book: true, cafeteria: false },
		cardData: '',
	});



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
						getUserInfo();
					}
				);
			}
		});
	}

	function getUserInfo() {
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
		console.log(userData)
	}, []);


	return (

		<ScrollView
			style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
			contentInsetAdjustmentBehavior="automatic"
		>
			{loading ? (
				<PapillonLoading
					title="Chargement en cours"
					subtitle="Merci de patienter quelques instants"
					style={{ marginTop: 36 }}
				/>
			) : (
				<View>
					<View style={[styles.qrcode]}><QRCode
						value={userData.cardData.toString()}
						size={200}
						color={UIColors.text}
						backgroundColor={UIColors.modalBackground}
					/>
						<NativeText>{userData.cardData}</NativeText></View>
					{/* <View style={{display: "flex", alignItems: "center", justifyContent: "center", marginTop: 25,}}>
						{Platform.OS === 'ios' ?

						<TouchableHighlight onPress={() => { }}>
							<View>
								<AppleWalletLogo width="200" height="60" />
							</View>
						</TouchableHighlight>
						:
						<TouchableHighlight onPress={() => { }}>
							<View>
								<GoogleWalletLogo width="200" height="60" />
							</View>
						</TouchableHighlight>
					}
					</View> */}
				</View>

			)}



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
	},

	qrcode: {
		display: 'flex',
		justifyContent: 'center',
		alignContent: 'center',
		textAlign: 'center',
		alignItems: 'center',
		marginHorizontal: 'auto'
	}
})

export default CardCantineScreen;