import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Pronote } from 'pawnote';
import { AsyncStoragePronoteKeys } from './connector';
import type { CachedPapillonNews, PapillonNews } from '../types/news';

export const newsHandler = async (force = false, instance?: Pronote): Promise<PapillonNews[]> => {
  const cache = await AsyncStorage.getItem(AsyncStoragePronoteKeys.CACHE_NEWS);
  if (cache && !force) {
    const data = JSON.parse(cache) as CachedPapillonNews;

    const userCacheDate = new Date(data.date);
    const today = new Date();

    userCacheDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (userCacheDate.getTime() === today.getTime()) {
      return data.news;
    }

    await AsyncStorage.removeItem(AsyncStoragePronoteKeys.CACHE_NEWS);
    return newsHandler(true, instance);
  }

  if (!instance) return [];

  try {
    const newsFromPawnote = await instance.getNews();
    const news: PapillonNews[] = newsFromPawnote.items.map(n => ({
      title: n.title,
      date: n.startDate.toISOString(),
      content: n.questions[0].content,
      survey: n.isSurvey,
      read: n.read,
      author: n.author,
      attachments: [] // TODO
    }));

    return news;
  }
  catch {
    // TODO
    return [];
  }
};
