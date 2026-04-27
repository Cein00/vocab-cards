let voicesLoaded = [];
window.speechSynthesis.onvoiceschanged = () => {
  voicesLoaded = window.speechSynthesis.getVoices();
};

function getBestVoice(lang) {
  if (voicesLoaded.length === 0) {
    voicesLoaded = window.speechSynthesis.getVoices();
  }
  const baseLang = lang.split('-')[0];
  const candidates = voicesLoaded.filter(v => v.lang.startsWith(baseLang));
  if (candidates.length === 0) return null;

  // Приоритет по имени голоса (качественные нейросетевые)
  const priorityOrder = [
    'Google US English', 'Google UK English Female', 'Microsoft Zira',
    'Microsoft David', 'Samantha', 'Alex', 'Daniel', 'Karen',
    'Moira', 'Fiona', 'Veena', 'Microsoft Mark'
  ];

  for (const name of priorityOrder) {
    const found = candidates.find(v => v.name.includes(name));
    if (found) return found;
  }
  return candidates[0]; // fallback
}

export function speak(text, lang = 'en') {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  const bestVoice = getBestVoice(lang);
  if (bestVoice) utterance.voice = bestVoice;

  window.speechSynthesis.speak(utterance);
}