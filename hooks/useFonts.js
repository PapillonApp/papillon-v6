import * as Font from 'expo-font';

export default useFonts = async () =>
  await Font.loadAsync({
    "Papillon-Light": require('../assets/fonts/FixelText-Light.ttf'),
    "Papillon-Regular": require('../assets/fonts/FixelText-Regular.ttf'),
    "Papillon-Medium": require('../assets/fonts/FixelText-Medium.ttf'),
    "Papillon-Semibold": require('../assets/fonts/FixelText-SemiBold.ttf'),
    "Papillon-Bold": require('../assets/fonts/FixelText-Bold.ttf'),
  });