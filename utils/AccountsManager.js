import asyncStorage from '@react-native-async-storage/async-storage';
asyncStorage.getAllKeys().then(v => { 
    console.log(v)
    asyncStorage.multiGet(v).then(v1 => {
        asyncStorage.multiSet(v1)
    })
})
export async function getAccounts() {
    return new Promise(async (resolve, reject) => {
        console.log("[AccountManager] Récupération des comptes")
        let storageAccs = await asyncStorage.getItem("accounts")
        let storageAccs1 = JSON.parse(storageAccs)
        console.log("[AccountManager/Get]", "Données : " + JSON.stringify(storageAccs))
        let accounts = new Map(
            storageAccs1 ? storageAccs1.map(obj => {
                return [obj.key, obj.value];
            }) : null
        )
        resolve(accounts)
    })
}

export async function saveAccounts(data) {
    return new Promise(async (resolve, reject) => {
        console.log("[AccountManager] Sauvegarde des comptes : " + JSON.stringify(data))
        let arr = Array.from(data, item => ({key: item[0], value: item[1]}))
        await asyncStorage.setItem("accounts", JSON.stringify(arr))
        resolve()
    })
}

/**
* Add account to the list
* @param {object} accountInfo Object of the account, contains : { "token": string, "service": string, "credentials": object }
*
* @returns Promise { id: number } where id is the id of the account locally
*/
export async function addAccount(accountInfo) {
    return new Promise(async(resolve, reject) => {
        console.log("[AccountManager] Ajout d'un compte avec les données suivantes : " + JSON.stringify(accountInfo))
        let accounts = await getAccounts()
        accountInfo.id = accounts.size + 1
        accounts.set(accountInfo.id, accountInfo)
        console.log("[AccountManager] Data après ajout : " + JSON.stringify(accounts))
        await saveAccounts(accounts)
        console.log("[AccountManager]", "Le compte a été ajouté")
        resolve(accountInfo.id)
    })
}

/**
 * Set the account to use
 * @param {number} id ID of the account locally
 * 
 * @returns Promise { }
 */
export function useAccount(id) {
    return new Promise(async(resolve, reject) => {
        console.log("[AccountManager] Utilisation du compte " + id)
        let accounts = await getAccounts()
        if(!accounts) reject("Aucun compte enregistré")
        let account = accounts.get(id)
        if(!account) reject("Aucun compte trouvé avec cet ID local")
        console.log("[AccountManager/Use] Infos du compte : " + JSON.stringify(account))
        let activeAccount = await asyncStorage.getItem("activeAccount")
        if(activeAccount) {
            let oldAccount = accounts.get(activeAccount)
            console.log("[AccountManager/Use] Ancien compte trouvé, données : " + JSON.stringify(oldAccount))
            let storage1 = await asyncStorage.getAllKeys()
            let storage = []
            storage1.forEach(e => {
                if(e !== "accounts" && e !== "old_login") storage.push(e)
            })
            oldAccount = {
                id: activeAccount,
                storage: await asyncStorage.multiGet(storage)
            }
            accounts.set(activeAccount, oldAccount)
        }
        let oldLogin = await asyncStorage.getItem("old_login")
        await asyncStorage.clear()
        await saveAccounts(accounts)
        if(account.storage) await asyncStorage.multiSet(account.storage)
        if(oldLogin) asyncStorage.setItem("old_login", oldLogin)
        if(account.token) await asyncStorage.setItem("token", account.token)
        if(account.credentials) await asyncStorage.setItem("credentials", JSON.stringify(account.credentials))
        if(account.service) await asyncStorage.setItem("service", account.service)
        await asyncStorage.setItem("activeAccount", JSON.stringify(id))
        console.log("[AccountManager/Use] Changement de compte effectué")
        resolve(true)
    })
}