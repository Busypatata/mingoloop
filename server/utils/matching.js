// Do the two users' languages overlap in a way that would make them a
// language-exchange match — i.e. one speaks natively what the other is
// learning, in either direction? This is the same "language factor" used in
// userController's compatibility scoring, pulled out here so profileVisibility
// and messagePermission's 'Matches' option can reuse the exact same rule.
export function isLanguageMatch(a, b) {
  const aNative = new Set((a.nativeLanguages || []).map((l) => l.language.toLowerCase()));
  const aLearning = new Set((a.learningLanguages || []).map((l) => l.language.toLowerCase()));
  const bNative = new Set((b.nativeLanguages || []).map((l) => l.language.toLowerCase()));
  const bLearning = new Set((b.learningLanguages || []).map((l) => l.language.toLowerCase()));

  const aLearnsWhatBSpeaks = [...aLearning].some((lang) => bNative.has(lang));
  const bLearnsWhatASpeaks = [...bLearning].some((lang) => aNative.has(lang));

  return aLearnsWhatBSpeaks || bLearnsWhatASpeaks;
}
