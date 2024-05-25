
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';

import { useTheme } from 'react-native-paper';
import { File } from 'lucide-react-native';

import GetUIColors from '../../utils/GetUIColors';
import PapillonLoading from '../../components/PapillonLoading';
import { useAppContext } from '../../utils/AppContext';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import type { studentDocsResData } from '@papillonapp/ed-core/dist/src/types/v3';



function SchoolLifeScreen({ navigation }: {
  navigation: any // TODO
}) {
  const [documents, setdocuments] = useState<studentDocsResData | null>(null);
  const theme = useTheme();
  const UIColors = GetUIColors();
  const appContext = useAppContext();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const retrieveData = async (force = false) => {
    try {
      if (!appContext.dataProvider) return;
      const value = await appContext.dataProvider.getED_Documents(force);
    
  
      setdocuments(value);
      
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
      headerTitle: 'Mes documents',
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
          title="Chargement des documents"
          subtitle="Veuillez patienter quelques instants..."
        />
      )}




      {documents && (
        <>
          {(documents.factures.length === 0 && documents.notes.length === 0 && documents.viescolaire.length === 0 && documents.administratifs.length === 0) && !loading && (
            <PapillonLoading
              title="Aucun document"
              subtitle="Vous n'avez aucun document à afficher"
              icon={<File size={26} color={UIColors.primary} />}
            />
          )}





        {documents.notes && documents.notes.length > 0 && (
            <NativeList header={`Notes`} inset>
                {documents.notes?.map((doc, index) => (
                <NativeItem key={index}>
                    <NativeText heading="h4" style={{ color: theme.dark ? 'white' : 'black' }}>
                    {doc.libelle}
                    </NativeText>
                    <NativeText heading="p2">
                    {doc.date}
                    </NativeText>
                </NativeItem>
                ))}
            </NativeList>
        )}


        {documents.viescolaire && documents.viescolaire.length > 0 && (
            <NativeList header={`Vie Scolaire`} inset>
              {documents.viescolaire?.map((doc, index) => (
                <NativeItem key={index}>
                  <NativeText heading="h4" style={{ color: theme.dark ? 'white' : 'black' }}>
                    {doc.libelle}
                  </NativeText>
                  <NativeText heading="p2">
                    {doc.date}
                  </NativeText>
                </NativeItem>
              ))}
            </NativeList>
        )}

        {documents.administratifs && documents.viescolaire.length > 0 && (
            <NativeList header={`Administratifs`} inset>
              {documents.administratifs?.map((doc, index) => (
                <NativeItem key={index}>
                  <NativeText heading="h4" style={{ color: theme.dark ? 'white' : 'black' }}>
                    {doc.libelle}
                  </NativeText>
                  <NativeText heading="p2">
                    {doc.date}
                  </NativeText>
                </NativeItem>
              ))}
            </NativeList>
        )}

        {documents.factures && documents.factures.length > 0 && (
            <NativeList header={`Factures`} inset>
              {documents.factures?.map((doc, index) => (
                <NativeItem key={index}>
                  <NativeText heading="h4" style={{ color: theme.dark ? 'white' : 'black' }}>
                    {doc.libelle}
                  </NativeText>
                  <NativeText heading="p2">
                    {doc.date}
                  </NativeText>
                </NativeItem>
              ))}
            </NativeList>
        )}



          
          
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
