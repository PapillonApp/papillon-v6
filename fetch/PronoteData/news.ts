import type { CachedPapillonNews, PapillonNews } from '../types/news';
import type { PapillonAttachmentType } from '../types/homework';
import type { Pronote } from 'pawnote';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStoragePronoteKeys } from './connector';

export const newsHandler = async (force = false, instance?: Pronote): Promise<PapillonNews[]> => {
  const cache = await AsyncStorage.getItem(AsyncStoragePronoteKeys.CACHE_NEWS);
  if (cache && !force) {
    const data = JSON.parse(cache) as CachedPapillonNews;

    const userCacheDate = new Date(data.date);
    const today = new Date();

    userCacheDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (userCacheDate.getTime() === today.getTime()) {
      console.info('news: cache is up to date, using it.');
      return data.news;
    }

    // Is this line really useful ? It may degrade user experience in case of
    // network failure with cache fallback when cache is expired
    await AsyncStorage.removeItem(AsyncStoragePronoteKeys.CACHE_NEWS);
    return newsHandler(true, instance);
  }

  if (!instance) return [];
  console.info('news: fetching new data.');

  try {
    const newsFromPawnote = await instance.getNews();
    const news: PapillonNews[] = newsFromPawnote.items.map(n => ({
      title: n.title,
      date: n.startDate.toISOString(),
      content: n.questions[0].content,
      survey: n.isSurvey,
      read: n.read,
      author: n.author,
      category: n.category.name,
      attachments: n.questions[0].attachments.map(a => ({
        name: a.name,
        type: a.type as unknown as PapillonAttachmentType,
        url: a.url
      }))
    }));

    await AsyncStorage.setItem(AsyncStoragePronoteKeys.CACHE_NEWS, JSON.stringify({
      news: news,
      date: new Date()
    }));

    return news;
  }
  catch (error) {
    console.info('pronote/newsHandler: network failed, recovering with possible cache');
    console.error(error);
    if (cache) {
      return newsHandler(false, instance);
    } else {
      console.info('pronote/newsHandler: No cache found, returning empty array');
    }
    return [];
  }
};
