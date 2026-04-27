// js/speech.js

// Языки, которые проксируем через наш сервер
const USE_PROXY_TTS = [];   // венгерский, польский

export function speak(text, lang = 'en') {
  if (!text) return;
  if (window.appSettings && !window.appSettings.speechEnabled) return; // глобальное отключение озвучки
  const baseLang = lang.split('-')[0];

  if (USE_PROXY_TTS.includes(baseLang)) {
    speakViaProxy(text, baseLang);
    return;
  }

  // Остальные языки — как раньше, через Web Speech API
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

let currentAudio = null;

// В файле js/speech.js обнови функцию
function speakViaProxy(text, langCode) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  // Если открыто через Live Server (порт 5500), стучимся на локальный бэк (порт 3000)
  // На Рендере baseUrl будет пустой строкой
  const baseUrl = window.location.port === '5500' ? 'http://localhost:3000' : '';
  const url = `${baseUrl}/api/tts?text=${encodeURIComponent(text)}&lang=${langCode}`;
  
  const audio = new Audio(url);
  currentAudio = audio;

  audio.play().catch(err => {
    console.warn('Ошибка воспроизведения:', err.message);
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