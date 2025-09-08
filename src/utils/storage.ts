import * as SecureStore from 'expo-secure-store';

class StorageService {
    /**
     * Set the item in the storage
     * @param key 
     * @param value 
     * @returns 
     */
    static async getItem(key: string) {
        return await SecureStore.getItemAsync(key)
    }

    static async setItem(key: string, value: string) {
        return await SecureStore.setItemAsync(key, value);
    }

    static async removeItem(key: string) {
        return await SecureStore.deleteItemAsync(key);
    }
}

export default StorageService;