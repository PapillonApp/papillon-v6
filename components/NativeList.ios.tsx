import React, { useCallback, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { Section, TableView } from 'react-native-tableview-simple';
import GetUIColors from '../utils/GetUIColors';
import mapChildrenWithKeys from '../utils/mapChildrenWithKeys';

interface Props {
  children: React.ReactNode;
  inset?: boolean;
  header?: string;
  footer?: string;
  style?: ViewStyle;
  tableViewProps?: Partial<React.ComponentProps<typeof TableView>>;
  sectionProps?: Partial<React.ComponentProps<typeof Section>>;
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
  const mapChildrenWithKeysMemoized = useCallback((children: React.ReactNode) => {
    return mapChildrenWithKeys(children);
  }, []);
  const childrenWithKeys = useMemo(() => mapChildrenWithKeysMemoized(children), [children]);

  const tableViewStyle = useMemo(() => {
    return [
      style,
      inset ? {marginHorizontal: 15} : null,
      tableViewProps?.style,
    ];
  }, [style, inset, tableViewProps?.style]);

  return (
    <TableView
      appearance="auto"
      style={tableViewStyle}
      {...(tableViewProps && tableViewProps)}
    >
      <Section
        header={header ? header.toUpperCase() : ''}
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
        {...(sectionProps && sectionProps)}
      >
        {childrenWithKeys}
      </Section>
    </TableView>
  );
};

export default React.memo(NativeList);
