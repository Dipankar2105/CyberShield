import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, MessageSquareWarning, Image as ImageIcon, GraduationCap, Map as MapIcon, LogOut, User, Globe, FileSearch, ShieldAlert, Bot } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Text Analyzer', path: '/app/analyze-text', icon: MessageSquareWarning },
    { name: 'Image Analyzer', path: '/app/analyze-image', icon: ImageIcon },
    { name: 'Phishing Scanner', path: '/app/scan-url', icon: Globe },
    { name: 'File Scanner', path: '/app/scan-file', icon: FileSearch },
    { name: 'Breach Checker', path: '/app/check-breach', icon: ShieldAlert },
    { name: 'AI Assistant', path: '/app/chat', icon: Bot },
    { name: 'Simulation Lab', path: '/app/simulation', icon: GraduationCap },
    { name: 'Fraud Map', path: '/app/fraud-map', icon: MapIcon },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 font-sans selection:bg-cyan-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Shield className="w-6 h-6 text-cyan-400 mr-2" />
          <span className="font-bold text-lg tracking-tight">CyberShield</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-cyan-500/10 text-cyan-400" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center px-3 py-2 text-sm text-slate-400">
            <User className="w-5 h-5 mr-3 text-slate-500" />
            <div className="flex-1 truncate">
              <p className="text-slate-200 font-medium truncate">Demo User</p>
              <p className="text-xs truncate">user@cybershield.ai</p>
            </div>
          </div>
          <Link
            to="/"
            className="mt-2 flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-red-400 transition-colors group"
          >
            <LogOut className="w-5 h-5 mr-3 text-slate-500 group-hover:text-red-400 transition-colors" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between px-8 z-10">
          <h1 className="text-lg font-semibold text-slate-200">
            {navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400">System Active</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 relative">
          {/* Decorative background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
