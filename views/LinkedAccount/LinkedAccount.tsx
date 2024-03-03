import React from 'react';
import {ScrollView, TouchableOpacity} from 'react-native';
import {Plus, Users2Icon} from 'lucide-react-native';
import AlertAnimated from '../../interface/AlertAnimated';
import GetUIColors from '../../utils/GetUIColors';
import NativeList from '../../components/NativeList';
import NativeText from '../../components/NativeText';
import NativeItem from '../../components/NativeItem';

function LinkedAccount({navigation}) {
  const UIColors = GetUIColors();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => {navigation.navigate('AddLinkedAccount');}}>
          <Plus></Plus>
        </TouchableOpacity>
      ),
    });
  });

  return (
    <ScrollView>
      <AlertAnimated
        visible={true}
        left={
          <Users2Icon color={UIColors.primary} />
        }
        title="A propos des comptes liés"
        subtitle="Papillon n’est affilié à aucun service tiers. Des bugs peuvent survenir lors de l’utilisation de ceci sur Papillon."
        height={106}
        marginVertical={16}
        style={{
          marginHorizontal: 16,
          backgroundColor: UIColors.primary + '22',
        }}
      />
      <NativeList inset header="Comptes liés">
        <NativeItem><NativeText heading="h2">Soon...</NativeText></NativeItem>
      </NativeList>
    </ScrollView>
  );
}

export default LinkedAccount;
