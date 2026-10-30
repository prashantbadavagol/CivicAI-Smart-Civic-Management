import React from 'react';
import {
  LayoutDashboard,
  FileText,
  BrainCircuit,
  MapPin,
  Flame,
  BarChart3,
  Briefcase,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export type AdminPage =
  | 'dashboard'
  | 'complaints'
  | 'ai-analysis'
  | 'smart-map'
  | 'hotspots'
  | 'analytics'
  | 'departments';

interface AdminSidebarProps {
  currentPage: AdminPage;
  onPageChange: (page: AdminPage) => void;
  criticalCount: number;
  pendingCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentPage,
  onPageChange,
  criticalCount,
  pendingCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as AdminPage,
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'complaints' as AdminPage,
      label: 'All Complaints',
      icon: FileText,
      badge: pendingCount > 0 ? `${pendingCount} open` : null,
      badgeColor: 'bg-slate-200 text-slate-800',
    },
    {
      id: 'ai-analysis' as AdminPage,
      label: 'AI Intelligence Hub',
      icon: BrainCircuit,
      badge: 'Gemini',
      badgeColor: 'bg-teal-100 text-teal-800 font-semibold',
    },
    {
      id: 'smart-map' as AdminPage,
      label: 'Smart City Map',
      icon: MapPin,
      badge: null,
    },
    {
      id: 'hotspots' as AdminPage,
      label: 'Hotspot Detection',
      icon: Flame,
      badge: 'Spatial',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'analytics' as AdminPage,
      label: 'Analytics & Insights',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'departments' as AdminPage,
      label: 'Department Workload',
      icon: Briefcase,
      badge: null,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex-shrink-0 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* City Alert Status if Critical Issues Exist */}
        {criticalCount > 0 ? (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 flex items-start space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block text-red-100">
                {criticalCount} Critical Safety Alert{criticalCount > 1 ? 's' : ''}
              </span>
              Immediate human review required.
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-300 flex items-center space-x-2.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span>Civic operations nominal</span>
          </div>
        )}

        {/* Navigation items */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Operations & Triage
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-blue-700 text-blue-100'
                          : item.badgeColor || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin system info footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span>Authority Node</span>
          <span className="text-teal-400 font-mono text-[11px]">ACTIVE</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Metro Civic Command • District 1
        </p>
      </div>
    </aside>
  );
};
