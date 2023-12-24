import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
  StatusBar,
  Platform,
  Button,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { PressableScale } from 'react-native-pressable-scale';
import { ContextMenuView } from 'react-native-ios-context-menu';
import { CopyCheck, CreditCard } from 'lucide-react-native';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import GetUIColors from '../../utils/GetUIColors';
import { useTheme, Text } from 'react-native-paper';


function ReservationCantineScreen({ navigation }) {
	const UIColors = GetUIColors();
	const theme = useTheme();

	// Debug data
	const solde = {
		error: false,
		errorMessage: '',
		data: {
			id: 'XXXXXXXXXX',
			balance: 1.02,
			estimatedBalance: -45.13,
			estimatedFor: '20XX-XX-XX'
		}
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
	const booking = {
		error: false,
		errorMessage: '',
		data: {
		  	weekId: 'XXXXXXXXXXX',
		  	days: [
			{
				id: 'XXXXXXXXXXX',
				dayNumber: 1, //(1: Lundi, 5: Vendredi)
				booked: true,
				lastSyncBooked: 1,
				canEdit: false,
				label: 'Lundi 11 Déc.',
				date: '11-12-2023'
			},
			{
				id: 'XXXXXXXXXXX',
				dayNumber: 2, //(1: Lundi, 5: Vendredi)
				booked: false,
				lastSyncBooked: 1,
				canEdit: false,
				label: 'Mardi 12 Déc.',
				date: '12-12-2023'
			},
			{
				id: 'XXXXXXXXXXX',
				dayNumber: 3, //(1: Lundi, 5: Vendredi)
				booked: true,
				lastSyncBooked: 1,
				canEdit: true,
				label: 'Mercredi 13 Déc.',
				date: '13-12-2023'
			}
		  ]
		}
	  };
	  
	return (
		<ScrollView
        style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
        contentInsetAdjustmentBehavior="automatic"
        >
			
					{solde.data.estimatedBalance != solde.data.balance ? (
						<View style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							marginTop: 50,
							marginBottom: 50,
						}}>
							<NativeText heading="p" style={{opacity: 0.6}}>Solde prévsionnel au {solde.data.estimatedFor}</NativeText>
							<NativeText heading="h1" style={{fontSize: 40}}>{Number(solde.data.estimatedBalance).toFixed(2)}€</NativeText>
							{Number(solde.data.estimatedBalance/etablissement.data.prixDej).toFixed(0) < 1 ? (
								<NativeText heading="p" style={{opacity: 0.6}}>Soit 0 repas</NativeText>
							) : (
								<NativeText heading="p" style={{opacity: 0.6}}>Soit {Number(solde.data.estimatedBalance/etablissement.data.prixDej).toFixed(0)} repas</NativeText>
							)}
						</View>
					) : (
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
					)}
			
			<NativeList inset header="Réservation du repas méridien">
				{
					booking.data.days.map((day, index) => (
						<NativeItem trailing={<Switch style={{opacity: 0.6, fontSize: 15}} value={day.booked} disabled={!day.canEdit}/>}>
							<NativeText heading="h4">{day.label}</NativeText>
						</NativeItem>
					))
				}
			</NativeList>
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