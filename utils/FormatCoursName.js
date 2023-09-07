const formatExceptions = {
  mathematiques: 'Mathématiques',
  francais: 'Français',
  'physique-chimie': 'Physique-Chimie',
  'vie de classe': 'Vie de classe',
  'education civique': 'Éducation civique',
  'education musicale': 'Éducation musicale',
  'education physique et sportive': 'Éducation physique et sportive',
  'sciences de la vie et de la terre': 'Sciences de la vie et de la terre',
  'histoire-geographie': 'Histoire-Géographie',
  'sciences economiques et sociales': 'Sciences économiques et sociales',
  'llc angl.mond.cont.': 'LLCER Anglais Monde Contemporain',
  'accompagnemt. perso.' : 'Accompagnement personnalisé',
  'numerique sc.inform.': 'Numérique et Sciences Informatiques',
  'ed.physique & sport.': 'Éducation physique et sportive',
};

const lengthExceptions = ['vie', 'de', 'et', 'la'];

function formatCoursName(name) {
  // return name with capitalized words only if they are longer than 3 characters
  let formattedName = name
    .split(' ')
    .map((word) => {
      if (word.length > 3) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      if (lengthExceptions.includes(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word;
    })
    .join(' ');

  // if formatExceptions contains a word contained in formattedName, replace it
  if (Object.keys(formatExceptions).includes(formattedName.toLowerCase())) {
    formattedName = formatExceptions[formattedName.toLowerCase()];
  }

  return formattedName;
}

export default formatCoursName;
