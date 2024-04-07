import { EDCore } from "@papillonapp/ed-core";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AsyncStorageEcoleDirecteKeys = {
    TOKEN: 'ecoledirecte:token',
    DEVICE_UUID: 'ecoledirecte:device_uuid',
    USERNAME: 'ecoledirecte:username',
    ACCESS_TOKEN: 'ecoledirecte:access_token',
  
    CACHE_GRADES: 'ecoledirecte:cache_grades',
    CACHE_USER: 'ecoledirecte:cache_user',
    CACHE_TIMETABLE: 'ecoledirecte:cache_timetable',
    CACHE_HOMEWORK: 'ecoledirecte:cache_homework',
    CACHE_VIE_SCOLAIRE: 'ecoledirecte:cache_vie_scolaire',
};

export const removeEcoleDirecteConnector = async () => {
    await AsyncStorage.multiRemove(Object.values(AsyncStorageEcoleDirecteKeys));
    await AsyncStorage.removeItem('service');
  };

export async function loadEcoleDirecteConnector() {
    let ed = new EDCore();
    const values = await AsyncStorage.multiGet([
        AsyncStorageEcoleDirecteKeys.ACCESS_TOKEN,
        AsyncStorageEcoleDirecteKeys.USERNAME,
        AsyncStorageEcoleDirecteKeys.DEVICE_UUID,
    ]);

    const access_token = values[0][1];
    const username = values[1][1];
    const uuid = values[2][1];

    if (!access_token || !username || !uuid) {
        console.warn('loadEcoleDirecteConnector: information are outdated, logging out...');
        await removeEcoleDirecteConnector();
        return null;
      }

    

    try {
      await ed.auth.renewToken(username, uuid, access_token);
  
      if(ed._token) await AsyncStorage.setItem(AsyncStorageEcoleDirecteKeys.TOKEN, ed._token);
      
      return ed;
    }

    catch (error) {
      if (error instanceof Error) {
        console.error('loadEcoleDirecteConnector: to handle', error); 
        return null;
      }
  
      console.error('loadEcoleDirecteConnector: Unknown error.', error);
      throw error;
    }
}