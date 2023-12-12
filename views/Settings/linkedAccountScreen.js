import * as React from 'react';
import { View, Image, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import {Plus} from 'lucide-react-native';

function LinkedAccountScreen({navigation}) {
	return(
		<ScrollView>
			<NativeList inset>
				<NativeItem
					leading={
						<Plus size={20} color="#2A937A" />
					}
					onPress={() => navigation.navigate('AddLinkedAccount')}
				>
					<NativeText heading="p" style={{color: '#2A937A'}}>Ajouter un compte</NativeText>
				</NativeItem>
			</NativeList>
		</ScrollView>
	)
}

export default LinkedAccountScreen;