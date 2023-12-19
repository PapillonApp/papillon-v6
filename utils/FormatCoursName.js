const formatExceptions = {
  // Please keep this list sorted alphabetically
  'accompagnemt. perso.': 'Accompagnement Personnalisé',
  'at. professionnalis.': 'Attelier de Professionnalisation',
  'bloc 1 smdsi': 'Bloc 1 Support et Mise à Disposition des Services Informatiques',
  'bloc 2 sisr': 'Bloc 2 Solutions d’Infrastructure, Systèmes et Réseaux',
  'bloc 2 slam': 'Bloc 2 Solutions Logicielles et Applications Métiers',
  'bloc 3 tp': 'Bloc 3 Travaux Pratiques',
  'cul.eco.jur.man.app.': 'Culture Économique, Juridique et Managériale Appliquée',
  'culture gene.et expr': 'Culture générale et expression',
  'cult.eco jur. manag.': 'Culture Économique, Juridique et Managériale',
  'education civique': 'Éducation civique',
  'ed.physique & sport.': 'Éducation Physique et Sportive',
  'education musicale': 'Éducation musicale',
  'education physique et sportive': 'Éducation Physique et Sportive',
  'francais': 'Français',
  'histoire & geograph.': 'Histoire-Géo',
  'histoire-geographie': 'Histoire-Géographie',
  'llc angl.mond.cont.': 'LLCER Anglais Monde Contemporain',
  'maths pour informatq': 'Mathématiques pour l’informatique',
  'mathematiques': 'Mathématiques',
  'numerique sc.inform.': 'Numérique et Sciences Informatiques',
  'physique-chimie': 'Physique-Chimie',
  'sc.econo & sociales': 'Sciences Économiques et Sociales',
  'sciences de la vie et de la terre': 'Sciences de la Vie et de la Terre',
  'sciences economiques et sociales': 'Sciences Économiques et Sociales',
  'sc.numeriq.technol.': 'Sciences Numériques et Technologie',
  'vie de classe': 'Vie de classe',
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
