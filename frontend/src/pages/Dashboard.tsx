import { ShieldAlert, Activity, AlertTriangle, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

const data = [
  { name: 'Mon', scams: 400, safe: 240 },
  { name: 'Tue', scams: 300, safe: 139 },
  { name: 'Wed', scams: 200, safe: 980 },
  { name: 'Thu', scams: 278, safe: 390 },
  { name: 'Fri', scams: 189, safe: 480 },
  { name: 'Sat', scams: 239, safe: 380 },
  { name: 'Sun', scams: 349, safe: 430 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cyber Safety Score"
          value="85/100"
          icon={ShieldAlert}
          trend="+5% this week"
          trendUp={true}
          color="text-emerald-400"
          bg="bg-emerald-400/10"
        />
        <StatCard
          title="Threats Blocked"
          value="1,248"
          icon={AlertTriangle}
          trend="+12% this week"
          trendUp={false}
          color="text-red-400"
          bg="bg-red-400/10"
        />
        <StatCard
          title="Safe Messages"
          value="8,432"
          icon={CheckCircle}
          trend="+2% this week"
          trendUp={true}
          color="text-cyan-400"
          bg="bg-cyan-400/10"
        />
        <StatCard
          title="Community Reports"
          value="342"
          icon={Users}
          trend="+18% this week"
          trendUp={true}
          color="text-blue-400"
          bg="bg-blue-400/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-200">Threat Activity Overview</h2>
            <div className="flex items-center space-x-2 text-sm">
              <span className="flex items-center text-red-400"><span className="w-2 h-2 rounded-full bg-red-400 mr-2"></span>Scams Detected</span>
              <span className="flex items-center text-cyan-400 ml-4"><span className="w-2 h-2 rounded-full bg-cyan-400 mr-2"></span>Safe Messages</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScams" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="scams" stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#colorScams)" />
                <Area type="monotone" dataKey="safe" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorSafe)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-200">Recent Threat Alerts</h2>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {[
              { type: 'Digital Arrest', source: 'WhatsApp', time: '10 mins ago', risk: 'High', color: 'text-red-400', bg: 'bg-red-400/10' },
              { type: 'Phishing Link', source: 'SMS', time: '1 hour ago', risk: 'High', color: 'text-red-400', bg: 'bg-red-400/10' },
              { type: 'Suspicious Offer', source: 'Instagram', time: '3 hours ago', risk: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { type: 'Impersonation', source: 'Telegram', time: '5 hours ago', risk: 'High', color: 'text-red-400', bg: 'bg-red-400/10' },
              { type: 'Fake Job Offer', source: 'WhatsApp', time: '1 day ago', risk: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            ].map((alert, i) => (
              <div key={i} className="flex items-start p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className={`p-2 rounded-lg ${alert.bg} mr-3`}>
                  <AlertTriangle className={`w-4 h-4 ${alert.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{alert.type}</p>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <span className="truncate">{alert.source}</span>
                    <span className="mx-2">•</span>
                    <span>{alert.time}</span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${alert.bg} ${alert.color}`}>
                  {alert.risk}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color, bg }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div className={`flex items-center text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
          {trend}
        </div>
      </div>
      <div>
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-slate-100 mt-1 tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}
