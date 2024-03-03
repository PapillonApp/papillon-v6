import React from 'react';
import {View} from 'react-native';
import getUIColors from '../utils/GetUIColors';
import * as WebBrowser from 'expo-web-browser';
import RenderHtml from 'react-native-render-html';
import AlertBottomSheet from '../interface/AlertBottomSheet';
import {Link} from 'lucide-react-native';

function PapillonHTMLRender({html, width, linkColor = '', style}: { html: string, width: number, linkColor: string, style: StyleSheet }) {
  let UIColors = getUIColors();
  let [catchError, setCatchError] = React.useState(false);
  console.log(html);
  let customizedHTML = (`<body style="color: ${UIColors.text};font-size: 14px;">${html}</body`)
    .replaceAll('font-family: Arial;', '')
    .replaceAll('font-size: 24px;', 'font-size: 33px;')
    .replaceAll('font-size: 20px;', 'font-size: 27px;')
    .replaceAll('font-size: 18px;', 'font-size: 21px;')
    .replaceAll('font-size: 16px;', 'font-size: 19px;')
    .replaceAll('font-size: 14px;', 'font-size: 16px;')
    .replaceAll('font-size: 13px;', 'font-size: 16px;')
    .replaceAll('font-size: small;', 'font-size: 16px;')
    .replaceAll('font-size: 12px;', 'font-size: 15px;')
    .replaceAll('font-size: 11px;', 'font-size: 15px;')
    .replaceAll('font-size: 10px;', 'font-size: 14px;')
    .replaceAll('font-size: 9px;', 'font-size: 14px;')
    .replaceAll('font-size: 8px;', 'font-size: 12px;')
    .replaceAll('font-size: 7px;', 'font-size: 12px;')
    .replaceAll('font-size: 6px;', 'font-size: 11px;')
    .replaceAll('font-size: 5px;', 'font-size: 11px;')
    .replaceAll('<a ', '<a style="color: ' + (linkColor != '' ? linkColor:UIColors.primary) + ';" ')
  ;
  const renderersProps = {
    a: {
      onPress(event: any,url: string) {
        if (url.startsWith('http://') || url.startsWith('https://')) {
          WebBrowser.openBrowserAsync(url, {
            dismissButtonStyle: 'done',
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.POPOVER,
            controlsColor: (linkColor != '' ? linkColor:UIColors.primary),
          });
        } else {
          setCatchError(true);
        }
      }
    }
  };
  return (
    <View style={style}>
      <AlertBottomSheet
        title={'Impossible d\'ouvrir le lien'}
        subtitle={'Le lien n\'est pas valide'}
        icon={<Link></Link>}
        visible={catchError}
        color={linkColor != '' ? linkColor:UIColors.primary}
        cancelAction={() => setCatchError(false)}
      ></AlertBottomSheet>
      <RenderHtml source={{html: customizedHTML}} contentWidth={width} defaultTextProps={{selectable: true}} renderersProps={renderersProps}/>
    </View>

  );
}

export default PapillonHTMLRender;
