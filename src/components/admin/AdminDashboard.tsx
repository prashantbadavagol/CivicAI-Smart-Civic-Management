import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Complaint, PriorityLevel } from '../../types';

interface AdminDashboardProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigatePage: (page: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  complaints,
  onSelectComplaint,
  onNavigatePage,
}) => {
  const total = complaints.length;
  const pending = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  ).length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const criticalList = complaints.filter((c) => c.priority === 'Critical');
  const critical = criticalList.length;

  // Breakdown by priority
  const priorityCounts: Record<PriorityLevel, number> = {
    Critical: critical,
    High: complaints.filter((c) => c.priority === 'High').length,
    Medium: complaints.filter((c) => c.priority === 'Medium').length,
    Low: complaints.filter((c) => c.priority === 'Low').length,
  };

  // Recent 6 complaints
  const recentComplaints = complaints.slice(0, 6);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Smart City Executive Command
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time citizen reports, AI triage scoring, and multi-department operational status
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigatePage('smart-map')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>Open Smart Map</span>
          </button>
          <button
            onClick={() => onNavigatePage('hotspots')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-slate-950" />
            <span>Hotspots</span>
          </button>
        </div>
      </div>

      {/* 5 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Total Complaints</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{total}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Across all wards</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Pending Triage</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-amber-600">{pending}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Awaiting assignment</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>In Progress</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-blue-600">{inProgress}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Field crews deployed</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-600">{resolved}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {Math.round((resolved / (total || 1)) * 100)}% resolution rate
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-red-200 shadow-sm flex flex-col justify-between bg-red-50/30">
          <div className="flex items-center justify-between text-red-600 text-xs font-bold uppercase">
            <span>Critical Issues</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-red-600">{critical}</span>
            <span className="text-[11px] text-red-700 block mt-0.5 font-medium">
              Immediate action
            </span>
          </div>
        </div>
      </div>

      {/* Urgent Public Safety Immediate Human Review Alert */}
      {critical > 0 && (
        <div className="bg-red-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-red-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">
                  Immediate Human Review Required: {critical} Critical Hazard{critical > 1 ? 's' : ''}
                </h3>
                <p className="text-xs text-red-200">
                  Per CivicAI safety protocol, AI models cannot make final emergency decisions without official human validation.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1 bg-red-900 text-red-200 rounded-full border border-red-700">
              PRIORITY 1
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {criticalList.slice(0, 3).map((crit) => (
              <div
                key={crit.id}
                onClick={() => onSelectComplaint(crit)}
                className="bg-red-900/60 hover:bg-red-900/90 border border-red-800 rounded-2xl p-4 transition-all cursor-pointer flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-red-300 font-mono">
                    <span>{crit.id}</span>
                    <span className="bg-red-700 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      {crit.priorityScore}/100
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs mt-1 line-clamp-1">{crit.title}</h4>
                  <p className="text-[11px] text-red-200 mt-1 line-clamp-2">
                    {crit.aiSummary || crit.description}
                  </p>
                </div>
                <div className="text-[10px] text-red-300 flex items-center justify-between pt-1 border-t border-red-800/80">
                  <span>📍 {crit.address.split(',')[0]}</span>
                  <span className="underline font-semibold">Triage Now →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority & Category Overview Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Priority distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Priority Scoring Spread</h3>
            <span className="text-xs text-slate-400">AI Evaluated</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Critical (80-100)', count: priorityCounts.Critical, color: 'bg-red-500' },
              { label: 'High (60-79)', count: priorityCounts.High, color: 'bg-amber-500' },
              { label: 'Medium (40-59)', count: priorityCounts.Medium, color: 'bg-yellow-400' },
              { label: 'Low (0-39)', count: priorityCounts.Low, color: 'bg-emerald-500' },
            ].map((p) => {
              const pct = Math.round((p.count / (total || 1)) * 100);
              return (
                <div key={p.label} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>{p.label}</span>
                    <span>
                      {p.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.color} rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Triage Status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 md:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Automated Triage Performance</h3>
              <p className="text-xs text-slate-500">
                Gemini AI integration speeds up ticket routing by 4.8x compared to manual dispatch
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              Active SLA: 98.4%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Avg. AI Triage</span>
              <span className="text-xl font-extrabold text-teal-700 mt-1 block">&lt; 1.8s</span>
              <span className="text-[10px] text-slate-400">Category & Priority</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Duplicates Found</span>
              <span className="text-xl font-extrabold text-purple-700 mt-1 block">
                {complaints.filter((c) => c.duplicateSuggestions.length > 0).length}
              </span>
              <span className="text-[10px] text-slate-400">Cluster candidates</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Action Briefs</span>
              <span className="text-xl font-extrabold text-blue-700 mt-1 block">{total}</span>
              <span className="text-[10px] text-slate-400">Direct for crews</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onNavigatePage('complaints')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>View All Complaints Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Recent Complaints Intake</h3>
            <p className="text-xs text-slate-500">Live feed of citizen reports received in city database</p>
          </div>

          <button
            onClick={() => onNavigatePage('complaints')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            All Complaints ({total}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Complaint ID</th>
                <th className="py-3 px-3">Title & Problem</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentComplaints.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{item.id}</td>
                  <td className="py-3 px-3 max-w-xs">
                    <span className="font-bold text-slate-800 block truncate">{item.title}</span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      📍 {item.address.split(',')[0]}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        item.priority === 'Critical'
                          ? 'bg-red-100 text-red-800'
                          : item.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : item.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {item.assignedDepartment}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-700">{item.status}</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectComplaint(item)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
