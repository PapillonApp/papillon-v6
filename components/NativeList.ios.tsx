import React from 'react';

import type { ViewStyle } from 'react-native';
import { Section, TableView } from 'react-native-tableview-simple';

import GetUIColors from '../utils/GetUIColors';
import mapChildrenWithKeys from '../utils/mapChildrenWithKeys';

interface Props {
  children: React.ReactNode
  inset?: boolean
  header?: string
  footer?: string
  style?: ViewStyle
  containerStyle?: ViewStyle
  plain?: boolean
  tableViewProps?: Partial<React.ComponentProps<typeof TableView>>
  sectionProps?: Partial<React.ComponentProps<typeof Section>>
}

const NativeList: React.FC<Props> = ({ 
  children,
  inset,
  header,
  footer,
  style,
  tableViewProps,
  sectionProps,
}) => {
  const UIColors = GetUIColors();
  const childrenWithKeys = mapChildrenWithKeys(children);

  return (
    <TableView
      {...tableViewProps}
      appearance="auto"
      style={[
        style,
        inset ? {marginHorizontal: 15} : null,
        tableViewProps?.style,
      ]}
    >
      <Section
        {...sectionProps}
        header={header}
        footer={footer}

        roundedCorners={sectionProps?.roundedCorners ? sectionProps.roundedCorners : inset}
        hideSurroundingSeparators={sectionProps?.hideSurroundingSeparators ? sectionProps.hideSurroundingSeparators : inset}
        separatorTintColor={sectionProps?.separatorTintColor ? sectionProps.separatorTintColor : UIColors.border}

        hideSeparator={sectionProps?.hideSeparator ? sectionProps.hideSeparator : false}

        headerTextStyle={{
          color: UIColors.text,
          fontSize: 13,
          fontWeight: '400',
          opacity: 0.4,
          textTransform: 'uppercase',
          marginBottom: 2,
          ...sectionProps?.headerTextStyle
        }}
      >
        {childrenWithKeys}
      </Section>
    </TableView>
  );
};

export default NativeList;
