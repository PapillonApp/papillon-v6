import * as React from 'react';
import { View, Image, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import {Plus} from 'lucide-react-native';

function AddLinkedAccountScreen({navigation}) {
	const styles = StyleSheet.create({
		logo: {
			height: 40,
			width: 40,
			borderRadius: 100,
		}
	})
	return(
		<ScrollView>
			<NativeList header='Restauration scolaire' inset>
				<NativeItem
					leading={
						<Image source={require('../../assets/logo_turboself.png')} style={styles.logo} />
					}
					onPress={() => navigation.navigate('LoginTurboself')}
					chevron
				>
					<NativeText heading="h4">Turboself</NativeText>
					<NativeText heading="p" style={{opacity: 0.6, fontSize: 15}}>Gérer vos réservation et votre solde dans Papillon</NativeText>
				</NativeItem>
			</NativeList>
		</ScrollView>
	)
}

export default AddLinkedAccountScreen;