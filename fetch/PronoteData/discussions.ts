import type { Pronote } from 'pawnote';
import type { PapillonDiscussion, PapillonDiscussionMessage } from '../types/discussions';

const makeLocalID = (subject: string, date: string) => `${subject.substring(0, 3)}${date}`;

export const discussionsHandler = async (instance?: Pronote): Promise<PapillonDiscussion[]> => {
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
          amountOfRecipients: message.amountOfRecipients,
          files: message.files.map(file => ({
            name: file.name,
            url: file.url
          }))
        });
      }

      discussions.push({
        local_id: makeLocalID(discussion.subject, discussion.dateAsFrenchText),
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

export const discussionsRecipientsHandler = async (localDiscussionID: string, instance?: Pronote): Promise<string[]> => {
  try {
    const overview = await instance?.getDiscussionsOverview();
    if (!overview) return [];

    const discussion = overview.discussions.find(discussion => makeLocalID(discussion.subject, discussion.dateAsFrenchText) === localDiscussionID);
    if (!discussion) return [];

    const recipients = await discussion.fetchRecipients();
    return recipients.map(recipient => recipient.name);
  }
  catch {
    console.warn('[pronote:discussionsRecipientsHandler]: error occurred, returning empty array.');
    return [];
  }
};
