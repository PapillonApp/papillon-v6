import AsyncStorage from '@react-native-async-storage/async-storage';

class CommonCacheUtils {
  static ASYNCSTORAGE_PREFIX = 'SkolengoCache_';

  static _DATE_ENCODING_CHAR = '@';

  static validateDateString = (str: string) =>
    typeof str === 'string' &&
    new Date(str?.toString()).toString() !== 'Invalid Date' &&
    str === new Date(str?.toString()).toISOString();

  static parser = (obj: any) =>
    JSON.stringify(
      obj,
      (_key, value) =>
        this.validateDateString(value)
          ? `${this._DATE_ENCODING_CHAR}${value}${this._DATE_ENCODING_CHAR}`
          : value,
      2
    );

  static deparser = (str: string) =>
    JSON.parse(str, (_key, value) =>
      typeof value === 'string' &&
      value.startsWith(this._DATE_ENCODING_CHAR) &&
      value.endsWith(this._DATE_ENCODING_CHAR)
        ? new Date(value.replaceAll(this._DATE_ENCODING_CHAR, ''))
        : value
    );
}

type CommonCacheItem<T> =
  | {
      expired: true;
      maxDate: number;
      data: T;
    }
  | {
      expired: false;
      maxDate: number;
      data: T;
    };

type CommonCacheSetItem<T> = Omit<CommonCacheItem<T>, 'expired'>;

export class SkolengoCommonCache {
  static SECOND = 1000;

  static MINUTE = 60 * this.SECOND;

  static HOUR = 60 * this.MINUTE;

  static DAY = 24 * this.HOUR;

  static TIMEZONE_OFFSET = new Date().getTimezoneOffset() * this.MINUTE;

  static msToTomorrow() {
    const now = Date.now();
    const timePassedToday = (now % this.DAY) + this.TIMEZONE_OFFSET;
    return this.DAY - timePassedToday;
  }

  static setItem<T>(key: CacheKeys, value: T, timeout: number) {
    const storedDatas = {
      maxDate: new Date().getTime() + timeout,
      data: value,
    };
    return AsyncStorage.setItem(
      `${CommonCacheUtils.ASYNCSTORAGE_PREFIX}${key}`,
      CommonCacheUtils.parser(storedDatas)
    );
  }

  static async setCollectionItem<T>(
    key: CacheKeys,
    id: string,
    value: T,
    timeout: number
  ) {
    if (id?.toString().trim().length === 0) return;
    const actualCache = await this.getItem<
      Record<string, CommonCacheSetItem<T>>
    >(key, {});
    actualCache.data![id] = {
      data: value,
      maxDate: new Date().getTime() + timeout,
    };
    return this.setItem(key, actualCache.data, this.DAY * 30);
  }

  static async getItem<T = null>(
    key: CacheKeys,
    defaultResponse?: T
  ): Promise<CommonCacheItem<T>> {
    const cachedDatas = await AsyncStorage.getItem(
      `${CommonCacheUtils.ASYNCSTORAGE_PREFIX}${key}`
    );
    if (cachedDatas === null)
      return {
        expired: true,
        maxDate: 0,
        data: defaultResponse || (null as T),
      };
    const value = CommonCacheUtils.deparser(cachedDatas);
    return {
      expired: value.maxDate < new Date().getTime(),
      maxDate: value.maxDate,
      data: value.data,
    };
  }

  static async getCollectionItem<T = null>(
    key: CacheKeys,
    id: string,
    defaultResponse?: T
  ) {
    const cachedDatas = await this.getItem<
      Record<string, CommonCacheSetItem<T>>
    >(key, {});
    if (!cachedDatas?.data || !cachedDatas?.data[id])
      return {
        expired: true,
        maxDate: 0,
        data: defaultResponse || (null as T),
      };
    const value = cachedDatas.data[id];
    return {
      expired: value.maxDate < new Date().getTime() || !value.data,
      maxDate: value.maxDate,
      data: value.data,
    };
  }

  static removeItem(key: CacheKeys) {
    return AsyncStorage.removeItem(
      `${CommonCacheUtils.ASYNCSTORAGE_PREFIX}${key}`
    );
  }

  static clearItems = () =>
    Promise.all(
      Object.values(this.cacheKeys).map((key) => this.removeItem(key))
    );

  static cacheKeys = {
    userdatas: 'userdatas',
    absences: 'absences',
    schoolInfos: 'schoolInfos',
    schoolInfoCollection: 'schoolInfoCollection',
    evalSettings: 'evalSettings',
    evalDatas: 'evalDatas',
    periods: 'periods',
    grades: 'grades',
    homeworkList: 'homeworkList',
    timetable: 'timetable',
    recap: 'recap',
  } as const;
}

type _CacheKeys = typeof SkolengoCommonCache.cacheKeys;

export type CacheKeys = _CacheKeys[keyof _CacheKeys];
