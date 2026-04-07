import React, { useState, useEffect } from 'react';
import { Scissors, Youtube, Instagram, Video, Download, Sparkles, Loader2, Zap, AlertCircle, TrendingUp, Clock } from 'lucide-react';

// API Gemini untuk Analisis (Masukkan API Key kamu di sini)
const geminiKey = ""; 

const App = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);
  const [renderingIndex, setRenderingIndex] = useState(null);

  const analyzeWithAI = async (videoUrl) => {
    const prompt = `Analisis video ini: ${videoUrl}. Identifikasi 3 momen paling viral. Berikan dalam format JSON: { "videoTitle": "Judul", "clips": [{ "title": "Judul Klip", "start": "00:10", "end": "00:40", "reason": "Alasan", "score": 95 }] }`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 1. Analisis AI
      const analysis = await analyzeWithAI(url);
      setResult(analysis);
      
      // 2. Ambil Link Download Asli dari Backend
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url })
      });
      const videoData = await res.json();
      
      // RapidAPI biasanya mengembalikan link di medias[0].url
      if (videoData.medias && videoData.medias.length > 0) {
        setDownloadLink(videoData.medias[0].url);
      }
    } catch (err) {
      setError("Gagal memproses video. Pastikan link publik.");
    } finally {
      setLoading(false);
    }
  };

  const downloadClip = (index) => {
    setRenderingIndex(index);
    setTimeout(() => {
      if (downloadLink) {
        window.open(downloadLink, '_blank');
      }
      setRenderingIndex(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans p-6">
      <div className="max-w-4xl mx-auto py-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-indigo-600 p-2 rounded-xl"><Scissors size={24}/></div>
          <h1 className="text-2xl font-black italic tracking-tighter">INDOCLIP<span className="text-indigo-500">AI</span></h1>
        </div>

        <section className="text-center mb-12">
          <h2 className="text-5xl font-extrabold mb-4 leading-tight">Ubah Link Video Jadi <br/><span className="text-indigo-500">Konten Viral</span></h2>
          <p className="text-gray-400">Tempel link YouTube, TikTok, atau Instagram kamu di bawah ini.</p>
        </section>

        <form onSubmit={handleProcess} className="relative mb-12">
          <input 
            type="text" 
            className="w-full bg-[#151515] border-2 border-[#222] py-5 px-8 rounded-3xl outline-none focus:border-indigo-600 transition text-lg"
            placeholder="https://www.tiktok.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="submit" disabled={loading} className="absolute right-2 top-2 bottom-2 bg-indigo-600 px-8 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-500 transition">
            {loading ? <Loader2 className="animate-spin"/> : <Zap size={20}/>} Proses
          </button>
        </form>

        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-2xl mb-8 flex items-center gap-3"><AlertCircle size={20}/>{error}</div>}

        {result && (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-5">
            {result.clips.map((clip, i) => (
              <div key={i} className="bg-[#111] border border-[#222] p-6 rounded-[2rem] flex flex-col">
                <div className="flex justify-between mb-4">
                  <span className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider">{clip.start} - {clip.end}</span>
                  <span className="text-yellow-500 font-black text-xs uppercase tracking-widest">🔥 {clip.score}%</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{clip.title}</h3>
                <p className="text-gray-500 text-sm italic mb-6">"{clip.reason}"</p>
                <button 
                  onClick={() => downloadClip(i)}
                  className="mt-auto w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
                >
                  {renderingIndex === i ? <Loader2 className="animate-spin"/> : <Download size={18}/>}
                  {renderingIndex === i ? "Menyiapkan..." : "Download Video"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;