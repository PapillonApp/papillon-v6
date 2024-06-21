import * as React from 'react';
import { Alert, Platform, ScrollView, StatusBar, View } from 'react-native'

import { useTheme } from 'react-native-paper';
import GetUIColors from '../../utils/GetUIColors';
import { useAppContext } from '../../utils/AppContext';
import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import PapillonIcon from '../../components/PapillonIcon';

import { Cloudy, Files } from 'lucide-react-native';

interface ModuleType {
  enable: boolean;
  code: string;
  name?: string;
  description?: string;
  screen?: string;
  icon?: React.ReactNode;
  color?: string;
}


function ModuleRenderer({ navigation, module }) {
  if (module.enable) {
    switch(module.code) {
      case 'EDT':
        return null;
      case 'CLOUD':
        module.name = 'Cloud';
        module.description = 'Vos fichiers';
        module.screen = 'ED_Extended_InsetCloud';
        module.icon = <Cloudy size={24} color='#fff' />;
        module.color = '#3b67d9';
      break;
      break;

      /*case 'MESSAGERIE':
        module.name = 'Messagerie';
        module.description = 'Vos messages';
        module.icon = <MessageSquare size={24} color='#fff' />
        module.color = '#32d98e';
      break;*/

        break;

      /*case 'MESSAGERIE':
        module.name = 'Messagerie';
        module.description = 'Vos messages';
        module.icon = <MessageSquare size={24} color='#fff' />
        module.color = '#32d98e';
      break;*/

      case 'DOCUMENTS_ELEVE':
        module.name = 'Documents';
        module.description = 'Vos documents';
        module.screen = 'ED_Extended_InsetDocuments';
        module.icon = <Files size={24} color='#fff' />;
        module.color = '#81a827';
      break;
      break;

        break;

      default:
        console.log('[ed_extendedMenu]: ignoreModule', module.code);
        return null;
    }

    return (
      <NativeItem
        leading={
          <PapillonIcon
            icon={module.icon}
            color={module.color}
            fill
            small
          />
        }
        chevron
        onPress={() => navigation.navigate(module.screen || '')}
      >
        <NativeText heading="h4">
          {module.name}
        </NativeText>
        <NativeText heading="p2">
          {module.description}
        </NativeText>
      </NativeItem>
    );
  } else {
    return null;
  }
}




function EDExtendedMenu({ navigation }) {
  const theme = useTheme();
  const appContext = useAppContext();
  const UIColors = GetUIColors();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'EcoleDirecte - Menu étendu',
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === 'ios' ? (
        <StatusBar animated barStyle="light-content" />
      ) : (
        <StatusBar
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
      )}
      <ScrollView style={{ backgroundColor: UIColors.modalBackground }} contentInsetAdjustmentBehavior="automatic" >
        <NativeList inset>
          {
            Array.from(appContext.dataProvider?.ecoledirecteInstance?.modules ?? []).map((module: ModuleType, index: number) => (
              <ModuleRenderer navigation={navigation} module={module} key={index} />
            ))
          }
        </NativeList>
      </ScrollView>
    </View>
  );
}

export default EDExtendedMenu;
