import { Pronote, PronoteApiResourceType } from 'pawnote';
import { type PapillonDiscussion, type PapillonDiscussionMessage, type PapillonRecipient, PapillonRecipientType } from '../types/discussions';

const makeLocalID = (subject: string, date: string) => `${subject.substring(0, 3)}${date}`;

export const discussionsHandler = async (instance?: Pronote): Promise<PapillonDiscussion[]> => {
  try {
    const discussionsOverview = await instance?.getDiscussionsOverview();
    if (!discussionsOverview) return [];

    const discussions: PapillonDiscussion[] = [];
    for (const discussion of discussionsOverview.discussions) {
      const overview = await discussion.fetchMessagesOverview();
      const parsedMessages: PapillonDiscussionMessage[] = [];
      
      for (const message of overview.messages) {
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
        timestamp: overview.messages[0].created.getTime(),
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

const convertPronoteResourceTypeToPapillon = (type: PronoteApiResourceType): PapillonRecipientType => {
  switch (type) {
    case PronoteApiResourceType.Teacher:
      return PapillonRecipientType.TEACHER;
    case PronoteApiResourceType.Personal:
      return PapillonRecipientType.PERSONAL;
    default:
      return PapillonRecipientType.UNKNOWN;
  }
};

const convertPapillonResourceTypeToPronote = (type: PapillonRecipientType): PronoteApiResourceType => {
  switch (type) {
    case PapillonRecipientType.PERSONAL:
      return PronoteApiResourceType.Personal;
    case PapillonRecipientType.TEACHER:
    default:
      return PronoteApiResourceType.Teacher;
  }
};

export const discussionsCreationRecipientsHandler = async (instance?: Pronote): Promise<PapillonRecipient[]> => {
  try {
    const types: (PronoteApiResourceType.Teacher | PronoteApiResourceType.Personal)[] = [];
    if (!instance) return [];

    if (instance.authorizations.canDiscussWithStaff) {
      types.push(PronoteApiResourceType.Personal);
    }

    if (instance.authorizations.canDiscussWithTeachers) {
      types.push(PronoteApiResourceType.Teacher);
    }

    const recipients = await Promise.all(types.map(type => instance.getRecipientsForDiscussionCreation(type)));

    return recipients.flat().map(recipient => ({
      id: recipient.id,
      type: convertPronoteResourceTypeToPapillon(recipient.type),
      name: recipient.name,
      functions: recipient.subjects.map(subject => subject.name)
    }));
  }
  catch {
    console.warn('[pronote:discussionsRecipientsHandler]: error occurred, returning empty array.');
    return [];
  }
};

export const discussionsCreationHandler = async (subject: string, content: string, recipients: PapillonRecipient[], instance?: Pronote): Promise<void> => {
  try {
    if (!instance) throw new Error('No instance available.');

    const parsedRecipients = recipients.map(r => ({
      id: r.id,
      type: convertPapillonResourceTypeToPronote(r.type),
    }));

    // @ts-expect-error : parsedRecipients is only implementing half of the needed class, but in fact we're only using
    // the id and type fields in the pawnote api call.
    await instance.createDiscussion(subject, content, parsedRecipients);
  }
  catch (error) {
    console.error('[pronote:discussionsCreationHandler] Failed to create discussion.');
    console.error(error);
  }
};
