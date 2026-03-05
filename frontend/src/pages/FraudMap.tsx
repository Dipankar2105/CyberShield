import { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, TrendingUp, Search, Filter, Plus, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getFraudMap, reportScam } from '../services/api';

const CITY_OPTIONS = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai',
  'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Bhopal',
  'Kochi', 'Indore', 'Nagpur', 'Guwahati', 'Patna', 'Surat',
];

const SCAM_TYPES = [
  'Digital Arrest', 'Phishing SMS', 'Phishing Link', 'Job Fraud',
  'Investment Scam', 'Lottery Scam', 'UPI Fraud', 'Romance Scam',
  'Tech Support Scam', 'Impersonation',
];

export default function FraudMap() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mapData, setMapData] = useState<any>({ reports: [], cityStats: [], totalReports: 0 });
  const [showReportForm, setShowReportForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportForm, setReportForm] = useState({ city: '', scamType: '', description: '', platform: '' });

  useEffect(() => {
    getFraudMap().then(setMapData).catch(() => {});
  }, []);

  const filteredStats = (mapData.cityStats || []).filter((s: any) =>
    s._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.types?.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleReport = async () => {
    if (!reportForm.city || !reportForm.scamType || !reportForm.description) return;
    setIsSubmitting(true);
    try {
      await reportScam(reportForm);
      setShowReportForm(false);
      setReportForm({ city: '', scamType: '', description: '', platform: '' });
      const data = await getFraudMap();
      setMapData(data);
    } catch (err) {
      console.error('Report failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Community Fraud Intelligence</h1>
          <p className="text-slate-400">Real-time visualization of emerging scam patterns across regions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search city or scam type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none w-64"
            />
          </div>
          <button
            onClick={() => setShowReportForm(true)}
            className="flex items-center px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl transition-all text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Report Scam
          </button>
        </div>
      </div>

      {/* Report Form Modal */}
      <AnimatePresence>
        {showReportForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-200">Report a Scam</h3>
              <button onClick={() => setShowReportForm(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={reportForm.city}
                onChange={(e) => setReportForm({ ...reportForm, city: e.target.value })}
                className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="">Select City</option>
                {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={reportForm.scamType}
                onChange={(e) => setReportForm({ ...reportForm, scamType: e.target.value })}
                className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="">Select Scam Type</option>
                {SCAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                value={reportForm.platform}
                onChange={(e) => setReportForm({ ...reportForm, platform: e.target.value })}
                placeholder="Platform (e.g., WhatsApp, SMS)"
                className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <textarea
                value={reportForm.description}
                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                placeholder="Describe the scam..."
                rows={2}
                className="md:col-span-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
              />
            </div>
            <button
              onClick={handleReport}
              disabled={isSubmitting || !reportForm.city || !reportForm.scamType || !reportForm.description}
              className="mt-4 flex items-center px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm relative min-h-[500px] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between mb-6 z-10">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-cyan-400" />
              Threat Heatmap
            </h2>
            <div className="flex items-center space-x-4 text-xs">
              <span className="flex items-center text-slate-400"><span className="w-3 h-3 rounded-full bg-red-500/80 mr-2"></span>High Risk</span>
              <span className="flex items-center text-slate-400"><span className="w-3 h-3 rounded-full bg-yellow-500/80 mr-2"></span>Medium Risk</span>
              <span className="flex items-center text-slate-400"><span className="w-3 h-3 rounded-full bg-blue-500/80 mr-2"></span>Low Risk</span>
            </div>
          </div>

          {/* Map with city markers */}
          <div className="relative flex-1 w-full h-full z-10">
            <div className="absolute inset-0 bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden">
              {/* India outline background */}
              <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/India_blank_map.svg/800px-India_blank_map.svg.png')] bg-no-repeat bg-contain bg-center opacity-10 pointer-events-none mix-blend-screen filter invert"></div>
              
              {/* City markers from data */}
              {(mapData.cityStats || []).map((city: any, i: number) => {
                const risk = city.count > 200 ? 'high' : city.count > 100 ? 'medium' : 'low';
                const colors = { high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-blue-500' };
                const glows = { high: 'shadow-[0_0_15px_rgba(239,68,68,0.8)]', medium: 'shadow-[0_0_10px_rgba(234,179,8,0.8)]', low: 'shadow-[0_0_10px_rgba(59,130,246,0.8)]' };
                // Normalize lat/lng to percentage positions within the map container
                const top = Math.max(5, Math.min(90, ((35 - city.lat) / 30) * 100));
                const left = Math.max(5, Math.min(90, ((city.lng - 68) / 30) * 100));
                const size = Math.max(8, Math.min(20, city.count / 20));
                return (
                  <div
                    key={city._id}
                    className="absolute group cursor-pointer"
                    style={{ top: `${top}%`, left: `${left}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <div className={`animate-pulse rounded-full ${colors[risk as keyof typeof colors]} ${glows[risk as keyof typeof glows]}`}
                      style={{ width: `${size}px`, height: `${size}px` }}
                    />
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs whitespace-nowrap z-50">
                      <p className="font-medium text-slate-200">{city._id}</p>
                      <p className="text-slate-400">{city.count} reports</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-6 right-6 bg-slate-950/80 border border-slate-800 p-4 rounded-xl backdrop-blur-md z-20">
            <h4 className="text-sm font-medium text-slate-200 mb-2">Active Threats</h4>
            <div className="text-3xl font-bold text-red-400 tracking-tight">{mapData.totalReports || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Total reports</p>
          </div>
        </motion.div>

        {/* Regional Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-200">Regional Alerts</h2>
            <AlertTriangle className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {filteredStats.map((stat: any) => {
              const risk = stat.count > 200 ? 'High' : stat.count > 100 ? 'Medium' : 'Low';
              return (
                <div key={stat._id} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">{stat._id}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{(stat.types || []).slice(0, 2).join(', ')}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                      risk === 'High' ? 'bg-red-500/10 text-red-400' :
                      risk === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {risk}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm">
                    <div className="flex items-center text-slate-400">
                      <AlertTriangle className="w-4 h-4 mr-1.5" />
                      {stat.count} reports
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredStats.length === 0 && (
              <div className="text-center py-8 text-slate-500">No reports found.</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
