export function speak(text, lang = 'en') {
  if (!window.speechSynthesis) {
    alert('Web Speech API не поддерживается в этом браузере.');
    return;
  }
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;

  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}