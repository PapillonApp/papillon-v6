/* give 50 random colors of all hues but with enough contrast with white text */
const colors = [
  '#2C3E50',
  '#34495E',
  '#2980B9',
  '#3498DB',
  '#1ABC9C',
  '#16A085',
  '#27AE60',
  '#2ECC71',
  '#F39C12',
  '#E49F37',
  '#E67E22',
  '#D35400',
  '#E74C3C',
  '#C0392B',
  '#9B59B6',
  '#8E44AD',
  '#2980B9',
  '#2C3E50',
  '#34495E',
  '#3498DB',
  '#1ABC9C',
  '#16A085',
  '#27AE60',
  '#2ECC71',
  '#F39C12',
  '#E49F37',
  '#E67E22',
  '#D35400',
  '#E74C3C',
  '#C0392B',
  '#9B59B6',
  '#8E44AD',
  '#2980B9',
  '#2C3E50',
  '#34495E',
  '#3498DB',
  '#1ABC9C',
  '#16A085',
  '#27AE60',
  '#2ECC71',
  '#F39C12',
  '#E49F37',
  '#E67E22',
  '#D35400',
  '#E74C3C',
  '#C0392B',
  '#9B59B6',
  '#8E44AD',
  '#2980B9',
  '#2C3E50',
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

const standardizedCourseColor = {
  "francais": 32,
  "mathematiques": 14,
  "histoire": 45,
  "sciences": 7,
  "anglais": 23,
  "geographie": 5,
  "physique": 18,
  "chimie": 9,
  "biologie": 38,
  "informatique": 11,
  "musique": 29,
  "art": 42,
  "education physique": 21,
  "philosophie": 47,
  "economie": 36,
  "espagnol": 10,
  "psychologie": 27,
  "sociologie": 4,
  "droit": 2,
  "management": 44,
  "marketing": 12,
  "finance": 33,
  "comptabilite": 6,
  "astronomie": 22,
};

function calculateStringDistance(str1, str2) {
  // This function calculates the Levenshtein distance between two strings.
  const m = str1.length;
  const n = str2.length;
  const dp = [];

  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

function removeAccentsAndLowercase(inputString) {
  // Convert the string to lowercase
  const lowercaseString = inputString.toLowerCase();

  // Use a regular expression to replace accented characters with their non-accented equivalents
  const normalizedString = lowercaseString.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return normalizedString;
}

function getClosestCourseColor(courseName) {
  courseName = removeAccentsAndLowercase(courseName);

  let closestMatch = null;
  let minDistance = Infinity;

  // Iterate through the course names in the standardizedCourseColor object
  for (const key in standardizedCourseColor) {
    const distance = calculateStringDistance(courseName, key);

    // Check if the current course name is closer than the previous closest match
    if (distance < minDistance) {
      closestMatch = key;
      minDistance = distance;
    }
  }

  // If no match was found, return a random color from the colors array
  if (closestMatch === null) {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Return the color associated with the closest matching course name
  return colors[standardizedCourseColor[closestMatch]];
}

export default getClosestColor;
export { getClosestCourseColor };