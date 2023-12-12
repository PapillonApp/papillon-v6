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
	  
	return (
		<ScrollView
        style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
        contentInsetAdjustmentBehavior="automatic"
        >
			<View style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					marginTop: 50,
					marginBottom: 50,
				}}>
				<NativeText heading="p" style={{opacity: 0.6}}>Solde prévisionnel</NativeText>
				<NativeText heading="h1" style={{fontSize: 40}}>-48.10€</NativeText>
                <NativeText heading="p" style={{opacity: 0.6}}>Soit 0 repas</NativeText>
			</View>
			<NativeList inset header="Réservation de jour">
				<NativeItem trailing={<Switch style={{opacity: 0.6, fontSize: 15}} />}>
					<NativeText heading="h4">Lundi 11 Décembre</NativeText>
				</NativeItem>
				<NativeItem trailing={<Switch style={{opacity: 0.6, fontSize: 15}} />}>
					<NativeText heading="h4">Mardi 12 Décembre</NativeText>
				</NativeItem>
				<NativeItem trailing={<Switch style={{opacity: 0.6, fontSize: 15}} />}>
					<NativeText heading="h4">Mercredi 13 Décemebre</NativeText>
				</NativeItem>
				<NativeItem trailing={<Switch style={{opacity: 0.6, fontSize: 15}} />}>
					<NativeText heading="h4">Jeudi 14 Décemebre</NativeText>
				</NativeItem>
				<NativeItem trailing={<Switch style={{opacity: 0.6, fontSize: 15}} />}>
					<NativeText heading="h4">Vendredi 15 Décemebre</NativeText>
				</NativeItem>
			</NativeList>
            <NativeList inset header="Réservation de Soir">
				<NativeItem trailing={<Switch style={{opacity: 0.6, fontSize: 15}} />}>
					<NativeText heading="h4">Lundi 11 Décembre</NativeText>
				</NativeItem>
				<NativeItem trailing={<Switch style={{opacity: 0.6, fontSize: 15}} />}>
					<NativeText heading="h4">Mardi 12 Décembre</NativeText>
				</NativeItem>
				<NativeItem trailing={<Switch style={{opacity: 0.6, fontSize: 15}} />}>
					<NativeText heading="h4">Mercredi 13 Décemebre</NativeText>
				</NativeItem>
				<NativeItem trailing={<Switch style={{opacity: 0.6, fontSize: 15}} />}>
					<NativeText heading="h4">Jeudi 14 Décemebre</NativeText>
				</NativeItem>
				<NativeItem trailing={<Switch style={{opacity: 0.6, fontSize: 15}} />}>
					<NativeText heading="h4">Vendredi 15 Décemebre</NativeText>
				</NativeItem>
			</NativeList>
		</ScrollView>
	)
}

export default ReservationCantineScreen;