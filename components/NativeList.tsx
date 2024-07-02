import React from 'react';
import { View, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native';
import { List } from 'react-native-paper';
import mapChildrenWithKeys from '../utils/mapChildrenWithKeys';

interface SectionProps {
  hideSeparator: boolean;
  hideSurroundingSeparators: boolean;
}

interface Props {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  plain?: boolean;
  inset?: boolean; // only for iOS (NativeList.ios.tsx)
  sideBar?: boolean;
  sectionProps?: SectionProps;
}

const NativeList: React.FC<Props> = React.memo(({
  children,
  header,
  footer,
  style,
  containerStyle,
  plain,
  inset,
  sideBar,
  sectionProps,
}) => {
  const childrenWithKeys = mapChildrenWithKeys(children);

  return (
    <List.Section style={[styles.container, style]} {...sectionProps}>
      {header && <List.Subheader>{header}</List.Subheader>}

      <View style={[styles.children, plain && styles.plain, containerStyle]}>
        {childrenWithKeys}
      </View>

      {footer && <List.Subheader>{footer}</List.Subheader>}
    </List.Section>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  children: {
    marginHorizontal: 16,
    borderRadius: 0,
    overflow: 'hidden',
    gap: 3,
  },
  plain: {
    borderWidth: 0,
  },
});

export default NativeList;
