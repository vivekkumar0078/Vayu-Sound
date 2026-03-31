import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Menu, X, Volume2, Wind, Sparkles, 
  PlayCircle, Music, Flower, Disc, 
  Settings, Languages, Mic, Zap, Play, Keyboard
} from 'lucide-react';

const TRANSLATIONS = {
  en: { 
    title: "Vayu", subtitle: "The Breath of Sound", start: "Enter the Flow", 
    keys: "Play with Numbers (1-9) or Letters (Q-O)", lang: "Language", vol: "Master Volume",
    record: "Record Session", stop: "Stop & Save", recording: "Recording..."
  },
  hi: { 
    title: "वायु", subtitle: "ध्वनि की श्वास", start: "प्रवाह में प्रवेश करें", 
    keys: "संख्याओं (1-9) या अक्षरों (Q-O) के साथ खेलें", lang: "भाषा", vol: "आवाज",
    record: "रिकॉर्ड करें", stop: "रोकें और सहेजें", recording: "रिकॉर्डिंग जारी..."
  }
};

const NOTES_DATA = [
  { id: '1', key: '1', char: 'q', freq: 261.63, name: 'Sa' },
  { id: '2', key: '2', char: 'w', freq: 293.66, name: 'Re' },
  { id: '3', key: '3', char: 'e', freq: 329.63, name: 'Ga' },
  { id: '4', key: '4', char: 'r', freq: 349.23, name: 'Ma' },
  { id: '5', key: '5', char: 't', freq: 392.00, name: 'Pa' },
  { id: '6', key: '6', char: 'y', freq: 440.00, name: 'Dha' },
  { id: '7', key: '7', char: 'u', freq: 493.88, name: 'Ni' },
  { id: '8', key: '8', char: 'i', freq: 523.25, name: 'Sa+' },
  { id: '9', key: '9', char: 'o', freq: 587.33, name: 'Re+' },
];

const INSTRUMENTS = [
  { 
    id: 'trumpet', name: { en: 'Trumpet', hi: 'तुरही' }, 
    harmonics: [1, 0.8, 0.6, 0.4, 0.2], 
    attack: 0.05, release: 0.2, sustain: 0.7, type: 'sawtooth' as OscillatorType, 
    filterStart: 200, filterEnd: 3500, filterEnv: 0.1, Q: 4,
    vibrato: 5.5, vibratoDepth: 5, detune: 4,
    art: 'paisley', theme: 'from-amber-900 via-orange-950 to-black', color: '#fbbf24'
  },
  { 
    id: 'sitar', name: { en: 'Sitar', hi: 'सितार' }, 
    harmonics: [1, 0.4, 1.2, 0.7, 1.8, 0.3], 
    attack: 0.005, release: 2.5, sustain: 0.2, type: 'triangle' as OscillatorType, 
    filterEnd: 6000, detune: 15,
    art: 'kalamkari', theme: 'from-orange-900 via-red-950 to-stone-950', color: '#f97316'
  },
  { 
    id: 'bansuri', name: { en: 'Bansuri', hi: 'बांसुरी' }, 
    harmonics: [1, 0.15, 0.05], 
    attack: 0.18, release: 0.8, sustain: 0.8, type: 'sine' as OscillatorType, 
    noise: 0.35, filterEnd: 2000, Q: 1.2,
    art: 'forest', theme: 'from-emerald-900 via-teal-950 to-black', color: '#10b981'
  },
  { 
    id: 'harmonium', name: { en: 'Harmonium', hi: 'हारमोनियम' }, 
    harmonics: [1, 1, 0.65, 0.45, 0.15], 
    attack: 0.12, release: 0.5, sustain: 0.95, type: 'square' as OscillatorType, 
    filterEnd: 1400, Q: 1.5,
    art: 'warli', theme: 'from-rose-900 via-stone-900 to-black', color: '#e11d48'
  },
  { 
    id: 'tanpura', name: { en: 'Tanpura', hi: 'तानपुरा' }, 
    harmonics: [1, 0.5, 0.9, 0.2, 1.1, 0.4],
    attack: 0.6, release: 7.0, sustain: 0.5, type: 'sine' as OscillatorType, 
    filterEnd: 900, Q: 4,
    art: 'mandala', theme: 'from-indigo-900 via-purple-950 to-black', color: '#6366f1'
  }
];

