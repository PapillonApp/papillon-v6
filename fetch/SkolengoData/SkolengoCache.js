/* eslint-disable max-classes-per-file */
import AsyncStorage from '@react-native-async-storage/async-storage';

class SkolengoPrivateCache {
  static ASYNCSTORAGE_PREFIX = 'SkolengoCache_';

  static _DATE_ENCODING_CHAR = '@';

  static validateDateString = (str) =>
    typeof str === 'string' &&
    new Date(str?.toString()).toString() !== 'Invalid Date' &&
    str === new Date(str?.toString()).toISOString();

  static parser = (obj) =>
    JSON.stringify(
      obj,
      (_key, value) =>
        this.validateDateString(value)
          ? `${this.DATE_ENCODING_CHAR}${value}${this.DATE_ENCODING_CHAR}`
          : value,
      2
    );

  static deparser = (str) =>
    JSON.parse(str, (_key, value) =>
      typeof value === 'string' &&
      value.startsWith(this.DATE_ENCODING_CHAR) &&
      value.endsWith(this.DATE_ENCODING_CHAR)
        ? new Date(value.replaceAll(this.DATE_ENCODING_CHAR, ''))
        : value
    );
}

export class SkolengoCache {
  static SECOND = 1000;

  static MINUTE = 60 * this.SECOND;

  static HOUR = 60 * this.MINUTE;

  static DAY = 24 * this.HOUR;

  static msToTomorrow() {
    const now = Date.now();
    const timePassedToday = now % this.DAY;
    return this.DAY - timePassedToday;
  }

  static setItem(key, value, timeout) {
    const storedDatas = {
      maxDate: new Date().getTime() + timeout,
      data: value,
    };
    return AsyncStorage.setItem(
      `${SkolengoPrivateCache.ASYNCSTORAGE_PREFIX}${key}`,
      SkolengoPrivateCache.parser(storedDatas)
    );
  }

  // eslint-disable-next-line default-param-last
  static async setCollectionItem(key, id = '', value, timeout) {
    const actualCache = await this.getItem(key, {});
    if (id?.toString().trim().length === 0) return;
    actualCache.data[id] = { value, maxDate: new Date().getTime() + timeout };
    return this.setItem(key, actualCache.data, this.DAY * 30);
  }

  static async getItem(key, defaultResponse = null) {
    const cachedDatas = await AsyncStorage.getItem(
      `${SkolengoPrivateCache.ASYNCSTORAGE_PREFIX}${key}`
    );
    if (cachedDatas === null)
      return {
        expired: true,
        maxDate: 0,
        data: defaultResponse,
      };
    const value = SkolengoPrivateCache.deparser(cachedDatas);
    return {
      expired: value.maxDate < new Date().getTime(),
      maxDate: value.maxDate,
      data: value.data,
    };
  }

  static async getCollectionItem(key, id, defaultResponse = null) {
    const cachedDatas = await this.getItem(key, {});
    if (!cachedDatas?.data || !cachedDatas?.data[id])
      return {
        expired: true,
        maxDate: 0,
        data: defaultResponse,
      };
    const value = cachedDatas.data[id];
    return {
      expired: value.maxDate < new Date().getTime(),
      maxDate: value.maxDate,
      data: value.data,
    };
  }

  static removeItem(key) {
    return AsyncStorage.removeItem(key);
  }
}
