import AsyncStorage from '@react-native-async-storage/async-storage';

function getConsts() {
    return AsyncStorage.getItem('custom_server').then((server) => {
        if(server) {
            server = JSON.parse(server);
        }

        let API = "http://192.168.1.22:8000"

        if(server && server.url) {
            API = server.url
        }

        return {
            "API": API
        }
    });
}

export default getConsts;