function getClosestGradeEmoji(subjectName) {
  const gradeEmojiList = {
    numerique: '💻',
    moral: '⚖️',
    sport: '🏀',
    econo: '📈',
    francais: '📚',
    anglais: '🇬🇧',
    allemand: '🇩🇪',
    espagnol: '🇪🇸',
    latin: '🇮🇹',
    italien: '🇮🇹',
    histoire: '📜',
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
    stage: '👔',
    default: '📝',
  };

  const subjectNameFormatted = subjectName
    .toLowerCase()
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // get emoji with key in subject name
  const closest = Object.keys(gradeEmojiList).reduce((a, b) =>
    subjectNameFormatted.includes(a) ? a : b
  );

  return gradeEmojiList[closest];
}

export default getClosestGradeEmoji;
