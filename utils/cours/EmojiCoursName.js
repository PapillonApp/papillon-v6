function getClosestGradeEmoji(subjectName) {
  const gradeEmojiList = {
    numerique: '💻',
    SI: '💻',
    SNT: '💻',
    travaux: '⚒',
    travail:'💼',
    moral: '⚖️',
    env:'🌿',
    sport: '🏀',
    EPS: '🏀',
    econo: '📈',
    francais: '📚',
    anglais: '🇬🇧',
    allemand: '🇩🇪',
    espagnol: '🇪🇸',
    latin: '🏛️',
    italien: '🇮🇹',
    histoire: '📜',
    EMC: '🤝',
    hist: '📜',
    llc: '🌍',
    scientifique: '🔬',
    arts: '🎨',
    philosophie: '🤔',
    math: '📐',
    phys: '🧪',
    accomp: '👨‍🏫',
    tech: '🔧',
    ingenieur: '🔧',
    musique: '🎼',
    musical: '🎼',
    classe: '🏫',
    vie: '🧬',
    SES: '💰',
    stage: '👔',
    œuvre:'🖼️',
    default: '📝',
  };

  const subjectNameFormatted = subjectName
    .toLowerCase()
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // sort keys by length in descending order
  const sortedKeys = Object.keys(gradeEmojiList).sort((a, b) => b.length - a.length);

  // get emoji with key in subject name
  const closest = sortedKeys.find(key => subjectNameFormatted.includes(key)) || 'default';

  return gradeEmojiList[closest];
}

export default getClosestGradeEmoji;