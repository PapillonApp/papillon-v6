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

	  React.useLayoutEffect(() => {
		navigation.setOptions({
		  headerTitle: Platform.OS === 'ios' ? () => (
			<PapillonInsetHeader
			  icon={<SFSymbol name="fork.knife.circle.fill" />}
			  title="Restauration scolaire"
			  color="#B42828"
			  inset
			/>
		  ) : 'Vie scolaire',
		  headerBackTitleVisible: false,
		  headerTintColor: UIColors.text,
		});
	  });
	  
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
						<PressableScale style={[styles.tabs.tab, { backgroundColor: UIColors.element }]} weight="light" activeScale={0.9} onPress={() => navigation.navigate('InsetReservationCantineScreen')}>
							<CopyCheck size={24} color={theme.dark ? '#ffffff' : '#000000'} />
							<Text style={[styles.tabs.tabText]}>Mes réservations</Text>
						</PressableScale>
					</ContextMenuView>
					<ContextMenuView style={{flex: 1}} borderRadius={12}>
						<PressableScale style={[styles.tabs.tab, { backgroundColor: UIColors.element }]} weight="light" activeScale={0.9} onPress={() => navigation.navigate('InsetCardCantineScreen')}>
							<CreditCard size={24} color={theme.dark ? '#ffffff' : '#000000'} />
							<Text style={[styles.tabs.tabText]}>Afficher ma carte</Text>
						</PressableScale>
					</ContextMenuView>
				</View>
			</View>
			<NativeList inset header="Historiques">
				<NativeItem trailing={<NativeText heading="h4" style={{color: "#B42828"}}>-3,70€</NativeText>}>
					<NativeText heading="h4">Self</NativeText>
					<NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>Le 18/12/2023 à 12:07</NativeText>
				</NativeItem>
				<NativeItem trailing={<NativeText heading="h4" style={{color: "#B42828"}}>-3,70€</NativeText>}>
					<NativeText heading="h4">Self</NativeText>
					<NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>Le 07/12/2023 à 00:00</NativeText>
				</NativeItem>
				<NativeItem trailing={<NativeText heading="h4" style={{color: "#2A937A"}}>+33,30€</NativeText>}>
					<NativeText heading="h4">Prélèvement Dk TG (Elèves)</NativeText>
					<NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>Le 06/12/2023 à 12:52</NativeText>
				</NativeItem>
				<NativeItem trailing={<NativeText heading="h4" style={{color: "#B42828"}}>-3,70€</NativeText>}>
					<NativeText heading="h4">Self</NativeText>
					<NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>Le 05/12/2023 à 11:59</NativeText>
				</NativeItem>
				<NativeItem trailing={<NativeText heading="h4" style={{color: "#B42828"}}>-3,70€</NativeText>}>
					<NativeText heading="h4">Self</NativeText>
					<NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>Le 04/12/2023 à 12:07</NativeText>
				</NativeItem>
				<NativeItem trailing={<NativeText heading="h4" style={{color: "#B42828"}}>-3,70€</NativeText>}>
					<NativeText heading="h4">Self</NativeText>
					<NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>Le 01/12/2023 à 11:23</NativeText>
				</NativeItem>
				<NativeItem trailing={<NativeText heading="h4" style={{color: "#B42828"}}>-3,70€</NativeText>}>
					<NativeText heading="h4">Self</NativeText>
					<NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>Le 30/11/2023 à 12:56</NativeText>
				</NativeItem>
				<NativeItem trailing={<NativeText heading="h4" style={{color: "#B42828"}}>-3,70€</NativeText>}>
					<NativeText heading="h4">Self</NativeText>
					<NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>Le 28/11/2023 à 11:59</NativeText>
				</NativeItem>
			</NativeList>
		</ScrollView>
	)
}

export default CantineScreen;