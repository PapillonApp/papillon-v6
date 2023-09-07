import React from 'react';
import {
  View,
  StyleSheet,
  TouchableNativeFeedback,
  Platform,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { PressableScale } from 'react-native-pressable-scale';
import * as Haptics from 'expo-haptics';

function ListItem({
  title,
  subtitle,
  left,
  right,
  icon,
  style,
  color,
  isLarge,
  onPress,
  onLongPress,
  fill,
  width,
  center,
}) {
  const theme = useTheme();

  let bgColor = theme.dark ? '#111' : '#fff';
  let textColor = theme.dark ? '#fff' : '#000';
  if (fill) {
    bgColor = color;
    textColor = '#fff';
  }

  const bgMaterial = theme.colors.elevation.level1;

  function onPressActive() {
    if (onPress) {
      onPress();
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  let pressScale = 0.89;
  // let clickable = true;

  if (!onPress) {
    pressScale = 1;
    // clickable = false;
  }

  return Platform.OS === 'ios' ? (
    <PressableScale
      onPress={() => onPressActive()}
      weight="light"
      activeScale={pressScale}
      style={{ flex: 1 }}
      onLongPress={onLongPress}
    >
      <View
        style={[
          styles.listItem,
          {
            backgroundColor: bgColor,
            borderColor: theme.dark ? '#191919' : '#e5e5e5',
            marginHorizontal: width ? 0 : 14,
            flex: width ? 1 : undefined,
            alignItems: center ? 'center' : undefined,
          },
          style,
        ]}
      >
        {left ? <View style={[styles.left]}>{left}</View> : null}

        {icon ? (
          <View
            style={[
              styles.icon,
              { backgroundColor: theme.dark ? '#ffffff10' : `${color}10` },
            ]}
          >
            {icon}
          </View>
        ) : null}

        <View style={[styles.listItemText, { gap: isLarge ? 8 : 2 }]}>
          { title ? (
            <Text style={[styles.listItemTextTitle, { color: textColor }]}>
              {title}
            </Text>
          ) : null }

          {subtitle ? (
            <Text style={[styles.listItemTextSubtitle, { color: textColor }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {right ? <View style={[styles.right]}>{right}</View> : null}
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
          flex: width ? 1 : undefined,
          alignItems: center ? 'center' : undefined,
        },
        style,
      ]}
    >
      <TouchableNativeFeedback
        style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}
        onPress={() => onPressActive()}
        onLongPress={onLongPress}
        background={TouchableNativeFeedback.Ripple(
          theme.colors.surfaceDisabled,
          true
        )}
      >
        <View style={[styles.listItemChild]}>
          {left ? <View style={[styles.left]}>{left}</View> : null}

          {icon ? (
            <View
              style={[
                styles.icon,
                { backgroundColor: theme.dark ? '#ffffff10' : `${color}10` },
              ]}
            >
              {icon}
            </View>
          ) : null}

          <View style={[styles.listItemText, { gap: isLarge ? 8 : 2 }]}>
            {title ? (
              <Text style={[styles.listItemTextTitle, { color: textColor }]}>
                {title}
              </Text>
            ) : null}

            {subtitle ? (
              <Text style={[styles.listItemTextSubtitle, { color: textColor }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {right ? <View style={[styles.right]}>{right}</View> : null}
        </View>
      </TouchableNativeFeedback>
    </View>
  );
}

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
