import React from "react";

import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

function PapillonInsetHeader({ icon, title, size= 24, color='#000000', inset=false, style, textStyle }) {
  // add size and color to icon
  if (icon) {
    icon = React.cloneElement(icon, {size, color});
  }

  return (
    <View style={[
      styles.header,
      inset && styles.headerInset,
      style
    ]}>
      { icon &&
        <View style={styles.headerIcon}>
          {icon}
        </View>
      }
      <Text
        style={[
          styles.headerText,
          textStyle
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems:'center',
    marginHorizontal: 14,
    
  },
  headerInset: {
    marginHorizontal: 0,
    marginLeft: 7,
    marginEnd: 110,
  },
  headerIcon: {
    marginRight: 30,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Papillon-Semibold',
    flex: 1,
  }
});

export default PapillonInsetHeader;