import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
  Image,
  StatusBar,
  Platform,
  Button,
  RefreshControl,
  TouchableOpacity,
    TouchableHighlight,
} from 'react-native';
import { PressableScale } from 'react-native-pressable-scale';
import { ContextMenuView } from 'react-native-ios-context-menu';
import { CopyCheck, CreditCard, Import } from 'lucide-react-native';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import GetUIColors from '../../utils/GetUIColors';
import { useTheme, Text } from 'react-native-paper';

import AppleWalletLogo from '../../assets/fr_add_to_apple_wallet.svg';
import GoogleWalletLogo from '../../assets/fr_add_to_google_wallet.svg';

import QRCode from 'react-native-qrcode-svg';



function CardCantineScreen({ navigation }) {
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
			<View>
				
            <NativeList inset>
            <NativeItem>
                <QRCode
                    value="81013189"
                    size={200}
                    color= {theme.dark ? UIColors.text : UIColors.text}
                    backgroundColor= {theme.dark ? UIColors.element : UIColors.element}
                />
            </NativeItem>
            </NativeList>

			</View>

            <View style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					marginTop: 25,
				}}>
                {Platform.OS === 'ios' ?

                    <TouchableHighlight onPress={()=>{}}>
                        <View>
                            <AppleWalletLogo width="200" height="60"/>
                        </View>
                    </TouchableHighlight>
                :
                    <TouchableHighlight onPress={()=>{}}>
                        <View>
                            <GoogleWalletLogo width="200" height="60"/>
                        </View>
                    </TouchableHighlight>
                }
                
			</View>

		</ScrollView>
	)
}

export default CardCantineScreen;