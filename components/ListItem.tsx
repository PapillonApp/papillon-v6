import React from 'react';

import {
  View,
  StyleSheet,
  TouchableNativeFeedback,
  Platform,
  type ViewStyle,
} from 'react-native';

import { PressableScale } from 'react-native-pressable-scale';
import { useTheme, Text } from 'react-native-paper';
import Haptics from 'expo-haptics';

import { ChevronRight } from 'lucide-react-native';

interface Props {
  title?: string
  subtitle?: string
  underTitle?: string
  left?: React.ReactElement
  right?: React.ReactElement
  /** Most likely an icon component from `lucide-react-native`. */
  icon?: React.ReactElement
  style?: ViewStyle
  color: string
  /** Add more space between `title` and `subtitle`. */
  isLarge?: boolean
  onPress?: () => unknown
  onLongPress?: () => unknown
  fill?: boolean
  /** Should take all the width from the parent. */
  width?: boolean
  center?: boolean
  chevron?: boolean
  trimSubtitle?: boolean
  bottom?: React.ReactElement
}

/**
 * @see https://i.imgur.com/rshTN7n.png
 */
const ListItem: React.FC<Props> = ({
  title,
  subtitle,
  underTitle,
  left,
  right,
  icon,
  style,
  color,
  isLarge = false,
  onPress,
  onLongPress,
  fill,
  width,
  center,
  chevron,
  trimSubtitle,
  bottom,
}) => {
  const theme = useTheme();

  let bgColor = theme.dark ? '#111' : '#fff';
  let textColor = theme.dark ? '#fff' : '#000';
  if (fill) {
    bgColor = color;
    textColor = '#fff';
  }

  const bgMaterial = theme.colors.elevation.level1;

  function onPressActive() {
    onPress?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  let pressScale = 0.92;
  if (!onPress) pressScale = 0.92;

  return Platform.OS === 'ios' ? (
    <PressableScale
      style={{ flex: 1 }}
      weight="light"
      activeScale={pressScale}
      onPress={onPressActive}
      onLongPress={() => onLongPress?.()}
    >
      <View
        style={[
          styles.listItem,
          {
            backgroundColor: bgColor,
            borderColor: theme.dark ? '#191919' : '#e5e5e5',
            marginHorizontal: width ? 0 : 14,
            flex: width ? 1 : void 0,
            alignItems: center ? 'center' : void 0,
          },
          style,
        ]}
      >
        {left && <View style={styles.left}>{left}</View>}

        {icon && (
          <View
            style={[
              styles.icon,
              { backgroundColor: theme.dark ? '#ffffff10' : `${color}10` },
            ]}
          >
            {icon}
          </View>
        )}

        <View style={[styles.listItemText, { gap: isLarge ? 8 : 2 }]}>
          {title && (
            <Text style={[styles.listItemTextTitle, { color: textColor }]}>
              {title}
            </Text>
          )}

          {subtitle && (
            <Text
              style={[styles.listItemTextSubtitle, { color: textColor }]}
              numberOfLines={trimSubtitle ? 1 : void 0}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          )}

          {underTitle && (
            <Text style={[styles.listItemTextUnderTitle, { color: textColor }]}>
              {underTitle}
            </Text>
          )}
        </View>

        {right && <View style={styles.right}>{right}</View>}

        {chevron && (
          <View style={styles.right}>
            <ChevronRight
              size={24}
              strokeWidth={2.5}
              style={{ marginTop: -6, marginBottom: -6 }}
              color={theme.dark ? '#ffffff40' : '#00000040'}
            />
          </View>
        )}
      </View>
    </PressableScale>
  ) : (
    <View
      style={[
        styles.listItemContainer,
        { flex: 1, borderRadius: 10, overflow: 'hidden' },
        {
          backgroundColor: bgMaterial,
          borderColor: theme.dark ? '#191919' : '#e5e5e5',
          marginHorizontal: width ? 0 : 14,
          flex: width ? 1 : void 0,
          alignItems: center ? 'center' : void 0,
        },
        style,
      ]}
    >
      <TouchableNativeFeedback
        style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}
        onPress={onPressActive}
        onLongPress={() => onLongPress?.()}
        background={TouchableNativeFeedback.Ripple(
          theme.colors.surfaceDisabled,
          true
        )}
      >
        <View style={styles.listItemChild}>
          {left && <View style={styles.left}>{left}</View>}

          {icon && (
            <View
              style={[
                styles.icon,
                { backgroundColor: theme.dark ? '#ffffff10' : `${color}10` },
              ]}
            >
              {icon}
            </View>
          )}

          <View style={[styles.listItemText, { gap: isLarge ? 8 : 2 }]}>
            {title && (
              <Text style={[styles.listItemTextTitle, { color: textColor }]}>
                {title}
              </Text>
            )}

            {subtitle && (
              <Text
                style={[styles.listItemTextSubtitle, { color: textColor }]}
                numberOfLines={trimSubtitle ? 1 : void 0}
                ellipsizeMode="tail"
              >
                {subtitle}
              </Text>
            )}

            {bottom && <View>{bottom}</View>}
          </View>

          {right && <View style={styles.right}>{right}</View>}
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',

    padding: 14,
    marginHorizontal: 14,

    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 0,
  },
  listItemContainer: {
    marginHorizontal: 14,

    borderRadius: 10,
    borderWidth: 0,
  },
  listItemChild: {
    padding: 14,
    flexDirection: 'row',
  },
  listItemText: {
    gap: 2,
    flex: 1,
    justifyContent: 'center',
  },
  listItemTextTitle: {
    fontSize: 17,
    fontFamily: 'Papillon-Semibold',
  },
  listItemTextSubtitle: {
    fontSize: 15,
    opacity: 0.6,
  },
  listItemTextUnderTitle: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 4,
  },
  left: {
    marginRight: 14,
  },
  right: {
    marginLeft: 14,
    marginRight: 4,
  },
  icon: {
    marginRight: 14,

    width: 38,
    height: 38,
    borderRadius: 30,

    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ListItem;
