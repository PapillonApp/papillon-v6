import type { CachedPapillonNews, PapillonNewsInformation, PapillonNewsSurvey, PapillonNews } from '../types/news';
import type { PapillonAttachmentType } from '../types/attachment';

import { type Pronote, StudentNewsInformation, StudentNewsSurvey, PronoteApiNewsQuestionType } from 'pawnote';

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
      return data.news;
    }

    await AsyncStorage.removeItem(AsyncStoragePronoteKeys.CACHE_NEWS);
    return newsHandler(true, instance);
  }

  try {
    if (!instance) throw new Error('No instance established.');

    const newsFromPawnote = await instance.getNews();
    const news: PapillonNews[] = newsFromPawnote.items.map(n => {
      if (n instanceof StudentNewsInformation) {
        const info: PapillonNewsInformation = {
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
          read: n.read
        };

        return info;
      }
      else if (n instanceof StudentNewsSurvey) {
        const survey: PapillonNewsSurvey = {
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
      
    return news;
  }
  catch {
    // TODO: return cache
    return [];
  }
};
