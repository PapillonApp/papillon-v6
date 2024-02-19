import type { Pronote } from 'pawnote';
import type { PapillonDiscussion, PapillonDiscussionMessage } from '../types/discussions';

export const discussionsHandler = async (instance?: Pronote, force = false): Promise<PapillonDiscussion[]> => {
  // TODO: Caching ?

  try {
    const discussionsOverview = await instance?.getDiscussionsOverview();
    if (!discussionsOverview) return [];

    const discussions: PapillonDiscussion[] = [];
    for (const discussion of discussionsOverview.discussions) {
      const messages: PapillonDiscussionMessage[] = [];
      
      for (const message of await discussion.fetchMessages()) {
        messages.push({
          id: message.id,
          content: message.content,
          author: message.author,
          timestamp: message.created.getTime(),
        });
      }

      discussions.push({
        local_id: `${discussion.subject.substring(0, 3)}${discussion.hourString}`,
        subject: discussion.subject,
        creator: discussion.creator ?? '',
        timestamp: Date.now(), // TODO in Pawnote
        unread: discussion.numberOfMessagesUnread,
        closed: discussion.closed,
        messages,
        repliable: true, // TODO : discussion.repliable in Pawnote
        participants: [] // TODO in Pawnote
      });
    }

    return discussions;
  }
  catch {
    return [];
  }
};
