import * as React from 'react';
import {useEffect} from 'react';
import {ActivityIndicator, ScrollView} from 'react-native';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import {Plus} from 'lucide-react-native';
import Services from './services.json';
import AsyncStorage from "@react-native-async-storage/async-storage";

function LinkedAccountScreen({navigation}) {
	const [accounts, setAccounts] = React.useState([]);
	const [loading, setLoading] = React.useState(true);

	function getAccounts() {
		setLoading(true)
		AsyncStorage.getItem('linkedAccount').then((result) => {
			let res = JSON.parse(result || {restaurant: {}});
			console.log(res)
			setAccounts(res);
			setLoading(false);
		});
	}

	function getServicesName(id) {
		var res = 'Services inconu';
		Services.restaurant.forEach((service) => {
			if (service.id === id) {
				res = service.name;
			}
		});
		return res;
	}

	useEffect(() => {
		getAccounts();
	})

	return (
		<ScrollView>

			{accounts.restaurant?.id !== null ?
				(
					<NativeList inset header='Service de restauration'>
						<NativeItem>
							<NativeText heading="h4">{getServicesName(accounts.restaurant?.id)}</NativeText>
							<NativeText heading="p2">{accounts.restaurant?.username}</NativeText>
						</NativeItem>
					</NativeList>
				) :
				null
			}

			<NativeList inset>
				{loading ?
					null
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