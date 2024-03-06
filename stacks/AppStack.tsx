import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const AppStack = ({ navigation }) => {
  function clearAsyncStorage() {
    AsyncStorage.clear();
  }

  return (
    <View>
      <Text>Hey !</Text>

      <Button title="Clear Async Storage" onPress={clearAsyncStorage} />
    </View>
  );
};

export default AppStack;
