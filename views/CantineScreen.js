import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { PressableScale } from 'react-native-pressable-scale';
import { ContextMenuView } from 'react-native-ios-context-menu';
import { CopyCheck, CreditCard, Album, BookX } from 'lucide-react-native';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';
import GetUIColors from '../utils/GetUIColors';
import { useTheme } from 'react-native-paper';

import { useAppContext } from '../utils/AppContext';
import PapillonLoading from '../components/PapillonLoading';



function CantineScreen({ navigation }) {
	const UIColors = GetUIColors();
	const theme = useTheme();
	const appctx = useAppContext();


	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerBackTitle: 'Retour',
			headerTintColor: UIColors.text,
			headerShadowVisible: true,
		})
	})

	function formatDateToDDMMYYY(dateString) {
		const dateObject = new Date(dateString);
		const day = ('0' + dateObject.getDate()).slice(-2);
		const month = ('0' + (dateObject.getMonth() + 1)).slice(-2);
		const year = dateObject.getFullYear();
		return `${day}/${month}/${year}`;
	}

	function extractHourFromDateJson(dateJson) {
		const dateObject = new Date(dateJson);
	  
		// Obtenir les composants de l'heure
		const hours = ('0' + dateObject.getHours()).slice(-2);
		const minutes = ('0' + dateObject.getMinutes()).slice(-2);
		const seconds = ('0' + dateObject.getSeconds()).slice(-2);

		const formattedTime = `${hours}:${minutes}`;
	  
		return formattedTime;
	}

	function textPriceHistory(debit, credit) {
		if (credit != null) {
			return (<NativeText heading='h4' style={{color: '#2A937A'}}>+{Number(credit / 100).toFixed(2)}€</NativeText>);
		}
		else if (debit != null) {
			return (<NativeText heading='h4' style={{color: '#B42828'}}>-{Number(debit / 100).toFixed(2)}€</NativeText>);
		} else {
			return (<NativeText heading='h4'></NativeText>);
		}
	}

	// Debug data
	const history = {
		"historiques": [
			{
				"id": 109245036,
				"date": "2023-09-19T13:19:29.000Z",
				"detail": "Self",
				"debit": null,
				"credit": 1500
			},
			{
				"id": 108078680,
				"date": "2023-09-14T12:56:12.000Z",
				"detail": "Self",
				"debit": 3850,
				"credit": null
			},
			{
				"id": 107308348,
				"date": "2023-09-11T12:15:44.000Z",
				"detail": "Self",
				"debit": 385,
				"credit": null
			},
			{
				"id": 106573419,
				"date": "2023-09-07T13:12:10.000Z",
				"detail": "Self",
				"debit": 385,
				"credit": null
			}
		]
	};

	// Debug data
	const etablissement = {
		error: false,
		errorMessage: '',
		data: {
		  id: 1234,
		  TSid: 1,
		  code2p5: 1234,
		  name: 'Lycée/Collège XXX',
		  version: 'XXX',
		  disabled: false,
		  symbol: '€',
		  minCreditAdd: 15.5,
		  prixDej: 2.87,
		  address: {
			line1: '1 Rue Doe Jonh',
			line2: '',
			postalCode: '10000',
			city: 'Ville connu'
		  },
		  contact: {
			url: 'http://mon.lycee-ou-college.com/',
			email: 'mail@college-lycee.com',
			tel: '0606060606'
		  },
		  sync: {
			first: '20XX-XX-XXTXX:XX:XX.XXXZ',
			last: '20XX-XX-XXTXX:XX:XX.XXXZ'
		  }
		}
	};

	// Debug data
	const solde = {
		error: false,
		errorMessage: '',
		data: {
			id: 'XXXXXXXXXX',
			balance: 102,
			estimatedBalance: -45.13,
			estimatedFor: '20XX-XX-XX'
		}
	};

	// Debug data
	const user = {
		error: false,
		errorMessage: '',
		data: {
			id: 1234,
			origId: 1234,
			type: 0,
			lastName: 'Doe',
			firstName: 'Jonh',
			class: 'CE1',
			method: 'Argent',
			quality: 'TICKET',
			authorization: {
				pay: true,
				book: true,
				cafeteria: false
			},
			lastSync: '20XX-XX-XXTXX:XX:XX.XXXZ',
			disabled: false,
			isPasswordSecure: true,
			cardData: 1234567890,
		}
	};

	return (
		<ScrollView>
			<View style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					marginTop: 50,
					marginBottom: 50,
				}}>
				<NativeText heading="p" style={{opacity: 0.6}}>Solde actuel</NativeText>
				<NativeText heading="h1" style={{fontSize: 40}}>{Number(solde.data.balance).toFixed(2)}€</NativeText>
				<NativeText heading="p" style={{opacity: 0.6}}>Soit {Number(solde.data.balance/etablissement.data.prixDej).toFixed(0)} repas</NativeText>
			</View>
			<View style={[styles.tabs.tabsContainer]}>
				<View style={[styles.tabs.tabRow]}>
					{/* Show only if user is allowed to book */}
					{user.data.authorization.book === true ? (
						<ContextMenuView style={{flex: 1}} borderRadius={12}>
						<PressableScale style={[styles.tabs.tab, { backgroundColor: UIColors.element }]} weight="light" activeScale={0.9} onPress={() => navigation.navigate('InsetReservationCantine')}>
							<CopyCheck size={24} color={theme.dark ? '#ffffff' : '#000000'} />
							<NativeText style={[styles.tabs.tabText]}>Mes résa.</NativeText>
						</PressableScale>
					</ContextMenuView>
					) : null }
					
					{/* Show only if user has a card */}
					{user.data.cardData != null ? (
						<ContextMenuView style={{flex: 1}} borderRadius={12}>
							<PressableScale style={[styles.tabs.tab, { backgroundColor: UIColors.element }]} weight="light" activeScale={0.9} onPress={() => navigation.navigate('InsetCardCantine')}>
								<CreditCard size={24} color={theme.dark ? '#ffffff' : '#000000'} />
								<NativeText style={[styles.tabs.tabText]}>Ma carte</NativeText>
							</PressableScale>
						</ContextMenuView>
					) : null}
					
					{/* Show "menu" only if user use Pronote */}
					{appctx.dataprovider.service === 'Pronote' ? (
						<ContextMenuView style={{flex: 1}} borderRadius={12}>
							<PressableScale style={[styles.tabs.tab, { backgroundColor: UIColors.element }]} weight="light" activeScale={0.9} onPress={() => navigation.navigate('InsetMenuCantine')}>
								<Album size={24} color={theme.dark ? '#ffffff' : '#000000'} />
								<NativeText style={[styles.tabs.tabText]}>Menu</NativeText>
							</PressableScale>
						</ContextMenuView>
					): null}
					
				</View>

			</View>
			{history.historiques.length > 0 
				? (
				<NativeList inset header="Historiques">
					{history.historiques.map((history, index) => (
						<NativeItem trailing={textPriceHistory(history.debit, history.credit)}>
							<NativeText heading="h4">{history.detail}</NativeText>
							<NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>Le {formatDateToDDMMYYY(history.date)} à {extractHourFromDateJson(history.date)}</NativeText>
						</NativeItem>
					))}
				</NativeList>
				) : (
					<PapillonLoading
						icon={<BookX size={26} color={UIColors.text} />}
						title="Pas d'historique disponible"
						subtitle="Vous n'avez pas encore effectué de paiement ou de rechargement. Si vous venez de recharger ou de payer, veuillez patienter quelques minutes."
						style={{ marginTop: 36 }}
					/>
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
	}
});

export default CantineScreen;