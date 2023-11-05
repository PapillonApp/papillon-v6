import AsyncStorage from '@react-native-async-storage/async-storage';
import getConsts from '../consts';

import { refreshToken } from '../AuthStack/LoginFlow';

// eslint-disable-next-line no-unused-vars
function getConversations(force = false) {
  return getConsts().then((consts) =>
    AsyncStorage.getItem('token')
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
            return result;
          })
          .catch(() => {})
      )
      .catch(() => {})
  );
}

export { getConversations };
