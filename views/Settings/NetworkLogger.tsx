import { useTheme } from '@react-navigation/native';
import NetworkLogger from 'react-native-network-logger';

const NetworkLoggerScreen = () => {
  const theme = useTheme();

  return (
    <NetworkLogger
      theme={theme}
    />
  );
};

export default NetworkLoggerScreen;
