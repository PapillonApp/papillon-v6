import React from 'react';
import {Image, ScrollView, View} from 'react-native';
import Services from './Services';
import NativeList from '../../components/NativeList';
import NativeText from '../../components/NativeText';
import NativeItem from '../../components/NativeItem';
import getUIColors from '../../utils/GetUIColors';
import {Check} from 'lucide-react-native';

function officialBadge() {
  const UIColors = getUIColors();
  return (
    <View style={
      {
        backgroundColor: UIColors.primary,
        width: 18,
        height: 18,
        borderRadius: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 5
      }
    }>
      <Check color='#FFFFFF' size={14}></Check>
    </View>
  );
}

function AddLinkedAccount({navigation}) {
  return (
    <ScrollView>
      {Services.map((category) => (
        <NativeList inset header={category.name}>
          {category.services.map((service)=>(
            <NativeItem chevron onPress={() => {navigation.navigate('LinkedAccountAuth' + service.authType, service);}}>
              <View style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                <Image source={service.logo} style={{height: 50, width: 50}}/>
                <View>
                  <View style={{display: 'flex', flexDirection: 'row'}}>
                    <NativeText heading={'h4'}>{service.name}</NativeText>
                    {service.official && officialBadge()}
                  </View>
                  <NativeText heading='p2'>{service.description}</NativeText>
                </View>
              </View>
            </NativeItem>
          ))}
        </NativeList>
      ))}
    </ScrollView>
  );
}

export default AddLinkedAccount;
