import ED from 'papillon-ed-core';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function() {
    const [token, user_id] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("ED_ID").then(
            (_studentId) => JSON.parse(_studentId)
        ),
    ]);
    let edInstance = new ED();
    edInstance.auth.setToken(token, user_id);
    return edInstance;
}