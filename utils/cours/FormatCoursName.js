const formatExceptions = new Map([
  // Please keep this list sorted alphabetically
  ['accompagnemt. perso.', 'Accompagnement Personnalisé'],
  ['at. professionnalis.', 'Attelier de Professionnalisation'],
  ['bloc 1 smdsi', 'Bloc 1 Support et Mise à Disposition des Services Informatiques'],
  ['bloc 2 sisr', 'Bloc 2 Solutions d’Infrastructure, Systèmes et Réseaux'],
  ['bloc 2 slam', 'Bloc 2 Solutions Logicielles et Applications Métiers'],
  ['bloc 3 tp', 'Bloc 3 Travaux Pratiques'],
  ['cul.eco.jur.man.app.', 'Culture Économique, Juridique et Managériale Appliquée'],
  ['culture gene.et expr', 'Culture générale et expression'],
  ['cult.eco jur. manag.', 'Culture Économique, Juridique et Managériale'],
  ['education civique', 'Éducation civique'],
  ['enseign.scientifique', 'Enseignement scientifique'],
  ['ed.physique & sport.', 'Éducation Physique et Sportive'],
  ['education musicale', 'Éducation musicale'],
  ['education physique et sportive', 'Éducation Physique et Sportive'],
  ['eps', 'Éducation Physique et Sportive'],
  ['francais', 'Français'],
  ['histoire geo', 'Histoire-Géo'],
  ['histoire-geo', 'Histoire-Géo'],
  ['histoire & geograph.', 'Histoire-Géo'],
  ['histoire-geographie', 'Histoire-Géographie'],
  ['human.litter.philo', 'Humanités, Littérature & Philosophie'],
  ['llc angl.mond.cont.', 'LLCER Anglais Monde Contemporain'],
  ['maths pour informatq', 'Mathématiques pour l’informatique'],
  ['mathematiques', 'Mathématiques'],
  ['math 1ere', 'Mathématiques 1ère'],
  ['numerique sc.inform.', 'Numérique et Sciences Informatiques'],
  ['physique-chimie', 'Physique-Chimie'],
  ['sc.econo & sociales', 'Sciences Économiques et Sociales'],
  ['sciences de la vie et de la terre', 'Sciences de la Vie et de la Terre'],
  ['sciences vie & terre', 'Sciences de la Vie et de la Terre'],
  ['sciences economiques et sociales', 'Sciences Économiques et Sociales'],
  ['sc.numeriq.technol.', 'Sciences Numériques et Technologie'],
  ['vie de classe', 'Vie de classe'],
]);

const lengthExceptions = new Set(['vie', 'de', 'des', 'et', 'la']);

function formatCoursName(name) {
  let formattedName = name
    .split(' ')
    .map((word) => {
      if (word.length > 3 || lengthExceptions.has(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word;
    })
    .join(' ');

  if (formatExceptions.has(formattedName.toLowerCase())) {
    formattedName = formatExceptions.get(formattedName.toLowerCase());
  }

  return formattedName;
}

export default formatCoursName;