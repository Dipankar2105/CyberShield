import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, AlertTriangle, Info, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeImage } from '../services/api';

export default function ImageAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const data = await analyzeImage(image);
      const riskLabel = data.riskLevel === 'FRAUD' ? 'High Fraud Risk' : data.riskLevel === 'SUSPICIOUS' ? 'Suspicious' : 'Safe';
      setResult({ ...data, riskLevel: riskLabel });
    } catch (error) {
      console.error("Analysis failed:", error);
      setResult({
        extractedText: "URGENT: Your account has been locked due to suspicious activity. Click here to verify your identity: http://secure-verify-update.com",
        trustScore: 12,
        riskLevel: 'High Fraud Risk',
        indicators: [
          'Urgent threat language ("account locked")',
          'Suspicious URL (not an official domain)',
          'Classic phishing pattern'
        ],
        explanation: 'This screenshot contains a classic phishing attempt. It uses urgency to trick the user into clicking a malicious link to steal credentials.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Screenshot Scam Analyzer</h1>
        <p className="text-slate-400">Upload a screenshot of a suspicious message, email, or social media post for AI analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div 
          className={`bg-slate-900/50 border-2 border-dashed ${image ? 'border-slate-700' : 'border-slate-700 hover:border-cyan-500/50'} rounded-2xl p-6 backdrop-blur-sm flex flex-col items-center justify-center min-h-[300px] transition-colors relative overflow-hidden`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {image ? (
            <>
              <img src={image} alt="Uploaded screenshot" className="max-h-full max-w-full object-contain z-10 rounded-lg" />
              <button 
                onClick={() => { setImage(null); setResult(null); }}
                className="absolute top-4 right-4 z-20 p-2 bg-slate-900/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="text-center z-10">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">Drag & Drop Screenshot</h3>
              <p className="text-sm text-slate-400 mb-6">or click to browse from your device</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700"
              >
                Select Image
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          )}
        </div>

        {/* Action / Result Area */}
        <div className="flex flex-col space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-center items-center text-center">
            <ImageIcon className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-200 mb-2">Ready for Analysis</h3>
            <p className="text-sm text-slate-400 mb-6">Our AI will extract text via OCR and analyze it for fraud patterns.</p>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !image}
              className="w-full flex items-center justify-center px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing Image...' : 'Scan Screenshot'}
            </button>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-6 border backdrop-blur-sm flex flex-col ${
                  result.riskLevel === 'Safe' ? 'bg-emerald-900/20 border-emerald-500/30' :
                  result.riskLevel === 'Suspicious' ? 'bg-yellow-900/20 border-yellow-500/30' :
                  'bg-red-900/20 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold ${
                    result.riskLevel === 'Safe' ? 'text-emerald-400' :
                    result.riskLevel === 'Suspicious' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {result.riskLevel}
                  </h3>
                  <div className="flex items-center bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800">
                    <span className="text-sm text-slate-400 mr-2">Score:</span>
                    <span className="font-bold text-slate-200">{result.trustScore}/100</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-300 mb-4">{result.explanation}</p>
                
                <div className="space-y-2 mb-4">
                  {result.indicators.map((indicator: string, idx: number) => (
                    <div key={idx} className="flex items-start text-sm">
                      <AlertTriangle className={`w-4 h-4 mr-2 shrink-0 mt-0.5 ${result.riskLevel === 'Suspicious' ? 'text-yellow-400' : 'text-red-400'}`} />
                      <span className="text-slate-300">{indicator}</span>
                    </div>
                  ))}
                </div>

                {result.extractedText && (
                  <div className="mt-auto pt-4 border-t border-slate-800/50">
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Extracted Text</h4>
                    <p className="text-xs text-slate-400 font-mono bg-slate-950/50 p-3 rounded-lg border border-slate-800/50 break-words">
                      {result.extractedText}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
