// js/speech.js

// Языки, для которых используем Google Translate TTS (прямая ссылка)
const USE_GOOGLE_TTS = ['hu']; // венгерский, польский

export function speak(text, lang = 'en') {
  if (!text) return;
  const baseLang = lang.split('-')[0];

  if (USE_GOOGLE_TTS.includes(baseLang)) {
    speakViaGoogleTTS(text, baseLang);
    return;
  }

  // Стандартный Web Speech API для других языков
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

// Прямое воспроизведение аудио с Google Translate (без fetch, без CORS)
let currentGoogleAudio = null;

function speakViaGoogleTTS(text, langCode) {
  if (currentGoogleAudio) {
    currentGoogleAudio.pause();
    currentGoogleAudio = null;
  }

  // Используем translate.googleapis.com и client=gtx – часто не блокируется
  const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=${langCode}&client=gtx&q=${encodeURIComponent(text)}`;
  const audio = new Audio(url);
  currentGoogleAudio = audio;

  audio.onended = audio.onerror = () => {
    currentGoogleAudio = null;
  };

  audio.play().catch(err => {
    console.warn('Не удалось воспроизвести Google TTS:', err.message);
    currentGoogleAudio = null;
  });
}

function getBestVoice(lang) {
  const allVoices = window.speechSynthesis.getVoices();
  if (!allVoices.length) return null;

  const baseLang = lang.split('-')[0];
  const candidates = allVoices.filter(v => v.lang.startsWith(baseLang));
  if (!candidates.length) return null;

  const scored = candidates.map(v => {
    let score = 0;
    if (v.default) score += 10;
    if (v.localService === false) score += 20;
    const name = v.name.toLowerCase();
    if (name.includes('google')) score += 30;
    else if (name.includes('microsoft')) score += 15;
    else if (/samantha|alex|daniel|karen|moira|fiona|veena/.test(name)) score += 10;
    return { voice: v, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].voice;
}