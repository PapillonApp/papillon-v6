/**
 * Took from <https://flaviocopes.com/how-to-check-dates-same-day-javascript/>.
 */
export const datesAreOnSameDay = (first: Date, second: Date): boolean =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export const dateToFrenchFormat = (date: Date): string => date.toLocaleDateString('fr-FR');
