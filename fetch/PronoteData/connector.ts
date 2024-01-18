import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticateToken, type Pronote, PronoteApiAccountId } from 'pawnote';

export const AsyncStoragePronoteKeys = {
  NEXT_TIME_TOKEN: 'pronote:next_time_token',
  ACCOUNT_TYPE_ID: 'pronote:account_type_id',
  INSTANCE_URL: 'pronote:instance_url',
  USERNAME: 'pronote:username',
  DEVICE_UUID: 'pronote:device_uuid',

  CACHE_GRADES: 'pronote:cache_grades',
  CACHE_USER: 'pronote:cache_user'
};

export const loadPronoteConnector = async (): Promise<Pronote> => {
  const values = await AsyncStorage.multiGet([
    AsyncStoragePronoteKeys.NEXT_TIME_TOKEN,
    AsyncStoragePronoteKeys.ACCOUNT_TYPE_ID,
    AsyncStoragePronoteKeys.INSTANCE_URL,
    AsyncStoragePronoteKeys.USERNAME,
    AsyncStoragePronoteKeys.DEVICE_UUID,
  ]);

  const token = values[0][1];
  const accountTypeID = parseInt(values[1][1]) as PronoteApiAccountId;
  const instanceURL = values[2][1];
  const username = values[3][1];
  const uuid = values[4][1];

  const pronote = await authenticateToken(instanceURL, {
    accountTypeID,
    token,
    username,
    deviceUUID: uuid
  });

  // We save the next token, for next auth.
  await AsyncStorage.setItem(AsyncStoragePronoteKeys.NEXT_TIME_TOKEN, pronote.nextTimeToken);

  return pronote;
};
