import type { CachedPapillonNews, PapillonNewsInformation, PapillonNewsSurvey, PapillonNews } from '../types/news';
import type { PapillonAttachmentType } from '../types/attachment';
import { AsyncStoragePronoteKeys } from './connector';

import { type Pronote, StudentNewsInformation, StudentNewsSurvey, PronoteApiNewsQuestionType } from 'pawnote';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { btoa } from 'js-base64';

const makeLocalID = (news: StudentNewsInformation | StudentNewsSurvey): string => {
  const localID = `${news.category.name.substring(0, 3)};${news instanceof StudentNewsInformation ? 'info' : 'survey'};${news.author};${news.title};${news.creationDate.getTime()}`;
  return btoa(localID);
};

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

    return newsHandler(true, instance);
  }

  try {
    if (!instance) throw new Error('No instance established.');

    const newsFromPawnote = await instance.getNews();
    const news: PapillonNews[] = newsFromPawnote.items.map(n => {
      if (n instanceof StudentNewsInformation) {
        const info: PapillonNewsInformation = {
          id: makeLocalID(n),
          is: 'information',
          title: n.title,
          date: n.startDate.toISOString(),
          acknowledged: n.acknowledged,
          attachments: n.attachments.map(a => ({
            name: a.name,
            type: a.type as unknown as PapillonAttachmentType,
            url: a.url
          })),
          content: n.content,
          author: n.author,
          category: n.category.name,
          read: n.read,
        };

        return info;
      }
      else if (n instanceof StudentNewsSurvey) {
        const survey: PapillonNewsSurvey = {
          id: makeLocalID(n),
          is: 'survey',
          title: n.title,
          date: n.startDate.toISOString(),
          read: n.read,
          author: n.author,
          category: n.category.name,
          questions: n.questions.map(q => ({
            title: q.title,
            attachments: q.attachments.map(a => ({
              name: a.name,
              type: a.type as unknown as PapillonAttachmentType,
              url: a.url
            })),
            choices: q.choices.map(c => ({
              label: c.value,
              position: c.position,
              textInputRequired: c.isTextInput
            })),
            maxChoices: q.shouldRespectMaximumChoices ? q.maximumChoices : null,
            maxInputLength: q.maximumLength,
            required: q.shouldAnswer,
            choicesAnswer: q.selectedAnswers,
            textAnswer: q.textInputAnswer,
            type: q.type === PronoteApiNewsQuestionType.TextInput ? 'input'
              : q.type === PronoteApiNewsQuestionType.MultipleChoice ? 'multiple'
                : q.type === PronoteApiNewsQuestionType.UniqueChoice ? 'unique'
                  : 'info'
          }))
        };
        
        return survey;
      }

      throw null; // unreachable
    });
    
    await AsyncStorage.setItem(AsyncStoragePronoteKeys.CACHE_NEWS, JSON.stringify({
      news,
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

const _newsStateHandlerPrefix = '[pronote:newsStateHandler]';
export const newsStateHandler = async (localID: string, read = true, instance?: Pronote): Promise<boolean> => {
  try {
    if (!instance) {
      console.warn(_newsStateHandlerPrefix, 'no instance established.');
      return false;
    }

    const news = await instance.getNews();
    const newsItem = news.items.find(n => makeLocalID(n) === localID);
    if (!newsItem) {
      console.warn(_newsStateHandlerPrefix, 'news item not found.');
      return false;
    }

    await newsItem.markAsRead(read);
    return true;
  }
  catch (error) {
    console.warn(_newsStateHandlerPrefix, 'an error thrown, hopefully, it shouldn\'t affect the app.');
    console.error(_newsStateHandlerPrefix, error);
    return false;
  }
};
