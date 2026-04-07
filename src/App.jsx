import React, { useState } from 'react';
import { Scissors, Youtube, Download, Sparkles, Loader2, Zap, AlertCircle } from 'lucide-react';

// API Key Gemini disematkan langsung
const geminiKey = "AIzaSyA5j6QK58Uayfcu_ffZvF3PqW5m9w2hE3E"; 

const App = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const analyzeWithAI = async (videoUrl) => {
    if (!geminiKey) {
      throw new Error("API Key Gemini belum diatur.");
    }

    const prompt = `Analisis video ini: ${videoUrl}. Identifikasi 3 momen paling viral. Berikan dalam format JSON: { "videoTitle": "Judul", "clips": [{ "title": "Judul Klip", "start": "00:10", "end": "00:40", "reason": "Alasan", "score": 95 }] }`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const text = data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeWithAI(url);
      setResult(analysis);
    } catch (err) {
      setError("Gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 flex flex-col items-center">
      <div className="max-w-4xl w-full pt-10 text-center">
        <h1 className="text-4xl font-black mb-8 italic">INDOCLIP<span className="text-indigo-500">AI</span></h1>
        <form onSubmit={handleProcess} className="mb-10 relative">
          <input 
            type="text" 
            className="w-full bg-[#151515] border-2 border-[#222] py-4 px-6 rounded-2xl outline-none focus:border-indigo-600"
            placeholder="Tempel link video..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="submit" disabled={loading} className="absolute right-2 top-2 bottom-2 bg-indigo-600 px-6 rounded-xl font-bold flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={18}/> : "Proses"}
          </button>
        </form>
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500 text-red-500 rounded-xl flex items-center gap-2">
            <AlertCircle size={20}/> {error}
          </div>
        )}
        {result && (
          <div className="grid md:grid-cols-2 gap-4 text-left">
            {result.clips.map((clip, i) => (
              <div key={i} className="bg-[#111] p-6 rounded-3xl border border-[#222]">
                <h3 className="font-bold text-xl mb-2">{clip.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{clip.reason}</p>
                <div className="text-xs font-mono text-indigo-400 mb-4">{clip.start} - {clip.end}</div>
                <button className="w-full bg-white text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Download size={18} /> Download
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
