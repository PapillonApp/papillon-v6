import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { AlertTriangle } from 'lucide-react-native';

interface Props {
  /** Text displayed within the item. */
  text: string
}

const UnstableItem: React.FC<Props> = ({ text }) => {
  return (
    <View style={styles.unstable}>
      <AlertTriangle size={20} color="#A84700" />
      <Text style={styles.unstableText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  unstable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 30,
    backgroundColor: '#A8470022',
  },
  unstableText: {
    fontSize: 15,
    color: '#A84700',
  },
});

export default UnstableItem;