const Visualizer = ({ analyser, color }: { analyser: AnalyserNode | null, color: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animationId: number;
    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `${color}${Math.floor(dataArray[i] / 2).toString(16).padStart(2, '0')}`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
    return () => cancelAnimationFrame(animationId);
  }, [analyser, color]);

  return <canvas ref={canvasRef} className="w-full h-24 opacity-40" width={800} height={96} />;
};

const ArtBackground = ({ type, activeColor }: { type: string, activeColor: string }) => {
  const patterns: Record<string, React.ReactNode> = {
    kalamkari: (
      <pattern id="kalamkari" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
        <path d="M100 20 Q130 50 100 100 Q70 150 100 180" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </pattern>
    ),
    forest: (
      <pattern id="forest" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
        <path d="M75 10 L85 40 L115 40 L90 60 L100 90 L75 70 L50 90 L60 60 L35 40 L65 40 Z" fill="none" stroke="currentColor" strokeWidth="1" />
      </pattern>
    ),
    warli: (
      <pattern id="warli" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
        <circle cx="40" cy="40" r="12" fill="currentColor" opacity="0.3"/>
        <path d="M40 52 L20 90 L60 90 Z" fill="currentColor" opacity="0.3"/>
      </pattern>
    ),
    mandala: (
      <pattern id="mandala" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
        <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="150" cy="150" r="100" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="10 5" />
      </pattern>
    ),
    paisley: (
      <pattern id="paisley" x="0" y="0" width="250" height="250" patternUnits="userSpaceOnUse">
        <path d="M125 200 C125 100 225 100 225 50 C225 0 125 0 125 50 C125 100 25 100 25 200 Z" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(45 125 125)" />
      </pattern>
    )
  };

  return (
    <div className="absolute inset-0 transition-all duration-1000 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay animate-liquid-slow" 
        style={{ background: `radial-gradient(circle at 50% 50%, ${activeColor}, transparent 70%)` }} />
      <svg className="absolute inset-0 w-full h-full opacity-20 transition-all duration-1000" style={{ color: activeColor }}>
        <defs>{patterns[type]}</defs>
        <rect width="100%" height="100%" fill={`url(#${type})`} />
      </svg>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 blur-[120px] rounded-full opacity-30 animate-pulse transition-all duration-1000" style={{ backgroundColor: activeColor }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 blur-[100px] rounded-full opacity-20 animate-float transition-all duration-1000" style={{ backgroundColor: activeColor }} />
    </div>
  );
};

