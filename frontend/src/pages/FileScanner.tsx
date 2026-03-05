import { useState, useRef } from 'react';
import { Upload, FileWarning, CheckCircle, AlertTriangle, Loader2, HardDrive, Hash, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { scanFile } from '../services/api';

export default function FileScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResult(null);
      setError('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setResult(null);
      setError('');
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);
    setResult(null);
    setError('');

    try {
      const data = await scanFile(file);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Malware File Scanner</h1>
        <p className="text-slate-400">Upload suspicious files to scan against VirusTotal's database of 70+ antivirus engines.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div
          className={`bg-slate-900/50 border-2 border-dashed ${file ? 'border-slate-700' : 'border-slate-700 hover:border-cyan-500/50'} rounded-2xl p-6 backdrop-blur-sm flex flex-col items-center justify-center min-h-[300px] transition-colors relative`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="text-center w-full">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HardDrive className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-1 truncate px-4">{file.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{formatFileSize(file.size)}</p>
              <button
                onClick={() => { setFile(null); setResult(null); }}
                className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">Drag & Drop File</h3>
              <p className="text-sm text-slate-400 mb-6">or click to browse (max 32MB)</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700"
              >
                Select File
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Action + Result */}
        <div className="flex flex-col space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-center items-center text-center">
            <FileWarning className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-200 mb-2">Malware Detection</h3>
            <p className="text-sm text-slate-400 mb-6">We compute the SHA-256 hash and query VirusTotal for known malware signatures.</p>
            <button
              onClick={handleScan}
              disabled={isScanning || !file}
              className="w-full flex items-center justify-center px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              {isScanning ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
              {isScanning ? 'Scanning File...' : 'Scan for Malware'}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-6 border backdrop-blur-sm ${
                  result.riskLevel === 'CLEAN' || result.riskLevel === 'UNKNOWN' ? 'bg-emerald-900/20 border-emerald-500/30' :
                  result.riskLevel === 'SUSPICIOUS' ? 'bg-yellow-900/20 border-yellow-500/30' :
                  'bg-red-900/20 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold ${
                    result.riskLevel === 'CLEAN' || result.riskLevel === 'UNKNOWN' ? 'text-emerald-400' :
                    result.riskLevel === 'SUSPICIOUS' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {result.riskLevel === 'MALWARE_DETECTED' ? 'Malware Detected!' :
                     result.riskLevel === 'SUSPICIOUS' ? 'Suspicious File' :
                     result.riskLevel === 'UNKNOWN' ? 'Not in Database' :
                     'File is Clean'}
                  </h3>
                  {result.detectionRate && (
                    <span className="text-sm bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800 text-slate-300">
                      {result.detectionRate} detections
                    </span>
                  )}
                </div>

                {result.hash && (
                  <div className="flex items-center text-xs text-slate-500 mb-3 font-mono bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                    <Hash className="w-3 h-3 mr-2 shrink-0" />
                    <span className="break-all">SHA-256: {result.hash}</span>
                  </div>
                )}

                {result.message && (
                  <p className="text-sm text-slate-300">{result.message}</p>
                )}

                {result.permalink && (
                  <a
                    href={result.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    View full report on VirusTotal
                    <span className="ml-1">→</span>
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
