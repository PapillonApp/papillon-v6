import * as React from 'react';
import { View, Image, StyleSheet, StatusBar, ScrollView, TextInput } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import {UserCircle,KeyRound} from 'lucide-react-native';

import NativeList from '../../../components/NativeList';
import NativeItem from '../../../components/NativeItem';
import NativeText from '../../../components/NativeText';
import PapillonButton from '../../../components/PapillonButton';
import GetUIColors from '../../../utils/GetUIColors';
let Turboself = require('papillon-turboself-core')

let ts = new Turboself;

function LoginTurboselfScreen() {
	const theme = useTheme();
	const UIColors = GetUIColors();
	const styles = StyleSheet.create({
	  nginput: {
		fontSize: 16,
		fontFamily: 'Papillon-Medium',
		paddingVertical: 4,
	  },
	});
	return (
		<ScrollView>
			<View style={{height: 200,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Image source={require('../../../assets/logo_turboself.png')} style={{height: 100, width: 100, borderRadius: 500, marginBottom: 20}} />
				<NativeText heading="h4" style={{opacity: 0.6}}>Connexion à</NativeText>
				<NativeText heading="h1">Turboself</NativeText>
			</View>
			<NativeList inset>
				<NativeItem
				  leading={
					<UserCircle
					  color={theme.dark ? '#fff' : '#000'}
					  style={{ opacity: 0.5 }}
					/>
				  }
				>
				  <TextInput
					placeholder="Identifiant"
					placeholderTextColor={theme.dark ? '#ffffff55' : '#00000055'}
					style={[styles.nginput, {color: UIColors.text}]}
					value=''
					onChangeText={(text) => console.warn(text)}
				  />
				</NativeItem>
				<NativeItem
				  leading={
					<KeyRound
					  color={theme.dark ? '#fff' : '#000'}
					  style={{ opacity: 0.5 }}
					/>
				  }
				>
				  <TextInput
					placeholder="Mot de passe"
					placeholderTextColor={theme.dark ? '#ffffff55' : '#00000055'}
					style={[styles.nginput, {color: UIColors.text}]}
					value=''
					secureTextEntry
					onChangeText={(text) => console.warn(text)}
				  />
				</NativeItem>
			  </NativeList>
			  <PapillonButton title="Connexion" color="#B42828" style={{marginHorizontal: 16}}/>
		</ScrollView>
		
	)	
}

export default LoginTurboselfScreen;