import type { Pronote } from 'pawnote';
import type { PapillonDiscussion, PapillonDiscussionMessage } from '../types/discussions';

export const discussionsHandler = async (instance?: Pronote, force = false): Promise<PapillonDiscussion[]> => {
  // TODO: Caching ?

  try {
    const discussionsOverview = await instance?.getDiscussionsOverview();
    if (!discussionsOverview) return [];

    const discussions: PapillonDiscussion[] = [];
    for (const discussion of discussionsOverview.discussions) {
      const messages = await discussion.fetchMessages();
      const parsedMessages: PapillonDiscussionMessage[] = [];
      
      for (const message of messages) {
        parsedMessages.push({
          id: message.id,
          content: message.content,
          author: message.author.name,
          timestamp: message.created.getTime(),
        });
      }

      discussions.push({
        local_id: `${discussion.subject.substring(0, 3)}${discussion.dateAsFrenchText}`,
        subject: discussion.subject,
        creator: discussion.creator ?? '',
        timestamp: messages[0].created.getTime(),
        unread: discussion.numberOfMessagesUnread,
        closed: discussion.closed,
        messages: parsedMessages,
        participants: [] // TODO in Pawnote
      });
    }

    return discussions;
  }
  catch {
    return [];
  }
};
