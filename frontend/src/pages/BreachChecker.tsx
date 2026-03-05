import { useState } from 'react';
import { Mail, Shield, AlertTriangle, CheckCircle, Loader2, Database, Calendar, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkBreach } from '../services/api';

export default function BreachChecker() {
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    if (!email.trim()) return;
    setIsChecking(true);
    setResult(null);
    setError('');

    try {
      const data = await checkBreach(email.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Check failed. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Data Breach Checker</h1>
        <p className="text-slate-400">Check if your email address has been exposed in known data breaches using the HaveIBeenPwned database.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none"
              placeholder="your-email@example.com"
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            />
          </div>
          <button
            onClick={handleCheck}
            disabled={isChecking || !email.trim()}
            className="flex items-center px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            {isChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
            <span className="ml-2">{isChecking ? 'Checking...' : 'Check Breaches'}</span>
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
            {/* Summary */}
            <div className={`rounded-2xl p-6 border backdrop-blur-sm ${
              result.breached === false ? 'bg-emerald-900/20 border-emerald-500/30' :
              result.breached === true ? 'bg-red-900/20 border-red-500/30' :
              'bg-yellow-900/20 border-yellow-500/30'
            }`}>
              <div className="flex items-center">
                {result.breached === false ? (
                  <CheckCircle className="w-8 h-8 text-emerald-400 mr-3 shrink-0" />
                ) : result.breached === true ? (
                  <AlertTriangle className="w-8 h-8 text-red-400 mr-3 shrink-0" />
                ) : (
                  <Shield className="w-8 h-8 text-yellow-400 mr-3 shrink-0" />
                )}
                <div>
                  <h3 className={`text-xl font-bold ${
                    result.breached === false ? 'text-emerald-400' :
                    result.breached === true ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {result.breached === false ? 'No Breaches Found' :
                     result.breached === true ? `Found in ${result.count} Breach${result.count > 1 ? 'es' : ''}` :
                     'Check Unavailable'}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">{result.message}</p>
                </div>
              </div>
            </div>

            {/* Breach List */}
            {result.breached && result.breaches?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Breach Details</h4>
                {result.breaches.map((breach: any, idx: number) => (
                  <motion.div
                    key={breach.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="text-lg font-semibold text-slate-200">{breach.name}</h5>
                        {breach.domain && <p className="text-xs text-slate-500 font-mono">{breach.domain}</p>}
                      </div>
                      <div className="flex items-center text-xs text-slate-500 bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        {breach.breachDate}
                      </div>
                    </div>

                    {breach.pwnCount && (
                      <div className="flex items-center text-sm text-slate-400 mb-3">
                        <Database className="w-4 h-4 mr-2 text-slate-500" />
                        {breach.pwnCount.toLocaleString()} accounts affected
                      </div>
                    )}

                    {breach.dataClasses?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-slate-500 mb-2 flex items-center">
                          <Lock className="w-3 h-3 mr-1" /> Compromised data:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {breach.dataClasses.map((dc: string) => (
                            <span key={dc} className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md border border-red-500/20">
                              {dc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {result.breached && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Recommended Actions</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start"><span className="text-cyan-400 mr-2">1.</span>Change your password immediately on affected services</li>
                  <li className="flex items-start"><span className="text-cyan-400 mr-2">2.</span>Enable two-factor authentication (2FA) wherever possible</li>
                  <li className="flex items-start"><span className="text-cyan-400 mr-2">3.</span>Don't reuse the same password across multiple sites</li>
                  <li className="flex items-start"><span className="text-cyan-400 mr-2">4.</span>Use a password manager to generate strong unique passwords</li>
                  <li className="flex items-start"><span className="text-cyan-400 mr-2">5.</span>Monitor your accounts for suspicious activity</li>
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
