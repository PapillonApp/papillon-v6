import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

interface Props {
  name?: string;
  plural?: boolean;
}

export const WillBeSoon: React.FC<Props> = ({ name = 'Cette fonctionnalité', plural = false }) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginHorizontal: 20,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: 20,
        }}
      >
        Ça arrive, t'inquiètes...
      </Text>
      <Text
        style={{
          fontSize: 16,
          textAlign: 'center',
          opacity: 0.5,
          marginTop: 4,
        }}
      >
        {name} {plural ? 'seront disponibles' : 'sera disponible'} dans une prochaine beta.
      </Text>
    </View>
  );
};
