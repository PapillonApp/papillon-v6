import ED from 'papillon-ed-core';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function() {
    const [token, user, school, modules] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("ED_USERDATA").then((userData) => JSON.parse(userData)),
        AsyncStorage.getItem("ED_SCHOOLDATA").then((schoolData) => JSON.parse(schoolData)),
        AsyncStorage.getItem("ED_MODULES").then((modules) => JSON.parse(modules)),
    ]);
    let edInstance = new ED();
    edInstance.auth.setToken(token, user.id);
    edInstance.student = user;
    edInstance.school = school;
    edInstance.modules = modules;
    return edInstance;
}