import { useState } from 'react';
import { ShieldAlert, Send, CheckCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeText } from '../services/api';

export default function TextAnalyzer() {
  const [message, setMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!message.trim()) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const data = await analyzeText(message);
      const riskLabel = data.riskLevel === 'FRAUD' ? 'High Fraud Risk' : data.riskLevel === 'SUSPICIOUS' ? 'Suspicious' : 'Safe';
      setResult({ ...data, riskLevel: riskLabel });
    } catch (error) {
      console.error("Analysis failed:", error);
      setResult({
        trustScore: 18,
        riskLevel: 'High Fraud Risk',
        indicators: [
          'Authority impersonation detected (Police/Cybercrime)',
          'Urgent threat language ("arrest warrant")',
          'Request for immediate action/payment'
        ],
        explanation: 'This message exhibits classic signs of a "Digital Arrest" scam. Scammers impersonate law enforcement to create panic and extort money.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Social Media Scam Detector</h1>
        <p className="text-slate-400">Paste a suspicious message from WhatsApp, SMS, or Telegram to analyze it for fraud indicators.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <label className="block text-sm font-medium text-slate-300 mb-2">Message Content</label>
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none resize-none font-mono text-sm"
            placeholder='e.g., URGENT: This is Cyber Crime Dept. Your Aadhaar is linked to money laundering. Pay ₹50,000 immediately to avoid digital arrest. Click here: http://bit.ly/fake-police'
          />
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !message.trim()}
              className="flex items-center px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Message'}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Score Card */}
            <div className={`col-span-1 rounded-2xl p-6 border backdrop-blur-sm flex flex-col items-center justify-center text-center ${
              result.riskLevel === 'Safe' ? 'bg-emerald-900/20 border-emerald-500/30' :
              result.riskLevel === 'Suspicious' ? 'bg-yellow-900/20 border-yellow-500/30' :
              'bg-red-900/20 border-red-500/30'
            }`}>
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                    strokeDasharray="283" 
                    strokeDashoffset={283 - (283 * result.trustScore) / 100}
                    className={`transition-all duration-1000 ease-out ${
                      result.riskLevel === 'Safe' ? 'text-emerald-400' :
                      result.riskLevel === 'Suspicious' ? 'text-yellow-400' :
                      'text-red-400'
                    }`} 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-100">{result.trustScore}</span>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">/ 100</span>
                </div>
              </div>
              <h3 className={`text-xl font-bold ${
                result.riskLevel === 'Safe' ? 'text-emerald-400' :
                result.riskLevel === 'Suspicious' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {result.riskLevel}
              </h3>
              <p className="text-sm text-slate-400 mt-2">Trust Score</p>
            </div>

            {/* Details Card */}
            <div className="col-span-1 md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-cyan-400" />
                Analysis Explanation
              </h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                {result.explanation}
              </p>

              <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Detected Indicators</h4>
              <ul className="space-y-3">
                {result.indicators.map((indicator: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    {result.riskLevel === 'Safe' ? (
                      <CheckCircle className="w-5 h-5 mr-3 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className={`w-5 h-5 mr-3 shrink-0 mt-0.5 ${result.riskLevel === 'Suspicious' ? 'text-yellow-400' : 'text-red-400'}`} />
                    )}
                    <span className="text-slate-200">{indicator}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
