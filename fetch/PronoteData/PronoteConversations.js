import AsyncStorage from '@react-native-async-storage/async-storage';
import getConsts from '../consts';

import { refreshToken } from '../AuthStack/LoginFlow';

function getConversations(force = false) {
    return getConsts().then((consts) => {
        return AsyncStorage.getItem('token')
        .then((token) =>
          // fetch le discussions
          fetch(`${consts.API}/discussions?token=${token}`, {
            method: 'GET',
          })
            .then((response) => response.json())
            .then(async (result) => {
              if (result === 'expired' || result === 'notfound') {
                return refreshToken().then(() => getConversations());
              }
              console.log(JSON.stringify(result));
              return result;
            })
            .catch(() => {})
        )
        .catch(() => {});
    });
}

export { getConversations };