export default function App() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [masterGain, setMasterGain] = useState<GainNode | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  const [instrument, setInstrument] = useState(INSTRUMENTS[0]);
  const [volume, setVolume] = useState(0.5);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeVoices = useRef<Record<string, { oscillators: any[], gain: GainNode }>>({});
  const t = TRANSLATIONS[lang];

  const initAudio = () => {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    const ctx = new AudioContextClass();
    const gainNode = ctx.createGain();
    const analyzerNode = ctx.createAnalyser();
    analyzerNode.fftSize = 256;
    gainNode.gain.value = volume;
    gainNode.connect(analyzerNode);
    analyzerNode.connect(ctx.destination);
    setAudioContext(ctx);
    setMasterGain(gainNode);
    setAnalyser(analyzerNode);
    setIsReady(true);
  };

  useEffect(() => {
    if (masterGain && audioContext) masterGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.05);
  }, [volume, masterGain, audioContext]);

  const startRecording = () => {
    if (!audioContext || !masterGain) return;
    const dest = audioContext.createMediaStreamDestination();
    masterGain.connect(dest);
    const mediaRecorder = new MediaRecorder(dest.stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => e.data.size > 0 && audioChunksRef.current.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Vayu_Session_${Date.now()}.wav`;
      link.click();
    };
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playNote = useCallback((id: string) => {
    const note = NOTES_DATA.find(n => n.id === id || n.key === id || n.char === id.toLowerCase());
    if (!note || !audioContext || !masterGain || activeVoices.current[note.id]) return;

    const time = audioContext.currentTime;
    const voiceGroup: any[] = [];
    const mainGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const panner = audioContext.createStereoPanner();
    
    panner.pan.setValueAtTime((Math.random() - 0.5) * 0.4, time);
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(instrument.Q || 1, time);
    
    if (instrument.id === 'trumpet') {
        filter.frequency.setValueAtTime(instrument.filterStart || 200, time);
        filter.frequency.exponentialRampToValueAtTime(instrument.filterEnd, time + (instrument.filterEnv || 0.1));
    } else {
        filter.frequency.setValueAtTime(instrument.filterEnd, time);
    }
    
    instrument.harmonics.forEach((vol, i) => {
      const osc = audioContext.createOscillator();
      const g = audioContext.createGain();
      osc.type = instrument.id === 'trumpet' ? (i === 0 ? 'sawtooth' : 'square') : instrument.type;
      osc.frequency.setValueAtTime(note.freq * (i + 1), time);
      
      if (instrument.vibrato) {
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        lfo.frequency.setValueAtTime(instrument.vibrato + Math.random(), time);
        lfoGain.gain.setValueAtTime(instrument.vibratoDepth || 5, time);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(time);
        voiceGroup.push(lfo);
      }
      
      if (instrument.detune) osc.detune.setValueAtTime(Math.random() * instrument.detune, time);
      g.gain.setValueAtTime(vol * (0.3 / (i + 1)), time);
      osc.connect(g);
      g.connect(mainGain);
      osc.start(time);
      voiceGroup.push(osc);
    });

    // Breath/Noise synthesis
    const bufferSize = audioContext.sampleRate * 0.5;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(instrument.noise || 0.05, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    noise.connect(noiseGain);
    noiseGain.connect(mainGain);
    noise.start(time);
    voiceGroup.push(noise);

    mainGain.gain.setValueAtTime(0, time);
    mainGain.gain.linearRampToValueAtTime(1, time + instrument.attack);
    mainGain.gain.exponentialRampToValueAtTime(instrument.sustain || 0.8, time + instrument.attack + 0.05);
    mainGain.connect(filter);
    filter.connect(panner);
    panner.connect(masterGain);

    activeVoices.current[note.id] = { oscillators: voiceGroup, gain: mainGain };
    setActiveKeys(prev => ({ ...prev, [note.id]: true }));
  }, [audioContext, masterGain, instrument]);

  const stopNote = useCallback((id: string) => {
    const note = NOTES_DATA.find(n => n.id === id || n.key === id || n.char === id.toLowerCase());
    if (!note || !activeVoices.current[note.id] || !audioContext) return;
    
    const { oscillators, gain } = activeVoices.current[note.id];
    const time = audioContext.currentTime;
    gain.gain.cancelScheduledValues(time);
    gain.gain.setValueAtTime(gain.gain.value, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + instrument.release);
    
    setTimeout(() => {
      oscillators.forEach(o => o.stop && o.stop());
      oscillators.forEach(o => o.disconnect && o.disconnect());
    }, instrument.release * 1000 + 100);
    
    delete activeVoices.current[note.id];
    setActiveKeys(prev => ({ ...prev, [note.id]: false }));
  }, [audioContext, instrument]);

  useEffect(() => {
    const d = (e: KeyboardEvent) => !e.repeat && playNote(e.key);
    const u = (e: KeyboardEvent) => stopNote(e.key);
    window.addEventListener('keydown', d); window.addEventListener('keyup', u);
    return () => { window.removeEventListener('keydown', d); window.removeEventListener('keyup', u); };
  }, [playNote, stopNote]);

  if (!isReady) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-stone-950 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 animate-spin-extra-slow" style={{ background: 'conic-gradient(from 0deg, #ff3366, #ff9933, #ffd700, #33cc66, #3399ff, #9933ff, #ff3366)' }} />
        <div className="absolute inset-0 backdrop-blur-[140px] bg-stone-950/40" />
        <div className="relative text-center space-y-12 max-w-lg w-full p-16 bg-white/5 backdrop-blur-[100px] rounded-[4.5rem] border border-white/10 shadow-2xl animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="p-8 bg-white/5 rounded-full border border-white/10 animate-float">
              <Music size={80} strokeWidth={1} className="text-white" />
            </div>
          </div>
          <h1 className="text-8xl font-serif font-black italic tracking-tighter bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent">Vayu</h1>
          <button onClick={initAudio} className="w-full py-6 bg-white text-black hover:bg-white/80 rounded-full text-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-4 group">
            <PlayCircle /> {t.start}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-full transition-all duration-1000 bg-gradient-to-br ${instrument.theme} text-white flex flex-col relative overflow-hidden font-sans`}>
      <ArtBackground type={instrument.art} activeColor={instrument.color} />
      
      <div className={`fixed inset-y-0 left-0 w-80 bg-stone-950/90 backdrop-blur-[120px] z-[100] transition-transform duration-700 ease-out border-r border-white/10 shadow-2xl flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-10 flex items-center justify-between border-b border-white/5">
          <div className="font-serif font-black italic text-2xl tracking-tighter">Vayu</div>
          <button onClick={() => setIsMenuOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={20}/></button>
        </div>
        <div className="flex-1 p-8 space-y-8">
           <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-widest font-black opacity-30">Studio</p>
              <button onClick={isRecording ? stopRecording : startRecording} className={`w-full p-4 rounded-2xl text-left flex items-center gap-4 transition-all ${isRecording ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 hover:bg-white/10'}`}>
                {isRecording ? <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /> : <Mic size={18}/>}
                {isRecording ? t.stop : t.record}
              </button>
           </div>
           <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-widest font-black opacity-30">Language</p>
              <div className="flex gap-2">
                <button onClick={() => setLang('en')} className={`flex-1 p-3 rounded-xl transition-all ${lang === 'en' ? 'bg-white text-black' : 'bg-white/5'}`}>EN</button>
                <button onClick={() => setLang('hi')} className={`flex-1 p-3 rounded-xl transition-all ${lang === 'hi' ? 'bg-white text-black' : 'bg-white/5'}`}>हि</button>
              </div>
           </div>
        </div>
      </div>

      <header className="p-6 md:p-8 flex items-center justify-between backdrop-blur-[80px] bg-white/5 border-b border-white/10 z-50">
        <div className="flex items-center gap-8">
          <button onClick={() => setIsMenuOpen(true)} className="p-4 bg-white/5 hover:bg-white/15 rounded-3xl border border-white/10 transition-all active:scale-90 shadow-xl group">
            <Menu size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-black italic leading-none tracking-tighter opacity-90">Vayu</h2>
            <p className="text-[9px] uppercase tracking-[0.5em] opacity-40 font-bold mt-2">{t.subtitle}</p>
          </div>
        </div>
        <div className="hidden lg:block flex-1 max-w-md mx-8"><Visualizer analyser={analyser} color={instrument.color} /></div>
        <div className="flex items-center gap-6 bg-black/20 px-8 py-4 rounded-full border border-white/5 shadow-inner">
          <Volume2 size={16} className="opacity-40" />
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-24 accent-white" />
        </div>
      </header>

      <nav className="z-40 flex justify-center py-6 md:py-10 px-4">
        <div className="flex bg-white/5 p-2 rounded-[3rem] border border-white/10 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar max-w-full">
          {INSTRUMENTS.map(inst => (
            <button key={inst.id} onClick={() => setInstrument(inst)} 
              className={`px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-700 whitespace-nowrap flex items-center gap-3 ${
                instrument.id === inst.id ? 'bg-white text-black scale-105 shadow-xl' : 'text-white/40 hover:text-white'
              }`}>
              {inst.id === 'trumpet' ? <Zap size={14}/> : inst.id === 'bansuri' ? <Wind size={14}/> : <Sparkles size={14}/>}
              {inst.name[lang]}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-4">
          <div className="relative flex flex-col items-center gap-8">
             <div className="relative">
                <div className="absolute inset-0 blur-[120px] rounded-full opacity-40 animate-pulse" style={{ backgroundColor: instrument.color }} />
                {Object.keys(activeKeys).some(k => activeKeys[k]) 
                  ? <div className="animate-liquid-float scale-110" style={{color: instrument.color}}><Sparkles size={220}/></div>
                  : <Flower size={240} strokeWidth={0.5} className="animate-spin-extra-slow opacity-20 text-white" />
                }
             </div>
             <p className="text-[10px] md:text-xs uppercase tracking-[0.5em] font-black text-white/30 flex items-center gap-3"><Keyboard size={14} /> {t.keys}</p>
          </div>
      </main>

      <footer className="p-8 md:p-12 bg-white/5 backdrop-blur-[120px] border-t border-white/10 z-40">
        <div className="max-w-7xl mx-auto grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-4 md:gap-6">
          {NOTES_DATA.map((note) => {
            const active = activeKeys[note.id];
            return (
              <button key={note.id}
                onMouseDown={() => playNote(note.id)} onMouseUp={() => stopNote(note.id)} onMouseLeave={() => stopNote(note.id)}
                onTouchStart={(e) => { e.preventDefault(); playNote(note.id); }} onTouchEnd={(e) => { e.preventDefault(); stopNote(note.id); }}
                className={`group relative aspect-square flex flex-col items-center justify-center rounded-[2rem] md:rounded-[3.5rem] transition-all duration-150 border-2 overflow-hidden ${
                  active ? 'scale-90 border-white bg-white' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className={`absolute inset-0 flex items-center justify-center transition-all ${active ? 'opacity-10 scale-150' : 'opacity-0'}`}><Play fill="black" size={80} /></div>
                <div className={`flex flex-col items-center transition-all duration-300 ${active ? 'scale-110' : ''}`}>
                   <span className={`text-3xl md:text-4xl font-black italic tracking-tighter leading-none ${active ? 'text-black' : 'text-white'}`}>{note.key}</span>
                   <div className={`mt-2 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-widest ${active ? 'bg-black text-white border-black' : 'bg-white/5 text-white/40 border-white/10'}`}>{note.char}</div>
                </div>
                <span className={`absolute bottom-4 text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${active ? 'text-black/40' : 'text-white/20'}`}>{note.name}</span>
                {active && <div className="absolute inset-0 animate-ping opacity-20 bg-white rounded-full" />}
              </button>
            );
          })}
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes liquid-slow { 0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: scale(1) rotate(0deg); } 50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: scale(1.1) rotate(5deg); } }
        @keyframes liquid-float { 0%, 100% { transform: translateY(0) scale(1); filter: blur(0px); } 50% { transform: translateY(-20px) scale(1.05); filter: blur(2px); } }
        @keyframes spin-extra-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
        @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-liquid-slow { animation: liquid-slow 20s ease-in-out infinite; }
        .animate-liquid-float { animation: liquid-float 4s ease-in-out infinite; }
        .animate-spin-extra-slow { animation: spin-extra-slow 80s linear infinite; }
        .animate-float { animation: float 10s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}

