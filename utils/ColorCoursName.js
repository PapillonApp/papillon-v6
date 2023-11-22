import SyncStorage from 'sync-storage';

SyncStorage.init();

const colors = [
  '#2667a9',
  '#76a10b',
  '#3498DB',
  '#1ABC9C',
  '#a01679',
  '#27AE60',
  '#156cd6',
  '#F39C12',
  '#E67E22',
  '#D35400',
  '#2C3E50',
  '#E74C3C',
  '#C0392B',
  '#8E44AD',
  '#ad4491',
  '#9f563b',
  '#920205',
];

function hexToRGB(_hex) {
  // Remove '#' if present
  const hex = _hex.replace('#', '');

  // Split into RGB components
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

function calculateDistance(color1, color2) {
  const dr = color1.r - color2.r;
  const dg = color1.g - color2.g;
  const db = color1.b - color2.b;

  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function findClosestColor(hexColor, colorList) {
  const inputColor = hexToRGB(hexColor);
  let closestColor = null;
  let closestDistance = Infinity;

  for (const color of colorList) {
    const distance = calculateDistance(inputColor, hexToRGB(color));

    if (distance < closestDistance) {
      closestColor = color;
      closestDistance = distance;
    }
  }

  return closestColor;
}

function getClosestColor(hexColor) {
  return findClosestColor(hexColor, colors);
}

function getClosestCourseColor(courseName) {
  // Fonction pour générer une valeur de hachage à partir du nom du cours
  function hashCode(str) {
    let hash = 5;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i) + 1;
      // eslint-disable-next-line no-bitwise
      hash = (hash << 5) - hash + char;
    }
    return hash;
  }

  // Générer une valeur de hachage à partir du nom du cours
  const hash = hashCode(courseName);

  // Introduire des facteurs multiplicatifs pour augmenter la variété des couleurs7
  const multiplierR = 32;
  const multiplierG = 26;
  const multiplierB = 22;

  // Calculer les composantes RVB de la couleur à partir de la valeur de hachage et des facteurs multiplicatifs
  const r = Math.abs(((hash * multiplierR * hash) / 0.7) % 231);
  const g = Math.abs(((hash * multiplierG * hash) / 1.6) % 213);
  const b = Math.abs(((hash * multiplierB * hash) / 0.5) % 246);

  // Convertir les composantes RVB en format HEX
  const hexColor = `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  return hexColor;
}

function normalizeCoursName(courseName = '') {
  // remove accents and lowercase
  courseName = courseName
    ?.normalize('NFD')
    ?.replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  // remove spaces
  courseName = courseName.replace(/\s/g, '');
  // remove special characters
  courseName = courseName.replace(/[^a-zA-Z0-9]/g, '');
  return courseName;
}

function getSavedCourseColor(courseName, courseColor) {
  courseColor = getClosestColor(courseColor);
  
  let originalCourseName = courseName;
  courseName = normalizeCoursName(courseName);
  let savedColors = SyncStorage.get('savedColors');
  if (savedColors) {
    savedColors = JSON.parse(savedColors);
  } else {
    savedColors = {};
  }

  if (savedColors[courseName] && savedColors[courseName].color) {
    return savedColors[courseName].color;
  }
  // find a color that is not used
  const color = courseColor;
  savedColors[courseName] = {
    color: color,
    originalCourseName: originalCourseName,
    systemCourseName: courseName,
  };
  SyncStorage.set('savedColors', JSON.stringify(savedColors));
  return color;
}

function forceSavedCourseColor(courseName, courseColor) {
  courseName = normalizeCoursName(courseName);
  let savedColors = SyncStorage.get('savedColors');
  if (savedColors) {
    savedColors = JSON.parse(savedColors);
  } else {
    savedColors = {};
  }

  const color = courseColor;
  savedColors[courseName].color = color;
  SyncStorage.set('savedColors', JSON.stringify(savedColors));
  return color;
}

export default getClosestColor;
export { getClosestCourseColor, getSavedCourseColor, forceSavedCourseColor };
