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
    musique: '🎼',
    musical: '🎼',
    vie: '🧬',
    stage: '👔',
    default: '📝',
  };

  // get emoji with key in subject name
  const closest = Object.keys(gradeEmojiList).reduce((a, b) =>
    subjectName.toLowerCase().includes(a) ? a : b
  );

  return gradeEmojiList[closest];
}

export default getClosestGradeEmoji;
