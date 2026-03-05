import { useState } from 'react';
import { Link2, Shield, AlertTriangle, CheckCircle, Loader2, ExternalLink, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { scanUrl } from '../services/api';

export default function PhishingScanner() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!url.trim()) return;
    setIsScanning(true);
    setResult(null);
    setError('');

    try {
      const data = await scanUrl(url.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Phishing Link Scanner</h1>
        <p className="text-slate-400">Check URLs against Google Safe Browsing and VirusTotal databases for phishing, malware, and other threats.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <label className="block text-sm font-medium text-slate-300 mb-2">Enter URL to Scan</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none font-mono text-sm"
              placeholder="https://example.com/suspicious-link"
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            />
          </div>
          <button
            onClick={handleScan}
            disabled={isScanning || !url.trim()}
            className="flex items-center px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            <span className="ml-2">{isScanning ? 'Scanning...' : 'Scan URL'}</span>
          </button>
        </div>
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
            className="space-y-4"
          >
            {/* Overall Result */}
            <div className={`rounded-2xl p-6 border backdrop-blur-sm ${
              result.overallSafe ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {result.overallSafe ? (
                    <CheckCircle className="w-8 h-8 text-emerald-400 mr-3" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-400 mr-3" />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${result.overallSafe ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.overallSafe ? 'URL Appears Safe' : 'Warning: Potential Threat Detected'}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 font-mono break-all">{result.url}</p>
                  </div>
                </div>
                <Shield className={`w-12 h-12 ${result.overallSafe ? 'text-emerald-400/30' : 'text-red-400/30'}`} />
              </div>
            </div>

            {/* Detailed Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Safe Browsing */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Google Safe Browsing</h4>
                {result.safeBrowsing?.safe === true && (
                  <div className="flex items-center text-emerald-400">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>No threats found</span>
                  </div>
                )}
                {result.safeBrowsing?.safe === false && (
                  <div>
                    <div className="flex items-center text-red-400 mb-2">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Threats detected!</span>
                    </div>
                    {result.safeBrowsing.threats?.map((threat: any, i: number) => (
                      <div key={i} className="text-sm text-red-300 bg-red-950/30 px-3 py-1.5 rounded-lg mb-1">
                        {threat.type}
                      </div>
                    ))}
                  </div>
                )}
                              {result.safeBrowsing?.safe === null && (
                  <div className="flex items-center text-yellow-400">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <span className="text-sm">{result.safeBrowsing.message}</span>
                  </div>
                )}
              </div>

              {/* VirusTotal */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">VirusTotal Analysis</h4>
                {result.virusTotal?.scanned ? (
                  <div>
                    <div className={`flex items-center mb-2 ${
                      result.virusTotal.riskLevel === 'CLEAN' ? 'text-emerald-400' :
                      result.virusTotal.riskLevel === 'SUSPICIOUS' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {result.virusTotal.riskLevel === 'CLEAN' ? (
                        <CheckCircle className="w-5 h-5 mr-2" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 mr-2" />
                      )}
                      <span className="font-medium">{result.virusTotal.riskLevel}</span>
                    </div>
                    {result.virusTotal.malicious > 0 && (
                      <p className="text-sm text-red-300">{result.virusTotal.malicious} engines flagged as malicious</p>
                    )}
                    {result.virusTotal.status === 'queued' && (
                      <p className="text-sm text-yellow-300">{result.virusTotal.message}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">{result.virusTotal?.message || 'Unable to scan'}</p>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
              <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Safety Tips</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start"><span className="text-cyan-400 mr-2">•</span>Always verify URLs before clicking — check for misspellings in the domain name</li>
                <li className="flex items-start"><span className="text-cyan-400 mr-2">•</span>Never enter credentials on pages reached through links in emails or messages</li>
                <li className="flex items-start"><span className="text-cyan-400 mr-2">•</span>Look for HTTPS and valid SSL certificates on banking/shopping sites</li>
                <li className="flex items-start"><span className="text-cyan-400 mr-2">•</span>When in doubt, type the official URL directly in your browser</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
