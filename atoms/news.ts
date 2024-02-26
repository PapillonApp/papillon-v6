import { atom } from 'jotai';

/**
 * Atom that contains the current news notifications.
 * Is `0` when loading all the news from cache or network.
 */
export const newsAtom = atom<number>(0);
