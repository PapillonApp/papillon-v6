import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticateToken, type Pronote, PronoteApiAccountId, PawnoteNetworkFail } from 'pawnote';

export const AsyncStoragePronoteKeys = {
  NEXT_TIME_TOKEN: 'pronote:next_time_token',
  ACCOUNT_TYPE_ID: 'pronote:account_type_id',
  INSTANCE_URL: 'pronote:instance_url',
  USERNAME: 'pronote:username',
  DEVICE_UUID: 'pronote:device_uuid',

  CACHE_GRADES: 'pronote:cache_grades',
  CACHE_USER: 'pronote:cache_user',
  CACHE_TIMETABLE: 'pronote:cache_timetable',
};

export const removePronoteConnector = async () => {
  await AsyncStorage.multiRemove(Object.values(AsyncStoragePronoteKeys));
  await AsyncStorage.removeItem('service');
};

export const loadPronoteConnector = async (): Promise<Pronote | null> => {
  const values = await AsyncStorage.multiGet([
    AsyncStoragePronoteKeys.NEXT_TIME_TOKEN,
    AsyncStoragePronoteKeys.ACCOUNT_TYPE_ID,
    AsyncStoragePronoteKeys.INSTANCE_URL,
    AsyncStoragePronoteKeys.USERNAME,
    AsyncStoragePronoteKeys.DEVICE_UUID,
  ]);

  const token = values[0][1];
  const accountTypeID = parseInt(values[1][1] ?? 'NaN') as PronoteApiAccountId;
  const instanceURL = values[2][1];
  const username = values[3][1];
  const uuid = values[4][1];

  if (!token || isNaN(accountTypeID) || !instanceURL || !username || !uuid) {
    console.warn('loadPronoteConnector: information are outdated, logging out...');
    await removePronoteConnector();
    return null;
  }

  console.log('loadPronoteConnector:', username, 'authenticating...');

  try {
    const pronote = await authenticateToken(instanceURL, {
      accountTypeID,
      token,
      username,
      deviceUUID: uuid
    });
  
    console.log('loadPronoteConnector:', username, 'authenticated ! see token:', pronote.nextTimeToken);
  
    // We save the next token, for next auth.
    await AsyncStorage.setItem(AsyncStoragePronoteKeys.NEXT_TIME_TOKEN, pronote.nextTimeToken);

    return pronote;
  }
  /**
   * We return null for an "forbidden" / "unauthenticated" reason.
   * We throw the error for a "network error" reason.
   */
  catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Failed to extract session from HTML')) {
        await removePronoteConnector();
        return null;
      }

      if (error instanceof PawnoteNetworkFail) { // (subclass of Error)
        throw error;
      }

      // TODO: Handle all errors from Pawnote.
      console.error('loadPronoteConnector: to handle', error); 
      return null;
    }

    console.error('loadPronoteConnector: Unknown error.', error);
    // Let's say it's just network error.
    throw error;
  }
};
