import AsyncStorage from '@react-native-async-storage/async-storage';

export default function refresh(ecoledirecteInstance) {
    return AsyncStorage.getItem('credentials').then((result) => {
        if (!result) return;
        const credentials = JSON.parse(result);

        return ecoledirecteInstance.auth.login(credentials.username, credentials.password).then((res) => {
            AsyncStorage.setItem('token', ecoledirecteInstance._token);
        }).catch(err => {

        })
    });
}