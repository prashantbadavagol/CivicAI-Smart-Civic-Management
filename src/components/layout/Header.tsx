import React from 'react';
import {
  Building2,
  ShieldCheck,
  Search,
  PlusCircle,
  Database,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { resetComplaintsToDemo } from '../../utils/storage';

interface HeaderProps {
  currentPortal: 'citizen' | 'admin';
  onPortalChange: (portal: 'citizen' | 'admin') => void;
  activeCitizenPage: 'home' | 'report' | 'track';
  onCitizenNavigate: (page: 'home' | 'report' | 'track') => void;
  onRefreshData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPortal,
  onPortalChange,
  activeCitizenPage,
  onCitizenNavigate,
  onRefreshData,
}) => {
  const handleResetDemo = () => {
    if (window.confirm('Reset complaints database to 42 synthetic demo records?')) {
      resetComplaintsToDemo();
      if (onRefreshData) onRefreshData();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (currentPortal === 'citizen') onCitizenNavigate('home');
              }}
              className="flex items-center space-x-3 text-left focus:outline-none group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                    Civic<span className="text-teal-400">AI</span>
                  </span>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-950 text-teal-300 border border-teal-800/80">
                    Smart City Ops
                  </span>
                </div>
                <p className="hidden sm:block text-xs text-slate-400 font-normal">
                  From Complaints to Prioritized Action
                </p>
              </div>
            </button>
          </div>

          {/* Citizen Navigation Links (if in Citizen Portal) */}
          {currentPortal === 'citizen' && (
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => onCitizenNavigate('home')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCitizenPage === 'home'
                    ? 'bg-slate-800 text-teal-300'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onCitizenNavigate('report')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCitizenPage === 'report'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-teal-300" />
                <span>Report a Problem</span>
              </button>
              <button
                onClick={() => onCitizenNavigate('track')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCitizenPage === 'track'
                    ? 'bg-slate-800 text-teal-300'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Track Complaint</span>
              </button>
            </nav>
          )}

          {/* Right Tools: Demo indicator & Portal Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Demo Mode Badge */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
              <span className="hidden lg:inline text-slate-300 font-medium mr-1.5">
                Local Demo Storage
              </span>
              <button
                onClick={handleResetDemo}
                title="Reset to 42+ initial synthetic records"
                className="flex items-center space-x-1 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[11px]">Reset Data</span>
              </button>
            </div>

            {/* Portal Switcher Tabs */}
            <div className="inline-flex p-0.5 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => onPortalChange('citizen')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  currentPortal === 'citizen'
                    ? 'bg-teal-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Citizen Portal
              </button>
              <button
                type="button"
                onClick={() => onPortalChange('admin')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  currentPortal === 'admin'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Admin Command
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
