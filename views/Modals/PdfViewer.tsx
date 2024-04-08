import React, { useEffect, useLayoutEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  Platform,
} from 'react-native';

import PdfRendererView from 'react-native-pdf-renderer';
import * as FileSystem from 'expo-file-system';

import GetUIColors from '../../utils/GetUIColors';

interface PdfViewerProps {
  route: { params: { url: string } };
  navigation: any;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ route, navigation }) => {
  const url: string = route.params.url;
  const UIColors = GetUIColors();
  const { width } = useWindowDimensions();

  // set the title of the screen
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: route.params.url.split('/').pop(),
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: UIColors.background }]}>
      {Platform.OS === 'ios' && <StatusBar animated barStyle="light-content" />}

      <PdfRendererView
        style={[styles.pdf]}
        source={url}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdf: {
    flex: 1,
  },
});

export default PdfViewer;
