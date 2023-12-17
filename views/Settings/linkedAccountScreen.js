import * as React from 'react';
import {useEffect} from 'react';
import {ActivityIndicator, ScrollView} from 'react-native';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import {Plus} from 'lucide-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

function LinkedAccountScreen({navigation}) {
	const [accounts, setAccounts] = React.useState([]);
	const [loading, setLoading] = React.useState(true);

	function getAccounts() {
		setLoading(true)
		AsyncStorage.getItem('linkedAccount').then((result) => {
			let res = JSON.parse(result || []);
			setAccounts(res);
			setLoading(false);
		});
	}

	useEffect(() => {
		getAccounts();
	})

	return (
		<ScrollView>

			<NativeList inset>
				{loading ?
					(accounts.map((account) => (
						<NativeItem>
							<NativeText heading="p">{account.username}</NativeText>
						</NativeItem>
					)))
					:
					(
						<ActivityIndicator/>
					)
				}
				<NativeItem
					leading={
						<Plus size={20} color="#2A937A"/>
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