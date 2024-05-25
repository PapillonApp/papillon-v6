
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';

import { useTheme } from 'react-native-paper';
import { Folder, File } from 'lucide-react-native';

import GetUIColors from '../../utils/GetUIColors';
import PapillonLoading from '../../components/PapillonLoading';
import { useAppContext } from '../../utils/AppContext';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import type { cloudResFolder } from '@papillonapp/ed-core/dist/src/types/v3';



function SchoolLifeScreen({ navigation }: {
  navigation: any // TODO
}) {
  const [files, setFiles] = useState<cloudResFolder[] | null>(null);
  const theme = useTheme();
  const UIColors = GetUIColors();
  const appContext = useAppContext();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const retrieveData = async (force = false) => {
    try {
      if (!appContext.dataProvider) return;
      const value = await appContext.dataProvider.getED_Cloud(force);
    
  
      setFiles(value);
      
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    retrieveData(false);
  }, [appContext.dataProvider]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Mon cloud',
      headerBackTitle: 'Retour',
      headerTintColor: UIColors.text,
      headerShadowVisible: true,
      headerLargeTitle: false,
    });
  });



  
  return (
    <ScrollView
      style={{ backgroundColor: UIColors.backgroundHigh }}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await retrieveData(true);
          }}
        />
      }
    >
      <StatusBar
        animated
        translucent
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />

      {loading && (
        <PapillonLoading
          title="Chargement des fichiers"
          subtitle="Veuillez patienter quelques instants..."
        />
      )}




      {files && (
        <>
          {(files[0].children.length === 0) && !loading && (
            <PapillonLoading
              title="Aucun fichiers"
              subtitle="Vous n'avez aucun fichiers à afficher"
              icon={<File size={26} color={UIColors.primary} />}
            />
          )}

          <NativeList header={'Mes fichiers'} inset>
          {files[0].children.map((file, index) => (
            <NativeItem key={index} leading={file.type === "folder" ? (
              <Folder size={24} color="#A84700" />
            ) : (
              <File size={24} color="#565EA3" />
            )
            }>
              <NativeText heading="h4" style={{ color: theme.dark ? 'white' : 'black' }}>
              {file.libelle}
              </NativeText>
              <NativeText heading="p2">
              {file.date}
              </NativeText>
            </NativeItem>
          ))
          }
          </NativeList>

          
        </>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    gap: 9,
    marginTop: 21,
    marginHorizontal: 14,
  },
  ListTitle: {
    paddingLeft: 18,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },

  absenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderCurve: 'continuous',
    gap: 16,
  },

  absenceItemData: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 0,
    flex: 1,
  },

  absenceItemTitle: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
  },

  absenceItemSubtitle: {
    fontSize: 15,
    opacity: 0.5,
    marginTop: 2,
  },

  absenceReason: {
    opacity: 1,
    marginTop: 7,
  },

  absenceItemStatus: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 0,
  },

  absenceItemStatusTitle: {
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },

  absenceItemStatusTitleToJustify: {
    color: '#A84700',
    opacity: 1,
  },
});

export default SchoolLifeScreen;
