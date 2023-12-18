import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
  Button,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { PressableScale } from 'react-native-pressable-scale';
import { ContextMenuView } from 'react-native-ios-context-menu';
import { CopyCheck, CreditCard } from 'lucide-react-native';

import NativeList from '../components/NativeList';
import NativeItem from '../components/NativeItem';
import NativeText from '../components/NativeText';
import GetUIColors from '../utils/GetUIColors';
import { useTheme, Text } from 'react-native-paper';

import { SFSymbol } from 'react-native-sfsymbols';
import PapillonInsetHeader from '../components/PapillonInsetHeader';

function CantineScreen({ navigation }) {
	const UIColors = GetUIColors();
	const theme = useTheme();

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerBackTitle: 'Retour',
			headerTintColor: UIColors.text,
			headerShadowVisible: true,
		})
	})

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

	const history = {
		"latestPaiement": {
			"id": 6080671,
			"hote": {
				"id": 1006056
			},
			"date": "2023-03-04T17:25:29.020Z",
			"type": "CB",
			"montant": 1500,
			"dateMaj": "2023-03-04T18:05:17.618Z",
			"statut": "OK",
			"idTransaction": "14064162829167",
			"token": "1eUaYoBGmat172mTQ2711677947133371",
			"msg": "Paiement accepté"
		},
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
		],
		"comptesHote": [
			{
				"id": "2400989169",
				"compte": null,
				"appli": {
					"id": 1078,
					"idOrig": 1,
					"lib": "Self"
				},
				"hote": {
					"id": 1006056
				},
				"montant": 265,
				"montantEstime": 265,
				"montantEstimeMsg": "Montant estimé au 18/12/2023"
			}
		]
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
				<NativeText heading="h1" style={{fontSize: 40}}>-48.10€</NativeText>
				<NativeText heading="p" style={{opacity: 0.6}}>Soit 0 repas</NativeText>
			</View>
			<View style={[styles.tabs.tabsContainer]}>
				<View style={[styles.tabs.tabRow]}>
					<ContextMenuView style={{flex: 1}} borderRadius={12}>
						<PressableScale style={[styles.tabs.tab, { backgroundColor: UIColors.element }]} weight="light" activeScale={0.9} onPress={() => navigation.navigate('InsetReservationCantine')}>
							<CopyCheck size={24} color={theme.dark ? '#ffffff' : '#000000'} />
							<Text style={[styles.tabs.tabText]}>Mes réservations</Text>
						</PressableScale>
					</ContextMenuView>
					<ContextMenuView style={{flex: 1}} borderRadius={12}>
						<PressableScale style={[styles.tabs.tab, { backgroundColor: UIColors.element }]} weight="light" activeScale={0.9} onPress={() => navigation.navigate('InsetCardCantine')}>
							<CreditCard size={24} color={theme.dark ? '#ffffff' : '#000000'} />
							<Text style={[styles.tabs.tabText]}>Afficher ma carte</Text>
						</PressableScale>
					</ContextMenuView>
				</View>
			</View>
			<NativeList inset header="Historiques">
				{history.historiques.map((history, index) => (
					<NativeItem trailing={textPriceHistory(history.debit, history.credit)}>
						<NativeText heading="h4">{history.detail}</NativeText>
						<NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>Le {formatDateToDDMMYYY(history.date)} à {extractHourFromDateJson(history.date)}</NativeText>
					</NativeItem>
				))}
			</NativeList>
		</ScrollView>
	)
}

export default CantineScreen;