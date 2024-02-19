import { atom } from 'jotai';
import type { PapillonDiscussion } from '../fetch/types/discussions';

/**
 * Atom that contains the current discussions.
 * Is `null` when loading all the discussions from cache or network.
 */
export const discussionsAtom = atom<PapillonDiscussion[] | null>(null);
